const pool = require('../db/pool');

const registrarAuditoria = async (idUsuario, accion, observaciones = null) => {
  try {
    await pool.query(
      `INSERT INTO dbo_auditoria (idUsuario, accion, observaciones)
        VALUES ($1, $2, $3)`,
      [idUsuario, accion, observaciones]
    );
  } catch (err) {
    console.error('Error al registrar auditoría:', err);
  }
};

const getAll = async () => {
  const resultadoObjeto = await pool.query(
    `SELECT a.*, u.usuario, p.nombre, p.apellido_paterno
      FROM dbo_auditoria a
      LEFT JOIN dbo_usuario u ON a.idUsuario = u.idUsuario
      LEFT JOIN dbo_persona p ON u.idPersona = p.idPersona
      ORDER BY a.fecha_accion DESC
      LIMIT 1000` 
  );
  return resultadoObjeto.rows;
};

const getByUsuario = async (idUsuario, limite = 100) => {
  const resultadoObjeto = await pool.query(
    `SELECT * FROM dbo_auditoria
      WHERE idUsuario = $1
      ORDER BY fechaAccion DESC
      LIMIT $2`, 
    [idUsuario, limite]
  );
  return resultadoObjeto.rows;
};

const getByFecha = async (fechaInicio, fechaFin) => {
  const resultadoObjeto = await pool.query(
    `SELECT a.*, u.usuario, p.nombre, p.apellido_paterno
      FROM dbo_auditoria a
      LEFT JOIN dbo_usuario u ON a.idUsuario = u.idUsuario
      LEFT JOIN dbo_persona p ON u.idPersona = p.idPersona
      WHERE a.fechaAccion BETWEEN $1 AND $2
      ORDER BY a.fechaAccion DESC`, 
    [fechaInicio, fechaFin]
  );
  return resultadoObjeto.rows;
};

module.exports = {
  registrarAuditoria,
  getAll,
  getByUsuario,
  getByFecha
};