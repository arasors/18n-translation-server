import mongoose from 'mongoose';
import { logger } from './logger';

// MongoDB URI tanımlama
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/admin';

// Bağlantı seçenekleri
const options = {
  autoIndex: true,
  dbName: 'prop360' // Admin veritabanı ile doğrulama yaptıktan sonra prop360 veritabanını kullan
};

/**
 * MongoDB veritabanına bağlantı sağlayan fonksiyon
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    // Varolan bağlantı durumunu kontrol et
    if (mongoose.connection.readyState >= 1) {
      logger.info('MongoDB bağlantısı zaten mevcut');
      return mongoose;
    }

    logger.info(`MongoDB'ye bağlanılıyor: ${MONGODB_URI}`);
    
    const connection = await mongoose.connect(MONGODB_URI, options);
    
    logger.info('MongoDB bağlantısı başarılı');
    
    // Bağlantı hatalarını yakala
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB bağlantı hatası: ${err}`);
    });

    // Bağlantı koptuğunda
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB bağlantısı kesildi');
    });

    // Uygulama kapandığında bağlantıyı kapat
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB bağlantısı kapatıldı (SIGINT)');
      process.exit(0);
    });

    return connection;
  } catch (error: any) {
    logger.error(`MongoDB bağlantı hatası: ${error.message}`);
    process.exit(1);
  }
};

/**
 * MongoDB bağlantısını kapatan fonksiyon
 */
export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB bağlantısı kapatıldı');
  } catch (error: any) {
    logger.error(`MongoDB bağlantısını kapatma hatası: ${error.message}`);
  }
}; 