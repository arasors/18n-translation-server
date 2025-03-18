import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../lib/logger';
import Translation from '../models/translation.model';
import { TranslationService } from '../services/translation.service';

// FS işlemlerinin Promise versiyonları
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

// Varsayılan çevirilerin bulunduğu dizin
const DEFAULT_LOCALES_DIR = path.resolve(process.env.DEFAULT_LOCALES_DIR || 
  path.join(__dirname, '../../assets/locales'));

/**
 * Çeviri dosyalarını yükler
 * @param language Dil kodu
 */
async function loadTranslationFiles(language: string): Promise<Array<{namespace: string, content: Record<string, any>}>> {
  try {
    const languageDir = path.join(DEFAULT_LOCALES_DIR, language);
    const files = await readdir(languageDir);
    
    const translations: Array<{namespace: string, content: Record<string, any>}> = [];
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(languageDir, file);
      const content = await readFile(filePath, 'utf8');
      const namespace = path.basename(file, '.json');
      
      try {
        const parsedContent = JSON.parse(content);
        translations.push({
          namespace,
          content: parsedContent
        });
      } catch (error: any) {
        logger.error(`${file} dosyası JSON olarak ayrıştırılamadı: ${error.message}`);
      }
    }
    
    return translations;
  } catch (error: any) {
    logger.error(`${language} dili için çeviri dosyaları yüklenemedi: ${error.message}`);
    return [];
  }
}

/**
 * Çeviri dosyalarını MongoDB'ye kaydet
 * @param language Dil kodu
 * @param translations Yüklenecek çeviriler
 */
async function saveTranslations(language: string, translations: Array<{namespace: string, content: Record<string, any>}>): Promise<void> {
  try {
    for (const { namespace, content } of translations) {
      logger.info(`${language}/${namespace} çevirisi yükleniyor...`);
      
      try {
        const existingTranslation = await Translation.findOne({ namespace, language });
        
        if (!existingTranslation) {
          await TranslationService.setTranslation(namespace, language, content, 'system');
          logger.info(`${language}/${namespace} çevirisi başarıyla oluşturuldu.`);
        } else {
          logger.info(`${language}/${namespace} çevirisi zaten mevcut, atlanıyor.`);
        }
      } catch (error: any) {
        logger.error(`${language}/${namespace} çevirisi kaydedilemedi: ${error.message}`);
      }
    }
  } catch (error: any) {
    logger.error(`Çeviriler kaydedilemedi: ${error.message}`);
  }
}

/**
 * Tüm dilleri kontrol eder ve eksik olanları varsayılan çevirilerle doldurur
 */
export async function setDefaultTranslations(): Promise<void> {
  try {
    logger.info('Varsayılan çeviriler kontrol ediliyor...');
    
    // Dilleri içeren klasörleri bul
    const languageFolders = await readdir(DEFAULT_LOCALES_DIR);
    
    // MongoDB'de bir çeviri olup olmadığını kontrol et
    const existingTranslations = await Translation.find({});
    
    if (existingTranslations.length === 0) {
      logger.info('Hiç çeviri bulunamadı. Varsayılan çeviriler yükleniyor...');
      
      // Her dil için
      for (const language of languageFolders) {
        // Klasör olmayan dosyaları atla
        const languagePath = path.join(DEFAULT_LOCALES_DIR, language);
        if (!fs.statSync(languagePath).isDirectory()) continue;
        
        logger.info(`${language} dili için çeviriler yükleniyor...`);
        
        const translations = await loadTranslationFiles(language);
        await saveTranslations(language, translations);
        
        logger.info(`${language} dili için çevirilerin yüklenmesi tamamlandı.`);
      }
      
      logger.info('Varsayılan çevirilerin yüklenmesi tamamlandı.');
    } else {
      logger.info('Veritabanında çeviriler zaten mevcut. Varsayılan çeviriler yüklenmeyecek.');
    }
  } catch (error: any) {
    logger.error(`Varsayılan çeviriler yüklenirken hata oluştu: ${error.message}`);
  }
} 