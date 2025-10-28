# Matriz de Pruebas Funcionales

Actualiza este archivo al sincronizar la matriz existente `matriz_pruebas.xlsx` en formato Markdown reproducible. Usa la tabla siguiente como plantilla.

> Convención de estados: Pendiente | En curso | Aprobado | Falló

| ID | Módulo | Caso | Precondiciones | Pasos | Datos | Resultado esperado | Criticidad | Estado |
|----|--------|------|----------------|-------|-------|--------------------|------------|--------|
| TC-001 | Autenticación | Login exitoso | Usuario activo | 1. Ir a login 2. Ingresar credenciales 3. Enviar | user=demo, pass=*** | Redirige a dashboard, cookie de sesión creada | Alta | Pendiente |
| TC-002 | Autenticación | Login falla | Usuario bloqueado | 1. Ir a login 2. Ingresar credenciales bloqueadas 3. Enviar | user=bloq | Muestra error 401/403 | Media | Pendiente |
| TC-003 | Alumno | Consultar kardex | Sesión activa | 1. Ir a perfil 2. Click en kardex | N/A | Devuelve lista de materias y calificaciones | Alta | Pendiente |

## Evidencias

- Coloca capturas en `docs/tests/evidencias/<ID>/` y vincula aquí.

## Trazabilidad

- Requisitos: enlaza a `docs/planificacion/PLANIFICACION.md` o a issues.
- Endpoints cubiertos: referencia a rutas en `backend/src/routes/*`.
