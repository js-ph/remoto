# Pruebas: guía rápida

Este repositorio separa pruebas funcionales de integración y pruebas de rendimiento.

- Integración (Jest): `backend/tests/integration/`
- Rendimiento (k6): `tests/performance/`
- Matriz de pruebas (funcionales manuales): `docs/tests/matriz_pruebas.md`

## Requisitos previos
- Node.js 18+ (recomendado 20 LTS)
- Para rendimiento: k6 (opcional local) o usar el workflow de GitHub

## Pruebas de integración (Jest)

1) Instala dependencias del backend:

```bash
cd backend
npm ci
```

2) Ejecuta las pruebas:

```bash
npm run test:integration
```

Notas:
- Las pruebas arrancan el servidor en un puerto efímero (5050) y verifican `GET /api/status`.
- No depende de la base de datos para esta verificación mínima.
 - Alternativa si no quieres modificar `backend/package.json`: desde la raíz del repo ejecuta `npm install --no-save jest axios wait-on` y luego `npx jest --config=jest.config.js`.

## Pruebas de rendimiento (k6)

Ejecuta el smoke test localmente contra tu entorno:

```bash
# BASE_URL por defecto: http://127.0.0.1:4000
k6 run --env K6_BASE_URL="http://tu-entorno" tests/performance/k6-smoke.js
```

El workflow `performance.yml` permite lanzar estas pruebas desde GitHub Actions contra un entorno (staging/prod) mediante `workflow_dispatch`.
