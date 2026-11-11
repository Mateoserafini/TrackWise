import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import apiRouter from './routes';

export function createApp(): Application {
  const app = express();

  // 1. Cabeceras de seguridad con Helmet
  app.use(helmet());

  // 2. Configuración de CORS
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 3. Parseo de cuerpo JSON y URL Encoded
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 4. Montaje del Router Principal bajo /api
  app.use('/api', apiRouter);

  // 5. Manejador de rutas no encontradas (404)
  app.use(notFoundHandler);

  // 6. Manejador global de errores
  app.use(errorHandler);

  return app;
}

export const app = createApp();
