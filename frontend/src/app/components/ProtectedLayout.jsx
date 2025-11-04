'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL || 'http://127.0.0.1:4000';

export default function ProtectedLayout({ children, rolesPermitidos = [] }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch(`${BACK_URL}/auth/perfil`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        const usuarioSesion = data.Datos_Personales;

        // Bloqueo por rol
        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuarioSesion.perfil)) {
          router.push('/inicio');
          return;
        }

        setUsuario(usuarioSesion);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, [router, rolesPermitidos]);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BACK_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      router.push('/login');
    } catch (err) {
      console.error(err);
      alert('Error cerrando sesión');
    }
  };

  if (loading)
    return (
      <main className="flex h-screen items-center justify-center">
        <p>⏳ Verificando sesión...</p>
      </main>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Sise Lite Hybrid</h1>
        <nav className="flex gap-4 items-center">
          <button onClick={() => router.push('/inicio')} className="hover:underline">
            Inicio
          </button>
          <button onClick={() => router.push('/perfil')} className="hover:underline">
            Perfil
          </button>
                    <button onClick={() => router.push('/inscripciones')} className="hover:underline">
            Inscripciones
          </button>

          {(usuario.perfil === 'Administrador' || usuario.perfil === 'Superadmin') && (
            <>
              <button onClick={() => router.push('/admin')} className="hover:underline">
                Admin
              </button>
              <button onClick={() => router.push('/materias')} className="hover:underline">
                Materias
              </button>
            </>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </nav>
      </header>

      <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900">{children}</main>
    </div>
  );
}
