import Translation, { ITranslation } from '../models/translation.model';
import { logger } from '../lib/logger';
import mongoose from 'mongoose';

/**
 * Çeviri servis sınıfı
 */
export class TranslationService {
  /**
   * Tüm namepace'lerin listesini döndürür
   */
  static async getAllNamespaces(): Promise<string[]> {
    try {
      const result = await Translation.distinct('namespace');
      return result;
    } catch (error: any) {
      logger.error(`getAllNamespaces hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tüm dillerin listesini döndürür
   */
  static async getAllLanguages(): Promise<string[]> {
    try {
      const result = await Translation.distinct('language');
      return result;
    } catch (error: any) {
      logger.error(`getAllLanguages hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Belirli bir namespace ve dil için çeviri içeriğini döndürür
   * @param namespace Çeviri namespace'i
   * @param language Dil kodu
   */
  static async getTranslation(namespace: string, language: string): Promise<Record<string, any> | null> {
    try {
      const translation = await Translation.findOne({ namespace, language });
      
      if (!translation) {
        return null;
      }
      
      return translation.content;
    } catch (error: any) {
      logger.error(`getTranslation(${namespace}, ${language}) hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tüm çeviri listesini döndürür
   * @param filter İsteğe bağlı filtreleme kriterleri
   */
  static async getAllTranslations(filter: { namespace?: string; language?: string } = {}): Promise<ITranslation[]> {
    try {
      const query = Translation.find(filter);
      const translations = await query.exec();
      return translations;
    } catch (error: any) {
      logger.error(`getAllTranslations hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Belirli bir dil için tüm namespace'lere ait çevirilerini döndürür
   * @param language Dil kodu
   */
  static async getLanguageTranslations(language: string): Promise<Record<string, Record<string, any>>> {
    try {
      const translations = await Translation.find({ language });
      
      // Namespace'leri anahtar olarak kullanan bir nesne oluştur
      const result: Record<string, Record<string, any>> = {};
      
      translations.forEach(translation => {
        result[translation.namespace] = translation.content;
      });
      
      return result;
    } catch (error: any) {
      logger.error(`getLanguageTranslations(${language}) hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Çeviri içeriğini oluşturur veya günceller
   * @param namespace Çeviri namespace'i
   * @param language Dil kodu
   * @param content Çeviri içeriği
   * @param userId Güncelleyen kullanıcı ID'si
   */
  static async setTranslation(
    namespace: string, 
    language: string, 
    content: Record<string, any>,
    userId?: string
  ): Promise<ITranslation> {
    try {
      // Çevirinin var olup olmadığını kontrol et
      const existingTranslation = await Translation.findOne({ namespace, language });
      
      if (existingTranslation) {
        // Varolan çeviriyi güncelle
        existingTranslation.content = content;
        
        if (userId) {
          existingTranslation.updatedBy = userId;
        }
        
        await existingTranslation.save();
        return existingTranslation;
      } else {
        // Yeni çeviri oluştur
        const newTranslation = new Translation({
          namespace,
          language,
          content,
          updatedBy: userId
        });
        
        await newTranslation.save();
        return newTranslation;
      }
    } catch (error: any) {
      logger.error(`setTranslation(${namespace}, ${language}) hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Çeviri içeriğinin sadece belirli alanlarını günceller, diğer alanlar korunur
   * @param namespace Çeviri namespace'i
   * @param language Dil kodu
   * @param partialContent Güncellenecek içerik (kısmi)
   * @param userId Güncelleyen kullanıcı ID'si
   */
  static async updatePartialTranslation(
    namespace: string, 
    language: string, 
    partialContent: Record<string, any>,
    userId?: string
  ): Promise<ITranslation> {
    try {
      // Çevirinin var olup olmadığını kontrol et
      const existingTranslation = await Translation.findOne({ namespace, language });
      
      if (existingTranslation) {
        // Varolan içeriği yeni içerikle birleştir
        existingTranslation.content = {
          ...existingTranslation.content,
          ...partialContent
        };
        
        if (userId) {
          existingTranslation.updatedBy = userId;
        }
        
        await existingTranslation.save();
        return existingTranslation;
      } else {
        // Çeviri yoksa, yeni çeviri oluştur
        return await this.setTranslation(namespace, language, partialContent, userId);
      }
    } catch (error: any) {
      logger.error(`updatePartialTranslation(${namespace}, ${language}) hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Çeviriden belirli bir anahtarı siler
   * @param namespace Çeviri namespace'i
   * @param language Dil kodu
   * @param key Silinecek anahtar
   * @param userId Güncelleyen kullanıcı ID'si
   */
  static async deleteTranslationKey(
    namespace: string,
    language: string,
    key: string,
    userId?: string
  ): Promise<ITranslation | null> {
    try {
      // Çevirinin var olup olmadığını kontrol et
      const existingTranslation = await Translation.findOne({ namespace, language });
      
      if (!existingTranslation) {
        return null;
      }
      
      // Anahtarı sil (MongoDB'nin unset operasyonuna benzer)
      if (existingTranslation.content && existingTranslation.content[key] !== undefined) {
        const content = { ...existingTranslation.content };
        delete content[key];
        existingTranslation.content = content;
        
        if (userId) {
          existingTranslation.updatedBy = userId;
        }
        
        await existingTranslation.save();
      }
      
      return existingTranslation;
    } catch (error: any) {
      logger.error(`deleteTranslationKey(${namespace}, ${language}, ${key}) hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Belirli bir çeviriyi siler
   * @param namespace Çeviri namespace'i
   * @param language Dil kodu
   */
  static async deleteTranslation(namespace: string, language: string): Promise<boolean> {
    try {
      const result = await Translation.deleteOne({ namespace, language });
      return result.deletedCount > 0;
    } catch (error: any) {
      logger.error(`deleteTranslation(${namespace}, ${language}) hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Çeviri dosyasını veritabanına aktarır
   * @param namespace Çeviri namespace'i
   * @param language Dil kodu
   * @param content Çeviri içeriği
   * @param userId Güncelleyen kullanıcı ID'si
   * @param merge Varolan çeviriyle birleştir (varsayılan: false)
   */
  static async importTranslation(
    namespace: string,
    language: string,
    content: Record<string, any>,
    userId?: string,
    merge: boolean = false
  ): Promise<ITranslation> {
    try {
      if (merge) {
        return await this.updatePartialTranslation(namespace, language, content, userId);
      } else {
        return await this.setTranslation(namespace, language, content, userId);
      }
    } catch (error: any) {
      logger.error(`importTranslation(${namespace}, ${language}) hatası: ${error.message}`);
      throw error;
    }
  }
} 