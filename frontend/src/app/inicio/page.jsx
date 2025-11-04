// app/pages/inicio.jsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import ProtectedLayout from '../components/ProtectedLayout';

const API_URL =
  process.env.NEXT_PUBLIC_BACK_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:4000';

export default function InicioPage() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

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
        data = {};
      }

      if (!res.ok) {
        const apiMsg = data?.mensaje || data?.error;
        throw new Error(apiMsg || 'No pudimos cargar la información.');
      }

      setDatos(data);
    } catch (err) {
      const msg = String(err?.message || err);
      if (/failed to fetch|network|fetch/i.test(msg)) {
        setError('No se pudo conectar con el servidor.');
      } else if (/timeout|tiempo de espera/i.test(msg)) {
        setError('La solicitud tardó demasiado. Intenta nuevamente.');
      } else if (/403|401/.test(msg)) {
        setError('Tu sesión no es válida o expiró.');
      } else {
        setError('No pudimos cargar la información.');
      }
      setDatos({ detalleError: msg });
    }
  }, []);

  useEffect(() => {
    fetchInicio();
  }, [fetchInicio]);

  return (
    <ProtectedLayout>
      {error ? (
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
          </div>
        </div>
      ) : !datos ? (
        <p className="text-lg">⏳ Cargando inicio...</p>
      ) : (
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
        </div>
      )}
    </ProtectedLayout>
  );
}
