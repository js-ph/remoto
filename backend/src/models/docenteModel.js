const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query(`
    SELECT d.idDocente, p.nombre, p.apellido_paterno, p.apellido_materno, u.usuario, u.correo_electronico,
           DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
           p.sexo, p.curp, m.municipio, e.estado
    FROM dbo_docente d
    INNER JOIN dbo_usuario u ON d.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
  `);
  return rows;
};

const getById = async (idDocente) => {
  const rows = await pool.query(`
    SELECT d.idDocente, p.nombre, p.apellido_paterno, p.apellido_materno, u.usuario, u.correo_electronico,
           DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
           p.sexo, p.curp, m.municipio, e.estado
    FROM dbo_docente d
    INNER JOIN dbo_usuario u ON d.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
    WHERE d.idDocente = ?
  `, [idDocente]);

  return rows[0]; 
};

const create = async ({
  nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
  sexo, curp, idEstado, idMunicipio,
  usuario, contrasena, correo_electronico
}) => {
  const idPerfil = 3; // Docente
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const personaResult = await conn.query(
      `INSERT INTO dbo_persona (nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio]
    );
    const idPersona = Number(personaResult.insertId);

    const usuarioResult = await conn.query(
      `INSERT INTO dbo_usuario (idPersona, usuario, contrasena, correo_electronico)
       VALUES (?, ?, ?, ?)`,
      [idPersona, usuario, contrasena, correo_electronico]
    );
    const idUsuario = Number(usuarioResult.insertId);

    await conn.query(`INSERT INTO dbo_docente (idUsuario) VALUES (?)`, [idUsuario]);
    await conn.query(`INSERT INTO dbo_usuario_perfil (idUsuario, idPerfil) VALUES (?, ?)`, [idUsuario, idPerfil]);

    await conn.commit();
    return { idPersona, idUsuario, perfil: 'Docente' };
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const update = async (idDocente, {
  nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
  sexo, curp, idEstado, idMunicipio,
  usuario, contrasena, correo_electronico
}) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const docenteRows = await conn.query(`SELECT idUsuario FROM dbo_docente WHERE idDocente = ?`, [idDocente]);
    if (docenteRows.length === 0) throw new Error('Docente no encontrado');
    const idUsuario = docenteRows[0].idUsuario;

    const usuarioRows = await conn.query(`SELECT idPersona FROM dbo_usuario WHERE idUsuario = ?`, [idUsuario]);
    if (usuarioRows.length === 0) throw new Error('Usuario del docente no encontrado');
    const idPersona = usuarioRows[0].idPersona;

    await conn.query(
      `UPDATE dbo_persona SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, fecha_de_nacimiento = ?,
       sexo = ?, curp = ?, idEstado = ?, idMunicipio = ? WHERE idPersona = ?`,
      [nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio, idPersona]
    );

    await conn.query(
      `UPDATE dbo_usuario SET usuario = ?, contrasena = ?, correo_electronico = ? WHERE idUsuario = ?`,
      [usuario, contrasena, correo_electronico, idUsuario]
    );

    await conn.commit();
    return true;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const remove = async (idDocente) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const docenteRows = await conn.query(`SELECT idUsuario FROM dbo_docente WHERE idDocente = ?`, [idDocente]);
    if (docenteRows.length === 0) throw new Error('Docente no encontrado');
    const idUsuario = docenteRows[0].idUsuario;

    const usuarioRows = await conn.query(`SELECT idPersona FROM dbo_usuario WHERE idUsuario = ?`, [idUsuario]);
    if (usuarioRows.length === 0) throw new Error('Usuario del docente no encontrado');
    const idPersona = usuarioRows[0].idPersona;

    await conn.query(`DELETE FROM dbo_usuario_perfil WHERE idUsuario = ?`, [idUsuario]);
    await conn.query(`DELETE FROM dbo_docente WHERE idDocente = ?`, [idDocente]);
    await conn.query(`DELETE FROM dbo_usuario WHERE idUsuario = ?`, [idUsuario]);
    await conn.query(`DELETE FROM dbo_persona WHERE idPersona = ?`, [idPersona]);

    await conn.commit();
    return true;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const getGruposByDocente = async (idDocente) => {
  const rows = await pool.query(
    `SELECT 
        g.idGrupo,
        g.clave_grupo,
        g.cupo,
        g.periodo,
        g.idMateria,
        g.idDocente,
        m.nombre_materia,
        m.creditos,
        m.semestre,
        COUNT(DISTINCT i.idAlumno) AS alumnos_inscritos
     FROM dbo_grupo g
     INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
     LEFT JOIN dbo_inscripciones i ON g.idGrupo = i.idGrupo
     WHERE g.idDocente = ?
     GROUP BY 
        g.idGrupo,
        g.clave_grupo,
        g.cupo,
        g.periodo,
        g.idMateria,
        g.idDocente,
        m.nombre_materia,
        m.creditos,
        m.semestre
     ORDER BY g.periodo DESC`,
    [idDocente]
  );
  return rows;
};


const getHorario = async (id) => {
  const rows = await pool.query(
    `SELECT h.idHorario, h.dia_semana, h.hora, h.aula,
             g.clave_grupo, m.nombre_materia, d.usuario AS docente
      FROM dbo_horario h
      INNER JOIN dbo_grupo g ON h.idGrupo = g.idGrupo
      INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
      LEFT JOIN dbo_usuario d ON g.idDocente = d.idUsuario
     WHERE g.idDocente = ?
     ORDER BY FIELD(h.dia_semana, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'),
               h.hora ASC`,
    [id]
  );
  return rows;
};

module.exports = { getAll, getById, create, update, remove, getGruposByDocente, getHorario };