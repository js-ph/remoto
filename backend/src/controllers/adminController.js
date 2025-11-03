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
   const idUsuarioCreador = req.usuario ? req.usuario.id : null; 
    try {
        const result = await Admin.create(req.body, idUsuarioCreador);
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
    const idUsuarioModificador = req.usuario ? req.usuario.id : null; 
    
    // console.log('[REGISTRAR] Datos del nuevo alumno recibidos:', req.body); // Esto parece ser un log de otra parte, tal vez quieras revisarlo.
    
    try {
        const updated = await Admin.update(id, req.body, idUsuarioModificador); 
        if (!updated) return res.status(404).json({ error: 'Administrador no encontrado' });
        res.json({ mensaje: 'Administrador actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar administrador:', err);
        res.status(500).json({ error: 'Error al actualizar administrador', detalle: err.message });
    }
};

exports.desactivarAdmin = async (req, res) => {
    const id = req.params.id;
    const idUsuarioEliminador = req.usuario ? req.usuario.id : null; 
    try {
        const deleted = await Admin.softDelete(id, idUsuarioEliminador);
        if (!deleted) return res.status(404).json({ error: 'Administrador no encontrado o ya desactivado' });
        res.json({ mensaje: 'Administrador desactivado correctamente' });
    } catch (err) {
        console.error('Error al desactivar administrador:', err);
        res.status(500).json({ error: 'Error al desactivar administrador', detalle: err.message });
    }
};

exports.reactivarAdmin = async (req, res) => {
    const id = req.params.id;
    const idUsuarioReactivador = req.usuario ? req.usuario.id : null; 
    try {
        const reactivated = await Admin.reactivate(id, idUsuarioReactivador);
        if (!reactivated) return res.status(404).json({ error: 'Administrador no encontrado o ya activo' });
        res.json({ mensaje: 'Administrador reactivado correctamente' });
    } catch (err) {
        console.error('Error al reactivar administrador:', err);
        res.status(500).json({ error: 'Error al reactivar administrador', detalle: err.message });
    }
};

exports.eliminarAdminPermanente = async (req, res) => {
    const id = req.params.id;
    const idUsuarioEliminador = req.usuario ? req.usuario.id : null; 
    try {
        const deleted = await Admin.remove(id, idUsuarioEliminador);
        if (!deleted) return res.status(404).json({ error: 'Administrador no encontrado' });
        res.json({ mensaje: 'Administrador eliminado permanentemente' });
    } catch (err) {
        console.error('Error al eliminar administrador permanentemente:', err);
        res.status(500).json({ error: 'Error al eliminar administrador permanentemente', detalle: err.message });
    }
};

exports.marcarComoExistente = async (req, res) => {
    const id = req.params.id;
    try {
        await Admin.marcarComoUsuarioExistente(id);
        res.json({ mensaje: 'Usuario marcado como existente' });
    } catch (err) {
        console.error('Error al marcar usuario como existente:', err);
        res.status(500).json({ error: 'Error al marcar usuario como existente', detalle: err.message });
    }
};