const pool = require('../db/pool');

exports.obtenerInicio = async (req, res) => {
  const usuario = req.session.usuario;
  if (!usuario) return res.status(401).json({ mensaje: 'No autenticado' });

  try {
    const resultadoObjeto = await pool.query(
      `SELECT u.idUsuario, u.usuario, p.nombre, p.apellido_paterno, p.apellido_materno, lp.nombre AS perfil, lp.idPerfil
        FROM dbo_usuario u
        LEFT JOIN dbo_persona p ON u.idPersona = p.idPersona 
        LEFT JOIN dbo_usuario_perfil up ON u.idUsuario = up.idUsuario
        LEFT JOIN dbo_login_perfil lp ON up.idPerfil = lp.idPerfil
        WHERE u.idUsuario = $1`, 
      [usuario.idUsuario]
    );

    const resultados = resultadoObjeto.rows; 

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró la información del usuario' });
    }

    const persona = resultados[0];
    
    const nombre = persona.nombre || '';
    const apellidoPaterno = persona.apellido_paterno || '';
    const apellidoMaterno = persona.apellido_materno || '';

    const nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();

    const nombrePerfil = persona.perfil || 'Desconocido'; 
    const idPerfil = persona.idPerfil;

    let datosGenerales = null;

    if (idPerfil === 1 || idPerfil === 2) {
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
        docentesRegistrados: Number(docentes.rows[0].cantidad),         
        estudiantesRegistrados: Number(estudiantes.rows[0].cantidad),    
        gruposRegistrados: Number(grupos.rows[0].cantidad),           
        inscripcionesRegistradas: Number(inscripciones.rows[0].cantidad),
        materiasRegistradas: Number(materias.rows[0].cantidad),        
        carrerasRegistradas: Number(carreras.rows[0].cantidad),       
        horariosRegistrados: Number(horarios.rows[0].cantidad),        
        plantelesRegistrados: Number(planteles.rows[0].cantidad),      
        rolesRegistrados: Number(roles.rows[0].cantidad),             
        administradoresRegistrados: Number(administradores.rows[0].cantidad) 
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