const AuthModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.login = async (req, res) => {
    const { usuario, contrasena } = req.body;
    
    // *** 1. LOG DE ENTRADA ***
    console.log(`[LOGIN] Intento de login para usuario: ${usuario}`);
    
    try {
        const user = await AuthModel.findUserByUsername(usuario); 

        if (!user) {
            console.log(`[LOGIN FALLIDO] Usuario no encontrado.`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        if (user.status === 0) { 
            console.log(`[LOGIN FALLIDO] Usuario encontrado pero inactivo (status=0).`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const contrasena_guardada = user.contrasena;
        let accesoConcedido = false;
        let hashActualizado = false;
        
        // *** 2. LOG DE ESTADO DE CONTRASEÑA ***
        const esHash = contrasena_guardada.startsWith('$2') && contrasena_guardada.length > 50;
        console.log(`[VERIFICACIÓN] ¿Contraseña Guardada es Hash?: ${esHash}`);


        if (esHash) {
            // --- A. PROCESO ESTÁNDAR: Verificar Hash ---
            accesoConcedido = await bcrypt.compare(contrasena, contrasena_guardada);
            // *** 3A. LOG DE VERIFICACIÓN HASH ***
            console.log(`[VERIFICACIÓN HASH] Resultado de bcrypt.compare: ${accesoConcedido}`);

        } else {
            // --- B. PROCESO DE MIGRACIÓN: Texto Plano ---
            // Asegúrate de que no haya espacios en blanco en la DB.
            const contrasenaDB_trimmed = contrasena_guardada.trim(); 
            
            if (contrasena === contrasenaDB_trimmed) { // Usamos .trim() por si hay espacios
                accesoConcedido = true;
                
                // Hashear la contraseña y actualizar la DB (MIGRACIÓN)
                const nuevoHash = await bcrypt.hash(contrasena, saltRounds);
                await AuthModel.updatePasswordHash(user.idUsuario, nuevoHash); 
                
                hashActualizado = true;
                // *** 3B. LOG DE MIGRACIÓN ***
                console.log(`[MIGRACIÓN EXITOSA] Contraseña de texto plano actualizada a hash.`);

            } else {
                 // *** 3B. LOG DE FALLO DE TEXTO PLANO ***
                 console.log(`[MIGRACIÓN FALLIDA] Contraseña ingresada NO coincide con texto plano en DB.`);
                 // console.log(`Contraseña Ingresada: '${contrasena}' | Contraseña DB: '${contrasenaDB_trimmed}'`); // Quitar en producción!
            }
        }

        if (!accesoConcedido) {
            // *** 4. LOG DE FALLO GENERAL ***
            console.log(`[LOGIN FALLIDO] Acceso no concedido (Contraseña incorrecta).`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // *** 5. LOG DE ÉXITO ***
        console.log(`[LOGIN EXITOSO] Acceso concedido. Hash actualizado: ${hashActualizado}`);
        
        // ... (El resto de la lógica de sesión sigue aquí) ...
        
        let idEntidad = null;
        if (user.perfil === 'Docente') idEntidad = await AuthModel.getDocenteByUserId(user.idUsuario);
        if (user.perfil === 'Alumno') idEntidad = await AuthModel.getAlumnoByUserId(user.idUsuario);

        req.session.usuario = { idUsuario: user.idUsuario, idEntidad, usuario: user.usuario, perfil: user.perfil };

        await AuthModel.recordLogin(user.idUsuario); 
        
        let mensaje = 'Login exitoso';
        if (hashActualizado) {
            mensaje += ' (Contraseña actualizada a formato seguro)';
        }
        
        res.json({ 
            mensaje: mensaje, 
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

exports.cambiarContrasena = async (req, res) => {
    const idUsuario = req.session.usuario?.idUsuario;
    if (!idUsuario) {
        return res.status(401).json({ error: 'No hay sesión activa' });
    }

    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
        return res.status(400).json({ error: 'Se requieren la contraseña actual y la nueva' });
    }
    
    try {
        await AuthModel.cambiarContrasena(idUsuario, contrasenaActual, contrasenaNueva);

        const esNuevo = await AuthModel.esNuevoUsuario(idUsuario);
        if (esNuevo) {
            await AuthModel.marcarComoUsuarioExperimentado(idUsuario);
        }

        res.json({ mensaje: 'Contraseña cambiada exitosamente' });
    } catch (err) {
        console.error('Error al cambiar contraseña:', err);
        if (err.message.includes('actual incorrecta')) {
            return res.status(401).json({ error: err.message });
        }
        res.status(500).json({ error: 'Error al cambiar la contraseña', detalle: err.message });
    }
};

exports.restablecerContrasena = async (req, res) => {
    const idUsuarioAfectado = Number(req.params.idUsuario); 

    const idAdministrador = req.session.usuario?.idUsuario; 
    
    if (!idAdministrador || idAdministrador <= 0) {
        return res.status(401).json({ error: 'No autorizado para esta acción' });
    }

    const { nuevaContrasena } = req.body;
    
    if (!nuevaContrasena || idUsuarioAfectado <= 0) {
        return res.status(400).json({ error: 'Datos de restablecimiento incompletos o ID de usuario inválido' });
    }

    try {
        await AuthModel.restablecerContrasena(idUsuarioAfectado, nuevaContrasena, idAdministrador);
        res.json({ 
            mensaje: 'Contraseña restablecida exitosamente. El usuario deberá cambiarla en el próximo login.' 
        });
    } catch (err) {
        console.error('Error al restablecer contraseña:', err);
        res.status(500).json({ error: 'Error al restablecer la contraseña', detalle: err.message });
    }
};

exports.obtenerEstadisticasUsuarios = async (req, res) => {
    try {
        const estadisticas = await AuthModel.getEstadisticasUsuarios();
        res.json({ estadisticas });
    } catch (err) {
        console.error('Error al obtener estadísticas de usuarios:', err);
        res.status(500).json({ error: 'Error al consultar estadísticas', detalle: err.message });
    }
};

exports.marcarComoExperimentado = async (req, res) => {
    const idUsuario = req.session.usuario?.idUsuario;
    if (!idUsuario) {
        return res.status(401).json({ error: 'No hay sesión activa' });
    }

    try {
        await AuthModel.marcarComoUsuarioExperimentado(idUsuario);
        res.json({ mensaje: 'Usuario marcado como experimentado' });
    } catch (err) {
        console.error('Error al marcar usuario como experimentado:', err);
        res.status(500).json({ error: 'Error al actualizar el estado del usuario', detalle: err.message });
    }
};