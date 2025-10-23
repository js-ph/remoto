const AuthModel = require('../models/authModel');

exports.login = async (req, res) => {
    const { usuario, contrasena } = req.body;
    try {
        const user = await AuthModel.findUser(usuario, contrasena);
        
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        let idEntidad = null;
        if (user.perfil === 'Docente') idEntidad = await AuthModel.getDocenteByUserId(user.idUsuario);
        if (user.perfil === 'Alumno') idEntidad = await AuthModel.getAlumnoByUserId(user.idUsuario);

        req.session.usuario = { idUsuario: user.idUsuario, idEntidad, usuario: user.usuario, perfil: user.perfil };

        await AuthModel.recordLogin(user.idUsuario); 
        
        res.json({ 
            mensaje: 'Login exitoso', 
            usuario: { id: user.idUsuario, usuario: user.usuario, perfil: user.perfil } 
        });

    } catch (err) {
        console.error("Error en el login:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.logout = async (req, res) => {
    const idUsuario = req.session.usuario?.idUsuario;
    if (idUsuario) {
        await AuthModel.recordLogout(idUsuario); 
    }
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
        }
        res.clearCookie('connect.sid'); 
        res.json({ mensaje: 'Logout exitoso' });
    });
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await AuthModel.getRoles();
    res.json({ roles });
  } catch (err) {
    console.error('Error al obtener roles:', err);
    res.status(500).json({ error: 'Error al consultar roles', detalle: err.message });
  }
};

exports.getRolbyID = async (req, res) => {
  const idPerfil = Number(req.params.id);
  if (!idPerfil || idPerfil <= 0) return res.status(400).json({ error: 'ID inválido' });

  try {
    const rol = await AuthModel.getRoleById(idPerfil);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(rol);
  } catch (err) {
    console.error('Error al obtener rol:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

exports.getDatosPersonales = async (req, res) => {
  try {
    const usuarioSesion = req.session.usuario;
    if (!usuarioSesion) return res.status(401).json({ error: 'No hay sesión activa' });

    const perfil = await AuthModel.getDatosPersonales(usuarioSesion.idUsuario);
    if (!perfil) return res.status(404).json({ error: 'Usuario no encontrado' });

    const apellidoCompleto = [perfil.apellido_paterno, perfil.apellido_materno].filter(Boolean).join(' ');

    res.json({
      mensaje: 'Sesión activa',
      Datos_Personales: {
        nombre: perfil.nombre,
        apellidos: apellidoCompleto,
        usuario: perfil.usuario,
        perfil: perfil.perfil,
        correo: perfil.correo_electronico,
        fechaNacimiento: perfil.fechaNacimiento,
        sexo: perfil.sexo,
        curp: perfil.curp,
        estado: perfil.estado,
        municipio: perfil.municipio
      }
    });
  } catch (err) {
    console.error('Error al mostrar datos del usuario', err);
    res.status(500).json({ error: 'Error al consultar datos del usuario', detalle: err.message });
  }
};