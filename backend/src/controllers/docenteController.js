const Docente = require('../models/docenteModel');

exports.obtenerDocentes = async (req, res) => {
  try {
    const docentes = await Docente.getAll();
    res.json({ docentes });
  } catch (err) {
    console.error('Error al obtener docentes:', err);
    res.status(500).json({ error: 'Error al consultar docentes', detalle: err.message });
  }
};

exports.obtenerDocentePorId = async (req, res) => {
  const id = req.params.id;
  try {
    const docente = await Docente.getById(id);
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json({ docente });
  } catch (err) {
    console.error('Error al obtener docente:', err);
    res.status(500).json({ error: 'Error al consultar docente', detalle: err.message });
  }
};

exports.registrarDocente = async (req, res) => {
    const idUsuarioCreador = req.session.usuario?.idUsuario; 
    const datosDocente = req.body; 

    try {
        const result = await Docente.create(datosDocente, idUsuarioCreador); 
        res.status(201).json({ mensaje: 'Docente creado correctamente', docente: result });
    } catch (err) {
        console.error('Error al crear docente:', err);
        res.status(500).json({ error: 'Error al insertar docente', detalle: err.message });
    }
};

exports.actualizarDocente = async (req, res) => {
    const id = req.params.id;
    const idUsuarioModificador = req.session.usuario?.idUsuario; 
    // console.log('[REGISTRAR] Datos del nuevo alumno recibidos:', req.body); // Ojo con este log, parece copiado de otro lado

    try {
        const updated = await Docente.update(id, req.body, idUsuarioModificador);
        if (!updated) return res.status(404).json({ error: 'Docente no encontrado' });
        res.json({ mensaje: 'Docente actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar docente:', err);
        res.status(500).json({ error: 'Error al actualizar docente', detalle: err.message });
    }
};

exports.eliminarDocentePermanente = async (req, res) => {
    const id = req.params.id;
    const idUsuarioEliminador = req.session.usuario?.idUsuario; 
    try {
        const deleted = await Docente.remove(id, idUsuarioEliminador);
        if (!deleted) return res.status(404).json({ error: 'Docente no encontrado' });
        res.json({ mensaje: 'Docente eliminado permanentemente' });
    } catch (err) {
        console.error('Error al eliminar docente:', err);
        if (err.message.includes('grupos asignados')) {
            return res.status(409).json({ error: err.message }); 
        }
        res.status(500).json({ error: 'Error al eliminar docente permanentemente', detalle: err.message });
    }
};

exports.desactivarDocente = async (req, res) => {
    const id = req.params.id;
    const idUsuarioEliminador = req.session.usuario?.idUsuario; 
    try {
        const deleted = await Docente.softDelete(id, idUsuarioEliminador);
        if (!deleted) return res.status(404).json({ error: 'Docente no encontrado' });
        res.json({ mensaje: 'Docente desactivado correctamente' });
    } catch (err) {
        console.error('Error al desactivar docente:', err);
        res.status(500).json({ error: 'Error al desactivar docente', detalle: err.message });
    }
};

exports.obtenerEstadisticasDocente = async (req, res) => {
    const { id } = req.params;

    try {
        const estadisticas = await Docente.getEstadisticas(id);

        if (!estadisticas) {
            const docenteExistente = await Docente.getById(id);
            if (!docenteExistente) return res.status(404).json({ error: 'Docente no encontrado' });
            return res.json({ mensaje: 'Docente encontrado, pero sin estadísticas aún', estadisticas: {} }); 
        }

        res.json({ estadisticas });
    } catch (err) {
        console.error('Error al obtener estadísticas del docente:', err);
        res.status(500).json({
            mensaje: 'Error al obtener estadísticas del docente',
            detalle: err.message,
        });
    }
};

exports.obtenerGruposDocente = async (req, res) => {
  const { id } = req.params;

  try {
    const grupos = await Docente.getGruposByDocente(id);

    if (grupos.length === 0) {
      return res.status(404).json({ mensaje: 'No hay grupos disponibles' });
    }

    res.json({ grupos });
  } catch (err) {
    console.error('Error al obtener grupos del docente:', err);
    res.status(500).json({
      mensaje: 'Error al obtener grupos del docente',
      detalle: err.message,
    });
  }
};

exports.obtenerHorarioDocentes = async (req, res) => {
  const { id } = req.params;

  try {
    const horario = await Docente.getHorario(id);

    if (horario.length === 0) {
      return res.status(404).json({ mensaje: 'No hay horarios disponibles' });
    }

    res.json({ horario });
  } catch (err) {
    console.error('Error al obtener horarios del docente:', err);
    res.status(500).json({
      mensaje: 'Error al obtener horarios del docente',
      detalle: err.message,
    });
  }
};