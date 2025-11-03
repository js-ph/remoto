const Auditoria = require('../models/auditoriaModel');

exports.obtenerRegistrosAuditoria = async (req, res) => {
    try {
        const registros = await Auditoria.getAll();
        res.json({ registros });
    } catch (err) {
        console.error('Error al obtener registros de auditoría:', err);
        res.status(500).json({ error: 'Error al consultar auditoría', detalle: err.message });
    }
};

exports.obtenerPorUsuario = async (req, res) => {
    const idUsuario = req.params.idUsuario;
    const limite = req.query.limite || 100; 

    if (isNaN(idUsuario) || idUsuario <= 0) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    try {
        const registros = await Auditoria.getByUsuario(Number(idUsuario), Number(limite));
        res.json({ registros });
    } catch (err) {
        console.error('Error al obtener auditoría por usuario:', err);
        res.status(500).json({ error: 'Error al consultar auditoría', detalle: err.message });
    }
};

exports.obtenerPorTabla = async (req, res) => {
    const tabla = req.params.tabla;
    const limite = req.query.limite || 100; 

    if (!tabla) {
        return res.status(400).json({ error: 'Nombre de tabla es obligatorio' });
    }

    try {
        const registros = await Auditoria.getByTabla(tabla, Number(limite));
        res.json({ registros });
    } catch (err) {
        console.error('Error al obtener auditoría por tabla:', err);
        res.status(500).json({ error: 'Error al consultar auditoría', detalle: err.message });
    }
};

exports.obtenerPorFechas = async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ error: 'Se requieren las fechas de inicio y fin (formato YYYY-MM-DD).' });
    }
    
    try {
        const registros = await Auditoria.getByFecha(fechaInicio, fechaFin);
        res.json({ registros });
    } catch (err) {
        console.error('Error al obtener auditoría por fechas:', err);
        res.status(500).json({ error: 'Error al consultar auditoría por fechas', detalle: err.message });
    }
};