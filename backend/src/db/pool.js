const mariadb = require('mariadb');
require('dotenv').config();

// Permitir que el backend arranque sin una base de datos configurada (p. ej., en tests)
const urlString = process.env.URL_DATABASE;

if (!urlString) {
  // Exporta un stub que falla de forma explícita si se intenta usar sin URL configurada
  const notConfigured = async () => {
    throw new Error('URL_DATABASE no configurada. Define la variable de entorno URL_DATABASE para habilitar el acceso a la DB.');
  };
  module.exports = {
    getConnection: notConfigured,
    query: notConfigured,
    end: async () => {},
  };
} else {
  const dbUrl = new URL(urlString);

  const pool = mariadb.createPool({
    host: dbUrl.hostname,
    port: dbUrl.port,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    connectionLimit: 5,
  });

  module.exports = pool;
}