CREATE TABLE dbo_usuario (idUsuario int(10) NOT NULL AUTO_INCREMENT, idPersona int(10) NOT NULL, nuevoUsuario int(10) comment 'Función para saber si se activa un tutorial de nuevo usuario
1 = Nuevo usuario
0 = El usuario ya hizo login', Usuario varchar(50), contrasena varchar(50), correo_electronico varchar(255), fecha_de_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, fecha_de_modificacion time, status int(10), ultimo_login TIMESTAMP, idGrupo int(10), PRIMARY KEY (idUsuario));
CREATE TABLE dbo_persona (idPersona int(10) NOT NULL AUTO_INCREMENT, nombre varchar(20), apellido_paterno varchar(20), apellido_materno varchar(20), fecha_de_nacimiento date, sexo char(255), curp varchar(18), idEstado int(10) NOT NULL, idMunicipio int(10) NOT NULL, PRIMARY KEY (idPersona));
CREATE TABLE dbo_login_perfil (idPerfil int(10) NOT NULL AUTO_INCREMENT, nombre varchar(255), descripcion varchar(255), PRIMARY KEY (idPerfil));
CREATE TABLE dbo_plantel (idPlantel int(10) NOT NULL AUTO_INCREMENT, idMunicipio int(10) NOT NULL, idEstado int(10) NOT NULL, nombre_plantel varchar(100), PRIMARY KEY (idPlantel));
CREATE TABLE dbo_carga_academica (idCargaAcademica int(10) NOT NULL AUTO_INCREMENT, idMateria int(10) NOT NULL, SC int(10), `AS` int(10), EGC int(10), creditos tinyint, RC int(10), Grupo varchar(255), PRIMARY KEY (idCargaAcademica)) comment='SC: Sobrecarga     AS: Asesoría     RC: Repite Curso     EGC: Examen General De Conocimientos     COR: Plantel Córdoba     ORI: Plantel Orizaba     ';
CREATE TABLE dbo_horario (idHorario int(10) NOT NULL AUTO_INCREMENT, dia_semana varchar(10), hora time, aula varchar(255), idGrupo int(10) NOT NULL, PRIMARY KEY (idHorario));
CREATE TABLE dbo_carrera (idCarrera int(10) NOT NULL AUTO_INCREMENT, carrera varchar(100), duracion_semestres tinyint, descripcion varchar(255), idPlantel int(10) NOT NULL, `Column` int(10), PRIMARY KEY (idCarrera));
CREATE TABLE dbo_menu_valido (id_menu int(10) NOT NULL AUTO_INCREMENT, nombre varchar(255), tipo int(10) comment 'enum(''gestor'', ''formulario'', ''otro'', ''observar'')', fecha_creacion time comment 'Fecha y hora de creación del registro del menú.', fecha_actualizacion time comment 'Fecha y hora de la última actualización del registro del menú.', acceso varchar(20) comment 'Ejemplo de uso
 [1,2] superadmin, admin

con un ciclo desglosar el arreglo en base al id de la tabla dbo_login_perfil ', PRIMARY KEY (id_menu));
CREATE TABLE dbo_materias (idMateria int(10) NOT NULL AUTO_INCREMENT, idCarrera int(10) NOT NULL, nombre_materia varchar(255), semestre tinyint, descripcion varchar(255), creditos int(10), PRIMARY KEY (idMateria));
CREATE TABLE dbo_auditoria (idAuditoria int(10) NOT NULL AUTO_INCREMENT, idUsuario int(10), accion varchar(255), fechaAccion time, observaciones varchar(255), PRIMARY KEY (idAuditoria));
CREATE TABLE dbo_docente (idDocente int(10) NOT NULL AUTO_INCREMENT, idUsuario int(10) NOT NULL, PRIMARY KEY (idDocente));
CREATE TABLE dbo_pagos (idPago int(10) NOT NULL AUTO_INCREMENT, idBeca int(10) NOT NULL, idUsuario int(10) NOT NULL, cantidad_a_pagar decimal(19, 0), fecha_de_pago time, estado varchar(255) comment 'Pendiente
Pagado
Prorroga
Etc', PRIMARY KEY (idPago));
CREATE TABLE dbo_becas (idBeca int(10) NOT NULL AUTO_INCREMENT, PRIMARY KEY (idBeca));
CREATE TABLE dbo_usuario_perfil (idPerfil_Usuario int(10) NOT NULL AUTO_INCREMENT, idUsuario int(10) NOT NULL, idPerfil int(10) NOT NULL, PRIMARY KEY (idPerfil_Usuario));
CREATE TABLE dbo_alumno (idAlumno int(10) NOT NULL AUTO_INCREMENT, idUsuario int(10) NOT NULL, idCarrera int(10), matricula varchar(255), semestre_actual varchar(255), PRIMARY KEY (idAlumno));
CREATE TABLE dbo_grupo (idGrupo int(10) NOT NULL AUTO_INCREMENT, idDocente int(10) NOT NULL, idMateria int(10) NOT NULL, periodo varchar(255), clave_grupo varchar(255), cupo int(10), PRIMARY KEY (idGrupo));
CREATE TABLE dbo_calificaciones (idCalificación int(10) NOT NULL AUTO_INCREMENT, idInscripción int(10) NOT NULL, valor int(100), observaciones varchar(255), PRIMARY KEY (idCalificación));
CREATE TABLE dbo_inscripciones (idInscripción int(10) NOT NULL AUTO_INCREMENT, idAlumno int(10) NOT NULL, idGrupo int(10) NOT NULL, PRIMARY KEY (idInscripción));
ALTER TABLE dbo_usuario ADD CONSTRAINT FKdbo_usuari129210 FOREIGN KEY (idPersona) REFERENCES dbo_persona (idPersona);
ALTER TABLE dbo_persona ADD CONSTRAINT FKdbo_person100524 FOREIGN KEY (idEstado) REFERENCES dbo_estados (idEstado); --modifique REFERENCES dbo_estado (idEstado);
ALTER TABLE dbo_persona ADD CONSTRAINT FKdbo_person526617 FOREIGN KEY (idMunicipio) REFERENCES dbo_municipios (idMunicipio); --modifique REFERENCES dbo_municipio (idMunicipio);
ALTER TABLE dbo_plantel ADD CONSTRAINT FKdbo_plante660490 FOREIGN KEY (idEstado) REFERENCES dbo_estados (idEstado); --modifique REFERENCES dbo_estado (idEstado);
ALTER TABLE dbo_plantel ADD CONSTRAINT FKdbo_plante966650 FOREIGN KEY (idMunicipio) REFERENCES dbo_municipios (idMunicipio); --modifique REFERENCES dbo_municipio (idMunicipio);
ALTER TABLE dbo_carga_academica ADD CONSTRAINT FKdbo_carga_849251 FOREIGN KEY (idMateria) REFERENCES dbo_materias (idMateria);
ALTER TABLE dbo_materias ADD CONSTRAINT FKdbo_materi309709 FOREIGN KEY (idCarrera) REFERENCES dbo_carrera (idCarrera);
ALTER TABLE dbo_docente ADD CONSTRAINT FKdbo_docent767636 FOREIGN KEY (idUsuario) REFERENCES dbo_usuario (idUsuario);
ALTER TABLE dbo_pagos ADD CONSTRAINT FKdbo_pagos274500 FOREIGN KEY (idBeca) REFERENCES dbo_becas (idBeca);
ALTER TABLE dbo_pagos ADD CONSTRAINT FKdbo_pagos243135 FOREIGN KEY (idUsuario) REFERENCES dbo_usuario (idUsuario);
ALTER TABLE dbo_usuario_perfil ADD CONSTRAINT FKdbo_usuari947805 FOREIGN KEY (idPerfil) REFERENCES dbo_login_perfil (idPerfil);
ALTER TABLE dbo_usuario_perfil ADD CONSTRAINT FKdbo_usuari705562 FOREIGN KEY (idUsuario) REFERENCES dbo_usuario (idUsuario);
ALTER TABLE dbo_alumno ADD CONSTRAINT FKdbo_alumno593145 FOREIGN KEY (idUsuario) REFERENCES dbo_usuario (idUsuario);
ALTER TABLE dbo_alumno ADD CONSTRAINT FKdbo_alumno985491 FOREIGN KEY (idCarrera) REFERENCES dbo_carrera (idCarrera);
ALTER TABLE dbo_carrera ADD CONSTRAINT FKdbo_carrer11661 FOREIGN KEY (idPlantel) REFERENCES dbo_plantel (idPlantel);
ALTER TABLE dbo_grupo ADD CONSTRAINT FKdbo_grupo639103 FOREIGN KEY (idDocente) REFERENCES dbo_docente (idDocente);
ALTER TABLE dbo_grupo ADD CONSTRAINT FKdbo_grupo787762 FOREIGN KEY (idMateria) REFERENCES dbo_materias (idMateria);
ALTER TABLE dbo_horario ADD CONSTRAINT FKdbo_horari262328 FOREIGN KEY (idGrupo) REFERENCES dbo_grupo (idGrupo);
ALTER TABLE dbo_usuario ADD CONSTRAINT FKdbo_usuari330426 FOREIGN KEY (idGrupo) REFERENCES dbo_grupo (idGrupo);
ALTER TABLE dbo_calificaciones ADD CONSTRAINT FKdbo_califi290469 FOREIGN KEY (idInscripción) REFERENCES dbo_inscripciones (idInscripción);
ALTER TABLE dbo_inscripciones ADD CONSTRAINT FKdbo_inscri530305 FOREIGN KEY (idAlumno) REFERENCES dbo_alumno (idAlumno);
ALTER TABLE dbo_inscripciones ADD CONSTRAINT FKdbo_inscri767283 FOREIGN KEY (idGrupo) REFERENCES dbo_grupo (idGrupo);
