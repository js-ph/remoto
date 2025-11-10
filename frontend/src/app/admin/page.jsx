'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AlumnoForm from './components/AlumnoForm';
import DocenteForm from './components/DocenteForm';
import AdminForm from './components/AdminForm';
import TablaAlumno from './components/TablaAlumno';
import TablaDocente from './components/TablaDocente';
import TablaAdmin from './components/TablaAdmin';
import ProtectedLayout from '../components/ProtectedLayout';

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;

function AdminPageContent() {
  const router = useRouter();
  const [registros, setRegistros] = useState([]);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState('Alumno');
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [editando, setEditando] = useState(false);

  // Cargar estados
  useEffect(() => {
    const cargarEstados = async () => {
      try {
        const res = await fetch(`${BACK_URL}/estados`, { credentials: 'include' });
        const data = await res.json();
        setEstados(data);
      } catch (err) {
        console.error(err);
      }
    };
    cargarEstados();
  }, []);

  // Cargar carreras
  useEffect(() => {
    const cargarCarreras = async () => {
      try {
        const res = await fetch(`${BACK_URL}/admin/carreras`, { credentials: 'include' });
        if (!res.ok) throw new Error('Fallo al cargar carreras');
        const data = await res.json();
        setCarreras(data.carreras || []);
      } catch (err) {
        console.error(err);
        setCarreras([]);
      }
    };
    cargarCarreras();
  }, []);

  // Cargar registros según tipo
  useEffect(() => {
    cargarRegistros();
  }, [tipoUsuario]);

  const cargarRegistros = async () => {
    setCargando(true);
    let endpoint =
      tipoUsuario === 'Alumno'
        ? '/admin/alumnos'
        : tipoUsuario === 'Docente'
        ? '/admin/docentes'
        : '/admin/administradores';
    try {
      const res = await fetch(`${BACK_URL}${endpoint}`, { credentials: 'include' });
      const data = await res.json();
      setRegistros(
        tipoUsuario === 'Alumno'
          ? data.alumnos
          : tipoUsuario === 'Docente'
          ? data.docentes
          : data.admins
      );
    } catch (err) {
      setError('Error al cargar registros');
    } finally {
      setCargando(false);
    }
  };

  // Cargar municipios según estado
  useEffect(() => {
    const cargarMunicipios = async () => {
      if (!formData.idEstado) return setMunicipios([]);
      try {
        const res = await fetch(`${BACK_URL}/municipios/${formData.idEstado}`, { credentials: 'include' });
        const data = await res.json();
        setMunicipios(data.municipios || []);
      } catch (err) {
        console.error(err);
      }
    };
    cargarMunicipios();
  }, [formData.idEstado]);

  // Guardar registro
  const guardarRegistro = async (e) => {
    e.preventDefault();
    const isEdit = editando;
    let endpoint = '';
    let bodyData = {};

    if (tipoUsuario === 'Alumno') {
      endpoint = isEdit
        ? `/admin/actualizar-alumno/${formData.idAlumno}`
        : '/admin/registrar-alumno';
      bodyData = { ...formData };
    } else if (tipoUsuario === 'Docente') {
      endpoint = isEdit
        ? `/admin/actualizar-docente/${formData.idDocente}`
        : '/admin/registrar-docente';
      bodyData = { ...formData };
    } else if (tipoUsuario === 'Admin') {
      endpoint = isEdit
        ? `/admin/actualizar-admin/${formData.idUsuario}`
        : '/admin/registrar-admin';
      bodyData = { ...formData };
    }

    try {
      const res = await fetch(`${BACK_URL}${endpoint}`, {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error(isEdit ? 'Error al actualizar registro' : 'Error al crear registro');

      setFormData({});
      setEditando(false);
      setError('');
      cargarRegistros();
    } catch (err) {
      setError(err.message);
    }
  };

  const editarRegistro = (registro) => {
    setFormData({
      ...registro,
      idAlumno: registro.idAlumno,
      idDocente: registro.idDocente,
      idUsuario: registro.idUsuario,
    });
    setEditando(true);
  };

  const eliminarRegistro = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    const endpoint =
      tipoUsuario === 'Alumno'
        ? `/admin/eliminar-alumno/${id}`
        : tipoUsuario === 'Docente'
        ? `/admin/eliminar-docente/${id}`
        : `/admin/eliminar-admin/${id}`;

    try {
      const res = await fetch(`${BACK_URL}${endpoint}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Error al eliminar');
      setRegistros(registros.filter(r => r.idAlumno !== id && r.idDocente !== id && r.idUsuario !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) return <p className="text-center mt-10">Cargando registros...</p>;

  return (
    <main className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-center mb-4">Panel de Administración</h1>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 shadow rounded p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-2">{editando ? 'Editar Usuario' : 'Crear Usuario'}</h2>
          <select
            value={tipoUsuario}
            onChange={(e) => { setTipoUsuario(e.target.value); setFormData({}); setEditando(false); }}
            className="mb-4 p-2 border rounded w-64"
          >
            <option value="Alumno">Alumno</option>
            <option value="Docente">Docente</option>
            <option value="Admin">Admin</option>
          </select>

          <form onSubmit={guardarRegistro} className="flex flex-col gap-2">
            <input type="text" placeholder="Nombre" value={formData.nombre || ''} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required className="p-2 border rounded w-full"/>
            <input type="text" placeholder="Apellido Paterno" value={formData.apellido_paterno || ''} onChange={e => setFormData({ ...formData, apellido_paterno: e.target.value })} required className="p-2 border rounded w-full"/>
            <input type="text" placeholder="Apellido Materno" value={formData.apellido_materno || ''} onChange={e => setFormData({ ...formData, apellido_materno: e.target.value })} required className="p-2 border rounded w-full"/>
            {tipoUsuario !== 'Alumno' ? (
            <input 
                type="text" 
                placeholder="Usuario" 
                value={formData.usuario || ''} 
                onChange={e => setFormData({ ...formData, usuario: e.target.value })} 
                className="p-2 border rounded w-full" 
                required={!editando} // Requerido solo para creación de Docente/Admin
                readOnly={editando} 
            />
                ) : (
            <>
                {editando ? (
                    // Si es Alumno y EDICIÓN, lo mostramos como solo lectura
                    <input 
                        type="text" 
                        placeholder="Matrícula/Usuario" 
                        value={formData.usuario || ''} 
                        className="p-2 border rounded w-full bg-gray-200 dark:bg-gray-700"
                        readOnly 
                    />
                ) : (
                    // Si es Alumno y CREACIÓN, NO mostramos el input, solo el mensaje
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
                        El usuario y matrícula del alumno se generarán automáticamente.
                    </p>
                  )}
                </>
            )}
            <input type="password" placeholder="Contraseña" value={formData.contrasena || ''} onChange={e => setFormData({ ...formData, contrasena: e.target.value })} required className="p-2 border rounded w-full"/>
            <input type="email" placeholder="Correo Electrónico" value={formData.correo_electronico || ''} onChange={e => setFormData({ ...formData, correo_electronico: e.target.value })} required className="p-2 border rounded w-full"/>
            <input type="text" placeholder="CURP" value={formData.curp || ''} onChange={e => setFormData({ ...formData, curp: e.target.value })} required className="p-2 border rounded w-full"/>

            {tipoUsuario === 'Alumno' && <AlumnoForm formData={formData} setFormData={setFormData} estados={estados} municipios={municipios} carreras={carreras}/>}
            {tipoUsuario === 'Docente' && <DocenteForm formData={formData} setFormData={setFormData} estados={estados} municipios={municipios}/>}
            {tipoUsuario === 'Admin' && <AdminForm formData={formData} setFormData={setFormData} estados={estados} municipios={municipios}/>}

            <button type="submit" className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors">{editando ? 'Actualizar' : 'Crear'}</button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Tablas */}
        {tipoUsuario === 'Alumno' && <TablaAlumno alumnos={registros} eliminarRegistro={eliminarRegistro} editarRegistro={editarRegistro}/>}
        {tipoUsuario === 'Docente' && <TablaDocente docentes={registros} eliminarRegistro={eliminarRegistro} editarRegistro={editarRegistro}/>}
        {tipoUsuario === 'Admin' && <TablaAdmin admins={registros} eliminarRegistro={eliminarRegistro} editarRegistro={editarRegistro}/>}
      </div>
    </main>
  );
}

// Export usando ProtectedLayout
export default function AdminPage() {
  return (
    <ProtectedLayout rolesPermitidos={['Administrador', 'Superadmin']}>
      <AdminPageContent />
    </ProtectedLayout>
  );
}
