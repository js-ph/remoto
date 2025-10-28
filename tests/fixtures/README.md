# Fixtures y Seeds de Base de Datos (Tests)

Para escenarios de integración que requieran datos, usa los SQL existentes en `database/` como base.

Sugerencia de flujo local con MariaDB en Docker:

1. Levantar MariaDB para pruebas (puerto 3307) con un volumen efímero.
2. Aplicar en orden:
   - `database/Sistema/02-sisesqlhybrid.sql`
   - `database/Roles/03-perfiles.sql`
   - `database/Poblado_inicial/03-poblado_inicial.sql`
3. (Opcional) Añadir SQL específicos del caso en `tests/fixtures/sql/`.

Estructura propuesta:

```
tests/fixtures/
  sql/
    00-cleanup.sql
    10-usuarios.sql
    20-alumnos.sql
```

Estos fixtures pueden ser invocados desde scripts de setup de Jest o desde un contenedor de backend de pruebas.
