const pool = require('../db/pool');

exports.obtenerInicio = async (req, res) => {
  const usuario = req.session.usuario;
  if (!usuario) return res.status(401).json({ mensaje: 'No autenticado' });

  try {
    const resultados = await pool.query(
      `SELECT u.idUsuario, u.usuario, p.nombre, p.apellido_paterno, p.apellido_materno, lp.nombre AS perfil, lp.idPerfil
       FROM dbo_usuario u
       INNER JOIN dbo_persona p ON u.idPersona = p.idPersona
       LEFT JOIN dbo_usuario_perfil up ON u.idUsuario = up.idUsuario
       LEFT JOIN dbo_login_perfil lp ON up.idPerfil = lp.idPerfil
       WHERE u.idUsuario = $1`,
      [usuario.idUsuario]
    );

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró el nombre del usuario' });
    }

    const persona = resultados[0];
    const nombreCompleto = `${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`;
    const nombrePerfil = persona.perfil;
    const idPerfil = persona.idPerfil;

    let datosGenerales = null;

    if (idPerfil === 1 || idPerfil === 2) {
      // Si es Admin o Superadmin
      const [docentes, estudiantes, grupos, inscripciones, materias, carreras, horarios, planteles, roles, administradores] = await Promise.all([
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_docente`),
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_alumno`),
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_grupo`),
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_inscripciones`),
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_materias`),
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_carrera`),
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_horario`),
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_plantel`),
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_login_perfil`),
        pool.query(`SELECT COUNT(*) AS cantidad FROM dbo_usuario_perfil WHERE idPerfil = 1 OR idPerfil = 2`)
      ]);

      datosGenerales = {
        docentesRegistrados: Number(docentes[0].cantidad),
        estudiantesRegistrados: Number(estudiantes[0].cantidad),
        gruposRegistrados: Number(grupos[0].cantidad),
        inscripcionesRegistrados: Number(inscripciones[0].cantidad),
        materiasRegistradas: Number(materias[0].cantidad),
        carrerasRegistradas: Number(carreras[0].cantidad),
        horariosRegistrados: Number(horarios[0].cantidad),
        plantelesRegistrados: Number(planteles[0].cantidad),
        rolesRegistrados: Number(roles[0].cantidad),
        administradoresRegistrados: Number(administradores[0].cantidad)
      };

      return res.json({
      mensaje: `¡Bienvenido ${nombrePerfil.toUpperCase()}, ${nombreCompleto}!`,
      datosGenerales
    });
    }

    return res.json({
      mensaje: `¡Bienvenido ${nombrePerfil.toUpperCase()}, ${nombreCompleto}!`,
    });

  } catch (error) {
    console.error('Error en inicio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', detalle: JSON.stringify(error.message)});
  }
};

