const express = require('express');
const router = express.Router();
const municipioController = require('../controllers/municipiosController');

router.get('/:idEstado', municipioController.getMunicipiosPorEstado);

module.exports = router;
