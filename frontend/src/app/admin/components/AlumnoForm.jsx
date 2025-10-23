'use client';
import { useEffect } from 'react';

export default function AlumnoForm({ formData, setFormData, estados, municipios, carreras }) {

  // Resetear municipio cuando cambia el estado
  useEffect(() => {
    setFormData(prev => ({ ...prev, idMunicipio: '' }));
  }, [formData.idEstado]);

  return (
    <div className="flex flex-col gap-2">
      {/* Fecha de nacimiento */}
      <input
        type="date"
        placeholder="Fecha de Nacimiento"
        value={formData.fecha_de_nacimiento || ''}
        onChange={(e) => setFormData({ ...formData, fecha_de_nacimiento: e.target.value })}
        required
        className="p-2 border rounded w-full"
      />

      {/* Sexo */}
      <select
        value={formData.sexo || ''}
        onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
        required
        className="p-2 border rounded w-full"
      >
        <option value="">Selecciona un sexo</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
      </select>

      {/* Estado */}
      <select
        value={formData.idEstado || ''}
        onChange={(e) => setFormData({ ...formData, idEstado: Number(e.target.value) })}
        required
        className="p-2 border rounded w-full"
      >
        <option value="">Selecciona un estado</option>
        {estados.map((estado) => (
          <option key={estado.idEstado} value={estado.idEstado}>
            {estado.estado}
          </option>
        ))}
      </select>

      {/* Municipio */}
      <select
        value={formData.idMunicipio || ''}
        onChange={(e) => setFormData({ ...formData, idMunicipio: Number(e.target.value) })}
        required
        className="p-2 border rounded w-full"
        disabled={!municipios.length}
      >
        <option value="">Selecciona un municipio</option>
        {municipios.map((mun) => (
          <option key={mun.idMunicipio} value={mun.idMunicipio}>
            {mun.municipio}
          </option>
        ))}
      </select>
      {/* Carrera */}
      <select
        value={formData.idCarrera || ''}
        onChange={(e) => setFormData({ ...formData, idCarrera: Number(e.target.value) })}
        required
        className="p-2 border rounded w-full"
      >
        <option value="">Selecciona una carrera</option>
        {carreras.map((carrera) => (
          <option key={carrera.idCarrea} value={carrera.idCarrera}>
            {carrera.carrera}
          </option>
        ))}
      </select>
    </div>
  );
}
