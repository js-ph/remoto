const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query(`
    SELECT i.idInscripcion, a.usuario AS alumno, g.clave_grupo, g.periodo,
           m.nombre_materia, d.usuario AS docente
    FROM dbo_inscripciones i
    INNER JOIN dbo_usuario a ON i.idAlumno = a.idUsuario
    INNER JOIN dbo_grupo g ON i.idGrupo = g.idGrupo
    INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
    LEFT JOIN dbo_usuario d ON g.idDocente = d.idUsuario
    ORDER BY g.periodo DESC, a.usuario ASC
  `);
  return rows;
};

const getById = async (idInscripcion) => {
  const rows = await pool.query(`
    SELECT i.idInscripcion, a.usuario AS alumno, g.clave_grupo, g.periodo,
           m.nombre_materia, d.usuario AS docente
    FROM dbo_inscripciones i
    INNER JOIN dbo_usuario a ON i.idAlumno = a.idUsuario
    INNER JOIN dbo_grupo g ON i.idGrupo = g.idGrupo
    INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
    LEFT JOIN dbo_usuario d ON g.idDocente = d.idUsuario
    WHERE i.idInscripcion = ?
  `, [idInscripcion]);
  return rows[0];
};

const create = async ({ idAlumno, idGrupo }) => {
  const existe = await pool.query(`
    SELECT * FROM dbo_inscripciones
    WHERE idAlumno = ? AND idGrupo = ?
  `, [idAlumno, idGrupo]);

  if (existe.length > 0) return null; 

  const result = await pool.query(`
    INSERT INTO dbo_inscripciones (idAlumno, idGrupo)
    VALUES (?, ?)
  `, [idAlumno, idGrupo]);

  return result.insertId;
};

const update = async (idInscripcion, { idAlumno, idGrupo }) => {
  const result = await pool.query(`
    UPDATE dbo_inscripciones
    SET idAlumno = ?, idGrupo = ?
    WHERE idInscripcion = ?
  `, [idAlumno, idGrupo, idInscripcion]);

  return result.affectedRows;
};

const remove = async (idInscripcion) => {
  const result = await pool.query(`
    DELETE FROM dbo_inscripciones WHERE idInscripcion = ?
  `, [idInscripcion]);

  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };
