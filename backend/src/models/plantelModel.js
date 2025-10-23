const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query(`SELECT * FROM dbo_plantel`);
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query(
    `SELECT idPlantel, nombre_plantel, idEstado, idMunicipio
     FROM dbo_plantel
     WHERE idPlantel = ?`,
    [id]
  );
  return rows[0]; 
};

const create = async ({ nombre_plantel, idEstado, idMunicipio }) => {
  const result = await pool.query(
    `INSERT INTO dbo_plantel (nombre_plantel, idEstado, idMunicipio)
     VALUES (?, ?, ?)`,
    [nombre_plantel, idEstado, idMunicipio]
  );
  return result.insertId;
};

const update = async (id, { nombre_plantel, idEstado, idMunicipio }) => {
  const result = await pool.query(
    `UPDATE dbo_plantel
     SET nombre_plantel = ?, idEstado = ?, idMunicipio = ?
     WHERE idPlantel = ?`,
    [nombre_plantel, idEstado, idMunicipio, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const result = await pool.query(
    `DELETE FROM dbo_plantel WHERE idPlantel = ?`,
    [id]
  );
  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };
