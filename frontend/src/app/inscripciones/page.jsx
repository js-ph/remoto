'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '../components/ProtectedLayout';
import FormInscripcion from './components/FormInscripcion';
import TablaInscripciones from './components/TablaInscripciones';

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;

export default function PageInscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [inscripcionEditando, setInscripcionEditando] = useState(null);
  const router = useRouter();

  // --- Traer inscripciones ---
  const obtenerInscripciones = async () => {
    const res = await fetch(`${BACK_URL}/admin/inscripciones`, { credentials: 'include' });
    const data = await res.json();
    setInscripciones(data.inscripciones || []);
  };

  // --- Traer alumnos ---
  const obtenerAlumnos = async () => {
    const res = await fetch(`${BACK_URL}/admin/alumnos`, { credentials: 'include' });
    const data = await res.json();
    setAlumnos(data.alumnos || []);
  };

  // --- Traer grupos ---
  const obtenerGrupos = async () => {
    const res = await fetch(`${BACK_URL}/admin/grupos`, { credentials: 'include' });
    const data = await res.json();
    setGrupos(data.grupos || []);
  };

  useEffect(() => {
    obtenerInscripciones();
    obtenerAlumnos();
    obtenerGrupos();
  }, []);

  // --- Guardar o actualizar inscripción ---
  const handleSubmit = async (form) => {
    const datosAEnviar = {
      idAlumno: Number(form.idAlumno),
      idGrupo: Number(form.idGrupo),
    };

    if (inscripcionEditando) {
      await fetch(`${BACK_URL}/admin/actualizar-inscripcion/${inscripcionEditando.idInscripcion}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAEnviar),
      });
    } else {
      await fetch(`${BACK_URL}/admin/registrar-inscripcion`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAEnviar),
      });
    }

    setInscripcionEditando(null);
    obtenerInscripciones();
  };

  // --- Eliminar ---
  const eliminarRegistro = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta inscripción?')) return;
    await fetch(`${BACK_URL}/admin/eliminar-inscripcion/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    obtenerInscripciones();
  };

  return (
    <ProtectedLayout>
      <div className="p-6 flex flex-col items-center">
        <button
          onClick={() => router.push('/perfil')}
          className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
        >
          ← Regresar al perfil
        </button>

        <FormInscripcion
          alumnos={alumnos}
          grupos={grupos}
          inscripcionEditando={inscripcionEditando}
          onSubmit={handleSubmit}
        />

        <TablaInscripciones
          inscripciones={inscripciones}
          editarRegistro={setInscripcionEditando}
          eliminarRegistro={eliminarRegistro}
        />
      </div>
    </ProtectedLayout>
  );
}
