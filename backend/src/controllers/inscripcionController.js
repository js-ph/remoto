const Inscripcion = require('../models/inscripcionModel');

exports.obtenerInscripciones = async (req, res) => {
  try {
    const inscripciones = await Inscripcion.getAll();
    res.json({ inscripciones });
  } catch (err) {
    console.error('Error al obtener inscripciones:', err);
    res.status(500).json({ error: 'Error al consultar inscripciones', detalle: err.message });
  }
};

exports.obtenerInscripcionesporId = async (req, res) => {
  const idInscripcion = req.params.id;

  if (isNaN(idInscripcion)) {
    return res.status(400).json({ error: 'ID de inscripción inválido' });
  }

  try {
    const inscripcion = await Inscripcion.getById(idInscripcion);

    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    res.json({ inscripcion });
  } catch (err) {
    console.error('Error al obtener inscripción:', err);
    res.status(500).json({ error: 'Error al consultar inscripción', detalle: err.message });
  }
};

exports.registrarInscripcion = async (req, res) => {
  const { idAlumno, idGrupo } = req.body;
  try {
    const idInscripcion = await Inscripcion.create({ idAlumno, idGrupo });

    if (!idInscripcion) {
      return res.status(409).json({ error: 'El alumno ya está inscrito en este grupo' });
    }
    res.json({
      mensaje: 'Inscripción realizada correctamente',
      idInscripcion: Number(idInscripcion)
    });
  } catch (err) {
    console.error('Error al inscribir alumno:', err);
    res.status(500).json({ error: 'Error al inscribir alumno', detalle: err.message });
  }
};

exports.actualizarInscripcion = async (req, res) => {
  const idInscripcion = req.params.id;
  try {
    const affected = await Inscripcion.update(idInscripcion, { idAlumno, idGrupo });

    if (affected === 0) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    res.json({ mensaje: 'Inscripción actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar inscripción:', err);
    res.status(500).json({ error: 'Error al actualizar inscripción', detalle: err.message });
  }
};

exports.eliminarInscripcion = async (req, res) => {
  const idInscripcion = req.params.id;

  try {
    const affected = await Inscripcion.remove(idInscripcion);

    if (affected === 0) {
      return res.status(404).json({ error: 'Inscripción no encontrada o ya eliminada' });
    }

    res.json({ mensaje: 'Inscripción eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar inscripción:', err);
    res.status(500).json({ error: 'Error al eliminar inscripción', detalle: err.message });
  }
};
