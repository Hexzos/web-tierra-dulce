# Local Admin API

> DEV ONLY · NOT FOR PRODUCTION · NOT PRODUCTION AUTHORIZATION

Esta API permite validar el CRUD local del panel sin convertir el sitio público de Astro a SSR.

```text
Admin UI → HTTP → Local Admin API → capa de datos → SQLite
```

Uso local, en dos terminales:

```bash
npm run dev
npm run admin:api
```

La API escucha únicamente en `127.0.0.1:4322`. Por defecto acepta CORS desde `http://localhost:4321` y `http://127.0.0.1:4321`.

El header `X-Admin-Profile-Id` sólo transporta el perfil ficticio guardado en `sessionStorage`. Es manipulable y no es autenticación. Admin y Developer pueden escribir; Editor permanece en modo lectura hasta que exista el workflow editorial.

Las escrituras modifican `db/local/tierra-dulce.sqlite`, no `dist/`. Para regenerar el catálogo público se requiere ejecutar manualmente:

```bash
npm run build
```

No desplegar `scripts/admin-api.mjs`. Al migrar a Supabase, se reemplazarán el contexto DEV y esta implementación HTTP/SQLite conservando, cuando resulte conveniente, el contrato JSON consumido por la UI.
