import { Router } from 'express';
import { TranslationController } from '../controllers/translation.controller';
import { authenticateRequest, isAdmin } from '../lib/firebase-admin';

const router = Router();

/**
 * Açık rotalar - Kimlik doğrulama gerektirmeyen
 */

// Tüm namespace listesini getir
router.get('/namespaces', TranslationController.getAllNamespaces);

// Tüm dil listesini getir 
router.get('/languages', TranslationController.getAllLanguages);

// Belirli bir dil için tüm çevirileri getir
router.get('/translations/language/:language', TranslationController.getLanguageTranslations);

// Belirli bir namespace ve dil için çeviri içeriğini getir
router.get('/translations/:namespace/:language', TranslationController.getTranslation);

// Filtrelere göre tüm çevirileri getir
// ?namespace=common&language=tr şeklinde query parametreleriyle çalışır
router.get('/translations', TranslationController.getAllTranslations);

/**
 * Güvenli rotalar - Kimlik doğrulama ve admin yetkisi gerektiren
 */

// Çeviri oluştur veya güncelle
router.post('/translations/:namespace/:language', 
  authenticateRequest, 
  isAdmin,
  TranslationController.setTranslation
);

// Kısmi çeviri güncelleme
router.patch('/translations/:namespace/:language', 
  authenticateRequest, 
  isAdmin,
  TranslationController.updatePartialTranslation
);

// Çeviriden bir anahtarı sil
router.delete('/translations/:namespace/:language/:key', 
  authenticateRequest, 
  isAdmin,
  TranslationController.deleteTranslationKey
);

// Çeviriyi tamamen sil
router.delete('/translations/:namespace/:language', 
  authenticateRequest, 
  isAdmin,
  TranslationController.deleteTranslation
);

// Çeviri içe aktar
router.post('/translations/import/:namespace/:language', 
  authenticateRequest, 
  isAdmin,
  TranslationController.importTranslation
);

export default router; 