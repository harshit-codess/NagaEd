'use strict';

const config = require('./config');
const app = require('./app');
const { pool, waitForDb, initSchema } = require('./db/pool');

async function main() {
  await waitForDb();
  await initSchema();

  const server = app.listen(config.port, () => {
    console.log(`[api] listening on :${config.port} (${config.env})`);
  });

  const shutdown = (signal) => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[api] fatal startup error:', err.message);
  process.exit(1);
});
