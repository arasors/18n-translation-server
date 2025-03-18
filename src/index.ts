import 'dotenv/config';
import app from './app';
import { connectDB } from './lib/db';
import { logger } from './lib/logger';
import path from 'path';
import fs from 'fs';
import { setDefaultTranslations } from './utils/set-defaults';

// Ortam değişkenleri
const PORT = process.env.PORT || 3001;

// Logs klasörünü oluştur
const logDir = process.env.LOG_DIR || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Sunucuyu başlat
const startServer = async () => {
  try {
    // MongoDB bağlantısı
    await connectDB();
    
    // Varsayılan çevirileri kontrol et ve yükle
    await setDefaultTranslations();
    
    // Express sunucusunu başlat
    app.listen(PORT, () => {
      logger.info(`Translation Server başlatıldı: http://localhost:${PORT}`);
      logger.info('Çalışma Modu: ' + (process.env.NODE_ENV || 'development'));
    });
  } catch (error: any) {
    logger.error(`Sunucu başlatılamadı: ${error.message}`);
    process.exit(1);
  }
};

// Planlanmamış kesintiler için olay dinleyiciler
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`İşlenmeyen Promise Reddi: ${reason}`);
  // Uygulamayı kapatma - yeniden başlatma işlemi sağlık kontrolüne bırakılır
});

process.on('uncaughtException', (error) => {
  logger.error(`Yakalanmayan İstisna: ${error.message}`);
  logger.error(error.stack);
  // Ciddi hatalar için uygulamayı kapat ve yeniden başlat
  process.exit(1);
});

// Sunucuyu başlat
startServer(); 