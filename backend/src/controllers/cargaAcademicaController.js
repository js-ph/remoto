const CargaAcademica = require('../models/cargaAcademicaModel');

exports.obtenerCargaAcademica = async (req, res) => {
  try {
    const cargaAcademica = await CargaAcademica.getAll();
    res.json({ cargaAcademica });
  } catch (err) {
    console.error('Error al obtener carga académica:', err);
    res.status(500).json({ error: 'Error al consultar carga académica', detalle: err.message });
  }
};

exports.obtenerCargaAcademicaById = async (req, res) => {
  const id = req.params.id;
  try {
    const carga = await CargaAcademica.getById(id);
    if (!carga) return res.status(404).json({ error: 'Carga académica no encontrada' });
    res.json({ cargaAcademica: carga });
  } catch (err) {
    console.error('Error al obtener carga académica:', err);
    res.status(500).json({ error: 'Error al consultar carga académica', detalle: err.message });
  }
};

exports.registrarCargaAcademica = async (req, res) => {
  const { idMateria, SC, AS, EGC, creditos, RC, Grupo } = req.body;
  if (!idMateria) return res.status(400).json({ error: 'Falta idMateria obligatorio' });

  try {
    const idCargaAcademica = await CargaAcademica.create({ idMateria, SC, AS, EGC, creditos, RC, Grupo });
    res.json({ mensaje: 'Carga académica creada', idCargaAcademica: Number(idCargaAcademica) });
  } catch (err) {
    console.error('Error al crear carga académica:', err);
    res.status(500).json({ error: 'Error al crear carga académica', detalle: err.message });
  }
};

exports.actualizarCargaAcademica = async (req, res) => {
  const id = req.params.id;
  const { idMateria, SC, AS, EGC, creditos, RC, Grupo } = req.body;

  try {
    const affected = await CargaAcademica.update(id, { idMateria, SC, AS, EGC, creditos, RC, Grupo });
    if (affected === 0) return res.status(404).json({ error: 'Carga académica no encontrada' });
    res.json({ mensaje: 'Carga académica actualizada' });
  } catch (err) {
    console.error('Error al actualizar carga académica:', err);
    res.status(500).json({ error: 'Error al actualizar carga académica', detalle: err.message });
  }
};

exports.eliminarCargaAcademica = async (req, res) => {
  const id = req.params.id;

  try {
    const affected = await CargaAcademica.remove(id);
    if (affected === 0) return res.status(404).json({ error: 'Carga académica no encontrada' });
    res.json({ mensaje: 'Carga académica eliminada' });
  } catch (err) {
    console.error('Error al eliminar carga académica:', err);
    res.status(500).json({ error: 'Error al eliminar carga académica', detalle: err.message });
  }
};
