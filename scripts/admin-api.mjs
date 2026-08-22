import { createAdminApiServer } from '../src/lib/admin/apiServer.js';
import { ADMIN_API_HOST, ADMIN_API_PORT } from '../src/config/adminApi.js';
import { defaultDatabasePath } from '../src/lib/database.js';

// DEV AUTH CONTEXT ONLY · NOT PRODUCTION AUTHORIZATION.
const host = ADMIN_API_HOST;
const port = Number(process.env.TIERRA_DULCE_ADMIN_API_PORT || ADMIN_API_PORT);
const databasePath = process.env.TIERRA_DULCE_DB_PATH || defaultDatabasePath;
const configuredOrigins = process.env.TIERRA_DULCE_ADMIN_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean);
const server = createAdminApiServer({ databasePath, allowedOrigins: configuredOrigins });

server.listen(port, host, () => {
  console.log(`Local Admin API: http://${host}:${port}`);
  console.log('DEV ONLY · NOT FOR PRODUCTION OR DEPLOYMENT');
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
