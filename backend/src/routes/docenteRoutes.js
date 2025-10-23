const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docenteController');
const calificacionesController = require('../controllers/calificacionesController');

const verificarSesion = require('../middlewares/verificarSesion');
const verificarPerfil = require('../middlewares/verificarPerfil');
const validar = require('../middlewares/validar');
const idParamSchema = require('../validators/idValidator');
const calificacionSchema = require('../validators/calificacionesValidator');

router.get('/calificaciones/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), calificacionesController.obtenerCalificacionById);
router.post('/registrar/calificaciones', verificarSesion, verificarPerfil(['Superadmin']), validar(calificacionSchema), calificacionesController.registrarCalificacion);
router.put('/actualizar/calificaciones/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(calificacionSchema), calificacionesController.actualizarCalificacion);
router.delete('/eliminar/calificaciones/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), calificacionesController.eliminarCalificacion);

router.get('/:id/grupos', validar(idParamSchema, 'params'), verificarSesion, verificarPerfil(["Superadmin", "Admin", "Docente"]),docenteController.obtenerGruposDocente);
router.get('/:id/horario', validar(idParamSchema, 'params'), verificarSesion, verificarPerfil(["Superadmin", "Admin", "Docente"]),docenteController.obtenerHorarioDocentes);

module.exports = router;