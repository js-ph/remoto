const { Pool } = require('pg'); // Cliente de PostgreSQL
require('dotenv').config();

// Usamos DATABASE_URL (estándar de Render/Neon) o URL_DATABASE (tu variable actual)
const connectionString = process.env.DATABASE_URL || process.env.URL_DATABASE;

if (!connectionString) {
  // Exporta el stub si no está configurada la URL
  const notConfigured = async () => {
    throw new Error('La URL de la base de datos no está configurada (DATABASE_URL o URL_DATABASE).');
  };
  
  // El pool de 'pg' usa 'query' y 'connect'
  module.exports = {
    query: notConfigured,
    connect: notConfigured,
    end: async () => {},
  };
} else {
  
  const config = {
    connectionString: connectionString,
    connectionTimeoutMillis: 5000, // Opcional: tiempo de espera
  };

  // Configuración SSL: Necesaria si te conectas a Neon/Render desde fuera de su red interna.
  if (connectionString.includes('render.com') || connectionString.includes('neon.tech') || process.env.NODE_ENV !== 'production') {
    config.ssl = {
      // Usar 'rejectUnauthorized: false' es común en desarrollo/test para ignorar problemas de certificado,
      // pero debe ser revisado para producción si se accede externamente.
      rejectUnauthorized: false 
    };
  }
  
  const pool = new Pool(config);

  console.log('Cliente PostgreSQL configurado y listo.');
  module.exports = pool;
}