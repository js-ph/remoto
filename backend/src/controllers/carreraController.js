const Carrera = require('../models/carreraModel');

exports.obtenerCarreras = async (req, res) => {
  try {
    const carreras = await Carrera.getAll();
    res.json({ carreras });
  } catch (err) {
    console.error('Error al obtener carreras:', err);
    res.status(500).json({ error: 'Error al consultar carreras', detalle: err.message });
  }
};

exports.obtenerCarreraPorId = async (req, res) => {
  const id = req.params.id;
  try {
    const carrera = await Carrera.getById(id);
    if (!carrera) return res.status(404).json({ error: 'Carrera no encontrada' });
    res.json({ carrera });
  } catch (err) {
    console.error('Error al obtener carrera:', err);
    res.status(500).json({ error: 'Error al consultar carrera', detalle: err.message });
  }
};

exports.registrarCarrera = async (req, res) => {
  const { carrera, duracion_semestres, descripcion, idPlantel } = req.body;

  if (!carrera || !duracion_semestres || !descripcion || !idPlantel) {
    return res.status(400).json({ error: 'Faltan datos para registrar la carrera' });
  }

  try {
    const idCarrera = await Carrera.create({ carrera, duracion_semestres, descripcion, idPlantel });
    res.status(201).json({ mensaje: 'Carrera creada correctamente', idCarrera });
  } catch (err) {
    console.error('Error al crear carrera:', err);
    res.status(500).json({ error: 'Error al crear carrera', detalle: err.message });
  }
};

exports.actualizarCarrera = async (req, res) => {
  const id = req.params.id;
  const { carrera, duracion_semestres, descripcion, idPlantel } = req.body;

  if (!carrera || !duracion_semestres || !descripcion || !idPlantel) {
    return res.status(400).json({ error: 'Faltan datos para actualizar la carrera' });
  }

  try {
    const affectedRows = await Carrera.update(id, { carrera, duracion_semestres, descripcion, idPlantel });
    if (!affectedRows) return res.status(404).json({ error: 'Carrera no encontrada' });
    res.json({ mensaje: 'Carrera actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar carrera:', err);
    res.status(500).json({ error: 'Error al actualizar carrera', detalle: err.message });
  }
};

exports.eliminarCarrera = async (req, res) => {
  const id = req.params.id;

  try {
    const affectedRows = await Carrera.remove(id);
    if (!affectedRows) return res.status(404).json({ error: 'Carrera no encontrada' });
    res.json({ mensaje: 'Carrera eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar carrera:', err);
    res.status(500).json({ error: 'Error al eliminar carrera', detalle: err.message });
  }
};