"use client";
import { useEffect } from "react";

export default function TablaMaterias({ materias, eliminarRegistro, editarRegistro }) {
  useEffect(() => {
    console.log("Materias cargadas:", materias);
  }, [materias]);

  return (
    <table className="min-w-full border border-gray-300 mt-6">
      <thead className="bg-gray-200">
        <tr>
          <th className="border px-4 py-2">ID</th>
          <th className="border px-4 py-2">Materia</th>
          <th className="border px-4 py-2">Semestre</th>
          <th className="border px-4 py-2">Descripción</th>
          <th className="border px-4 py-2">Créditos</th>
          <th className="border px-4 py-2">Carrera</th>
          <th className="border px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {materias.map((m) => (
          <tr key={m.idMateria} className="hover:bg-gray-50">
            <td className="border px-4 py-2">{m.idMateria}</td>
            <td className="border px-4 py-2">{m.nombre_materia}</td>
            <td className="border px-4 py-2">{m.semestre}</td>
            <td className="border px-4 py-2">{m.descripcion}</td>
            <td className="border px-4 py-2">{m.creditos}</td>
            <td className="border px-4 py-2">{m.carrera}</td>
            <td className="border px-4 py-2 flex gap-2">
              <button
                onClick={() => editarRegistro(m)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarRegistro(m.idMateria)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
