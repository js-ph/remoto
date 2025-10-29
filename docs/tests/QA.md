# QA: Pruebas automatizadas y validación de entorno

Este documento explica, paso a paso, cómo:

1) Implementar pruebas automatizadas con el framework de testing (Jest)
2) Diseñar el plan de pruebas automatizadas
3) Validar la instalación y el correcto funcionamiento del entorno

Está orientado a Windows con PowerShell y al proyecto actual (`sise_lite_hybrid`).

---

## 1) Implementar pruebas automatizadas con framework de testing

En este repo usamos Jest para pruebas de integración del backend (Node/Express). Ya hay ejemplos funcionando en `tests/integration/` y en `backend/tests/integration/` que hacen un smoke del endpoint `GET /api/status`.

### Estructura relevante

- `jest.config.js` (raíz): configuración común para ejecutar pruebas de integración
- `tests/integration/*.test.js`: pruebas de integración que levantan el servidor de backend y verifican endpoints
- `backend/tests/integration/*.test.js`: segundo conjunto de pruebas de integración específicas del backend
- `backend/server.js`: servidor Express a probar
- `backend/src/db/pool.js`: conexión a DB; fue adaptado para permitir arrancar el server sin DB real durante pruebas

### Cómo escribir una nueva prueba de integración

1. Crea un archivo `*.test.js` en `tests/integration/` (o en `backend/tests/integration/`).
2. Dentro del test, arranca el servidor de backend en un puerto de prueba usando `child_process.spawn` y espera a que el endpoint responda con `wait-on`.
3. Realiza la(s) petición(es) con `axios` y valida respuestas con `expect`.

Ejemplo mínimo (ya existente): `tests/integration/health.test.js`.

Puntos a considerar:
- Puerto de prueba por defecto: `5050` (se puede cambiar con `TEST_PORT`).
- El servidor se arranca con la variable `PORT` del entorno.
- Si tu prueba invoca rutas que usan base de datos, necesitas definir `URL_DATABASE` (ver apartado de ejecución). Las pruebas que no usan DB funcionan con el stub definido en `pool.js`.

### Comandos útiles

Los siguientes scripts están definidos en el `package.json` de la raíz:

```powershell
# Ejecuta todas las pruebas de integración en serie (evita colisiones de puertos)
npm run test:integration

# Ejecuta el smoke test rápidamente (filtra por nombre)
npm run qa:smoke

# Genera reporte de cobertura
npm run test:coverage
```

Variables de entorno relevantes:

```powershell
# Cambiar el puerto donde las pruebas arrancan el backend
$env:TEST_PORT = "5051"

# Cadena de conexión a MariaDB (DSN)
$env:URL_DATABASE = "mariadb://user:pass@host:3306/db"
```

---

## 2) Diseñar plan de pruebas automatizadas

Este es el plan base para el proyecto. Puedes ampliarlo conforme evolucione el sistema.

### Objetivos
- Detectar regresiones funcionales del backend de forma temprana (smoke/integración).
- Supervisar la disponibilidad del endpoint de salud en entornos desplegados.
- Medir rendimiento básico (smoke) para detectar degradaciones evidentes.

### Alcance inicial
- Backend Node/Express: endpoint de salud y rutas clave a medida que se estabilicen.
- Frontend (Next.js): se añadirán pruebas unitarias/RTL en iteraciones posteriores.

### Pirámide de pruebas (mínimos viables)
- Unitarias: utilidades y validadores (objetivo ≥ 60% de cobertura progresiva).
- Integración: server + endpoints críticos (ya incluido `/api/status`).
- E2E: fuera de alcance por ahora; considerar Playwright/Cypress más adelante.

### Criterios de entrada/salida
- Entrada: dependencias instaladas; server arranca con stub de DB o `URL_DATABASE` configurada.
- Salida: suites de integración en verde; cobertura generada; smoke verde.

### Métricas/targets
- Smoke test < 10s local/CI.
- Cobertura inicial informativa; objetivo progresivo ≥ 50% en backend `src/`.

### Datos y fixtures
- Para rutas con DB, usar dobles/mocks del pool o preparar datos en contenedor de test (`compose-test`).
- Evitar datos productivos.

### Integración continua (opcional)
- Puedes crear un workflow de GitHub Actions que:
  - Instale dependencias (raíz y `backend/`)
  - Exporte `URL_DATABASE` (por ejemplo a un servicio de MariaDB en el workflow)
  - Ejecute `npm run test:integration` y publique `coverage/lcov.info` como artefacto

> Referencia extendida: consulta `docs/tests/README.md` para detalles adicionales y próximos pasos sugeridos.

---

## 3) Validar instalación y correcto funcionamiento del entorno

### Requisitos previos
- Node.js 18+ (recomendado 20 LTS; funciona con Node 22 verificado)
- Docker Desktop (opcional, si quieres levantar MariaDB local para pruebas con DB)
- Windows PowerShell

### Instalación

```powershell
# Instalar dependencias del backend
pushd .\backend
npm install
popd

# Instalar dependencias de la raíz (Jest, axios, wait-on)
npm install
```

### Verificación rápida (smoke + versiones)

```powershell
npm run qa:verify
```

Qué valida:
- Imprime versiones de `node` y `npm`.
- Ejecuta las pruebas de integración en serie (incluye el smoke `GET /api/status`).

Resultado esperado:
- Todas las suites deben aparecer como `PASS`.

### Ejecutar con base de datos (opcional)

```powershell
# Levanta MariaDB de pruebas del compose
docker compose -f .\compose-test\docker-compose.yml up -d db

# Configura la cadena de conexión (usuario/clave según compose)
$env:URL_DATABASE = "mariadb://root:root123@127.0.0.1:3306/testdb"

# Ejecuta pruebas
npm run test:integration
```

### Solución de problemas
- Tiempo de espera en `wait-on` (no responde `/api/status`):
  - Asegúrate de haber corrido `npm install` en `backend/`.
  - Cambia `TEST_PORT` si hay colisión de puertos (p. ej., `5051`).
- Error de `URL_DATABASE` faltante o de parseo:
  - Exporta un DSN válido, p.ej. `mariadb://user:pass@host:3306/db`.
  - Recuerda: si la ruta ejercita DB y no definiste `URL_DATABASE`, el stub de `pool.js` fallará explícitamente (comportamiento esperado en smoke sin DB).

---

## Referencias
- `docs/tests/README.md`: guía ampliada, plan detallado y próximos pasos.
- `tests/integration/health.test.js` y `backend/tests/integration/health.test.js`: ejemplos de smoke test.
- `backend/src/db/pool.js`: manejo de `URL_DATABASE` y stub para pruebas.
