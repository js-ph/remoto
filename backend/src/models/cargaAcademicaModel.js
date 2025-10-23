const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query('SELECT * FROM dbo_carga_academica');
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query('SELECT * FROM dbo_carga_academica WHERE idCargaAcademica = ?', [id]);
  return rows[0];
};

const create = async ({ idMateria, SC, AS, EGC, creditos, RC, Grupo }) => {
  const result = await pool.query(
    `INSERT INTO dbo_carga_academica (idMateria, SC, AS, EGC, creditos, RC, Grupo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [idMateria, SC || null, AS || null, EGC || null, creditos || null, RC || null, Grupo || null]
  );
  return result.insertId;
};

const update = async (id, { idMateria, SC, AS, EGC, creditos, RC, Grupo }) => {
  const result = await pool.query(
    `UPDATE dbo_carga_academica
     SET idMateria = ?, SC = ?, AS = ?, EGC = ?, creditos = ?, RC = ?, Grupo = ?
     WHERE idCargaAcademica = ?`,
    [idMateria, SC || null, AS || null, EGC || null, creditos || null, RC || null, Grupo || null, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const result = await pool.query('DELETE FROM dbo_carga_academica WHERE idCargaAcademica = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };
