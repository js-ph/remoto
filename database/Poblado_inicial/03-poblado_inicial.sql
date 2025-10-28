-- =============================================================
-- Script de datos iniciales para el sistema 'sisesqlhybrid'
-- =============================================================

-- Desactivar temporalmente las comprobaciones de claves foráneas
-- Esto evita errores al insertar datos en un orden no estricto
-- debido a las relaciones complejas de las tablas.
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------
-- 1. Población de tablas sin dependencias (o con dependencias externas)
-- -----------------------------------------------------------------

-- NOTA: Asumo que las tablas dbo_estados y dbo_municipios ya existen y están pobladas.
-- Si no, es necesario crearlas e insertar datos básicos.

-- Datos para dbo_login_perfil (Perfiles de acceso)
INSERT INTO dbo_login_perfil (nombre, descripcion) VALUES
('Superadmin', 'Acceso total al sistema y gestion de usuarios.'),
('Administrador', 'Gestión de procesos académicos, administrativos y reportes.'),
('Docente', 'Gestión de materias, grupos y calificaciones.'),
('Alumno', 'Acceso a su información personal, calificaciones y pagos.');

-- Datos para dbo_plantel
INSERT INTO dbo_plantel (idMunicipio, idEstado, nombre_plantel) VALUES
(30119, 30, 'Plantel Orizaba'),
(30119, 30, 'Plantel Córdoba');

-- Datos para dbo_carrera
INSERT INTO dbo_carrera (carrera, duracion_semestres, descripcion, idPlantel) VALUES
('Licenciatura en Administración', 8, 'Carrera enfocada en la gestión de empresas, recursos humanos y financieros.', 1),
('Licenciatura en Contaduría', 8, 'Carrera que forma profesionales en contabilidad, finanzas y auditoría.', 1),
('Licenciatura en Mercadotecnia', 8, 'Carrera orientada al análisis de mercados, publicidad y estrategias comerciales.', 1),
('Licenciatura en Negocios y Comercio Internacional', 8, 'Carrera enfocada en operaciones internacionales, logística y relaciones comerciales globales.', 1),
('Licenciatura en Ciencias de la Comunicación', 9, 'Carrera dedicada al estudio de los medios, comunicación organizacional y periodismo.', 1),
('Licenciatura en Educación', 8, 'Carrera centrada en la formación pedagógica, docencia y desarrollo educativo.', 1),
('Licenciatura en Derecho', 8, 'Carrera que forma profesionales del ámbito jurídico con enfoque en leyes y justicia.', 1),
('Licenciatura en Ingeniería en Sistemas Computacionales', 9, 'Carrera enfocada en el desarrollo de software, redes y soluciones tecnológicas.', 1),
('Licenciatura en Gestión Ambiental', 8, 'Carrera orientada a la sostenibilidad, manejo de recursos naturales y protección ambiental.', 1);

-- -----------------------------------------------------------------
-- 2. Población de tablas con dependencias (personas y usuarios)
-- -----------------------------------------------------------------

-- Datos para dbo_persona (Personas genéricas y de ejemplo)
INSERT INTO dbo_persona (nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, sexo, curp, idEstado, idMunicipio)
VALUES
('JOHN FELIX', 'ANTHONY', 'CENA', '2000-01-01', 'M', 'GENSADM000101HVZR1', 30, 30119),
('ERIC', 'MARLON', 'BISHOP', '2000-01-01', 'M', 'GENADM000101HVZR2', 30, 30119),
('JOSE PEDRO', 'BALMACEDA', 'PASCAL', '2000-01-01', 'M', 'GENDOC000101HVZR3', 30, 30119),
('JOSEPH EMILIANO', 'RUANO', 'GALVEZ', '2001-08-07', 'M', 'JERG010807HVZALU01', 30, 30119),
('ALEXIS EMMANUEL', 'FERNANDEZ', 'GONZALEZ', '2003-09-21', 'M', 'AEFG030921HVZALU02', 30, 30119),
('PEDRO PABLO', 'MORA', 'FLORES', '2003-06-29', 'M', 'PPMF030629HVZALU03', 30, 30119),
('DANIEL DE JESUS', 'NOGALES', 'ESCALONA', '2003-07-03', 'M', 'DJNE030703HVZALU04', 30, 30119),
('JESUS ALEJANDRO', 'LARA', 'CASTRO', '2003-09-05', 'M', 'JALC030905HVZALU05', 30, 30119),
('CLAUDIO', 'CARRERA', 'HERNANDEZ', '2001-10-30', 'M', 'CACH011030HVZALU06', 30, 30119),
('ROGELIO LEOPOLDO', 'CANCINO', 'LÓPEZ', '1978-04-15', 'M', 'CALR780415HVZDOC01', 30, 30119),
('ELIUD FEDERICO', 'DE LOS SANTOS', 'VERA', '1982-07-09', 'M', 'DSVE820709HVZDOC02', 30, 30119),
('EDGAR EDUARDO', 'ACOSTA', 'ACEVEDO', '1985-11-23', 'M', 'AAAE851123HVZDOC03', 30, 30119),
('ERIK', 'NUÑEZ', 'DELGADO', '1980-02-17', 'M', 'NDEE800217HVZDOC04', 30, 30119),
('JESÚS JULIÁN', 'TORRES', 'VELÁSQUEZ', '1983-09-30', 'M', 'TOVJ830930HVZDOC05', 30, 30119),
('JESÚS RICARDO', 'MUÑOZ', 'MARTÍNEZ', '1975-06-12', 'M', 'MUMJ750612HVZDOC06', 30, 30119);

-- Datos para dbo_usuario
-- Nota: 'idGrupo' se dejará como NULL por ahora para evitar un error, ya que no se ha poblado 'dbo_grupo'.
-- Se actualizará más tarde.
INSERT INTO dbo_usuario (idPersona, nuevoUsuario, Usuario, Contrasena, correo_electronico, fecha_de_creacion, fecha_de_modificacion, status, ultimo_login, idGrupo)
VALUES
(1, 1, 19103001, '1234', 'superadmin@email.com', NOW(), NOW(), 1, CURDATE(), NULL),             -- Usuario id 1
(2, 1, 20103001, '1234', 'admin@email.com', NOW(), NOW(), 1, CURDATE(), NULL),                  -- Usuario id 2
(3, 1, 21103003, '1234', 'docente@email.com', NOW(), NOW(), 1, CURDATE(), NULL),                -- Usuario id 3
(4, 1, 22103001, '1234', 'joseph.ruano@email.com', NOW(), NOW(), 1, CURDATE(), NULL),           -- Usuario id 4
(5, 1, 22103002, '1234', 'alexis.fernandez@email.com', NOW(), NOW(), 1, CURDATE(), NULL),       -- Usuario id 5
(6, 1, 22103003, '1234', 'pedro.mora@email.com', NOW(), NOW(), 1, CURDATE(), NULL),             -- Usuario id 6
(7, 1, 22103004, '1234', 'daniel.nogales@email.com', NOW(), NOW(), 1, CURDATE(), NULL),         -- Usuario id 7
(8, 1, 22103005, '1234', 'jesus.lara@email.com', NOW(), NOW(), 1, CURDATE(), NULL),             -- Usuario id 8
(9, 1, 22103007, '1234', 'claudio.carrera@email.com', NOW(), NOW(), 1, CURDATE(), NULL),        -- Usuario id 9
(10, 1, 10001001, '1234', 'rogelio.cancino@email.com', NOW(), NOW(), 1, CURDATE(), NULL),       -- Usuario id 10
(11, 1, 10001002, '1234', 'eliud.santos@email.com', NOW(), NOW(), 1, CURDATE(), NULL),          -- Usuario id 11
(12, 1, 10001003, '1234', 'edgar.acosta@email.com', NOW(), NOW(), 1, CURDATE(), NULL),          -- Usuario id 12
(13, 1, 10001004, '1234', 'erik.nunez@email.com', NOW(), NOW(), 1, CURDATE(), NULL),            -- Usuario id 13
(14, 1, 10001005, '1234', 'jesus.torres@email.com', NOW(), NOW(), 1, CURDATE(), NULL),          -- Usuario id 14
(15, 1, 10001006, '1234', 'jesus.munoz@email.com', NOW(), NOW(), 1, CURDATE(), NULL);           -- Usuario id 15

-- -----------------------------------------------------------------
-- 3. Población de tablas secundarias (materias, docentes, alumnos, etc.)
-- -----------------------------------------------------------------

-- Datos para dbo_materias
INSERT INTO dbo_materias (idCarrera, nombre_materia, semestre, descripcion, creditos)
VALUES
(8, 'POLÍTICA Y LEGISLACIÓN EN INFORMÁTICA', 9, 'Análisis de leyes y políticas aplicadas a la informática.', 6),
(8, 'REDES ALTERNATIVAS', 9, 'Estudio de redes inalámbricas, distribuidas y nuevas arquitecturas.', 6),
(8, 'SISTEMAS OPERATIVOS II', 9, 'Profundización en gestión de recursos, concurrencia y seguridad.', 6),
(8, 'BASES DE DATOS AVANZADAS', 9, 'Diseño e implementación de bases de datos complejas y optimización.', 6),
(8, 'FUNDAMENTOS DE ROBÓTICA', 9, 'Principios de robótica, sensores y actuadores.', 6),
(8, 'SEMINARIO DE TESIS', 9, 'Desarrollo y presentación del proyecto de tesis profesional.', 6);

-- Datos para dbo_docente
INSERT INTO dbo_docente (idUsuario) VALUES
(10), -- MTRO. ROGELIO LEOPOLDO CANCINO LÓPEZ
(11), -- MTRO. ELIUD FEDERICO DE LOS SANTOS VERA
(12), -- ING. EDGAR EDUARDO ACOSTA ACEVEDO
(13), -- MTRO. ERIK NUÑEZ DELGADO
(14), -- ING. JESÚS JULIÁN TORRES VELÁSQUEZ
(15); -- DR. JESÚS RICARDO MUÑOZ MARTÍNEZ

-- Datos para dbo_alumno
INSERT INTO dbo_alumno (idUsuario, idCarrera, matricula, semestre_actual) VALUES
(4, 8, '22103001', '9'), -- Joseph Emiliano Ruano Galvez
(5, 8, '22103002', '9'), -- Alexis Emmanuel Fernandez Gonzalez
(6, 8, '22103003', '9'), -- Pedro Pablo Mora Flores
(7, 8, '22103004', '9'), -- Daniel de Jesus Nogales Escalona
(8, 8, '22103005', '9'), -- Jesus Alejandro Lara Castro
(9, 8, '22103007', '9'); -- Claudio Carrera Hernandez

-- Datos para dbo_grupo
-- Se necesitan idDocente y idMateria, por lo que crearemos un grupo de ejemplo.
-- Asumiremos que el idDocente es 1 (el único que hemos insertado)
INSERT INTO dbo_grupo (idDocente, idMateria, periodo, clave_grupo, cupo) VALUES
(1, 1, '26-1', '39512', 30), -- POLÍTICA Y LEGISLACIÓN EN INFORMÁTICA - Rogelio
(2, 2, '26-1', '39522', 30), -- REDES ALTERNATIVAS - Eliud
(3, 3, '26-1', '39532', 30), -- SISTEMAS OPERATIVOS II - Edgar
(4, 4, '26-1', '39542', 30), -- BASES DE DATOS AVANZADAS - Erik
(5, 5, '26-1', '39552', 30), -- FUNDAMENTOS DE ROBÓTICA - Jesús Torres
(6, 6, '26-1', '39562', 30); -- SEMINARIO DE TESIS - Jesús Muñoz

INSERT INTO dbo_horario (dia_semana, hora, aula, idGrupo) VALUES
-- (1) POLÍTICA Y LEGISLACIÓN EN INFORMÁTICA - MTRO. ROGELIO LEOPOLDO CANCINO LÓPEZ
('Miércoles', '14:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 1),
('Miércoles', '15:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 1),
('Jueves', '15:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 1),

-- (2) REDES ALTERNATIVAS - MTRO. ELIUD FEDERICO DE LOS SANTOS VERA
('Martes', '16:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 2),
('Martes', '17:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 2),
('Jueves', '16:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 2),
('Jueves', '17:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 2),

-- (3) SISTEMAS OPERATIVOS II - ING. EDGAR EDUARDO ACOSTA ACEVEDO
('Martes', '18:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 3),
('Martes', '19:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 3),
('Jueves', '18:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 3),
('Jueves', '19:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 3),

-- (4) BASES DE DATOS AVANZADAS - MTRO. ERIK NUÑEZ DELGADO
('Lunes', '16:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 4),
('Lunes', '17:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 4),
('Martes', '12:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 4),
('Martes', '13:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 4),

-- (5) FUNDAMENTOS DE ROBÓTICA - ING. JESÚS JULIÁN TORRES VELÁSQUEZ
('Lunes', '18:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 5),
('Lunes', '19:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 5),
('Miércoles', '16:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 5),
('Miércoles', '17:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 5),

-- (6) SEMINARIO DE TESIS - DR. JESÚS RICARDO MUÑOZ MARTÍNEZ
('Lunes', '14:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 6),
('Lunes', '15:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 6),
('Martes', '14:00:00', 'INFORMATICA Y ELECTRONICA ELECTRONICA 5', 6);

INSERT INTO dbo_pagos (idBeca, idUsuario, cantidad_a_pagar, fecha_de_pago, estado)
VALUES
(1, 4, 3720, '10:00:00', 'Pagado'), -- INSCRIPCIÓN
(1, 4, 450,  '10:00:00', 'Pagado'), -- GASTOS ADMINISTRATIVOS 26-1
(1, 4, 4300, '11:00:00', 'Pagado'), -- PRIMER PAGO
(1, 4, 4300, '12:00:00', 'Pagado'), -- SEGUNDO PAGO
(1, 4, 4300, '13:00:00', 'Pagado'), -- TERCER PAGO
(1, 4, 4300, '14:00:00', 'Pagado'), -- CUARTO PAGO
(1, 4, 4300, '15:00:00', 'Pagado'); -- QUINTO PAGO


-- -----------------------------------------------------------------
-- 4. Actualización de datos dependientes y vinculación final
-- -----------------------------------------------------------------

-- Actualizar el campo idGrupo en la tabla dbo_usuario
-- Esto lo hacemos una vez que dbo_grupo ya está poblado.
UPDATE dbo_usuario SET idGrupo = 1 WHERE idUsuario IN (1, 2, 3);
UPDATE dbo_usuario SET idGrupo = 1 WHERE idUsuario IN (4, 5);

-- Asignar perfiles a los usuarios
INSERT INTO dbo_usuario_perfil (idUsuario, idPerfil) VALUES
(1, 1), -- Usuario 1 (Superadmin) -> Perfil 1 (Superadmin)
(2, 2), -- Usuario 2 (Admin) -> Perfil 2 (Administrador)
(3, 3), -- Usuario 3 (Docente) -> Perfil 3 (Docente)
(4, 4), -- Usuario 4 (Joseph Emiliano Ruano) -> Perfil 4 (Alumno)
(5, 4), -- Usuario 5 (Alexis Emmanuel Fernandez) -> Perfil 4 (Alumno)
(6, 4), -- Usuario 6 (Pedro Pablo Mora) -> Perfil 4 (Alumno)
(7, 4), -- Usuario 7 (Daniel de Jesus Nogales) -> Perfil 4 (Alumno)
(8, 4), -- Usuario 8 (Jesus Alejandro Lara) -> Perfil 4 (Alumno)
(9, 4), -- Usuario 9 (Claudio Carrera) -> Perfil 4 (Alumno)
(10, 3), -- Usuario 10 (MTRO. Rogelio Leopoldo Cancino López) -> Perfil 3 (Docente)
(11, 3), -- Usuario 11 (MTRO. Eliud Federico de los Santos Vera) -> Perfil 3 (Docente)
(12, 3), -- Usuario 12 (ING. Edgar Eduardo Acosta Acevedo) -> Perfil 3 (Docente)
(13, 3), -- Usuario 13 (MTRO. Erik Nuñez Delgado) -> Perfil 3 (Docente)
(14, 3), -- Usuario 14 (ING. Jesús Julián Torres Velásquez) -> Perfil 3 (Docente)
(15, 3); -- Usuario 15 (DR. Jesús Ricardo Muñoz Martínez) -> Perfil 3 (Docente)

-- Re-activar la comprobación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;