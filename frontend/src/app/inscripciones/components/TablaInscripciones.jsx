// 'use client';
// export default function TablaInscripciones({ inscripciones, editarRegistro, eliminarRegistro }) {
//   return (
//     <table className="mt-4 w-full max-w-4xl border-collapse border border-gray-300">
//       <thead>
//         <tr className="bg-gray-200">
//           <th className="border p-2">Alumno</th>
//           <th className="border p-2">Grupo</th>
//           <th className="border p-2">Periodo</th>
//           <th className="border p-2">Materia</th>
//           <th className="border p-2">Docente</th>
//           <th className="border p-2">Acciones</th>
//         </tr>
//       </thead>
//       <tbody>
//         {inscripciones.map((i) => (
//           <tr key={i.idInscripcion}>
//             <td className="border p-2">{i.alumno}</td>
//             <td className="border p-2">{i.clave_grupo}</td>
//             <td className="border p-2">{i.periodo}</td>
//             <td className="border p-2">{i.nombre_materia}</td>
//             <td className="border p-2">{i.docente || '-'}</td>
//             <td className="border p-2 flex gap-2">
//               <button onClick={() => editarRegistro(i)} className="bg-yellow-500 p-1 rounded text-white">Editar</button>
//               <button onClick={() => eliminarRegistro(i.idInscripcion)} className="bg-red-500 p-1 rounded text-white">Eliminar</button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }
