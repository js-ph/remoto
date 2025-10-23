const Plantel = require('../models/plantelModel');

exports.obtenerPlantel = async (req, res) => {
  try {
    const planteles = await Plantel.getAll();
    res.json({ planteles });
  } catch (err) {
    console.error('Error al obtener planteles:', err);
    res.status(500).json({ error: 'Error al consultar planteles', detalle: err.message });
  }
};

exports.obtenerPlantelporID = async (req, res) => {
  const id = req.params.id;
  try {
    const plantel = await Plantel.getById(id);
    if (!plantel) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }
    res.json({ plantel });
  } catch (err) {
    console.error('Error al obtener plantel:', err);
    res.status(500).json({ error: 'Error al consultar plantel', detalle: err.message });
  }
};

exports.registrarPlantel = async (req, res) => {
  try {
    const idPlantel = await Plantel.create({ nombre_plantel, idEstado, idMunicipio });
    res.status(201).json({ mensaje: 'Plantel creado correctamente', idPlantel: Number(idPlantel) });
  } catch (err) {
    console.error('Error al crear plantel:', err);
    res.status(500).json({ error: 'Error al crear plantel', detalle: err.message });
  }
};

exports.actualizarPlantel = async (req, res) => {
  const id = req.params.id;
  try {
    const updated = await Plantel.update(id, { nombre_plantel, idEstado, idMunicipio });
    if (updated === 0) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }
    res.json({ mensaje: 'Plantel actualizado correctamente' });

  } catch (err) {
    console.error('Error al actualizar plantel:', err);
    res.status(500).json({ error: 'Error al actualizar plantel', detalle: err.message });
  }
};

exports.eliminarPlantel = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Plantel.remove(id);
    if (deleted === 0) {
      return res.status(404).json({ error: 'Plantel no encontrado o ya eliminado' });
    }
    res.json({ mensaje: 'Plantel eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar plantel:', err);
    res.status(500).json({ error: 'Error al eliminar plantel', detalle: err.message });
  }
};
