const pool = require('../db/pool');
const { registrarAuditoria } = require('./auditoriaModel');
const fs_promises = require('fs').promises; 
const fs_sync = require('fs'); 
const path = require('path');

let webdavClient = null; 

const WEBDAV_BASE_URL = "http://172.16.3.136/owncloud/remote.php/dav/files/jsph"; 
const WEBDAV_DOCUMENTS_FOLDER = "Documentos_SISE"; 
const OWNCLOUD_USERNAME = "jsph";
const OWNCLOUD_PASSWORD = "admin";

const initializeWebdavClient = async () => {
    if (webdavClient) {
        return; 
    }

    try {
        const webdav = await import("webdav"); 
        
        webdavClient = webdav.createClient(WEBDAV_BASE_URL, {
            username: OWNCLOUD_USERNAME,
            password: OWNCLOUD_PASSWORD
        });
        console.log("WebDAV cliente inicializado exitosamente.");

    } catch (e) {
        console.error("ERROR: No se pudo cargar o inicializar el cliente WebDAV.", e);
        throw new Error('Fallo al inicializar el servicio de almacenamiento en la nube.');
    }
};

const create = async ({
  idAlumno,
  idTipoDocumento,
  nombre_original,
  nombre_guardado,
  ruta_archivo, 
  tamano,
  extension,
  mime_type
}, idUsuarioSubidor = null) => {

    await initializeWebdavClient(); 

  let webdavPath = '';
  let insertId;
  
  try {
    webdavPath = path.join(WEBDAV_DOCUMENTS_FOLDER, nombre_guardado);

    const fileStream = fs_sync.createReadStream(ruta_archivo); 
    await webdavClient.putFileContents(webdavPath, fileStream); 

    const result = await pool.query(
    `INSERT INTO dbo_documentos_alumno 
    (idAlumno, idTipoDocumento, nombre_original, nombre_guardado, ruta_archivo, 
    tamano, extension, mime_type, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
    [idAlumno, idTipoDocumento, nombre_original, nombre_guardado, webdavPath, 
    tamano, extension, mime_type]
);
    
    insertId = result.insertId;

    await registrarAuditoria(
      idUsuarioSubidor || idAlumno,
      'CREATE',
      'dbo_documentos_alumno',
      insertId,
      `Documento subido a OwnCloud: ${nombre_original}`
    );

  } catch (webdavError) {
    console.error('Error al subir a WebDAV:', webdavError);
    throw new Error('Error al subir el archivo al servidor OwnCloud.');
  } finally {
    try {
        await fs_promises.unlink(ruta_archivo); 
    } catch (unlinkError) {
        console.error('Advertencia: No se pudo eliminar el archivo temporal local:', unlinkError.message);
    }
  }

  return insertId.toString();
};

const getById = async (idDocumento) => {
    const rows = await pool.query(
        `SELECT 
        d.*,
        td.nombre AS tipo_documento,
        td.requerido,
        a.matricula,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', p.apellido_materno) AS nombre_alumno
        FROM dbo_documentos_alumno d
        INNER JOIN dbo_tipo_documento td ON d.idTipoDocumento = td.idTipoDocumento
        INNER JOIN dbo_alumno a ON d.idAlumno = a.idAlumno
        INNER JOIN dbo_usuario u ON a.idUsuario = u.idUsuario
        INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
        WHERE d.idDocumento = ?`,
        [idDocumento]
    );
    return rows[0];
};

const verificarDocumentosCompletos = async (idAlumno) => {
  const rows = await pool.query(
    `SELECT 
        td.idTipoDocumento,
        td.nombre,
        td.requerido,
        COUNT(d.idDocumento) as tiene_documento,
        MAX(CASE WHEN d.estado = 'aprobado' THEN 1 ELSE 0 END) as aprobado
     FROM dbo_tipo_documento td
     LEFT JOIN dbo_documentos_alumno d ON td.idTipoDocumento = d.idTipoDocumento 
        AND d.idAlumno = ?
     WHERE td.requerido = 1
     GROUP BY td.idTipoDocumento, td.nombre, td.requerido`,
    [idAlumno]
  );

  const faltantes = rows.filter(doc => doc.tiene_documento === 0 || doc.aprobado === 0);
  
  return {
    completo: faltantes.length === 0,
    total_requeridos: rows.length,
    documentos_aprobados: rows.filter(doc => doc.aprobado === 1).length,
    faltantes: faltantes.map(doc => doc.nombre)
  };
};

const actualizarEstado = async (idDocumento, estado, observaciones = null, idUsuarioRevisor) => {
  const result = await pool.query(
    `UPDATE dbo_documentos_alumno
     SET estado = ?, observaciones = ?, fecha_revision = NOW(), idUsuario_revisor = ?
     WHERE idDocumento = ?`,
    [estado, observaciones, idUsuarioRevisor, idDocumento]
  );

  await registrarAuditoria(
    idUsuarioRevisor,
    'UPDATE',
    'dbo_documentos_alumno',
    idDocumento,
    `Documento ${estado}: ${observaciones || 'Sin observaciones'}`
  );

  return result.affectedRows > 0;
};

const getTiposDocumento = async () => {
  const rows = await pool.query(
    `SELECT * FROM dbo_tipo_documento ORDER BY requerido DESC, nombre ASC`
  );
  return rows;
};

const getTipoDocumentoById = async (idTipoDocumento) => {
  const rows = await pool.query(
    `SELECT * FROM dbo_tipo_documento WHERE idTipoDocumento = ?`,
    [idTipoDocumento]
  );
  return rows[0];
};

const remove = async (idDocumento, idUsuarioElimina = null) => {
    await initializeWebdavClient(); 

    const documento = await getById(idDocumento); 
    
    if (!documento) {
        throw new Error('Documento no encontrado en la base de datos.');
    }
    
    const webdavPath = documento.ruta_archivo;

    try {
        await webdavClient.deleteFile(webdavPath);
        console.log(`Archivo WebDAV eliminado: ${webdavPath}`);
    } catch (webdavError) {

        if (webdavError.status === 404) {
            console.warn(`Advertencia: Archivo ${webdavPath} no encontrado en OwnCloud, pero se eliminará el registro de la DB.`);
        } else {
            console.error('Error al eliminar archivo en WebDAV:', webdavError);
            throw new Error('Fallo al eliminar el archivo del servidor en la nube.');
        }
    }

    const result = await pool.query(
        `DELETE FROM dbo_documentos_alumno WHERE idDocumento = ?`,
        [idDocumento]
    );

    if (result.affectedRows > 0) {
        await registrarAuditoria(
            idUsuarioElimina || documento.idAlumno,
            'DELETE',
            'dbo_documentos_alumno',
            idDocumento,
            `Documento eliminado: ${documento.nombre_original} (Ruta WebDAV: ${webdavPath})`
        );
    }
    
    return result.affectedRows > 0;
};

module.exports = {
  getById,
  verificarDocumentosCompletos,
  create,
  actualizarEstado,
  getTiposDocumento,
  getTipoDocumentoById,
  remove,
  initializeWebdavClient,
    getWebdavClient: () => webdavClient,
    createWebdavReadStream: fs_sync.createReadStream, 
};