const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const upload = require('../middlewares/upload');

router.post(
  '/subir',
  upload.single('documento'),
  documentoController.subirDocumento
);

router.get('/:idDocumento/visualizar', documentoController.visualizarDocumento);

router.get('/:idDocumento/descargar', documentoController.descargarDocumento);

router.delete('/:idDocumento/eliminar', documentoController.eliminarDocumento);


module.exports = router;