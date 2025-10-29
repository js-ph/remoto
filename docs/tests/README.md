# Pruebas e indicadores: guía de uso

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

2) Ejecuta las pruebas SIN base de datos real (valor dummy válido)

```powershell
$env:URL_DATABASE = "mariadb://root:root@127.0.0.1:3306/testdb"
npm run test:integration
```

3) Ejecuta las pruebas CON MariaDB en Docker (opcional)

```powershell
# Levanta solo la DB de compose-test (root/root123, DB testdb)
docker compose -f .\compose-test\docker-compose.yml up -d db

# Apunta la cadena de conexión al contenedor
$env:URL_DATABASE = "mariadb://root:root123@127.0.0.1:3306/testdb"
npm run test:integration
```

4) Si el puerto 5050 está ocupado

```powershell
$env:TEST_PORT = "5051"
$env:URL_DATABASE = "mariadb://root:root@127.0.0.1:3306/testdb"
npm run test:integration
```

5) Cobertura

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
