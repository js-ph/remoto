const pool = require('../db/pool');
const { registrarAuditoria } = require('./auditoriaModel');
const bcrypt = require('bcrypt'); // Asegúrate de instalarlo: 

const SALT_ROUNDS = 10;

const getAll = async () => {
  const rows = await pool.query(
    `SELECT 
        u.idUsuario, 
        l.idPerfil, 
        p.nombre, p.apellido_paterno, p.apellido_materno, 
        u.usuario, u.correo_electronico, 
        DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
        p.sexo, p.curp, m.municipio, e.estado,
        u.status,
        u.ultimo_login
    FROM dbo_usuario_perfil l
    INNER JOIN dbo_usuario u ON l.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
    WHERE l.idPerfil = 2 AND u.status = 1`
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
        p.sexo, p.curp, m.municipio, e.estado,
        u.status,
        u.nuevoUsuario,
        u.ultimo_login
    FROM dbo_usuario_perfil l
    INNER JOIN dbo_usuario u ON l.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
    WHERE l.idPerfil = 2 AND l.idUsuario = ?`,
    [id]
  );
  return rows[0]; 
};

const create = async ({
  nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
  sexo, curp, idEstado, idMunicipio,
  usuario, contrasena, correo_electronico
}, idUsuarioCreador = null) => {
  const idPerfil = 2; 
  const nuevoUsuario = 1;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);

    const personaResult = await conn.query(
      `INSERT INTO dbo_persona (nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio]
    );
    const idPersona = Number(personaResult.insertId);

    const usuarioResult = await conn.query(
      `INSERT INTO dbo_usuario (idPersona, nuevoUsuario, usuario, contrasena, correo_electronico, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [idPersona, nuevoUsuario, usuario, hashedPassword, correo_electronico]
    );
    const idUsuario = Number(usuarioResult.insertId);

    await conn.query(
      `INSERT INTO dbo_usuario_perfil (idUsuario, idPerfil)
       VALUES (?, ?)`,
      [idUsuario, idPerfil]
    );

    await conn.commit();

    await registrarAuditoria(
      idUsuarioCreador,
      'CREATE',
      'dbo_usuario',
      idUsuario,
      `Administrador creado: ${usuario}`
    );

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
}, idUsuarioModificador = null) => {
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

    let hashedPassword = contrasena;
    if (contrasena && contrasena.length < 60) { 
      hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);
    }

    await conn.query(
      `UPDATE dbo_usuario
       SET usuario = ?, contrasena = ?, correo_electronico = ?
       WHERE idUsuario = ?`,
      [usuario, hashedPassword, correo_electronico, idUsuario]
    );

    await conn.commit();

    await registrarAuditoria(
      idUsuarioModificador,
      'UPDATE',
      'dbo_usuario',
      idUsuario,
      `Administrador actualizado: ${usuario}`
    );

    return true; 
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// Soft delete (cambiar status a 0)
const softDelete = async (idUsuario, idUsuarioEliminador = null) => {
  const result = await pool.query(
    `UPDATE dbo_usuario SET status = 0 WHERE idUsuario = ?`,
    [idUsuario]
  );

  if (result.affectedRows > 0) {
    await registrarAuditoria(
      idUsuarioEliminador,
      'SOFT_DELETE',
      'dbo_usuario',
      idUsuario,
      'Administrador desactivado'
    );
  }

  return result.affectedRows > 0;
};

// Hard delete (eliminar permanentemente)
const remove = async (idUsuario, idUsuarioEliminador = null) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const usuarioRows = await conn.query(
      `SELECT u.idUsuario, u.idPersona, u.usuario
       FROM dbo_usuario u
       JOIN dbo_usuario_perfil up ON u.idUsuario = up.idUsuario
       WHERE u.idUsuario = ? AND up.idPerfil = 2`,
      [idUsuario]
    );

    if (usuarioRows.length === 0) {
      throw new Error('Administrador no encontrado');
    }

    const { idUsuario: uid, idPersona, usuario } = usuarioRows[0];

    await conn.query(`DELETE FROM dbo_usuario_perfil WHERE idUsuario = ?`, [uid]);
    await conn.query(`DELETE FROM dbo_usuario WHERE idUsuario = ?`, [uid]);
    await conn.query(`DELETE FROM dbo_persona WHERE idPersona = ?`, [idPersona]);

    await conn.commit();

    await registrarAuditoria(
      idUsuarioEliminador,
      'DELETE',
      'dbo_usuario',
      uid,
      `Administrador eliminado permanentemente: ${usuario}`
    );

    return true;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const reactivate = async (idUsuario, idUsuarioReactivador = null) => {
  const result = await pool.query(
    `UPDATE dbo_usuario SET status = 1 WHERE idUsuario = ?`,
    [idUsuario]
  );

  if (result.affectedRows > 0) {
    await registrarAuditoria(
      idUsuarioReactivador,
      'REACTIVATE',
      'dbo_usuario',
      idUsuario,
      'Administrador reactivado'
    );
  }

  return result.affectedRows > 0;
};

const marcarComoUsuarioExistente = async (idUsuario) => {
  await pool.query(
    `UPDATE dbo_usuario SET nuevoUsuario = 0 WHERE idUsuario = ?`,
    [idUsuario]
  );
};

module.exports = { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  softDelete, 
  reactivate,
  marcarComoUsuarioExistente
};