import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { logger, httpLogFormat } from './lib/logger';
import apiRoutes from './routes/api.routes';

// Express uygulaması oluşturma
const app = express();

// Cross-Origin Resource Sharing (CORS) izinleri
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Yalnızca belirli bir kökene izin ver
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Güvenlik başlıkları
app.use(helmet());

// JSON body-parser
app.use(express.json({ limit: '2mb' }));

// URL-encoded parser
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// HTTP isteklerini loglama
app.use(morgan((tokens, req, res) => {
  return httpLogFormat(req, res);
}, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// API rotaları
app.use('/api', apiRoutes);

// Ana rota
app.get('/', (req, res) => {
  res.json({
    name: 'Translation Server API',
    version: '1.0.0',
    status: 'online'
  });
});

// 404 - Bulunamadı hatası
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Kaynak bulunamadı: ${req.originalUrl}`
  });
});

// 500 - Sunucu Hatası
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Sunucu hatası: ${err.message}`);
  logger.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

export default app; 