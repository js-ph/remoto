const pool = require('../db/pool');

const registrarAuditoria = async (idUsuario, accion, tabla_afectada = null, id_registro_afectado = null, observaciones = null) => {
  try {
    await pool.query(
      `INSERT INTO dbo_auditoria (idUsuario, accion, observaciones)
       VALUES (?, ?, ?)`,
      [idUsuario, accion, observaciones]
    );
  } catch (err) {
    console.error('Error al registrar auditoría:', err);
  }
};

const getAll = async () => {
  const rows = await pool.query(
    `SELECT a.*, u.usuario, p.nombre, p.apellido_paterno
     FROM dbo_auditoria a
     LEFT JOIN dbo_usuario u ON a.idUsuario = u.idUsuario
     LEFT JOIN dbo_persona p ON u.idPersona = p.idPersona
     ORDER BY a.fecha_accion DESC
     LIMIT 1000`
  );
  return rows;
};

const getByUsuario = async (idUsuario, limite = 100) => {
  const rows = await pool.query(
    `SELECT * FROM dbo_auditoria
     WHERE idUsuario = ?
     ORDER BY fechaAccion DESC
     LIMIT ?`,
    [idUsuario, limite]
  );
  return rows;
};

const getByFecha = async (fechaInicio, fechaFin) => {
  const rows = await pool.query(
    `SELECT a.*, u.usuario, p.nombre, p.apellido_paterno
     FROM dbo_auditoria a
     LEFT JOIN dbo_usuario u ON a.idUsuario = u.idUsuario
     LEFT JOIN dbo_persona p ON u.idPersona = p.idPersona
     WHERE a.fechaAccion BETWEEN ? AND ?
     ORDER BY a.fechaAccion DESC`,
    [fechaInicio, fechaFin]
  );
  return rows;
};

module.exports = {
  registrarAuditoria,
  getAll,
  getByUsuario,
  getByFecha
};