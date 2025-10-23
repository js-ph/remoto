const pool = require('../db/pool');

exports.getEstados = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM dbo_estados`);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener estados:', err);
    res.status(500).json({ error: 'Error al obtener estados' });
  } finally {
    if (conn) conn.release();
  }
};

exports.createEstados = async (req, res) => {
  const { nombre_estado } = req.body;
  if (!nombre_estado) {
    return res.status(400).json({ error: 'Falta nombre_estado' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `INSERT INTO dbo_estado (nombre_estado) VALUES (?)`,
      [nombre_estado]
    );
    res.json({ nombre_estado });
  } catch (err) {
    console.error('Error al insertar estado:', err);
    res.status(500).json({ error: 'Error al insertar usuario' });
  } finally {
    if (conn) conn.release();
  }
};

exports.updateEstados = async (req, res) => {
  const { id } = req.params;
  const { nombre_estado } = req.body;

  if (!nombre_estado) {
    return res.status(400).json({ error: 'Falta nombre_estado' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `UPDATE dbo_estado SET nombre_estado = ? WHERE idEstado = ?`,
      [nombre_estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }

    res.json({ idEstado: Number(id), nombre_estado });
  } catch (err) {
    console.error('Error al actualizar estado:', err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  } finally {
    if (conn) conn.release();
  }
};
