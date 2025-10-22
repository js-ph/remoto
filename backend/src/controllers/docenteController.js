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
  const {
    nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
    sexo, curp, idEstado, idMunicipio,
    usuario, contrasena, correo_electronico
  } = req.body;

  try {
    const result = await Docente.create({
      nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento,
      sexo, curp, idEstado, idMunicipio,
      usuario, contrasena, correo_electronico
    });
    res.status(201).json({ mensaje: 'Docente creado correctamente', docente: result });
  } catch (err) {
    console.error('Error al crear docente:', err);
    res.status(500).json({ error: 'Error al insertar docente', detalle: err.message });
  }
};

exports.actualizarDocente = async (req, res) => {
  const id = req.params.id;
  console.log('[REGISTRAR] Datos del nuevo alumno recibidos:', req.body);
  try {
    const updated = await Docente.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json({ mensaje: 'Docente actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar docente:', err);
    res.status(500).json({ error: 'Error al actualizar docente', detalle: err.message });
  }
};

exports.eliminarDocente = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Docente.remove(id);
    if (!deleted) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json({ mensaje: 'Docente eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar docente:', err);
    res.status(500).json({ error: 'Error al eliminar docente', detalle: err.message });
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