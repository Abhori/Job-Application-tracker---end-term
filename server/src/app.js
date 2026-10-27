import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import skillRoutes from './routes/skillRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();

// Security headers (configured to allow inline styles and data URIs for icons)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible rendering across dev & hosting
  })
);

// Cross-Origin Resource Sharing
const allowedOrigins = [
  config.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(config.COOKIE_SECRET));

// Safe HTTP Request logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

// Rate Limiting on API endpoints
app.use('/api', apiLimiter);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/skills', skillRoutes);

// In production or when client/dist exists, serve frontend build
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    // If request begins with /api, pass to API 404 handler
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized 404 & Error Handling for API routes
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
