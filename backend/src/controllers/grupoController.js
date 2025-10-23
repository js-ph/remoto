const Grupo = require('../models/grupoModel');

exports.obtenerGrupos = async (req, res) => {
  try {
    const grupos = await Grupo.getAll();
    res.json({ grupos });
  } catch (err) {
    console.error('Error al obtener grupos:', err);
    res.status(500).json({ error: 'Error al consultar grupos', detalle: err.message });
  }
};

exports.obtenerGrupoPorId = async (req, res) => {
  const id = req.params.id;
  try {
    const grupo = await Grupo.getById(id);
    if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ grupo });
  } catch (err) {
    console.error('Error al obtener grupo:', err);
    res.status(500).json({ error: 'Error al consultar grupo', detalle: err.message });
  }
};

exports.registrarGrupo = async (req, res) => {
  try {
    const idGrupo = await Grupo.create({ periodo, clave_grupo, cupo, idMateria, idDocente });
    res.status(201).json({ mensaje: 'Grupo creado correctamente', idGrupo });
  } catch (err) {
    console.error('Error al crear grupo:', err);
    res.status(500).json({ error: 'Error al crear grupo', detalle: err.message });
  }
};

exports.actualizarGrupo = async (req, res) => {
  const id = req.params.id;
  try {
    const affectedRows = await Grupo.update(id, { periodo, clave_grupo, cupo, idMateria, idDocente });
    if (!affectedRows) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ mensaje: 'Grupo actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar grupo:', err);
    res.status(500).json({ error: 'Error al actualizar grupo', detalle: err.message });
  }
};

exports.eliminarGrupo = async (req, res) => {
  const id = req.params.id;
  try {
    const affectedRows = await Grupo.remove(id);
    if (!affectedRows) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ mensaje: 'Grupo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar grupo:', err);
    res.status(500).json({ error: 'Error al eliminar grupo', detalle: err.message });
  }
};