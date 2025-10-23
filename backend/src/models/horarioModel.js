const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query(`SELECT h.idHorario, h.dia_semana, h.hora, h.aula,
             g.clave_grupo, m.nombre_materia, d.usuario AS docente
      FROM dbo_horario h
      INNER JOIN dbo_grupo g ON h.idGrupo = g.idGrupo
      INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
      LEFT JOIN dbo_usuario d ON g.idDocente = d.idUsuario
      ORDER BY FIELD(h.dia_semana, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'),
               h.hora ASC`);
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query(
    `SELECT h.idHorario, h.dia_semana, h.hora, h.aula,
             g.clave_grupo, m.nombre_materia, d.usuario AS docente
      FROM dbo_horario h
      INNER JOIN dbo_grupo g ON h.idGrupo = g.idGrupo
      INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
      LEFT JOIN dbo_usuario d ON g.idDocente = d.idUsuario
      WHERE h.idHorario = ?`,
    [id]
  );
  return rows[0]; 
};

const create = async ({ dia_semana, hora, aula, idGrupo }) => {
  const result = await pool.query(
    `INSERT INTO dbo_horario (dia_semana, hora, aula, idGrupo)
      VALUES (?, ?, ?, ?)`,
    [dia_semana, hora, aula, idGrupo]
  );
  return result.insertId;
};

const update = async (id, { dia_semana, hora, aula }) => {
  const result = await pool.query(
    `UPDATE dbo_horario
      SET dia_semana = ?, hora = ?, aula = ?
      WHERE idHorario = ?`,
    [dia_semana, hora, aula, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const result = await pool.query(
    `DELETE FROM dbo_horario WHERE idHorario = ?`,
    [id]
  );
  return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };