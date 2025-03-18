import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Service account dosyasının yolunu belirleme
const serviceAccountPath = path.resolve(
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
  path.join(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '')
);

// Firebase admin başlatma
if (!admin.apps.length) {
  try {
    // Service account dosyasının varlığını kontrol et
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8')
      );
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
      });
    } else {
      throw new Error(`Firebase service account dosyası bulunamadı: ${serviceAccountPath}`);
    }
  } catch (error: any) {
    console.error('Firebase admin başlatma hatası:', error.stack);
  }
}

export const auth = admin.auth();

/**
 * Gelen isteklerin kimlik doğrulamasını yapan middleware
 */
export const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Kimlik doğrulama başarısız: Geçerli bir token bulunamadı' 
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if(!token){
      return res.status(401).json({ 
        success: false, 
        message: 'Kimlik doğrulama başarısız: Geçerli bir token bulunamadı' 
      });
    }
    // Token doğrulama
    const decodedToken = await auth.verifyIdToken(token);
    
    // Kullanıcı bilgilerini isteğe ekle
    (req as any).user = decodedToken;
    
    next();
  } catch (error: any) {
    console.error('Kimlik doğrulama hatası:', error);
    
    return res.status(401).json({ 
      success: false, 
      message: 'Kimlik doğrulama başarısız: Geçersiz token',
      error: error.message 
    });
  }
};

/**
 * Admin rolünü kontrol eden middleware
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Kimlik doğrulama gerekli' 
    });
  }
  
  // Admin rolünü kontrol et
  if (user.role === 'admin' || user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Bu işlem için admin yetkisi gerekli' 
    });
  }
}; 