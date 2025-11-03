'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL =
  process.env.NEXT_PUBLIC_BACK_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:4000';

export default function InicioPage() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchInicio = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(`${API_URL}/inicio`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      let data;
      try {
        data = await res.json();
      } catch (_) {
        // Si no hay JSON válido, forzamos un objeto vacío para evitar romper el flujo
        data = {};
      }

      if (!res.ok) {
        const apiMsg = data?.mensaje || data?.error;
        throw new Error(apiMsg || 'No pudimos cargar la información. Intenta de nuevo.');
      }

      console.log('Respuesta del backend:', data); // 👈 para depurar
      setDatos(data);
    } catch (err) {
      console.error('Error en fetchInicio:', err);
      const msg = String(err?.message || err);
      // Mensajes más amables según el tipo de fallo
      if (/failed to fetch|network|fetch/i.test(msg)) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
      } else if (/timeout|tiempo de espera/i.test(msg)) {
        setError('La solicitud tardó demasiado. Intenta nuevamente.');
      } else if (/403|401/.test(msg)) {
        setError('Tu sesión no es válida o expiró. Inicia sesión de nuevo.');
      } else {
        setError('No pudimos cargar la información. Intenta de nuevo.');
      }
      // En desarrollo, muestra el detalle debajo para depurar
      if (process.env.NODE_ENV !== 'production') {
        setDatos({ detalleError: msg });
      }
    }
  }, []);

  useEffect(() => {
    fetchInicio();
  }, [fetchInicio]);

  if (error)
    return (
      <main className="flex h-screen items-center justify-center bg-gray-100">
        <div className="p-6 bg-white shadow-lg rounded-2xl text-center">
          <h1 className="text-2xl font-bold text-red-500">{error}</h1>
          {datos?.detalleError && (
            <p className="mt-2 text-xs text-gray-500 break-all">Detalle: {datos.detalleError}</p>
          )}
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={() => fetchInicio()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Reintentar
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </main>
    );

  if (!datos)
    return (
      <main className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-lg">⏳ Cargando inicio...</p>
      </main>
    );

  return (
  <main className="flex flex-col h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-lg text-center">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{datos.mensaje}</h1>

      {datos.datosGenerales ? (
        <div className="grid grid-cols-2 gap-4 text-left">
          {Object.entries(datos.datosGenerales).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="font-semibold capitalize text-gray-900 dark:text-gray-200">
                {key.replace(/([A-Z])/g, ' $1')}
              </p>
              <p className="text-xl text-gray-800 dark:text-gray-100">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 mt-4">No hay datos generales disponibles.</p>
      )}

      <button
        onClick={() => router.push('/perfil')}
        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
      >
        Ver perfil
      </button>
    </div>
  </main>
);
}
