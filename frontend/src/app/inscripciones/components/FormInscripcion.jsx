// 'use client';
// export default function FormInscripcion({ alumnos, grupos, inscripcionEditando, onSubmit }) {
//   const [formData, setFormData] = useState({ idAlumno: '', idGrupo: '' });

//   useEffect(() => {
//     if (inscripcionEditando) {
//       setFormData({
//         idAlumno: inscripcionEditando.idAlumno,
//         idGrupo: inscripcionEditando.idGrupo,
//       });
//     } else {
//       setFormData({ idAlumno: '', idGrupo: '' });
//     }
//   }, [inscripcionEditando]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow flex flex-col gap-2 w-full max-w-md">
//       <h2 className="text-xl font-semibold">{inscripcionEditando ? 'Editar Inscripción' : 'Nueva Inscripción'}</h2>

//       <select
//         value={formData.idAlumno}
//         onChange={(e) => setFormData({ ...formData, idAlumno: e.target.value })}
//         required
//         className="p-2 border rounded"
//       >
//         <option value="">Selecciona un alumno</option>
//         {alumnos.map((a) => (
//           <option key={a.idAlumno} value={a.idAlumno}>{a.usuario}</option>
//         ))}
//       </select>

//       <select
//         value={formData.idGrupo}
//         onChange={(e) => setFormData({ ...formData, idGrupo: e.target.value })}
//         required
//         className="p-2 border rounded"
//       >
//         <option value="">Selecciona un grupo</option>
//         {grupos.map((g) => (
//           <option key={g.idGrupo} value={g.idGrupo}>{g.clave_grupo} - {g.nombre_materia}</option>
//         ))}
//       </select>

//       <button type="submit" className="bg-green-500 text-white p-2 rounded mt-2">
//         {inscripcionEditando ? 'Actualizar' : 'Registrar'}
//       </button>
//     </form>
//   );
// }
