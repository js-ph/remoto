const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query(`SELECT * FROM dbo_carrera`);
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query(
    `SELECT idCarrera, carrera, duracion_semestres, descripcion, idPlantel
      FROM dbo_carrera
      WHERE idCarrera = ?`,
    [id]
  );
  return rows[0]; 
};

const create = async ({ carrera, duracion_semestres, descripcion, idPlantel }) => {
  const result = await pool.query(
    `INSERT INTO dbo_carrera (carrera, duracion_semestres, descripcion, idPlantel)
     VALUES (?, ?, ?, ?)`,
    [carrera, duracion_semestres, descripcion, idPlantel]
  );
  return result.insertId;
};

const update = async (id, { carrera, duracion_semestres, descripcion, idPlantel }) => {
  const result = await pool.query(
    `UPDATE dbo_carrera
      SET carrera = ?, duracion_semestres = ?, descripcion = ?, idPlantel = ?
      WHERE idCarrera = ?`,
    [carrera, duracion_semestres, descripcion, idPlantel, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const result = await pool.query(
    `DELETE FROM dbo_carrera WHERE idCarrera = ?`,
    [id]
  );
  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };
