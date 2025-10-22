const Admin = require('../models/adminModel');

exports.obtenerAdmins = async (req, res) => {
  try {
    const admins = await Admin.getAll();
    res.json({ admins });
  } catch (err) {
    console.error('Error al obtener administradores:', err);
    res.status(500).json({ error: 'Error al consultar administradores', detalle: err.message });
  }
};

exports.obtenerAdminPorId = async (req, res) => {
  const id = req.params.id;

  try {
    const admin = await Admin.getById(id);
    if (!admin) return res.status(404).json({ error: 'Administrador no encontrado' });
    res.json({ admin });
  } catch (err) {
    console.error('Error al obtener administrador:', err);
    res.status(500).json({ error: 'Error al consultar administrador', detalle: err.message });
  }
};

exports.registrarAdmin = async (req, res) => {
  try {
    const result = await Admin.create(req.body);
    res.status(201).json({
      mensaje: 'Administrador creado correctamente',
      admin: result
    });
  } catch (err) {
    console.error('Error al crear administrador:', err);
    res.status(500).json({ error: 'Error al crear administrador', detalle: err.message });
  }
};

exports.actualizarAdmin = async (req, res) => {
  const id = req.params.id;
  console.log('[REGISTRAR] Datos del nuevo alumno recibidos:', req.body);
  try {
    const updated = await Admin.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Administrador no encontrado' });
    res.json({ mensaje: 'Administrador actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar administrador:', err);
    res.status(500).json({ error: 'Error al actualizar administrador', detalle: err.message });
  }
};

exports.eliminarAdmin = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Admin.remove(id);
    if (!deleted) return res.status(404).json({ error: 'Administrador no encontrado' });
    res.json({ mensaje: 'Administrador eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar administrador:', err);
    res.status(500).json({ error: 'Error al eliminar administrador', detalle: err.message });
  }
};