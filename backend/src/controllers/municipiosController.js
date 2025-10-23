const pool = require('../db/pool');

exports.getMunicipiosPorEstado = async (req, res) => {
  const { idEstado } = req.params;

  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT idMunicipio, municipio FROM dbo_municipios WHERE idEstado = ?',
      [idEstado]
    );
    conn.release();

    res.json({ municipios: rows });
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
