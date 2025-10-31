"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TablaMaterias from "./components/TablaMaterias";
import FormMateria from "./components/MateriasForm";

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;

export default function PageMaterias() {
    const [materias, setMaterias] = useState([]);
    const [carreras, setCarreras] = useState([]); 
      const router = useRouter();

    const [materiaEditando, setMateriaEditando] = useState(null);

    const obtenerMaterias = async () => {
        const res = await fetch(`${BACK_URL}/admin/materias`);
        const data = await res.json();
        setMaterias(data.materias || []);
    };
    
    const obtenerCarreras = async () => {
        const res = await fetch(`${BACK_URL}/admin/carreras`); 
        const data = await res.json();
        setCarreras(data.carreras || []);
    };

    useEffect(() => {
        obtenerMaterias();
        obtenerCarreras();
    }, []);

    const eliminarRegistro = async (id) => {
        if (!confirm("¿Seguro que deseas eliminar esta materia?")) return;
        await fetch(`${BACK_URL}/admin/eliminar-materias/${id}`, { method: "DELETE" });
        obtenerMaterias();
    };

    const handleSubmit = async (form) => {
        let datosAEnviar;

        if (materiaEditando) {
            datosAEnviar = {
                nombre_materia: form.nombre_materia,
                semestre: Number(form.semestre),
                descripcion: form.descripcion,
                creditos: Number(form.creditos),
            };

            await fetch(`${BACK_URL}/admin/actualizar-materias/${materiaEditando.idMateria}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosAEnviar),
            });
        } else {
            datosAEnviar = {
                nombre_materia: form.nombre_materia,
                semestre: Number(form.semestre),
                descripcion: form.descripcion,
                creditos: Number(form.creditos),
                idCarrera: Number(form.idCarrera), 
            };
            
            if (!datosAEnviar.idCarrera) {
                alert("Por favor, selecciona una carrera.");
                return; 
            }

            await fetch(`${BACK_URL}/admin/registrar-materias`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosAEnviar),
            });
        }
        
        setMateriaEditando(null);
        obtenerMaterias();
    };

    return (
    
        <div className="p-6 flex flex-col items-center">
          <button
            onClick={() => router.push("/perfil")}
            className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
          >
            ← Regresar al perfil
          </button>

            <FormMateria 
                materiaEditando={materiaEditando} 
                onSubmit={handleSubmit} 
                carreras={carreras} 
            />
            <TablaMaterias
                materias={materias}
                eliminarRegistro={eliminarRegistro}
                editarRegistro={setMateriaEditando}
            />
        </div>
    );
}