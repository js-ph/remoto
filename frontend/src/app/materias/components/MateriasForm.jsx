"use client";
import { useState, useEffect } from "react";

export default function FormMateria({ materiaEditando, onSubmit, carreras = [] }) {
    const [form, setForm] = useState({
        nombre_materia: "",
        semestre: "",
        descripcion: "",
        creditos: "",
        idCarrera: "", 
    });

    useEffect(() => {
        if (materiaEditando) setForm(materiaEditando);
    }, [materiaEditando]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
        setForm({
            nombre_materia: "",
            semestre: "",
            descripcion: "",
            creditos: "",
            idCarrera: "", 
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 bg-gray-100 p-4 rounded-lg w-full max-w-lg"
        >
            <h2 className="text-xl font-semibold">
                {materiaEditando ? "Editar materia" : "Registrar nueva materia"}
            </h2>
            
            <input
                name="nombre_materia"
                placeholder="Nombre de materia"
                value={form.nombre_materia}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
                required
            />
            
            <input
                name="semestre"
                placeholder="Semestre"
                value={form.semestre}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
                required
            />
            
            <input
                name="descripcion"
                placeholder="Descripción"
                value={form.descripcion}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
            />

            <select
                name="idCarrera" 
                value={form.idCarrera || ""}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
                required
                disabled={!!materiaEditando} 
            >
                <option value="">Selecciona una carrera</option>
                {carreras.map((carrera) => (
                    <option key={carrera.idCarrera} value={carrera.idCarrera}>
                        {carrera.carrera || carrera.nombre_carrera || `Carrera ID: ${carrera.idCarrera}`}
                    </option>
                ))}
            </select>
            
            <input
                name="creditos"
                placeholder="Créditos"
                type="number"
                value={form.creditos}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
                required
            />

            <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {materiaEditando ? "Actualizar" : "Registrar"}
            </button>
        </form>
    );
}