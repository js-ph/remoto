const pool = require('../db/pool');
const { registrarAuditoria } = require('./auditoriaModel');
const bcrypt = require('bcrypt');

const recordLogin = async (idUsuario) => {
  await pool.query(
    `UPDATE dbo_usuario SET ultimo_login = NOW() WHERE idUsuario = $1`,
    [idUsuario]
  );
  
  await registrarAuditoria(idUsuario, 'LOGIN', 'dbo_usuario', idUsuario, 'Usuario inició sesión');
};

const recordLogout = async (idUsuario) => {
  await registrarAuditoria(idUsuario, 'LOGOUT', 'dbo_usuario', idUsuario, 'Usuario cerró sesión');
  return true; 
};

const findUserByUsername = async (usuario) => {
    // Consulta TEMPORAL: Solo busca en la tabla de usuario.
    const rows = await pool.query( 
        `SELECT u.idUsuario, u.usuario, u.contrasena, u.status, u.nuevoUsuario
         FROM dbo_usuario u
         WHERE LOWER(TRIM(u.usuario)) = LOWER(TRIM($1))`,
        [usuario]
    );
    
    // Si la fila se encuentra, devolvemos un objeto con la info básica.
    if (rows[0]) {
        return {
            ...rows[0],
            // Los campos de perfil serán NULL o 'temporal' hasta que los joins funcionen
            idPerfil: null, 
            perfil: 'temporal' 
        };
    }
    
    return null;
};

const updatePasswordHash = async (idUsuario, nuevoHash) => {
    await pool.query(
        `UPDATE dbo_usuario SET contrasena = $1 WHERE idUsuario = $2`,
        [nuevoHash, idUsuario]
    );
};

const cambiarContrasena = async (idUsuario, contrasenaActual, contrasenaNueva) => {
    const rows = await pool.query(
        `SELECT contrasena FROM dbo_usuario WHERE idUsuario = $1`,
        [idUsuario]
    );

    if (rows.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const passwordMatch = await bcrypt.compare(contrasenaActual, rows[0].contrasena);

    if (!passwordMatch) {
        throw new Error('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(contrasenaNueva, 10);

    await pool.query(
        `UPDATE dbo_usuario SET contrasena = $1 WHERE idUsuario = $2`,
        [hashedPassword, idUsuario]
    );

    await registrarAuditoria(idUsuario, 'UPDATE', 'dbo_usuario', idUsuario, 'Usuario cambió su contraseña');

    return true;
};

const restablecerContrasena = async (idUsuario, nuevaContrasena, idAdministrador) => {
  const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
  
  await pool.query(
    `UPDATE dbo_usuario SET contrasena = $1, nuevoUsuario = 1 WHERE idUsuario = $2`,
    [hashedPassword, idUsuario]
  );
  
  await registrarAuditoria(
    idAdministrador, 
    'UPDATE', 
    'dbo_usuario', 
    idUsuario, 
    'Administrador restableció la contraseña del usuario'
  );
  
  return true;
};

const getDocenteByUserId = async (idUsuario) => {
  const rows = await pool.query('SELECT idDocente FROM dbo_docente WHERE idUsuario = $1', [idUsuario]);
  return rows[0]?.idDocente || null;
};

const getAlumnoByUserId = async (idUsuario) => {
  const rows = await pool.query('SELECT idAlumno FROM dbo_alumno WHERE idUsuario = $1', [idUsuario]);
  return rows[0]?.idAlumno || null;
};

const getRoles = async () => {
  const rows = await pool.query('SELECT idPerfil, nombre, descripcion FROM dbo_login_perfil');
  return rows;
};

const getRoleById = async (idPerfil) => {
  const rows = await pool.query('SELECT nombre, descripcion FROM dbo_login_perfil WHERE idPerfil = $1', [idPerfil]);
  return rows[0];
};

const getDatosPersonales = async (idUsuario) => {
  const rows = await pool.query(
    `SELECT u.idUsuario, u.nuevoUsuario, u.status,
            p.nombre, p.apellido_paterno, p.apellido_materno, 
            u.usuario, u.correo_electronico, 
            TO_CHAR(p.fecha_de_nacimiento, 'YYYY-MM-DD') AS fechaNacimiento, // <--- CORREGIDO A TO_CHAR
            p.sexo, p.curp, 
            m.municipio, e.estado, 
            lp.idPerfil, lp.nombre AS perfil,
            u.ultimo_login
      FROM dbo_usuario u
      LEFT JOIN dbo_usuario_perfil up ON u.idUsuario = up.idUsuario
      INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
      INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
      INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
      LEFT JOIN dbo_login_perfil lp ON up.idPerfil = lp.idPerfil
      WHERE u.idUsuario = $1`,
    [idUsuario]
  );
  return rows[0];
};

/**
 * Verifica si es el primer login del usuario
 */
const esNuevoUsuario = async (idUsuario) => {
  const rows = await pool.query(
    `SELECT nuevoUsuario FROM dbo_usuario WHERE idUsuario = $1`,
    [idUsuario]
  );
  return rows[0]?.nuevoUsuario === 1;
};

/**
 * Marca al usuario como experimentado (ya no nuevo)
 */
const marcarComoUsuarioExperimentado = async (idUsuario) => {
  await pool.query(
    `UPDATE dbo_usuario SET nuevoUsuario = 0 WHERE idUsuario = $1`,
    [idUsuario]
  );
};

/**
 * Obtiene estadísticas de usuarios
 */
const getEstadisticasUsuarios = async () => {
  const rows = await pool.query(
    `SELECT 
        lp.nombre AS perfil,
        COUNT(DISTINCT u.idUsuario) AS total,
        SUM(CASE WHEN u.status = 1 THEN 1 ELSE 0 END) AS activos,
        SUM(CASE WHEN u.status = 0 THEN 1 ELSE 0 END) AS inactivos,
        SUM(CASE WHEN u.nuevoUsuario = 1 THEN 1 ELSE 0 END) AS nuevos
     FROM dbo_usuario u
     INNER JOIN dbo_usuario_perfil up ON u.idUsuario = up.idUsuario
     INNER JOIN dbo_login_perfil lp ON up.idPerfil = lp.idPerfil
     GROUP BY lp.nombre`
  );
  return rows;
};

module.exports = {
  cambiarContrasena,
  restablecerContrasena,
  getDocenteByUserId,
  getAlumnoByUserId,
  getRoles,
  getRoleById,
  getDatosPersonales,
  recordLogin,
  recordLogout,
  esNuevoUsuario,
  marcarComoUsuarioExperimentado,
  getEstadisticasUsuarios,
  findUserByUsername,
  updatePasswordHash
};