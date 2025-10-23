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
  try {
    const idBeca = await Beca.create();
    res.json({ mensaje: 'Beca creada', idBeca: Number(idBeca) });
  } catch (err) {
    console.error('Error al crear beca:', err);
    res.status(500).json({ error: 'Error al crear beca', detalle: err.message });
  }
};

exports.actualizarBeca = async (req, res) => {
  res.status(400).json({ error: 'No hay campos para actualizar en beca' });
};

exports.eliminarBeca = async (req, res) => {
  const id = req.params.id;
  try {
    const affected = await Beca.remove(id);
    if (affected === 0) return res.status(404).json({ error: 'Beca no encontrada' });
    res.json({ mensaje: 'Beca eliminada' });
  } catch (err) {
    console.error('Error al eliminar beca:', err);
    res.status(500).json({ error: 'Error al eliminar beca', detalle: err.message });
  }
};
