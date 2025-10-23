const Horario = require('../models/horarioModel');

exports.obtenerHorarios = async (req, res) => {
  try {
    const horarios = await Horario.getAll();
    res.json({ horarios });
  } catch (err) {
    console.error('Error al obtener horarios:', err);
    res.status(500).json({ error: 'Error al consultar horarios', detalle: err.message });
  }
};

exports.obtenerHorarioporId = async (req, res) => {
  const idHorario = req.params.id;

  if (isNaN(idHorario)) {
    return res.status(400).json({ error: 'ID de horario inválido' });
  }

  if (!dia_semana || !hora || !aula) {
    return res.status(400).json({ error: 'Faltan datos para actualizar el horario' });
  }

  try {
    const horario = await Horario.getById(idHorario);

    if (!horario) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    res.json({ horario });
  } catch (err) {
    console.error('Error al obtener horario:', err);
    res.status(500).json({ error: 'Error al consultar horario', detalle: err.message });
  }
};

exports.registrarHorario = async (req, res) => {
  const { dia_semana, hora, aula, idGrupo } = req.body;
  try {
    const idHorario = await Horario.create({ dia_semana, hora, aula, idGrupo });
    res.json({
      mensaje: 'Horario creado correctamente',
      idHorario: Number(idHorario)
    });
  } catch (err) {
    console.error('Error al crear horario:', err);
    res.status(500).json({ error: 'Error al crear horario', detalle: err.message });
  }
};

exports.actualizarHorario = async (req, res) => {
  const idHorario = req.params.id;
  try {
    const affected = await Horario.update(idHorario, { dia_semana, hora, aula });

    if (affected === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    res.json({ mensaje: 'Horario actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar horario:', err);
    res.status(500).json({ error: 'Error al actualizar horario', detalle: err.message });
  }
};

exports.eliminarHorario = async (req, res) => {
  const idHorario = req.params.id;
  try {
    const affected = await Horario.remove(idHorario);

    if (affected === 0) {
      return res.status(404).json({ error: 'Horario no encontrado o ya eliminado' });
    }

    res.json({ mensaje: 'Horario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar horario:', err);
    res.status(500).json({ error: 'Error al eliminar horario', detalle: err.message });
  }
};
