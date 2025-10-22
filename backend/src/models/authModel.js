const pool = require('../db/pool');

const recordLogin = async (idUsuario) => {
    await pool.query(
        `UPDATE dbo_usuario SET ultimo_login = NOW() WHERE idUsuario = ?`,
        [idUsuario]
    );
};

const recordLogout = async (idUsuario) => {
    return true; 
};

const findUser = async (usuario, contrasena) => {
  const rows = await pool.query(
    `SELECT u.idUsuario, u.usuario, u.contrasena, lp.nombre AS perfil
     FROM dbo_usuario u
     LEFT JOIN dbo_usuario_perfil up ON u.idUsuario = up.idUsuario
     LEFT JOIN dbo_login_perfil lp ON up.idPerfil = lp.idPerfil
     WHERE u.usuario = ? AND u.contrasena = ?`,
    [usuario, contrasena]
  );
  return rows[0];
};

const getDocenteByUserId = async (idUsuario) => {
  const rows = await pool.query('SELECT idDocente FROM dbo_docente WHERE idUsuario = ?', [idUsuario]);
  return rows[0]?.idDocente || null;
};

const getAlumnoByUserId = async (idUsuario) => {
  const rows = await pool.query('SELECT idAlumno FROM dbo_alumno WHERE idUsuario = ?', [idUsuario]);
  return rows[0]?.idAlumno || null;
};

const getRoles = async () => {
  const rows = await pool.query('SELECT nombre FROM dbo_login_perfil');
  return rows.map(r => r.nombre);
};

const getRoleById = async (idPerfil) => {
  const rows = await pool.query('SELECT nombre, descripcion FROM dbo_login_perfil WHERE idPerfil = ?', [idPerfil]);
  return rows[0];
};

const getDatosPersonales = async (idUsuario) => {
  const rows = await pool.query(
    `SELECT u.idUsuario, p.nombre, p.apellido_paterno, p.apellido_materno, u.usuario, u.correo_electronico, 
            DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
            p.sexo, p.curp, m.municipio, e.estado, lp.nombre AS perfil
     FROM dbo_usuario u
     LEFT JOIN dbo_usuario_perfil up ON u.idUsuario = up.idUsuario
     INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
     INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
     INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
     LEFT JOIN dbo_login_perfil lp ON up.idPerfil = lp.idPerfil
     WHERE u.idUsuario = ?`,
    [idUsuario]
  );
  return rows[0];
};

module.exports = {
  findUser,
  getDocenteByUserId,
  getAlumnoByUserId,
  getRoles,
  getRoleById,
  getDatosPersonales,
  recordLogin,
  recordLogout
};
