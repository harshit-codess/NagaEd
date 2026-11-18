'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { pool } = require('./db/pool');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // behind nginx -> correct client IP for rate limiting
app.use(helmet());
if (config.corsOrigins.length) app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: '10kb' }));

// Liveness + DB readiness (used by the Docker health check).
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
