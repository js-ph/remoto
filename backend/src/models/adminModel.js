const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query(
    `SELECT 
        u.idUsuario, 
        l.idPerfil, 
        p.nombre, p.apellido_paterno, p.apellido_materno, 
        u.usuario, u.correo_electronico, 
        DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
        p.sexo, p.curp, m.municipio, e.estado
    FROM dbo_usuario_perfil l
    INNER JOIN dbo_usuario u ON l.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
    WHERE idPerfil = 2`
);
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query(
    `SELECT 
        u.idUsuario, 
        l.idPerfil, 
        p.nombre, p.apellido_paterno, p.apellido_materno, 
        u.usuario, u.correo_electronico, 
        DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
        p.sexo, p.curp, m.municipio, e.estado
    FROM dbo_usuario_perfil l
    INNER JOIN dbo_usuario u ON l.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
    WHERE l.idPerfil = 2
    AND l.idUsuario = ?`,
    [id]
);
  return rows[0]; 
};

const create = async ({
  nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
  sexo, curp, idEstado, idMunicipio,
  usuario, contrasena, correo_electronico
}) => {
  const idPerfil = 2; 

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const personaResult = await conn.query(
      `INSERT INTO dbo_persona (nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio]
    );
    const idPersona = Number(personaResult.insertId);

    const usuarioResult = await conn.query(
      `INSERT INTO dbo_usuario (idPersona, usuario, contrasena, correo_electronico)
       VALUES (?, ?, ?, ?)`,
      [idPersona, usuario, contrasena, correo_electronico]
    );
    const idUsuario = Number(usuarioResult.insertId);

    await conn.query(
      `INSERT INTO dbo_usuario_perfil (idUsuario, idPerfil)
       VALUES (?, ?)`,
      [idUsuario, idPerfil]
    );

    await conn.commit();

    return { idPersona, idUsuario, perfil: 'Administrador' };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const update = async (idAdmin, {
  nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
  sexo, curp, idEstado, idMunicipio, usuario, contrasena, correo_electronico
}) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const adminRows = await conn.query(
    `SELECT u.idUsuario, u.idPersona
    FROM dbo_usuario u
    JOIN dbo_usuario_perfil up ON u.idUsuario = up.idUsuario
    WHERE u.idUsuario = ? AND up.idPerfil = 2`,
    [idAdmin]
    );

    if (adminRows.length === 0) {
      throw new Error('Administrador no encontrado');
    }

    const { idUsuario, idPersona } = adminRows[0];

    await conn.query(
      `UPDATE dbo_persona
       SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, fecha_de_nacimiento = ?,
           sexo = ?, curp = ?, idEstado = ?, idMunicipio = ?
       WHERE idPersona = ?`,
      [nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio, idPersona]
    );

    await conn.query(
      `UPDATE dbo_usuario
       SET usuario = ?, contrasena = ?, correo_electronico = ?
       WHERE idUsuario = ?`,
      [usuario, contrasena, correo_electronico, idUsuario]
    );

    await conn.commit();
    return true; 
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const remove = async (idUsuario) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const usuarioRows = await conn.query(
      `SELECT u.idUsuario, u.idPersona
       FROM dbo_usuario u
       JOIN dbo_usuario_perfil up ON u.idUsuario = up.idUsuario
       WHERE u.idUsuario = ? AND up.idPerfil = 2`,
      [idUsuario]
    );

    if (usuarioRows.length === 0) {
      throw new Error('Administrador no encontrado');
    }

    const { idUsuario: uid, idPersona } = usuarioRows[0];

    await conn.query(`DELETE FROM dbo_usuario_perfil WHERE idUsuario = ?`, [uid]);
    await conn.query(`DELETE FROM dbo_usuario WHERE idUsuario = ?`, [uid]);
    await conn.query(`DELETE FROM dbo_persona WHERE idPersona = ?`, [idPersona]);

    await conn.commit();
    return true;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
module.exports = { getAll, getById, create, update, remove };