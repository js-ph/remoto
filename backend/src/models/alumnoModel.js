const pool = require('../db/pool');

const getAll = async () => {
  const rows = await pool.query(
    `SELECT 
        a.idAlumno, a.matricula, a.semestre_actual, 
        p.nombre, p.apellido_paterno, p.apellido_materno, u.usuario, u.correo_electronico, 
        DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
        p.sexo, p.curp, m.municipio, e.estado,
        c.carrera AS carrera 
    FROM dbo_alumno a
    INNER JOIN dbo_usuario u ON a.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
    INNER JOIN dbo_carrera c ON a.idCarrera = c.idCarrera`
);
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query(
    `SELECT 
        a.idAlumno, a.matricula, a.semestre_actual, 
        p.nombre, p.apellido_paterno, p.apellido_materno, u.usuario, u.correo_electronico, 
        DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
        p.sexo, p.curp, m.municipio, e.estado,
        c.carrera AS carrera
    FROM dbo_alumno a
    INNER JOIN dbo_usuario u ON a.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
    INNER JOIN dbo_carrera c ON a.idCarrera = c.idCarrera
    WHERE a.idAlumno = ?`,
    [id]
  );
  return rows[0]; 
};

const create = async ({
  nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
  sexo, curp, idEstado, idMunicipio,
  usuario, contrasena, correo_electronico, idCarrera //matricula, semestre_actual
}) => {
  const idPerfil = 4; 

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

    await conn.query(
      `INSERT INTO dbo_alumno (idUsuario, matricula, idCarrera)
       VALUES (?, ?, ?)`,
      [idUsuario, usuario, idCarrera]
    );

    await conn.query(
      `INSERT INTO dbo_usuario_perfil (idUsuario, idPerfil)
       VALUES (?, ?)`,
      [idUsuario, idPerfil]
    );

    await conn.commit();

    return { idPersona, idUsuario, perfil: 'Alumno' };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const update = async (idAlumno, {
  nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
  sexo, curp, idEstado, idMunicipio, usuario, contrasena, correo_electronico
  //matricula, semestre_actual, idCarrera
}) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const alumnoRows = await conn.query(
      `SELECT a.idUsuario, u.idPersona 
       FROM dbo_alumno a 
       JOIN dbo_usuario u ON a.idUsuario = u.idUsuario
       WHERE a.idAlumno = ?`,
      [idAlumno]
    );

    if (alumnoRows.length === 0) {
      throw new Error('Alumno no encontrado');
    }

    const { idUsuario, idPersona } = alumnoRows[0];

    await conn.query(
      `UPDATE dbo_persona
       SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, fecha_de_nacimiento = ?,
           sexo = ?, curp = ?, idEstado = ?, idMunicipio = ?
       WHERE idPersona = ?`,
      [nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio, idPersona]
    );

    await conn.query(
      `UPDATE dbo_usuario
       SET usuario = ?, contrasena = ?, correo_electronico = ?
       WHERE idUsuario = ?`,
      [usuario, contrasena, correo_electronico, idUsuario]
    );
/*
    await conn.query(
      `UPDATE dbo_alumno
       SET idCarrera = ?, matricula = ?, semestre_actual = ?
       WHERE idUsuario = ?`,
      [idCarrera, matricula, semestre_actual, idUsuario]
    );
*/
    await conn.commit();
    return true; 
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const remove = async (idAlumno) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const alumnoRows = await conn.query(
      `SELECT idUsuario FROM dbo_alumno WHERE idAlumno = ?`,
      [idAlumno]
    );

    if (alumnoRows.length === 0) {
      throw new Error('Alumno no encontrado');
    }

    const idUsuario = alumnoRows[0].idUsuario;

    const usuarioRows = await conn.query(
      `SELECT idPersona FROM dbo_usuario WHERE idUsuario = ?`,
      [idUsuario]
    );

    if (usuarioRows.length === 0) {
      throw new Error('Usuario del alumno no encontrado');
    }

    const idPersona = usuarioRows[0].idPersona;

    await conn.query(`DELETE FROM dbo_usuario_perfil WHERE idUsuario = ?`, [idUsuario]);
    await conn.query(`DELETE FROM dbo_alumno WHERE idAlumno = ?`, [idAlumno]);
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

const getCalificaciones = async (id) => {
  const rows = await pool.query(
    `SELECT c.*, m.nombre_materia, m.creditos, g.periodo, g.clave_grupo
     FROM dbo_calificaciones c
     INNER JOIN dbo_inscripciones i ON c.idInscripción = i.idInscripción
     INNER JOIN dbo_grupo g ON i.idGrupo = g.idGrupo
     INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
     WHERE i.idAlumno = ?
     ORDER BY g.periodo DESC`,
    [id]
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
      INNER JOIN dbo_inscripciones i ON h.idGrupo = i.idGrupo
     WHERE i.idAlumno = ?
     ORDER BY FIELD(h.dia_semana, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'),
               h.hora ASC`,
    [id]
  );
  return rows;
};

const getGrupo = async (id) => {
  const rows = await pool.query(
    `SELECT 
    g.idGrupo,
    g.clave_grupo,
    g.cupo,
    m.nombre_materia,
    a.usuario AS Alumno
    FROM dbo_grupo g
    INNER JOIN dbo_materias m 
        ON g.idMateria = m.idMateria
    INNER JOIN dbo_inscripciones i 
        ON g.idGrupo = i.idGrupo
    INNER JOIN dbo_usuario a 
        ON i.idAlumno = a.idUsuario
    WHERE i.idAlumno = ?
    ORDER BY m.nombre_materia DESC;
    `,
    [id]
  );
  return rows;
};

module.exports = { getAll, getById, create, update, remove, getCalificaciones, getHorario, getGrupo };