import express from 'express';
import path from 'node:path';
import nunjucks from 'nunjucks';
import cookieParser from 'cookie-parser';

import { themeMiddleware } from './middleware/theme.js';
import { ajaxMiddleware } from './middleware/ajax.js';
import { requestLogger } from './middleware/logging.js';
import { browseRouter } from './routes/browse.js';
import { apiRouter } from './routes/api.js';
import { demoRouter } from './routes/demo.js';
import { pomodoroRouter } from './routes/pomodoro.js';
import { countdownRouter } from './routes/countdown.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';

const app: ReturnType<typeof express> = express();
const PORT = parseInt(process.env['PORT'] ?? '3500', 10);
const VIEWS_DIR = path.join(import.meta.dirname, '..', 'views');
const PUBLIC_DIR = path.join(import.meta.dirname, '..', 'public');

// --- Nunjucks setup ---
const nunjucksEnv = nunjucks.configure(VIEWS_DIR, {
  autoescape: true,
  express: app,
  noCache: process.env['NODE_ENV'] !== 'production',
});

nunjucksEnv.addFilter('filesize', (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
});

nunjucksEnv.addFilter('truncate', (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
});

// --- Middleware ---
app.use(express.static(PUBLIC_DIR));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(themeMiddleware);
app.use(ajaxMiddleware);

// --- Routes ---
app.use('/api', apiRouter);
app.use('/demo', demoRouter);
app.use('/pomodoro', pomodoroRouter);
app.use('/countdown', countdownRouter);
app.use('/', browseRouter);

// --- Error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Portal Ink running at http://localhost:${PORT}`);
});

export { app };
