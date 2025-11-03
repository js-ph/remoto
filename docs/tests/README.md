# Plan y guía de pruebas automatizadas

Este documento define el plan de pruebas automatizadas y cómo ejecutarlas localmente y en CI.

## Plan de pruebas automatizadas

- Objetivos
	- Detectar regresiones funcionales del backend de forma temprana (smoke e integración).
	- Supervisar la disponibilidad del endpoint de salud en entornos desplegados.
	- Medir rápidamente rendimiento básico (smoke) para detectar degradaciones evidentes.
- Alcance inicial
	- Backend Node/Express: endpoint de salud y rutas clave a medida que se vayan estabilizando.
	- Frontend: se añadirán pruebas unitarias/RTL en siguientes iteraciones.
- Pirámide de pruebas (mínimos viables)
	- Unitarias: por definir (objetivo ≥ 60% del código de utilidades y validadores).
	- Integración: smoke de servidor y endpoints críticos (ya incluido `/api/status`).
	- E2E: fuera de alcance por ahora; considerar Playwright/Cypress más adelante.
- Criterios de entrada/salida
	- Entrada: dependencias instaladas, servidor arranca sin DB real (stub), o URL_DATABASE configurada.
	- Salida: todos los suites integrados pasan; cobertura generada; smoke verde.
- Métricas/targets
	- Tiempo de ejecución smoke < 10s local/CI.
	- Cobertura inicial informativa; objetivo progresivo ≥ 50% en backend src.
- Integración continua
	- Workflow `integration-tests` ejecuta `npm run test:integration` y publica cobertura lcov.
- Datos y fixtures
	- Para rutas con DB, usar dobles/mocks del pool o preparar datos con scripts SQL en contenedor de test.
	- Evitar dependencias con datos productivos.

> Nota: el módulo `backend/src/db/pool.js` tolera ausencia de `URL_DATABASE` y exporta un stub que falla si se usa; esto permite lanzar el servidor en pruebas que no ejercen la capa de datos.

Este repo incluye:

- Pruebas de integración (Jest): `tests/integration/` y `backend/tests/integration/`
- Pruebas de rendimiento (k6): `tests/performance/`
- Monitoreo sintético (GitHub Actions): `.github/workflows/synthetic-monitor.yml`
- Matriz de pruebas manuales: `docs/tests/matriz_pruebas.md`

## Requisitos previos

- Node.js 18+ (recomendado 20 LTS)
- Docker Desktop (opcional, si deseas levantar MariaDB local con Compose)
- Windows PowerShell (los ejemplos usan PowerShell)

## Ejecutar pruebas de integración (Jest) en local

Las pruebas arrancan el backend (`backend/server.js`) en un puerto de prueba (por defecto `5050`) y validan `GET /api/status`.

1) Instala dependencias necesarias

```powershell
# En la carpeta backend (para que el server arranque)
pushd .\backend
npm install
popd

# En la raíz (dev deps para Jest/axios/wait-on ya están declaradas)
npm install
```

2) Validación rápida del entorno (versión y smoke)

```powershell
npm run qa:verify
```

3) Ejecuta las pruebas SIN base de datos real (valor dummy válido)

```powershell
$env:URL_DATABASE = "mariadb://root:root@127.0.0.1:3306/testdb"
npm run test:integration
```

4) Ejecuta las pruebas CON MariaDB en Docker (opcional)

```powershell
# Levanta solo la DB de compose-test (root/root123, DB testdb)
docker compose -f .\compose-test\docker-compose.yml up -d db

# Apunta la cadena de conexión al contenedor
$env:URL_DATABASE = "mariadb://root:root123@127.0.0.1:3306/testdb"
npm run test:integration
```

5) Si el puerto 5050 está ocupado

```powershell
$env:TEST_PORT = "5051"
$env:URL_DATABASE = "mariadb://root:root@127.0.0.1:3306/testdb"
npm run test:integration
```

6) Cobertura

- Se genera en `coverage/`.
- Abre `coverage/lcov-report/index.html` en el navegador para ver el informe HTML.

### Solución de problemas

- Error `read ECONNRESET` al invocar el endpoint:
	- Verifica que el puerto de pruebas esté libre o cambia `TEST_PORT`.
	- Asegúrate de tener `npm install` ejecutado en `backend/`.
- Error de `URL_DATABASE` faltante o parseo:
	- Exporta `URL_DATABASE` con un DSN válido, por ejemplo `mariadb://user:pass@host:3306/db`.
- Puerto en uso o servidor colgado:
	- Cierra procesos node escuchando en el puerto configurado o cambia `TEST_PORT`.

## Ejecutar pruebas de integración en GitHub Actions

- Workflow: `.github/workflows/integration-tests.yml`
- ¿Qué hace?
	- Ejecuta en Ubuntu
	- Levanta un servicio MariaDB (root/root123, DB `testdb`)
	- Instala dependencias en `backend/` y en la raíz
	- Exporta `URL_DATABASE` y corre `npm run test:integration`
- Disparadores: `push`, `pull_request` y `workflow_dispatch` manual.

## Monitoreo sintético (uptime) en GitHub Actions

- Workflow: `.github/workflows/synthetic-monitor.yml`
- Usa `curl` cada 15 minutos (cron) o on-demand para chequear `GET $BASE_URL/api/status`.
- Cómo usarlo:
	- Manual: `Run workflow` y proporciona `baseUrl` (p. ej., `https://staging.tu-dominio.com`).
	- Automático: define el secreto `STAGING_BASE_URL` en el repositorio; si no pasas `baseUrl`, usa ese secreto.

## Pruebas de rendimiento (k6)

Ejecuta el smoke test localmente contra tu entorno:

```powershell
# BASE_URL por defecto: http://127.0.0.1:4000 (ajústalo a tu backend)
k6 run --env K6_BASE_URL="http://tu-entorno" tests/performance/k6-smoke.js
```

También puedes orquestarlo desde un workflow (si se configura uno, p. ej., `performance.yml`).

## Script Bash para QA (automatizado)

Para entornos Bash (Git Bash en Windows, WSL, Linux, macOS):

```bash
# Ejecución básica (sin DB real)
bash ./scripts/test-integration.sh

# Con MariaDB en Docker (usa compose-test)
bash ./scripts/test-integration.sh --with-docker

# Personalizar puerto y DSN
bash ./scripts/test-integration.sh --test-port 5051 --database-url "mariadb://user:pass@host:3306/db"
```

Alias npm (requiere tener bash disponible):

```bash
npm run test:integration:sh
```

El script:
- Instala dependencias en `backend/` y en la raíz (si faltan)
- (Opcional) levanta MariaDB con `compose-test/docker-compose.yml`
- Exporta `URL_DATABASE` y `TEST_PORT`
- Ejecuta `npm run test:integration` y devuelve el código de salida

## Script PowerShell para QA (automatizado)

En Windows PowerShell:

```powershell
# Ejecución básica (sin DB real)
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-integration.ps1

# Con MariaDB en Docker (usa compose-test)
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-integration.ps1 -WithDocker

# Personalizar puerto y DSN
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-integration.ps1 -TestPort 5051 -DatabaseUrl "mariadb://user:pass@host:3306/db"
```

## Próximos pasos sugeridos

- Añadir pruebas unitarias para validadores y middlewares en `backend/src/validators` y `backend/src/middlewares` usando Jest y dobles del `req/res`.
- Incorporar `supertest` para probar rutas que no requieren DB o con DB mockeada.
- Definir un fixture de datos mínimos para pruebas de integración con MariaDB (scripts bajo `database/Poblado_inicial`).
