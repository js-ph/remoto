const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query(`SELECT m.idMateria, m.nombre_materia, m.semestre, m.descripcion, m.creditos, c.carrera
      FROM dbo_materias m
      INNER JOIN dbo_carrera c ON m.idCarrera = c.idCarrera`);
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query(
    `SELECT m.idMateria, m.nombre_materia, m.semestre, m.descripcion, m.creditos,
             c.carrera
      FROM dbo_materias m
      INNER JOIN dbo_carrera c ON m.idCarrera = c.idCarrera
      WHERE m.idMateria = ?`,
    [id]
  );
  return rows[0]; 
};

const create = async ({ idCarrera, nombre_materia, semestre, descripcion, creditos }) => {
  const result = await pool.query(
    `INSERT INTO dbo_materias (idCarrera, nombre_materia, semestre, descripcion, creditos)
      VALUES (?, ?, ?, ?, ?)`,
    [idCarrera, nombre_materia, semestre, descripcion, creditos ]
  );
  return result.insertId;
};

const update = async (id, { nombre_materia, semestre, descripcion, creditos  }) => {
  const result = await pool.query(
    `UPDATE dbo_materias
      SET nombre_materia = ?, semestre = ?, descripcion = ?, creditos = ?
      WHERE idMateria = ?`,
    [nombre_materia, semestre, descripcion, creditos, id ]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const result = await pool.query(
    `DELETE FROM dbo_materias WHERE idMateria = ?`,
    [id]
  );
  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };
