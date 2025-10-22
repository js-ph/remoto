const express = require('express');
const router = express.Router();

const validar = require('../middlewares/validar');
const idParamSchema = require('../validators/idValidator');
const verificarSesion = require('../middlewares/verificarSesion');
//const verificarPerfil = require('../middlewares/verificarPerfil');
const alumnoController = require('../controllers/alumnoController');

router.get('/:id/calificaciones', validar(idParamSchema, 'params'), verificarSesion, alumnoController.obtenerCalificacionesPorAlumno);
router.get('/:id/horario',validar(idParamSchema, 'params'), verificarSesion, alumnoController.obtenerHorarioporAlumno)
router.get('/:id/grupo',validar(idParamSchema, 'params'), verificarSesion, alumnoController.obtenerGrupoporAlumno)
module.exports = router;
