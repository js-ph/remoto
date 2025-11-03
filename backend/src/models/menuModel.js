const pool = require('../db/pool');
const { registrarAuditoria } = require('./auditoriaModel');

const getAll = async () => {
  const rows = await pool.query(
    `SELECT * FROM dbo_menu_valido ORDER BY nombre ASC`
  );
  
  return rows.map(menu => ({
    ...menu,
    perfiles_permitidos: menu.perfiles_permitidos ? JSON.parse(menu.perfiles_permitidos) : []
  }));
};

const getById = async (id) => {
  const rows = await pool.query(
    `SELECT * FROM dbo_menu_valido WHERE id_menu = ?`,
    [id]
  );
  
  if (rows.length === 0) return null;
  
  const menu = rows[0];
  return {
    ...menu,
    perfiles_permitidos: menu.perfiles_permitidos ? JSON.parse(menu.perfiles_permitidos) : []
  };
};

const getByPerfil = async (idPerfil) => {
  const rows = await pool.query(
    `SELECT * FROM dbo_menu_valido ORDER BY nombre ASC`
  );
  
  return rows
    .map(menu => ({
      ...menu,
      perfiles_permitidos: menu.perfiles_permitidos ? JSON.parse(menu.perfiles_permitidos) : []
    }))
    .filter(menu => menu.perfiles_permitidos.includes(idPerfil));
};

const create = async ({ nombre, ruta, tipo, perfiles_permitidos }, idUsuarioCreador = null) => {
  if (!Array.isArray(perfiles_permitidos)) {
    throw new Error('perfiles_permitidos debe ser un array');
  }

  const perfilesJSON = JSON.stringify(perfiles_permitidos);

  const result = await pool.query(
    `INSERT INTO dbo_menu_valido (nombre, ruta, tipo, perfiles_permitidos)
     VALUES (?, ?, ?, ?)`,
    [nombre, ruta, tipo, perfilesJSON]
  );

  await registrarAuditoria(
    idUsuarioCreador,
    'CREATE',
    'dbo_menu_valido',
    result.insertId,
    `Menú creado: ${nombre}`
  );

  return result.insertId;
};

const update = async (id, { nombre, ruta, tipo, perfiles_permitidos }, idUsuarioModificador = null) => {
  if (!Array.isArray(perfiles_permitidos)) {
    throw new Error('perfiles_permitidos debe ser un array');
  }

  const perfilesJSON = JSON.stringify(perfiles_permitidos);

  const result = await pool.query(
    `UPDATE dbo_menu_valido
     SET nombre = ?, ruta = ?, tipo = ?, perfiles_permitidos = ?
     WHERE id_menu = ?`,
    [nombre, ruta, tipo, perfilesJSON, id]
  );

  if (result.affectedRows > 0) {
    await registrarAuditoria(
      idUsuarioModificador,
      'UPDATE',
      'dbo_menu_valido',
      id,
      `Menú actualizado: ${nombre}`
    );
  }

  return result.affectedRows;
};

const remove = async (id, idUsuarioEliminador = null) => {
  const menu = await getById(id);

  const result = await pool.query(
    `DELETE FROM dbo_menu_valido WHERE id_menu = ?`,
    [id]
  );

  if (result.affectedRows > 0) {
    await registrarAuditoria(
      idUsuarioEliminador,
      'DELETE',
      'dbo_menu_valido',
      id,
      `Menú eliminado: ${menu?.nombre || 'N/A'}`
    );
  }

  return result.affectedRows;
};

const tieneAcceso = async (idUsuario, idMenu) => {

  const perfilRows = await pool.query(
    `SELECT idPerfil FROM dbo_usuario_perfil WHERE idUsuario = ?`,
    [idUsuario]
  );

  if (perfilRows.length === 0) return false;

  const idPerfil = perfilRows[0].idPerfil;

  const menu = await getById(idMenu);

  if (!menu) return false;

  return menu.perfiles_permitidos.includes(idPerfil);
};


const agregarPerfilPermitido = async (idMenu, idPerfil, idUsuarioModificador = null) => {
  const menu = await getById(idMenu);
  
  if (!menu) {
    throw new Error('Menú no encontrado');
  }

  if (!menu.perfiles_permitidos.includes(idPerfil)) {
    menu.perfiles_permitidos.push(idPerfil);
    
    const perfilesJSON = JSON.stringify(menu.perfiles_permitidos);
    
    await pool.query(
      `UPDATE dbo_menu_valido SET perfiles_permitidos = ? WHERE id_menu = ?`,
      [perfilesJSON, idMenu]
    );

    await registrarAuditoria(
      idUsuarioModificador,
      'UPDATE',
      'dbo_menu_valido',
      idMenu,
      `Perfil ${idPerfil} agregado al menú ${menu.nombre}`
    );

    return true;
  }

  return false; 
};

const removerPerfilPermitido = async (idMenu, idPerfil, idUsuarioModificador = null) => {
  const menu = await getById(idMenu);
  
  if (!menu) {
    throw new Error('Menú no encontrado');
  }

  const index = menu.perfiles_permitidos.indexOf(idPerfil);
  if (index > -1) {
    menu.perfiles_permitidos.splice(index, 1);
    
    const perfilesJSON = JSON.stringify(menu.perfiles_permitidos);
    
    await pool.query(
      `UPDATE dbo_menu_valido SET perfiles_permitidos = ? WHERE id_menu = ?`,
      [perfilesJSON, idMenu]
    );

    await registrarAuditoria(
      idUsuarioModificador,
      'UPDATE',
      'dbo_menu_valido',
      idMenu,
      `Perfil ${idPerfil} removido del menú ${menu.nombre}`
    );

    return true;
  }

  return false; 
};

module.exports = {
  getAll,
  getById,
  getByPerfil,
  create,
  update,
  remove,
  tieneAcceso,
  agregarPerfilPermitido,
  removerPerfilPermitido
};