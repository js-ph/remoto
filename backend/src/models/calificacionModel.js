const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query('SELECT * FROM dbo_calificaciones');
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query(
    'SELECT * FROM dbo_calificaciones WHERE idCalificación = ?',
    [id]
  );
  return rows[0];
};

const create = async ({ idInscripción, valor, observaciones }) => {
  const result = await pool.query(
    'INSERT INTO dbo_calificaciones (idInscripción, valor, observaciones) VALUES (?, ?, ?)',
    [idInscripción, valor, observaciones || null]
  );
  return result.insertId;
};

const update = async (id, { idInscripción, valor, observaciones }) => {
  const result = await pool.query(
    'UPDATE dbo_calificaciones SET idInscripción = ?, valor = ?, observaciones = ? WHERE idCalificación = ?',
    [idInscripción, valor, observaciones || null, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const result = await pool.query(
    'DELETE FROM dbo_calificaciones WHERE idCalificación = ?',
    [id]
  );
  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };
