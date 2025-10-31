'use client';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const goToLogin = () => router.push('/login');

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-black p-4">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white/95 dark:bg-gray-800/90 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <header className="px-6 py-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-teal-400 shadow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 12h18" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="6" y="6" width="12" height="12" stroke="white" strokeWidth="1.6" rx="2" fill="none"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">Sise Lite Hybrid</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300">Acceso institucional — pulsa para iniciar sesión</p>
          </div>
        </header>

        <section className="px-6 pb-8 sm:pb-10 flex flex-col items-center gap-4">
          <p className="text-sm text-center text-slate-600 dark:text-slate-300 max-w-xs">
            Pulsa el botón para ir a la pantalla de inicio de sesión. Compatible con dispositivos móviles.
          </p>

          <button
            onClick={goToLogin}
            className="mt-2 w-full max-w-xs inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold shadow-md hover:scale-[1.01] transition-transform focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Ir a iniciar sesión"
          >
            Acceder
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="mt-2 text-xs text-slate-400 text-center">
            © {new Date().getFullYear()} Sise Lite Hybrid
          </div>
        </section>
      </div>
    </main>
  );
}
