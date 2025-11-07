const documentoModel = require('../models/documentoModel');
const path = require('path');
const fs = require('fs').promises; 
const crypto = require('crypto');

let webdavClient = null;

const getWebdavClient = async () => {
    if (webdavClient) {
        return webdavClient;
    }
    
    const WEBDAV_BASE_URL = "http://172.16.3.136/owncloud/remote.php/dav/files/jsph"; 
    const OWNCLOUD_USERNAME = "jsph";
    const OWNCLOUD_PASSWORD = "admin";

    try {
        const webdav = await import("webdav");
        
        const client = webdav.createClient(WEBDAV_BASE_URL, {
            username: OWNCLOUD_USERNAME,
            password: OWNCLOUD_PASSWORD
        });
        
        webdavClient = {
            client: client,
            createReadStream: webdav.createReadStream 
        };
        
        return webdavClient;

    } catch (e) {
        console.error("Fallo al cargar las utilidades de WebDAV en el controlador:", e);
        throw new Error("No se pudo conectar al servicio de almacenamiento en la nube.");
    }
}

const subirDocumento = async (req, res) => {
  try {
    const { idAlumno, idTipoDocumento } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const tipoDoc = await documentoModel.getTipoDocumentoById(idTipoDocumento);

    if (!tipoDoc) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento no válido'
      });
    }

    const extension = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const formatosPermitidos = tipoDoc.formato_permitido.split(',');

    if (!formatosPermitidos.includes(extension)) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Formato no permitido. Formatos aceptados: ${tipoDoc.formato_permitido}`
      });
    }

    const tamanoKB = req.file.size / 1024;
    if (tamanoKB > tipoDoc.tamano_maximo) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: `El archivo excede el tamaño máximo permitido (${tipoDoc.tamano_maximo} KB)`
      });
    }

    const idDocumento = await documentoModel.create({
      idAlumno,
      idTipoDocumento,
      nombre_original: req.file.originalname,
      nombre_guardado: req.file.filename,
      ruta_archivo: req.file.path, 
      tamano: req.file.size,
      extension: extension,
      mime_type: req.file.mimetype
    },req.user?.idUsuario);

    res.status(201).json({
      success: true,
      message: 'Documento subido correctamente',
      data: {
        idDocumento: Number(idDocumento), 
        nombre_original: req.file.originalname,
        tamano: Number(req.file.size) 
      }
    });
    
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path); 
      } catch (unlinkError) {
        console.error('Error al eliminar archivo tras fallo en validación:', unlinkError);
      }
    }

    if (res.headersSent) {
        console.error('Error asíncrono tardío capturado:', error);
        return; 
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const descargarDocumento = async (req, res) => {
  try {
    const { idDocumento } = req.params;
    const documento = await documentoModel.getById(idDocumento);
    
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento no encontrado' });
    }

    const { client } = await getWebdavClient();

    const webdavStream = client.createReadStream(documento.ruta_archivo);

    res.setHeader('Content-Type', documento.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${documento.nombre_original}"`);

    webdavStream.pipe(res);

    webdavStream.on('error', (error) => {
        console.error('Error al descargar desde OwnCloud:', error);
        if (!res.headersSent) {
            return res.status(404).json({ success: false, message: 'Archivo físico no encontrado en la nube.' });
        }
    });

  } catch (error) {
    if (!res.headersSent) {
        res.status(500).json({ success: false, message: error.message });
    }
  }
};

const visualizarDocumento = async (req, res) => {
  try {
    const { idDocumento } = req.params;
    const documento = await documentoModel.getById(idDocumento);

    if (!documento || !documento.ruta_archivo) {
      return res.status(404).json({ 
        success: false, 
        message: `Documento ID ${idDocumento} no encontrado o ruta de archivo inválida.` 
      });
    }

    const { client } = await getWebdavClient();

    const webdavStream = client.createReadStream(documento.ruta_archivo);

    res.setHeader('Content-Type', documento.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${documento.nombre_original}"`);

    webdavStream.pipe(res);

    webdavStream.on('error', (error) => {
        console.error('Error al visualizar desde OwnCloud:', error);
        if (!res.headersSent) {
            return res.status(404).json({ success: false, message: 'Archivo físico no encontrado en la nube.' });
        }
    });

  } catch (error) {
    if (!res.headersSent) {
        res.status(500).json({ success: false, message: error.message });
    }
  }
};

const eliminarDocumento = async (req, res) => {
    try {
        const { idDocumento } = req.params;

        const eliminado = await documentoModel.remove(idDocumento, req.user?.idUsuario);

        if (eliminado) {
            res.status(200).json({ 
                success: true, 
                message: 'Documento eliminado correctamente de la base de datos y de OwnCloud.' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'El documento no fue encontrado para ser eliminado.' 
            });
        }
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
  subirDocumento,
  descargarDocumento,
  visualizarDocumento,
  eliminarDocumento
};