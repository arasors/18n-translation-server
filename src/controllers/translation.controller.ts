import { Request, Response } from 'express';
import { TranslationService } from '../services/translation.service';
import { logger } from '../lib/logger';

/**
 * Çeviri API kontrolcüsü
 */
export class TranslationController {
  /**
   * Tüm çevirileri listeler
   */
  static async getAllTranslations(req: Request, res: Response): Promise<void> {
    try {
      const namespace = req.query.namespace as string | undefined;
      const language = req.query.language as string | undefined;
      
      const filter: { namespace?: string; language?: string } = {};
      
      if (namespace) {
        filter.namespace = namespace;
      }
      
      if (language) {
        filter.language = language;
      }
      
      const translations = await TranslationService.getAllTranslations(filter);
      
      res.json({
        success: true,
        data: translations
      });
    } catch (error: any) {
      logger.error(`getAllTranslations hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Çeviriler getirilirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Tüm dillerin listesini döndürür
   */
  static async getAllLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await TranslationService.getAllLanguages();
      
      res.json({
        success: true,
        data: languages
      });
    } catch (error: any) {
      logger.error(`getAllLanguages hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Diller getirilirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Tüm namespace'lerin listesini döndürür
   */
  static async getAllNamespaces(req: Request, res: Response): Promise<void> {
    try {
      const namespaces = await TranslationService.getAllNamespaces();
      
      res.json({
        success: true,
        data: namespaces
      });
    } catch (error: any) {
      logger.error(`getAllNamespaces hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Namespace\'ler getirilirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Belirli bir dil için tüm çevirileri döndürür
   */
  static async getLanguageTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { language } = req.params;
      
      if (!language) {
        res.status(400).json({
          success: false,
          message: 'Dil parametresi gereklidir'
        });
        return;
      }
      
      const translations = await TranslationService.getLanguageTranslations(language);
      
      res.json({
        success: true,
        data: translations
      });
    } catch (error: any) {
      logger.error(`getLanguageTranslations hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: `${req.params.language} dili için çeviriler getirilirken bir hata oluştu`,
        error: error.message
      });
    }
  }

  /**
   * Belirli bir namespace ve dil için çeviri içeriğini döndürür
   */
  static async getTranslation(req: Request, res: Response): Promise<void> {
    try {
      const { namespace, language } = req.params;
      
      if (!namespace || !language) {
        res.status(400).json({
          success: false,
          message: 'Namespace ve dil parametreleri gereklidir'
        });
        return;
      }
      
      const content = await TranslationService.getTranslation(namespace, language);
      
      if (!content) {
        res.status(404).json({
          success: false,
          message: `${namespace} namespace'i ve ${language} dili için çeviri bulunamadı`
        });
        return;
      }
      
      res.json({
        success: true,
        data: content
      });
    } catch (error: any) {
      logger.error(`getTranslation hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: `Çeviri getirilirken bir hata oluştu`,
        error: error.message
      });
    }
  }

  /**
   * Yeni bir çeviri oluşturur veya mevcut çeviriyi günceller
   */
  static async setTranslation(req: Request, res: Response): Promise<void> {
    try {
      const { namespace, language } = req.params;
      const content = req.body.content;
      const userId = (req as any).user?.uid;
      
      if (!namespace || !language) {
        res.status(400).json({
          success: false,
          message: 'Namespace ve dil parametreleri gereklidir'
        });
        return;
      }
      
      if (!content || typeof content !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Geçerli bir çeviri içeriği gereklidir'
        });
        return;
      }
      
      const translation = await TranslationService.setTranslation(namespace, language, content, userId);
      
      res.json({
        success: true,
        message: `${namespace} namespace'i ve ${language} dili için çeviri güncellendi`,
        data: translation
      });
    } catch (error: any) {
      logger.error(`setTranslation hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Çeviri güncellenirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Çeviri içeriğinin bir kısmını günceller
   */
  static async updatePartialTranslation(req: Request, res: Response): Promise<void> {
    try {
      const { namespace, language } = req.params;
      const partialContent = req.body.content;
      const userId = (req as any).user?.uid;
      
      if (!namespace || !language) {
        res.status(400).json({
          success: false,
          message: 'Namespace ve dil parametreleri gereklidir'
        });
        return;
      }
      
      if (!partialContent || typeof partialContent !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Geçerli bir çeviri içeriği gereklidir'
        });
        return;
      }
      
      const translation = await TranslationService.updatePartialTranslation(
        namespace, 
        language, 
        partialContent,
        userId
      );
      
      res.json({
        success: true,
        message: `${namespace} namespace'i ve ${language} dili için çeviri kısmen güncellendi`,
        data: translation
      });
    } catch (error: any) {
      logger.error(`updatePartialTranslation hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Çeviri kısmen güncellenirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Çeviriden bir anahtarı siler
   */
  static async deleteTranslationKey(req: Request, res: Response): Promise<void> {
    try {
      const { namespace, language, key } = req.params;
      const userId = (req as any).user?.uid;
      
      if (!namespace || !language || !key) {
        res.status(400).json({
          success: false,
          message: 'Namespace, dil ve anahtar parametreleri gereklidir'
        });
        return;
      }
      
      const translation = await TranslationService.deleteTranslationKey(namespace, language, key, userId);
      
      if (!translation) {
        res.status(404).json({
          success: false,
          message: `${namespace} namespace'i ve ${language} dili için çeviri bulunamadı`
        });
        return;
      }
      
      res.json({
        success: true,
        message: `${namespace} namespace'i ve ${language} dili için '${key}' anahtarı silindi`,
        data: translation
      });
    } catch (error: any) {
      logger.error(`deleteTranslationKey hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Çeviri anahtarı silinirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Bir çeviriyi tamamen siler
   */
  static async deleteTranslation(req: Request, res: Response): Promise<void> {
    try {
      const { namespace, language } = req.params;
      
      if (!namespace || !language) {
        res.status(400).json({
          success: false,
          message: 'Namespace ve dil parametreleri gereklidir'
        });
        return;
      }
      
      const deleted = await TranslationService.deleteTranslation(namespace, language);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: `${namespace} namespace'i ve ${language} dili için çeviri bulunamadı`
        });
        return;
      }
      
      res.json({
        success: true,
        message: `${namespace} namespace'i ve ${language} dili için çeviri silindi`
      });
    } catch (error: any) {
      logger.error(`deleteTranslation hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Çeviri silinirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Çeviri dosyasını içe aktarır
   */
  static async importTranslation(req: Request, res: Response): Promise<void> {
    try {
      const { namespace, language } = req.params;
      const content = req.body.content;
      const merge = req.body.merge === true;
      const userId = (req as any).user?.uid;
      
      if (!namespace || !language) {
        res.status(400).json({
          success: false,
          message: 'Namespace ve dil parametreleri gereklidir'
        });
        return;
      }
      
      if (!content || typeof content !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Geçerli bir çeviri içeriği gereklidir'
        });
        return;
      }
      
      const translation = await TranslationService.importTranslation(
        namespace, 
        language, 
        content, 
        userId, 
        merge
      );
      
      res.json({
        success: true,
        message: `${namespace} namespace'i ve ${language} dili için çeviri içe aktarıldı`,
        data: translation
      });
    } catch (error: any) {
      logger.error(`importTranslation hatası: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Çeviri içe aktarılırken bir hata oluştu',
        error: error.message
      });
    }
  }
} 