const pool = require('../db/pool');
const { registrarAuditoria } = require('./auditoriaModel');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const getAll = async () => {
  const rows = await pool.query(
    `SELECT 
        a.idAlumno, a.matricula, a.semestre_actual, 
        p.nombre, p.apellido_paterno, p.apellido_materno, 
        u.usuario, u.correo_electronico, 
        DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
        p.sexo, p.curp, m.municipio, e.estado,
        c.carrera AS carrera,
        u.status,
        u.ultimo_login
    FROM dbo_alumno a
    INNER JOIN dbo_usuario u ON a.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
    INNER JOIN dbo_carrera c ON a.idCarrera = c.idCarrera
    WHERE u.status = 1`
  );
  return rows;
};

const getById = async (id) => {
  const rows = await pool.query(
    `SELECT 
        a.idAlumno, a.matricula, a.semestre_actual, 
        p.nombre, p.apellido_paterno, p.apellido_materno, 
        u.usuario, u.correo_electronico, 
        DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
        p.sexo, p.curp, m.municipio, e.estado,
        c.carrera AS carrera, a.idCarrera,
        u.status, u.nuevoUsuario, u.ultimo_login
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

const generarMatricula = async (idCarrera) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const carreraCode = String(idCarrera).padStart(2, '0');
  
  const prefix = `${year}${carreraCode}`;
  const rows = await pool.query(
    `SELECT matricula FROM dbo_alumno 
     WHERE matricula LIKE ? 
     ORDER BY matricula DESC 
     LIMIT 1`,
    [`${prefix}%`]
  );
  
  let secuencia = 1;
  if (rows.length > 0) {
    const ultimaMatricula = rows[0].matricula;
    const ultimaSecuencia = parseInt(ultimaMatricula.slice(-4));
    secuencia = ultimaSecuencia + 1;
  }
  
  return `${prefix}-${String(secuencia).padStart(4, '0')}`;
};

const create = async ({
  nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
  sexo, curp, idEstado, idMunicipio,
  usuario, contrasena, correo_electronico, idCarrera, semestre_actual = 1
}, idUsuarioCreador = null) => {
  const idPerfil = 4;
  const nuevoUsuario = 1;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const matricula = await generarMatricula(idCarrera);

    const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);

    const personaResult = await conn.query(
      `INSERT INTO dbo_persona (nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio]
    );
    const idPersona = Number(personaResult.insertId);

    const usuarioResult = await conn.query(
      `INSERT INTO dbo_usuario (idPersona, nuevoUsuario, usuario, contrasena, correo_electronico, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [idPersona, nuevoUsuario, usuario, hashedPassword, correo_electronico]
    );
    const idUsuario = Number(usuarioResult.insertId);

    await conn.query(
      `INSERT INTO dbo_alumno (idUsuario, matricula, idCarrera, semestre_actual)
       VALUES (?, ?, ?, ?)`,
      [idUsuario, matricula, idCarrera, semestre_actual]
    );

    await conn.query(
      `INSERT INTO dbo_usuario_perfil (idUsuario, idPerfil)
       VALUES (?, ?)`,
      [idUsuario, idPerfil]
    );

    await conn.commit();

    await registrarAuditoria(
      idUsuarioCreador,
      'CREATE',
      'dbo_alumno',
      idUsuario,
      `Alumno creado: ${usuario} - Matrícula: ${matricula}`
    );

    return { idPersona, idUsuario, matricula, perfil: 'Alumno' };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err; 
  } finally {
    if (conn) conn.release();
  }
};

const update = async (idAlumno, {
  nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
  sexo, curp, idEstado, idMunicipio, usuario, contrasena, correo_electronico, 
  idCarrera, semestre_actual
}, idUsuarioModificador = null) => {
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

    let hashedPassword = contrasena;
    if (contrasena && contrasena.length < 60) {
      hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);
    }

    await conn.query(
      `UPDATE dbo_usuario
       SET usuario = ?, contrasena = ?, correo_electronico = ?
       WHERE idUsuario = ?`,
      [usuario, hashedPassword, correo_electronico, idUsuario]
    );

    await conn.query(
      `UPDATE dbo_alumno
       SET idCarrera = ?, semestre_actual = ?
       WHERE idUsuario = ?`,
      [idCarrera, semestre_actual, idUsuario]
    );

    await conn.commit();

    await registrarAuditoria(
      idUsuarioModificador,
      'UPDATE',
      'dbo_alumno',
      idAlumno,
      `Alumno actualizado: ${usuario}`
    );

    return true; 
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const softDelete = async (idAlumno, idUsuarioEliminador = null) => {
  const alumnoRows = await pool.query(
    `SELECT idUsuario FROM dbo_alumno WHERE idAlumno = ?`,
    [idAlumno]
  );

  if (alumnoRows.length === 0) {
    throw new Error('Alumno no encontrado');
  }

  const idUsuario = alumnoRows[0].idUsuario;

  const result = await pool.query(
    `UPDATE dbo_usuario SET status = 0 WHERE idUsuario = ?`,
    [idUsuario]
  );

  if (result.affectedRows > 0) {
    await registrarAuditoria(
      idUsuarioEliminador,
      'SOFT_DELETE',
      'dbo_alumno',
      idAlumno,
      'Alumno desactivado'
    );
  }

  return result.affectedRows > 0;
};

const remove = async (idAlumno, idUsuarioEliminador = null) => {
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
      `SELECT idPersona, usuario FROM dbo_usuario WHERE idUsuario = ?`,
      [idUsuario]
    );

    if (usuarioRows.length === 0) {
      throw new Error('Usuario del alumno no encontrado');
    }

    const { idPersona, usuario } = usuarioRows[0];

    await conn.query(`DELETE FROM dbo_usuario_perfil WHERE idUsuario = ?`, [idUsuario]);
    await conn.query(`DELETE FROM dbo_alumno WHERE idAlumno = ?`, [idAlumno]);
    await conn.query(`DELETE FROM dbo_usuario WHERE idUsuario = ?`, [idUsuario]);
    await conn.query(`DELETE FROM dbo_persona WHERE idPersona = ?`, [idPersona]);

    await conn.commit();

    await registrarAuditoria(
      idUsuarioEliminador,
      'DELETE',
      'dbo_alumno',
      idAlumno,
      `Alumno eliminado permanentemente: ${usuario}`
    );

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
     INNER JOIN dbo_inscripciones i ON c.idInscripcion = i.idInscripcion
     INNER JOIN dbo_grupo g ON i.idGrupo = g.idGrupo
     INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
     WHERE i.idAlumno = ?
     ORDER BY g.periodo DESC, m.nombre_materia ASC`,
    [id]
  );
  return rows;
};

