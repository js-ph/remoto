'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${BACK_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // 🔑 envía la cookie de sesión
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, contrasena }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      console.log('Login exitoso:', data);
      router.push('/inicio');
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el backend');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-black p-6">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <header className="flex items-center gap-3 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-teal-400 text-white shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="1.6" rx="2" fill="none" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Sise Lite Hybrid</h1>
              <p className="text-xs text-slate-500 dark:text-slate-300">Acceso institucional seguro</p>
            </div>
          </header>

          <section className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Usuario</span>
                <input
                  type="text"
                  placeholder="usuario@institucion.mx"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition"
                  aria-label="Usuario"
                  autoComplete="username"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Contraseña</span>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition"
                  aria-label="Contraseña"
                  autoComplete="current-password"
                />
              </label>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold shadow hover:scale-[1.01] transition-transform focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label="Ingresar"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Ingresar
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 p-3 text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="underline decoration-dotted"
              >
                ¿Olvidaste tu contraseña?
              </button>
              <span>© {new Date().getFullYear()} Sise Lite Hybrid</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
