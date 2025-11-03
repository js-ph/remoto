const express = require('express');
const router = express.Router();

const verificarSesion = require('../middlewares/verificarSesion');
const verificarPerfil = require('../middlewares/verificarPerfil');

const plantelController = require('../controllers/plantelController');
const loginController = require('../controllers/loginController');
const alumnoController = require('../controllers/alumnoController');
const docenteController = require('../controllers/docenteController');
const adminController = require('../controllers/adminController');
const cargaAcademicaController = require('../controllers/cargaAcademicaController');
const pagosController = require('../controllers/pagosController');
const becasController = require('../controllers/becasController');
const calificacionesController = require('../controllers/calificacionesController');
const carreraController = require('../controllers/carreraController');
const grupoController = require('../controllers/grupoController');
const horarioController = require('../controllers/horarioController');
const inscripcionController = require('../controllers/inscripcionController');
const materiaController = require('../controllers/materiaController');

const validar = require('../middlewares/validar');
const validarUsuarioUnico = require('../middlewares/validarUsuarioUnico');
const adminSchema = require('../validators/adminValidator');
const alumnoSchema = require('../validators/alumnoValidator');
const becaSchema = require('../validators/becaValidator');
const calificacionSchema = require('../validators/calificacionesValidator');
const cargaAcademicaSchema = require('../validators/cargaAcademicaValidator');
const carreraSchema = require('../validators/carreraValidator');
const docenteSchema = require('../validators/docenteValidator');
const grupoSchema = require('../validators/grupoValidator');
const horarioSchema = require('../validators/horarioValidator');
const inscripcionSchema = require('../validators/inscripcionValidator');
const { createMateriaSchema, updateMateriaSchema } = require('../validators/materiaValidator');
const idParamSchema = require('../validators/idValidator');
const { createPagoSchema, updatePagoSchema } = require('../validators/pagosValidator');
const { createPlantelSchema, updatePlantelSchema } = require('../validators/plantelValidator');

const debugBody = (req, res, next) => {
    // 🚨 ESTO IMPRIMIRÁ LA DATA RECIBIDA ANTES DE VALIDARLA
    console.log('[LOG DE DEPURACIÓN] Datos recibidos ANTES de la validación:', req.body);
    next(); // Permite que la petición continúe al siguiente middleware (la validación)
};

// ===============================
// PLANTELES
// ===============================
router.get('/plantel', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), plantelController.obtenerPlantel);
router.get('/plantel/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), plantelController.obtenerPlantelporID);
router.post('/registrar-plantel', verificarSesion, verificarPerfil(['Superadmin']), validar(createPlantelSchema), plantelController.registrarPlantel);
router.put('/actualizar-plantel/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(updatePlantelSchema), plantelController.actualizarPlantel);
router.delete('/eliminar-plantel/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), plantelController.eliminarPlantel);

// ===============================
// GRUPOS
// ===============================
router.get('/grupo', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), grupoController.obtenerGrupos);
router.get('/grupo/:idGrupo', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), grupoController.obtenerGrupoPorId);
router.post('/registrar-grupo', verificarSesion, verificarPerfil(['Superadmin']), validar(grupoSchema), grupoController.registrarGrupo);
router.put('/actualizar-grupo/:idGrupo', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(grupoSchema), grupoController.actualizarGrupo);
router.delete('/eliminar-grupo/:idGrupo', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), grupoController.eliminarGrupo);

