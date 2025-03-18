import winston from 'winston';
import path from 'path';

// Log dosyası yolu
const logDir = process.env.LOG_DIR || 'logs';
const logFile = path.join(logDir, 'translation-server.log');

// Winston formatı
const { combine, timestamp, printf, colorize } = winston.format;

// Özel log formatı
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Logger oluşturma
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Konsol çıktısı
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    // Dosya çıktısı
    new winston.transports.File({ 
      filename: logFile,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

// HTTP isteklerini loglamak için format
export const httpLogFormat = (req: any, res: any): string => {
  return `${req.method} ${req.url} ${res.statusCode} - ${res.responseTime}ms`;
};

export default logger; 