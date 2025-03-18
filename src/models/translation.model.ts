import mongoose, { Document, Schema } from 'mongoose';

/**
 * Çeviri dökümanı için arayüz
 */
export interface ITranslation extends Document {
  namespace: string;
  language: string;
  content: Record<string, any>;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Çeviri şeması
 */
const TranslationSchema = new Schema<ITranslation>(
  {
    // Çevirinin ait olduğu namespace (örn: common, auth, vb.)
    namespace: { 
      type: String, 
      required: true,
      trim: true,
      index: true
    },
    
    // Çevirinin dil kodu (örn: en, tr, vb.)
    language: { 
      type: String, 
      required: true,
      trim: true,
      index: true
    },
    
    // Çeviri içeriği (key-value çiftleri)
    content: { 
      type: Schema.Types.Mixed,
      required: true,
      default: {}
    },
    
    // Son güncelleyen kullanıcı ID'si
    updatedBy: { 
      type: String,
      trim: true,
      index: true
    }
  }, 
  { 
    // Otomatik tarih damgası
    timestamps: true, 
    
    // İçerik için versiyonlama aktif ve alanı "__v" olarak ayarla
    versionKey: "__v"
  }
);

// Namespace ve dil kombinasyonu için benzersizlik kısıtlaması
TranslationSchema.index({ namespace: 1, language: 1 }, { unique: true });

// Veritabanında model tanımı
const Translation = mongoose.models.Translation || 
  mongoose.model<ITranslation>('Translation', TranslationSchema, 'translations');

export default Translation; 