// ===============================
// HORARIOS
// ===============================
router.get('/horario', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), horarioController.obtenerHorarios);
router.get('/horario/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), horarioController.obtenerHorarioporId);
router.post('/registrar-horario', verificarSesion, verificarPerfil(['Superadmin']), validar(horarioSchema), horarioController.registrarHorario);
router.put('/actualizar-horario/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(horarioSchema), horarioController.actualizarHorario);
router.delete('/eliminar-horario/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), horarioController.eliminarHorario);

// ===============================
// INSCRIPCIÓN
// ===============================
router.get('/inscripcion', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), inscripcionController.obtenerInscripciones);
router.get('/inscripcion/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), inscripcionController.obtenerInscripcionesporId);
router.post('/registrar-inscripcion', verificarSesion, verificarPerfil(['Superadmin']), validar(inscripcionSchema), inscripcionController.registrarInscripcion);
router.put('/actualizar-inscripcion/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(inscripcionSchema), inscripcionController.actualizarInscripcion);
router.delete('/eliminar-inscripcion/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), inscripcionController.eliminarInscripcion);

// ===============================
// ROLES
// ===============================
router.get('/roles', verificarSesion, verificarPerfil(['Superadmin']), loginController.getRoles);
router.get('/roles/:id', verificarSesion, verificarPerfil(['Superadmin']), loginController.getRolbyID);

// ===============================
// ALUMNOS
// ===============================
router.get('/alumnos', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), alumnoController.obtenerAlumnos);
router.get('/alumnos/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), alumnoController.obtenerAlumnoPorId);
router.post('/registrar-alumno', 
    verificarSesion, 
    verificarPerfil(['Superadmin']), 
    debugBody, 
    validar(alumnoSchema), 
    validarUsuarioUnico, 
    alumnoController.registrarAlumno
);router.put('/actualizar-alumno/:id', verificarSesion, verificarPerfil(['Superadmin']), debugBody, validar(idParamSchema, 'params'), validar(alumnoSchema), alumnoController.actualizarAlumno);
router.delete('/eliminar-alumno/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), alumnoController.eliminarAlumno);

// ===============================
// DOCENTES
// ===============================
router.get('/docentes', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), docenteController.obtenerDocentes);
router.get('/docentes/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), docenteController.obtenerDocentePorId);
router.post('/registrar-docente', verificarSesion, verificarPerfil(['Superadmin']), validar(docenteSchema), docenteController.registrarDocente);
router.put('/actualizar-docente/:id', verificarSesion, verificarPerfil(['Superadmin']), debugBody, validar(idParamSchema, 'params'), validar(docenteSchema), docenteController.actualizarDocente);
router.delete('/eliminar-docente/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), docenteController.eliminarDocentePermanente);

// ===============================
// ADMINISTRADORES
// ===============================
router.get('/administradores', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), adminController.obtenerAdmins);
router.get('/administradores/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), adminController.obtenerAdminPorId);
router.post('/registrar-admin', verificarSesion, verificarPerfil(['Superadmin']), validar(adminSchema), validarUsuarioUnico, adminController.registrarAdmin);
router.put('/actualizar-admin/:id', verificarSesion, verificarPerfil(['Superadmin']), debugBody, validar(idParamSchema, 'params'), validar(adminSchema), adminController.actualizarAdmin);
router.delete('/eliminar-admin/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), adminController.eliminarAdminPermanente);

// ===============================
// CARGA ACADÉMICA
// ===============================
router.get('/carga', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), cargaAcademicaController.obtenerCargaAcademica);
router.get('/carga/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), cargaAcademicaController.obtenerCargaAcademica);
router.post('/registrar-carga', verificarSesion, verificarPerfil(['Superadmin']), validar(cargaAcademicaSchema), cargaAcademicaController.registrarCargaAcademica);
router.put('/actualizar-carga/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(cargaAcademicaSchema), cargaAcademicaController.actualizarCargaAcademica);
router.delete('/eliminar-carga/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), cargaAcademicaController.eliminarCargaAcademica);

// ===============================
// PAGOS
// ===============================
router.get('/pagos', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), pagosController.obtenerPagos);
router.get('/pagos/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), pagosController.obtenerPagoporID);
router.post('/registrar-pagos', verificarSesion, verificarPerfil(['Superadmin']), validar(createPagoSchema), pagosController.registrarPago);
router.put('/actualizar-pagos/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(updatePagoSchema), pagosController.actualizarPago);
router.delete('/eliminar-pagos/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), pagosController.eliminarPago);

// ===============================
// BECAS
// ===============================
router.get('/becas', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), becasController.obtenerBecas);
router.get('/becas/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), becasController.obtenerBecaporId);
router.post('/registrar-becas', verificarSesion, verificarPerfil(['Superadmin']), validar(becaSchema), becasController.registrarBeca);
router.put('/actualizar-becas/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(becaSchema), becasController.actualizarBeca);
router.delete('/eliminar-becas/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), becasController.eliminarBeca);

// ===============================
// CALIFICACIONES
// ===============================
router.get('/calificaciones', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), calificacionesController.obtenerCalificaciones);
router.get('/calificaciones/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), calificacionesController.obtenerCalificacionById);
router.post('/registrar-calificaciones', verificarSesion, verificarPerfil(['Superadmin']), validar(calificacionSchema), calificacionesController.registrarCalificacion);
router.put('/actualizar/calificaciones/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(calificacionSchema), calificacionesController.actualizarCalificacion);
router.delete('/eliminar/calificaciones/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), calificacionesController.eliminarCalificacion);

// ===============================
// CARRERAS
// ===============================
router.get('/carreras', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), carreraController.obtenerCarreras);
router.get('/carreras/:id', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), carreraController.obtenerCarreraPorId);
router.post('/registrar-carreras', verificarSesion, verificarPerfil(['Superadmin']), validar(carreraSchema), carreraController.registrarCarrera);
router.put('/actualizar-carreras/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), validar(carreraSchema), carreraController.actualizarCarrera);
router.delete('/eliminar-carreras/:id', verificarSesion, verificarPerfil(['Superadmin']), validar(idParamSchema, 'params'), carreraController.eliminarCarrera);

// ===============================
// MATERIAS
// ===============================
router.get('/materias', verificarSesion, verificarPerfil(['Superadmin', 'Admin']), materiaController.obtenerMaterias);
router.get('/materias/:id',  verificarSesion, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), materiaController.obtenerMateriaPorId);
router.post('/registrar-materias', debugBody, verificarPerfil(['Superadmin', 'Admin']), validar(createMateriaSchema), materiaController.registrarMateria);
router.put('/actualizar-materias/:id', debugBody, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), validar(updateMateriaSchema), materiaController.actualizarMateria);
router.delete('/eliminar-materias/:id', debugBody, verificarPerfil(['Superadmin', 'Admin']), validar(idParamSchema, 'params'), materiaController.eliminarMateria);

module.exports = router;