const { Pool } = require('pg'); 
require('dotenv').config();


const connectionString = process.env.DATABASE_URL || process.env.URL_DATABASE;

if (!connectionString) {
  const notConfigured = async () => {
    throw new Error('La URL de la base de datos no está configurada (DATABASE_URL o URL_DATABASE).');
  };
  
  module.exports = {
    query: notConfigured,
    connect: notConfigured,
    end: async () => {},
  };
} else {
  
  const config = {
    connectionString: connectionString,
    connectionTimeoutMillis: 5000, 
  };

  if (connectionString.includes('render.com') || connectionString.includes('neon.tech') || process.env.NODE_ENV !== 'production') {
    config.ssl = {
      rejectUnauthorized: false 
    };
  }
  
  const pool = new Pool(config);

  console.log('Cliente PostgreSQL configurado y listo.');
  module.exports = pool;
}