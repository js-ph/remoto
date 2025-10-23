const Materia = require('../models/materiaModel');

exports.obtenerMaterias = async (req, res) => {
  try {
    const materias = await Materia.getAll();
    res.json({ materias });
  } catch (err) {
    console.error('Error al obtener materias:', err);
    res.status(500).json({ error: 'Error al consultar materias', detalle: err.message });
  }
};

exports.obtenerMateriaPorId = async (req, res) => {
  const id = req.params.id;
  try {
    const materia = await Materia.getById(id);
    if (!materia) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json({ materia });
  } catch (err) {
    console.error('Error al obtener materia:', err);
    res.status(500).json({ error: 'Error al consultar materia', detalle: err.message });
  }
};

exports.registrarMateria = async (req, res) => {
  try {
    const idMateria = await Materia.create({ idCarrera, nombre_materia, semestre, descripcion, creditos });
    res.status(201).json({ mensaje: 'Materia creada correctamente', idMateria });
  } catch (err) {
    console.error('Error al crear materia:', err);
    res.status(500).json({ error: 'Error al crear materia', detalle: err.message });
  }
};

exports.actualizarMateria = async (req, res) => {
  const id = req.params.id;
  try {
    const affectedRows = await Materia.update(id, { idCarrera, nombre_materia, semestre, descripcion, creditos });
    if (!affectedRows) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json({ mensaje: 'Materia actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar materia:', err);
    res.status(500).json({ error: 'Error al actualizar materia', detalle: err.message });
  }
};

exports.eliminarMateria = async (req, res) => {
  const id = req.params.id;
  try {
    const affectedRows = await Materia.remove(id);
    if (!affectedRows) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json({ mensaje: 'Materia eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar materia:', err);
    res.status(500).json({ error: 'Error al eliminar materia', detalle: err.message });
  }
};

exports.getMateriasByCarrera = async (req, res) => {
  const idCarrera = req.params.id;
  try {
    const materias = await pool.query(`
      SELECT idMateria, nombre_materia, semestre, descripcion, creditos
      FROM dbo_materias
      WHERE idCarrera = ?
    `, [idCarrera]);

    res.json({ materias });
  } catch (err) {
    console.error('Error al obtener materias por carrera:', err);
    res.status(500).json({ error: 'Error al consultar materias', detalle: err.message });
  }
};