const pool = require('../db/pool');

const getAll = async () => {
  return await pool.query(`
    SELECT g.idGrupo, g.clave_grupo, g.cupo, m.nombre_materia, d.usuario AS docente
    FROM dbo_grupo g
    INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
    LEFT JOIN dbo_usuario d ON g.idDocente = d.idUsuario
  `);
};

const getById = async (idGrupo) => {
  const rows = await pool.query(`
    SELECT g.idGrupo, g.clave_grupo, g.cupo, m.nombre_materia, d.usuario AS docente
    FROM dbo_grupo g
    INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
    LEFT JOIN dbo_usuario d ON g.idDocente = d.idUsuario
    WHERE g.idGrupo = ?
  `, [idGrupo]);

  return rows[0];
};

const create = async ({ periodo, clave_grupo, cupo, idMateria, idDocente }) => {
  const result = await pool.query(`
    INSERT INTO dbo_grupo (periodo, clave_grupo, cupo, idMateria, idDocente)
    VALUES (?, ?, ?, ?, ?)
  `, [periodo, clave_grupo, cupo, idMateria, idDocente]);

  return Number(result.insertId);
};

const update = async (idGrupo, { periodo, clave_grupo, cupo, idMateria, idDocente }) => {
  const result = await pool.query(`
    UPDATE dbo_grupo
    SET periodo = ?, clave_grupo = ?, cupo = ?, idMateria = ?, idDocente = ?
    WHERE idGrupo = ?
  `, [periodo, clave_grupo, cupo, idMateria, idDocente, idGrupo]);

  return result.affectedRows;
};

const remove = async (idGrupo) => {
  const result = await pool.query('DELETE FROM dbo_grupo WHERE idGrupo = ?', [idGrupo]);
  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };