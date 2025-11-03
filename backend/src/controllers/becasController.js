const Beca = require('../models/becaModel');

exports.obtenerBecas = async (req, res) => {
  try {
    const becas = await Beca.getAll();
    res.json({ becas });
  } catch (err) {
    console.error('Error al obtener becas:', err);
    res.status(500).json({ error: 'Error al consultar becas', detalle: err.message });
  }
};

exports.obtenerBecaporId = async (req, res) => {
  const id = req.params.id;
  try {
    const beca = await Beca.getById(id);
    if (!beca) return res.status(404).json({ error: 'Beca no encontrada' });
    res.json({ beca });
  } catch (err) {
    console.error('Error al obtener beca:', err);
    res.status(500).json({ error: 'Error al consultar beca', detalle: err.message });
  }
};

exports.registrarBeca = async (req, res) => {
  const idUsuarioCreador = req.session.usuario?.idUsuario; 
  const datosBeca = req.body;

  if (!datosBeca.nombre_beca || datosBeca.porcentaje_descuento === undefined) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para la beca.' });
  }

  try {
    const idBeca = await Beca.create(datosBeca, idUsuarioCreador); 
    res.status(201).json({ mensaje: 'Beca creada correctamente', idBeca: Number(idBeca) });
  } catch (err) {
    console.error('Error al crear beca:', err);
    if (err.message.includes('porcentaje de descuento')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Error al crear beca', detalle: err.message });
  }
};

exports.actualizarBeca = async (req, res) => {
  const id = req.params.id;
  const idUsuarioModificador = req.session.usuario?.idUsuario; 
  const datosBeca = req.body;

  try {
    const affected = await Beca.update(id, datosBeca, idUsuarioModificador);
    
    if (affected === 0) {
      const becaExistente = await Beca.getById(id);
      if (!becaExistente) {
        return res.status(404).json({ error: 'Beca no encontrada' });
      }
      return res.json({ mensaje: 'Beca actualizada correctamente (sin cambios aplicados)' });
    }

    res.json({ mensaje: 'Beca actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar beca:', err);
    if (err.message.includes('porcentaje de descuento')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Error al actualizar beca', detalle: err.message });
  }
};

exports.eliminarBeca = async (req, res) => {
  const id = req.params.id;
  const idUsuarioEliminador = req.session.usuario?.idUsuario; 
  
  try {
    const affected = await Beca.remove(id, idUsuarioEliminador); 
    if (affected === 0) return res.status(404).json({ error: 'Beca no encontrada' });
    res.json({ mensaje: 'Beca eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar beca:', err);
    if (err.message.includes('pagos asociados')) {
      return res.status(409).json({ error: err.message }); 
    }
    res.status(500).json({ error: 'Error al eliminar beca', detalle: err.message });
  }
};

exports.obtenerEstadisticasBecas = async (req, res) => {
  try {
    const estadisticas = await Beca.getEstadisticas();
    res.json({ estadisticas });
  } catch (err) {
    console.error('Error al obtener estadísticas de becas:', err);
    res.status(500).json({ error: 'Error al consultar estadísticas', detalle: err.message });
  }
};

exports.obtenerUsuariosPorBeca = async (req, res) => {
  const id = req.params.id;
  try {
    const usuarios = await Beca.getUsuariosPorBeca(id);

    if (usuarios.length === 0) {
      const becaInfo = await Beca.getById(id);
      if (!becaInfo) return res.status(404).json({ error: 'Beca no encontrada' });
      
      return res.json({ mensaje: 'La beca no tiene usuarios activos con pagos asociados', usuarios: [] });
    }

    res.json({ usuarios });
  } catch (err) {
    console.error('Error al obtener usuarios por beca:', err);
    res.status(500).json({ error: 'Error al consultar usuarios por beca', detalle: err.message });
  }
};