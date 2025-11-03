const pool = require('../db/pool');
const { registrarAuditoria } = require('./auditoriaModel');

const getAll = async () => {
  const rows = await pool.query('SELECT * FROM dbo_becas ORDER BY nombre_beca ASC');
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query('SELECT * FROM dbo_becas WHERE idBeca = ?', [id]);
  return rows[0];
};

const create = async ({ nombre_beca, descripcion, porcentaje_descuento }, idUsuarioCreador = null) => {
  if (porcentaje_descuento < 0 || porcentaje_descuento > 100) {
    throw new Error('El porcentaje de descuento debe estar entre 0 y 100');
  }

  const result = await pool.query(
    `INSERT INTO dbo_becas (nombre_beca, descripcion, porcentaje_descuento) 
     VALUES (?, ?, ?)`,
    [nombre_beca, descripcion, porcentaje_descuento]
  );

  await registrarAuditoria(
    idUsuarioCreador,
    'CREATE',
    'dbo_becas',
    result.insertId,
    `Beca creada: ${nombre_beca}`
  );

  return result.insertId;
};

const update = async (id, { nombre_beca, descripcion, porcentaje_descuento }, idUsuarioModificador = null) => {
  if (porcentaje_descuento < 0 || porcentaje_descuento > 100) {
    throw new Error('El porcentaje de descuento debe estar entre 0 y 100');
  }

  const result = await pool.query(
    `UPDATE dbo_becas 
     SET nombre_beca = ?, descripcion = ?, porcentaje_descuento = ?
     WHERE idBeca = ?`,
    [nombre_beca, descripcion, porcentaje_descuento, id]
  );

  if (result.affectedRows > 0) {
    await registrarAuditoria(
      idUsuarioModificador,
      'UPDATE',
      'dbo_becas',
      id,
      `Beca actualizada: ${nombre_beca}`
    );
  }

  return result.affectedRows;
};

const remove = async (id, idUsuarioEliminador = null) => {
  const pagosRows = await pool.query(
    'SELECT COUNT(*) as total FROM dbo_pagos WHERE idBeca = ?',
    [id]
  );

  if (pagosRows[0].total > 0) {
    throw new Error('No se puede eliminar la beca porque tiene pagos asociados');
  }

  const becaInfo = await getById(id);

  const result = await pool.query('DELETE FROM dbo_becas WHERE idBeca = ?', [id]);

  if (result.affectedRows > 0) {
    await registrarAuditoria(
      idUsuarioEliminador,
      'DELETE',
      'dbo_becas',
      id,
      `Beca eliminada: ${becaInfo?.nombre_beca || 'N/A'}`
    );
  }

  return result.affectedRows;
};

const getEstadisticas = async () => {
  const rows = await pool.query(
    `SELECT 
        b.idBeca,
        b.nombre_beca,
        b.porcentaje_descuento,
        COUNT(DISTINCT p.idUsuario) AS usuarios_con_beca,
        COUNT(p.idPago) AS total_pagos,
        SUM(CASE WHEN p.estado = 'Pagado' THEN 1 ELSE 0 END) AS pagos_completados,
        SUM(CASE WHEN p.estado = 'Pendiente' THEN 1 ELSE 0 END) AS pagos_pendientes
     FROM dbo_becas b
     LEFT JOIN dbo_pagos p ON b.idBeca = p.idBeca
     GROUP BY b.idBeca, b.nombre_beca, b.porcentaje_descuento
     ORDER BY usuarios_con_beca DESC`
  );
  return rows;
};

const getUsuariosPorBeca = async (idBeca) => {
  const rows = await pool.query(
    `SELECT DISTINCT
        u.idUsuario,
        u.usuario,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', p.apellido_materno) AS nombre_completo,
        COUNT(pa.idPago) AS total_pagos,
        SUM(pa.cantidad_a_pagar) AS total_adeudo
     FROM dbo_pagos pa
     INNER JOIN dbo_usuario u ON pa.idUsuario = u.idUsuario
     INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
     WHERE pa.idBeca = ?
     GROUP BY u.idUsuario, u.usuario, nombre_completo
     ORDER BY nombre_completo ASC`,
    [idBeca]
  );
  return rows;
};

module.exports = { 
  getAll, 
  getById, 
  create, 
  update, 
  remove,
  getEstadisticas,
  getUsuariosPorBeca
};