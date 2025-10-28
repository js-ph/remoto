# Disponibilidad y Monitoreo Sintético

## Health checks

- Backend: `GET /api/status` devuelve `{ message: 'Backend funcionando' }` y HTTP 200.
- Recomendación: exponer `GET /health` con detalles (DB OK, cache OK). Por ahora usamos `/api/status`.

## Monitoreo sintético

- Workflow `synthetic-monitor.yml` (GitHub Actions) hace ping periódico al endpoint crítico.
- Entradas: `baseUrl` (p.ej. `https://staging.tu-dominio.com`).
- Fallas generan una corrida fallida en Actions (puede extenderse para crear un issue/alerta).

## Objetivos de disponibilidad (SLO/SLI)

- Objetivo: 99.5% mensual HTTP 200 en `/api/status` con p95 < 800ms (medido en k6 para capacidad básica).

## Resiliencia (opcional)

- Simular fallos de contenedores con Docker Compose y reinicios controlados.
- Futuro: incorporar pruebas de chaos (p.ej., `pumba` o `chaos-mesh`).
