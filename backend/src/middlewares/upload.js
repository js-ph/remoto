// Archivo de Configuración de Multer

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// 💡 CAMBIO CRUCIAL: Usar path.resolve para obtener una ruta ABSOLUTA
// Asumimos que la carpeta 'backend' está en el nivel superior.
// Si este archivo está en 'backend/src/middleware', necesitamos subir dos niveles (../../) para la raíz de 'backend'
// Y luego entrar en 'src/uploads/documentos'.
// PERO si el servidor se ejecuta desde la RAIZ del proyecto,
// es mejor calcular la ruta desde el directorio de trabajo actual (`process.cwd()`).

// Opción 1 (Más simple y asumiendo CWD es la raíz del proyecto):
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'backend', 'src', 'uploads', 'documentos');
// O si tu proyecto solo tiene 'src' en la raíz:
// const UPLOAD_BASE_DIR = path.join(process.cwd(), 'src', 'uploads', 'documentos');


// Opción 2: Corregir tu definición actual si el servidor se ejecuta desde la raíz de 'backend':
// Si el archivo Multer está en `backend/src/middleware` y el servidor inicia en `backend/`,
// esta línea funciona para crear la carpeta:
// const UPLOAD_DIR = path.join(__dirname, '../uploads/documentos'); 
// PERO si el problema es que el CWD es "app/", vamos con la Opción 1.

// Vamos a usar la Opción 1 para garantizar que Multer guarda la ruta ABSOLUTA.

if (!fs.existsSync(UPLOAD_BASE_DIR)) {
  fs.mkdirSync(UPLOAD_BASE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { idAlumno } = req.body;
    
    if (idAlumno) {
      // Usamos la base ABSOLUTA aquí
      const alumnoDir = path.join(UPLOAD_BASE_DIR, `alumno_${idAlumno}`);
      
      if (!fs.existsSync(alumnoDir)) {
        fs.mkdirSync(alumnoDir, { recursive: true });
      }
      
      cb(null, alumnoDir);
    } else {
      cb(null, UPLOAD_BASE_DIR);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    const safeName = nameWithoutExt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/[^a-zA-Z0-9]/g, '_')   
      .substring(0, 50);                
    
    const filename = `${safeName}_${Date.now()}_${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${ext}. Permitidos: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo excede el tamaño máximo permitido (10 MB)'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo no esperado'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error de carga: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = upload;
module.exports.handleMulterError = handleMulterError;