const getHorario = async (id) => {
  const rows = await pool.query(
    `SELECT h.idHorario, h.dia_semana, h.hora, h.aula,
            g.clave_grupo, m.nombre_materia, 
            CONCAT(p.nombre, ' ', p.apellido_paterno) AS docente
     FROM dbo_horario h
     INNER JOIN dbo_grupo g ON h.idGrupo = g.idGrupo
     INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
     LEFT JOIN dbo_docente d ON g.idDocente = d.idDocente
     LEFT JOIN dbo_usuario u ON d.idUsuario = u.idUsuario
     LEFT JOIN dbo_persona p ON u.idPersona = p.idPersona
     INNER JOIN dbo_inscripciones i ON h.idGrupo = i.idGrupo
     WHERE i.idAlumno = ?
     ORDER BY FIELD(h.dia_semana, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'),
              h.hora ASC`,
    [id]
  );
  return rows;
};

const getGrupos = async (id) => {
  const rows = await pool.query(
    `SELECT 
        g.idGrupo,
        g.clave_grupo,
        g.cupo,
        g.periodo,
        m.nombre_materia,
        m.creditos,
        CONCAT(p.nombre, ' ', p.apellido_paterno) AS docente,
        COUNT(DISTINCT i2.idAlumno) AS alumnos_inscritos
    FROM dbo_grupo g
    INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
    INNER JOIN dbo_inscripciones i ON g.idGrupo = i.idGrupo
    LEFT JOIN dbo_docente d ON g.idDocente = d.idDocente
    LEFT JOIN dbo_usuario u ON d.idUsuario = u.idUsuario
    LEFT JOIN dbo_persona p ON u.idPersona = p.idPersona
    LEFT JOIN dbo_inscripciones i2 ON g.idGrupo = i2.idGrupo
    WHERE i.idAlumno = ?
    GROUP BY g.idGrupo, g.clave_grupo, g.cupo, g.periodo, m.nombre_materia, m.creditos, docente
    ORDER BY g.periodo DESC, m.nombre_materia ASC`,
    [id]
  );
  return rows;
};

const avanzarSemestre = async (idAlumno, idUsuarioModificador = null) => {
  const alumno = await getById(idAlumno);
  if (!alumno) {
    throw new Error('Alumno no encontrado');
  }

  const nuevoSemestre = parseInt(alumno.semestre_actual) + 1;

  const result = await pool.query(
    `UPDATE dbo_alumno SET semestre_actual = ? WHERE idAlumno = ?`,
    [nuevoSemestre, idAlumno]
  );

  if (result.affectedRows > 0) {
    await registrarAuditoria(
      idUsuarioModificador,
      'UPDATE',
      'dbo_alumno',
      idAlumno,
      `Alumno avanzó al semestre ${nuevoSemestre}`
    );
  }

  return result.affectedRows > 0;
};

module.exports = { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  softDelete,
  getCalificaciones, 
  getHorario, 
  getGrupos,
  avanzarSemestre
};