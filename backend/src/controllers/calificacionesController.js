const Calificacion = require('../models/calificacionModel');

exports.obtenerCalificaciones = async (req, res) => {
  try {
    const calificaciones = await Calificacion.getAll();
    res.json({ calificaciones });
  } catch (err) {
    console.error('Error al obtener calificaciones:', err);
    res.status(500).json({ error: 'Error al consultar calificaciones', detalle: err.message });
  }
};

exports.obtenerCalificacionById = async (req, res) => {
  const id = req.params.id;
  try {
    const calificacion = await Calificacion.getById(id);
    if (!calificacion) return res.status(404).json({ error: 'Calificación no encontrada' });
    res.json({ calificacion });
  } catch (err) {
    console.error('Error al obtener calificación:', err);
    res.status(500).json({ error: 'Error al consultar calificación', detalle: err.message });
  }
};

exports.registrarCalificacion = async (req, res) => {
  const { idInscripción, valor, observaciones } = req.body;
  if (!idInscripción || valor == null) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    const idCalificación = await Calificacion.create({ idInscripción, valor, observaciones });
    res.json({ mensaje: 'Calificación creada', idCalificación: Number(idCalificación) });
  } catch (err) {
    console.error('Error al crear calificación:', err);
    res.status(500).json({ error: 'Error al crear calificación', detalle: err.message });
  }
};

exports.actualizarCalificacion = async (req, res) => {
  const id = req.params.id;
  const { idInscripción, valor, observaciones } = req.body;
  try {
    const affected = await Calificacion.update(id, { idInscripción, valor, observaciones });
    if (affected === 0) return res.status(404).json({ error: 'Calificación no encontrada' });
    res.json({ mensaje: 'Calificación actualizada' });
  } catch (err) {
    console.error('Error al actualizar calificación:', err);
    res.status(500).json({ error: 'Error al actualizar calificación', detalle: err.message });
  }
};

exports.eliminarCalificacion = async (req, res) => {
  const id = req.params.id;
  try {
    const affected = await Calificacion.remove(id);
    if (affected === 0) return res.status(404).json({ error: 'Calificación no encontrada' });
    res.json({ mensaje: 'Calificación eliminada' });
  } catch (err) {
    console.error('Error al eliminar calificación:', err);
    res.status(500).json({ error: 'Error al eliminar calificación', detalle: err.message });
  }
};
