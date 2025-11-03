const pool = require('../db/pool');
const { registrarAuditoria } = require('./auditoriaModel');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const getAll = async () => {
  const rows = await pool.query(`
    SELECT d.idDocente, 
           p.nombre, p.apellido_paterno, p.apellido_materno, 
           u.usuario, u.correo_electronico,
           DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
           p.sexo, p.curp, m.municipio, e.estado,
           u.status, u.ultimo_login
    FROM dbo_docente d
    INNER JOIN dbo_usuario u ON d.idUsuario = u.idUsuario
    INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
    INNER JOIN dbo_estados e ON p.idEstado = e.idEstado
    INNER JOIN dbo_municipios m ON p.idMunicipio = m.idMunicipio
    WHERE u.status = 1
    ORDER BY p.apellido_paterno, p.apellido_materno, p.nombre
  `);
  return rows;
};

const getById = async (idDocente) => {
  const rows = await pool.query(`
    SELECT d.idDocente, 
           p.nombre, p.apellido_paterno, p.apellido_materno, 
           u.usuario, u.correo_electronico,
           DATE_FORMAT(p.fecha_de_nacimiento, '%Y-%m-%d') AS fechaNacimiento,
           p.sexo, p.curp, m.municipio, e.estado,
           u.status, u.nuevoUsuario, u.ultimo_login
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
}, idUsuarioCreador = null) => {
  const idPerfil = 3; 
  const nuevoUsuario = 1;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

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

    const docenteResult = await conn.query(
      `INSERT INTO dbo_docente (idUsuario) VALUES (?)`, 
      [idUsuario]
    );
    const idDocente = Number(docenteResult.insertId);

    await conn.query(
      `INSERT INTO dbo_usuario_perfil (idUsuario, idPerfil) VALUES (?, ?)`, 
      [idUsuario, idPerfil]
    );

    await conn.commit();

    await registrarAuditoria(
      idUsuarioCreador,
      'CREATE',
      'dbo_docente',
      idDocente,
      `Docente creado: ${usuario}`
    );

    return { idPersona, idUsuario, idDocente, perfil: 'Docente' };
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
}, idUsuarioModificador = null) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const docenteRows = await conn.query(
      `SELECT idUsuario FROM dbo_docente WHERE idDocente = ?`, 
      [idDocente]
    );
    if (docenteRows.length === 0) throw new Error('Docente no encontrado');
    const idUsuario = docenteRows[0].idUsuario;

    const usuarioRows = await conn.query(
      `SELECT idPersona FROM dbo_usuario WHERE idUsuario = ?`, 
      [idUsuario]
    );
    if (usuarioRows.length === 0) throw new Error('Usuario del docente no encontrado');
    const idPersona = usuarioRows[0].idPersona;

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

    await conn.commit();

    await registrarAuditoria(
      idUsuarioModificador,
      'UPDATE',
      'dbo_docente',
      idDocente,
      `Docente actualizado: ${usuario}`
    );

    return true;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const softDelete = async (idDocente, idUsuarioEliminador = null) => {
  const docenteRows = await pool.query(
    `SELECT idUsuario FROM dbo_docente WHERE idDocente = ?`,
    [idDocente]
  );

  if (docenteRows.length === 0) {
    throw new Error('Docente no encontrado');
  }

  const idUsuario = docenteRows[0].idUsuario;

  const result = await pool.query(
    `UPDATE dbo_usuario SET status = 0 WHERE idUsuario = ?`,
    [idUsuario]
  );

  if (result.affectedRows > 0) {
    await registrarAuditoria(
      idUsuarioEliminador,
      'SOFT_DELETE',
      'dbo_docente',
      idDocente,
      'Docente desactivado'
    );
  }

  return result.affectedRows > 0;
};

const remove = async (idDocente, idUsuarioEliminador = null) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const docenteRows = await conn.query(
      `SELECT idUsuario FROM dbo_docente WHERE idDocente = ?`, 
      [idDocente]
    );
    if (docenteRows.length === 0) throw new Error('Docente no encontrado');
    const idUsuario = docenteRows[0].idUsuario;

    const usuarioRows = await conn.query(
      `SELECT idPersona, usuario FROM dbo_usuario WHERE idUsuario = ?`, 
      [idUsuario]
    );
    if (usuarioRows.length === 0) throw new Error('Usuario del docente no encontrado');
    const { idPersona, usuario } = usuarioRows[0];

    const gruposRows = await conn.query(
      `SELECT COUNT(*) as total FROM dbo_grupo WHERE idDocente = ?`,
      [idDocente]
    );

    if (gruposRows[0].total > 0) {
      throw new Error('No se puede eliminar el docente porque tiene grupos asignados');
    }

    await conn.query(`DELETE FROM dbo_usuario_perfil WHERE idUsuario = ?`, [idUsuario]);
    await conn.query(`DELETE FROM dbo_docente WHERE idDocente = ?`, [idDocente]);
    await conn.query(`DELETE FROM dbo_usuario WHERE idUsuario = ?`, [idUsuario]);
    await conn.query(`DELETE FROM dbo_persona WHERE idPersona = ?`, [idPersona]);

    await conn.commit();

    await registrarAuditoria(
      idUsuarioEliminador,
      'DELETE',
      'dbo_docente',
      idDocente,
      `Docente eliminado permanentemente: ${usuario}`
    );

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
        g.idGrupo, g.clave_grupo, g.cupo, g.periodo,
        g.idMateria, g.idDocente,
        m.nombre_materia, m.creditos, m.semestre
     ORDER BY g.periodo DESC, m.nombre_materia ASC`,
    [idDocente]
  );
  return rows;
};

const getHorario = async (idDocente) => {
  const rows = await pool.query(
    `SELECT h.idHorario, h.dia_semana, h.hora, h.aula,
            g.clave_grupo, m.nombre_materia
     FROM dbo_horario h
     INNER JOIN dbo_grupo g ON h.idGrupo = g.idGrupo
     INNER JOIN dbo_materias m ON g.idMateria = m.idMateria
     WHERE g.idDocente = ?
     ORDER BY FIELD(h.dia_semana, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'),
              h.hora ASC`,
    [idDocente]
  );
  return rows;
};


const getEstadisticas = async (idDocente) => {
  const rows = await pool.query(
    `SELECT 
        COUNT(DISTINCT g.idGrupo) AS total_grupos,
        COUNT(DISTINCT g.idMateria) AS materias_diferentes,
        COUNT(DISTINCT i.idAlumno) AS total_alumnos,
        COUNT(DISTINCT g.periodo) AS periodos_activos
     FROM dbo_grupo g
     LEFT JOIN dbo_inscripciones i ON g.idGrupo = i.idGrupo
     WHERE g.idDocente = ?`,
    [idDocente]
  );
  return rows[0];
};

module.exports = { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  softDelete,
  getGruposByDocente, 
  getHorario,
  getEstadisticas
};