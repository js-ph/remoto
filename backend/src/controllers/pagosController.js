const Pago = require('../models/pagosModel');

exports.obtenerPagos = async (req, res) => {
  try {
    const pagos = await Pago.getAll();
    res.json({ pagos });
  } catch (err) {
    console.error('Error al obtener pagos:', err);
    res.status(500).json({ error: 'Error al consultar pagos', detalle: err.message });
  }
};

exports.obtenerPagoporID = async (req, res) => {
  const id = req.params.id;

  try {
    const pago = await Pago.getById(id);
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    res.json({ pago });
  } catch (err) {
    console.error('Error al obtener pago:', err);
    res.status(500).json({ error: 'Error al consultar pago', detalle: err.message });
  }
};

exports.registrarPago = async (req, res) => {
  try {
    const idPlantel = await Plantel.create({ nombre_plantel, idEstado, idMunicipio });
    res.status(201).json({ mensaje: 'Pago registrado correctamente', idPlantel: Number(idPlantel) });
  } catch (err) {
    console.error('Error al registrar pago:', err);
    res.status(500).json({ error: 'Error al registrar pago', detalle: err.message });
  }
};

exports.actualizarPago = async (req, res) => {
  const id = req.params.id;
  try {
    const updated = await Pago.update(id, { idBeca, idUsuario, cantidad_a_pagar, fecha_de_pago, estado });
    if (updated === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    res.json({ mensaje: 'Pago actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar pago:', err);
    res.status(500).json({ error: 'Error al actualizar pago', detalle: err.message });
  }
};

exports.eliminarPago = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Pago.remove(id);
    if (deleted === 0) {
      return res.status(404).json({ error: 'Pago no encontrado o ya eliminado' });
    }
    res.json({ mensaje: 'Pago eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar pago:', err);
    res.status(500).json({ error: 'Error al eliminar pago', detalle: err.message });
  }
};
