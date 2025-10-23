const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query('SELECT * FROM dbo_becas');
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query('SELECT * FROM dbo_becas WHERE idBeca = ?', [id]);
  return rows[0];
};

const create = async () => {
  const result = await pool.query('INSERT INTO dbo_becas () VALUES ()');
  return result.insertId;
};

const remove = async (id) => {
  const result = await pool.query('DELETE FROM dbo_becas WHERE idBeca = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, create, remove };
