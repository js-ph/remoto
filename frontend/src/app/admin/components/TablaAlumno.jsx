'use client';
export default function TablaAlumno({ alumnos = [], eliminarRegistro, editarRegistro }) {
  if (!alumnos.length) return <p>No hay alumnos registrados.</p>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-4 overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-3">ID</th>
            <th className="p-3">Carrera</th>
            <th className="p-3">Matricula</th>
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
          {alumnos.map((a, index) => (
            <tr key={a.idAlumno || index} className="border-b border-gray-200 dark:border-gray-700">
              <td className="p-3">{a.idAlumno}</td>
              <td className="p-3">{a.carrera}</td>
              <td className="p-3">{a.matricula}</td>
              <td className="p-3">{a.nombre}</td>
              <td className="p-3">{a.apellido_paterno}</td>
              <td className="p-3">{a.apellido_materno}</td>
              <td className="p-3">{a.usuario}</td>
              <td className="p-3">{a.correo_electronico}</td>
              <td className="p-3">{a.fechaNacimiento}</td>
              <td className="p-3">{a.sexo}</td>
              <td className="p-3">{a.curp}</td>
              <td className="p-3">{a.estado}</td>
              <td className="p-3">{a.municipio}</td>
              <td className="p-3 text-center flex gap-2 justify-center">
                <button
                  onClick={() => editarRegistro(a)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarRegistro(a.idAlumno)}
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
