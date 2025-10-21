'use client';
export default function TablaDocente({ docentes = [], eliminarRegistro, editarRegistro }) {
  if (!docentes.length) return <p>No hay docentes registrados.</p>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-4 overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-3">ID Docente</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Apellido Paterno</th>
            <th className="p-3">Apellido Materno</th>
            <th className="p-3">Usuario</th>
            <th className="p-3">Correo</th>
            <th className="p-3">Fecha Nac.</th>
            <th className="p-3">Sexo</th>
            <th className="p-3">CURP</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Municipio</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((d, index) => (
            <tr key={d.idDocente || index} className="border-b border-gray-200 dark:border-gray-700">
              <td className="p-3">{d.idDocente}</td>
              <td className="p-3">{d.nombre}</td>
              <td className="p-3">{d.apellido_paterno}</td>
              <td className="p-3">{d.apellido_materno}</td>
              <td className="p-3">{d.usuario}</td>
              <td className="p-3">{d.correo_electronico}</td>
              <td className="p-3">{d.fechaNacimiento}</td>
              <td className="p-3">{d.sexo}</td>
              <td className="p-3">{d.curp}</td>
              <td className="p-3">{d.estado}</td>
              <td className="p-3">{d.municipio}</td>
              <td className="p-3 text-center flex gap-2 justify-center">
                <button
                  onClick={() => editarRegistro(d)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarRegistro(d.idDocente)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
