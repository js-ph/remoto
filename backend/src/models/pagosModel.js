const pool = require('../db/pool');

const getALL = async () => {
  const rows = await pool.query(`SELECT * FROM dbo_pagos`);
  return {rows};
};

const getByID = async (id) => {
  const rows = await pool.query(
    'SELECT * FROM dbo_pagos WHERE idPago = ?',
    [id]
  );
  return rows[0]; 
};

const create = async ({ idBeca, idUsuario, cantidad_a_pagar, fecha_de_pago, estado }) => {
  const result = await pool.query(
    `INSERT INTO dbo_pagos (idBeca, idUsuario, cantidad_a_pagar, fecha_de_pago, estado)
      VALUES (?, ?, ?, ?, ?)`,
    [idBeca, idUsuario, cantidad_a_pagar, fecha_de_pago || null, estado]
  );
  return result.insertId;
};

const update = async (id, { idBeca, idUsuario, cantidad_a_pagar, fecha_de_pago, estado }) => {
  const result = await pool.query(
    `UPDATE dbo_pagos
      SET idBeca = ?, idUsuario = ?, cantidad_a_pagar = ?, fecha_de_pago = ?, estado = ?
      WHERE idPago = ?`,
    [idBeca, idUsuario, cantidad_a_pagar, fecha_de_pago, estado, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const result = await pool.query(
    `DELETE FROM dbo_pagos WHERE idPago = ?`,
    [id]
  );
  return result.affectedRows;
};

module.exports = { getALL, getByID, create, update, remove };