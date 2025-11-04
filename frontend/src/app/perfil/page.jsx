// app/pages/perfil.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '../components/ProtectedLayout';

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;

export default function PerfilPage() {
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await fetch(`${BACK_URL}/auth/perfil`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const text = await res.text();
        const data = JSON.parse(text);

        if (!res.ok) throw new Error(data.error || 'No hay sesión activa');

        setUsuario(data.Datos_Personales);
      } catch (err) {
        console.error('Error en fetchPerfil:', err);
        setError(err.message || 'Error desconocido');
      }
    };

    fetchPerfil();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BACK_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al cerrar sesión');

      router.push('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setError(err.message || 'No se pudo cerrar sesión');
    }
  };

  return (
    <ProtectedLayout>
      {error ? (
        <div className="flex h-screen items-center justify-center bg-gray-100">
          <div className="p-6 bg-white shadow-lg rounded-2xl text-center">
            <h1 className="text-2xl font-bold text-red-500">{error}</h1>
          </div>
        </div>
      ) : !usuario ? (
        <div className="flex h-screen items-center justify-center bg-gray-100">
          <p className="text-lg">⏳ Cargando perfil...</p>
        </div>
      ) : (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
          <div className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl w-96 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Perfil del Usuario
            </h1>
            <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellidos}</p>
            <p><strong>Usuario:</strong> {usuario.usuario}</p>
            <p><strong>Perfil:</strong> {usuario.perfil}</p>
            <p><strong>Correo:</strong> {usuario.correo}</p>
            <p><strong>CURP:</strong> {usuario.curp}</p>
            <p><strong>Estado:</strong> {usuario.estado}</p>
            <p><strong>Municipio:</strong> {usuario.municipio}</p>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
