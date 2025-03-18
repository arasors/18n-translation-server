# Translation Server API

Bu servis, Prop360 uygulaması için çoklu dil desteği sağlayan bir çeviri yönetim API'sidir. Bu API, i18n çevirilerini veritabanında saklar ve bunları yönetmek için RESTful bir arayüz sunar.

## Özellikler

- Namespace ve dil bazında çevirileri depolama
- Çeviri içeriğini JSON formatında saklama
- CRUD işlemleri için RESTful API 
- Firebase ile kimlik doğrulama
- Admin/SuperAdmin yetkilendirmesi
- MongoDB veritabanı desteği

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme için çalıştır
npm run dev

# Üretim için derle
npm run build

# Derlenen kodu çalıştır
npm start
```

## Ortam Değişkenleri

Aşağıdaki ortam değişkenlerini `.env` dosyasında tanımlayın:

```env
# Port
PORT=3001

# MongoDB bağlantı URL'si
MONGODB_URI=mongodb://localhost:27017/prop360

# Firebase veritabanı URL'si
FIREBASE_DATABASE_URL=https://your-firebase-project.firebaseio.com

# Firebase Service Account dosya yolu (isteğe bağlı)
FIREBASE_SERVICE_ACCOUNT_PATH=./lib/firebase-admin-services.json

# CORS izin verilen köken
CORS_ORIGIN=*

# Log seviyesi
LOG_LEVEL=info

# Log dosyası dizini
LOG_DIR=logs

# Node çalışma ortamı
NODE_ENV=development
```

## API Endpoint'leri

### Açık API'ler (Kimlik Doğrulama Gerektirmez)

#### Namespace'leri Listele

```
GET /api/namespaces
```

Tüm çeviri namespace'lerini listeler.

**Yanıt:**

```json
{
  "success": true,
  "data": ["common", "auth", "navbar", "profile", ...]
}
```

#### Dilleri Listele

```
GET /api/languages
```

Desteklenen tüm dilleri listeler.

**Yanıt:**

```json
{
  "success": true,
  "data": ["en", "tr", ...]
}
```

#### Tüm Çevirileri Listele

```
GET /api/translations
```

Filtrelere göre tüm çevirileri listeler.

**Sorgu Parametreleri:**

- `namespace`: Çeviri namespace'i
- `language`: Dil kodu

**Yanıt:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "namespace": "common",
      "language": "en",
      "content": {
        "welcome": "Welcome",
        "login": "Login",
        ...
      },
      "updatedBy": "user123",
      "createdAt": "2023-06-22T10:00:00.000Z",
      "updatedAt": "2023-06-22T10:00:00.000Z"
    },
    ...
  ]
}
```

#### Belirli Bir Dil İçin Tüm Çevirileri Getir

```
GET /api/translations/language/:language
```

Belirli bir dil için tüm namespace'leri içeren çevirileri döndürür.

**Yanıt:**

```json
{
  "success": true,
  "data": {
    "common": {
      "welcome": "Welcome",
      "login": "Login",
      ...
    },
    "auth": {
      "signIn": "Sign In",
      "signUp": "Sign Up",
      ...
    },
    ...
  }
}
```

#### Belirli Bir Çeviriyi Getir

```
GET /api/translations/:namespace/:language
```

Belirli bir namespace ve dil için çeviri içeriğini döndürür.

**Yanıt:**

```json
{
  "success": true,
  "data": {
    "welcome": "Welcome",
    "login": "Login",
    ...
  }
}
```

### Güvenli API'ler (Kimlik Doğrulama ve Admin Yetkisi Gerektirir)

#### Çeviri Oluştur veya Güncelle

```
POST /api/translations/:namespace/:language
```

Belirli bir namespace ve dil için çeviri içeriğini oluşturur veya günceller.

**İstek Gövdesi:**

```json
{
  "content": {
    "welcome": "Welcome",
    "login": "Login",
    ...
  }
}
```

**Yanıt:**

```json
{
  "success": true,
  "message": "common namespace'i ve en dili için çeviri güncellendi",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "namespace": "common",
    "language": "en",
    "content": {
      "welcome": "Welcome",
      "login": "Login",
      ...
    },
    "updatedBy": "user123",
    "createdAt": "2023-06-22T10:00:00.000Z",
    "updatedAt": "2023-06-22T10:00:00.000Z"
  }
}
```

#### Kısmi Çeviri Güncelleme

```
PATCH /api/translations/:namespace/:language
```

Belirli bir namespace ve dil için çeviri içeriğinin bir kısmını günceller.

**İstek Gövdesi:**

```json
{
  "content": {
    "welcome": "Welcome to our app",
    "newKey": "New value"
  }
}
```

**Yanıt:**

```json
{
  "success": true,
  "message": "common namespace'i ve en dili için çeviri kısmen güncellendi",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "namespace": "common",
    "language": "en",
    "content": {
      "welcome": "Welcome to our app",
      "login": "Login",
      "newKey": "New value",
      ...
    },
    "updatedBy": "user123",
    "createdAt": "2023-06-22T10:00:00.000Z",
    "updatedAt": "2023-06-22T10:00:00.000Z"
  }
}
```

#### Çeviriden Bir Anahtarı Silme

```
DELETE /api/translations/:namespace/:language/:key
```

Belirli bir namespace ve dil için çeviriden belirli bir anahtarı siler.

**Yanıt:**

```json
{
  "success": true,
  "message": "common namespace'i ve en dili için 'welcome' anahtarı silindi",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "namespace": "common",
    "language": "en",
    "content": {
      "login": "Login",
      ...
    },
    "updatedBy": "user123",
    "createdAt": "2023-06-22T10:00:00.000Z",
    "updatedAt": "2023-06-22T10:00:00.000Z"
  }
}
```

#### Çeviriyi Silme

```
DELETE /api/translations/:namespace/:language
```

Belirli bir namespace ve dil için tüm çeviriyi siler.

**Yanıt:**

```json
{
  "success": true,
  "message": "common namespace'i ve en dili için çeviri silindi"
}
```

#### Çeviri İçe Aktarma

```
POST /api/translations/import/:namespace/:language
```

Belirli bir namespace ve dil için çeviri içeriğini içe aktarır.

**İstek Gövdesi:**

```json
{
  "content": {
    "welcome": "Welcome",
    "login": "Login",
    ...
  },
  "merge": true
}
```

**Parametreler:**

- `merge`: `true` olarak ayarlanırsa, mevcut çeviriyle birleştirir; `false` olarak ayarlanırsa veya belirtilmezse, mevcut çeviriyi tamamen değiştirir.

**Yanıt:**

```json
{
  "success": true,
  "message": "common namespace'i ve en dili için çeviri içe aktarıldı",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "namespace": "common",
    "language": "en",
    "content": {
      "welcome": "Welcome",
      "login": "Login",
      ...
    },
    "updatedBy": "user123",
    "createdAt": "2023-06-22T10:00:00.000Z",
    "updatedAt": "2023-06-22T10:00:00.000Z"
  }
}
```

## Kimlik Doğrulama

Güvenli API'ler için, isteklerin `Authorization` başlığında bir Firebase kimlik doğrulama belirteci (token) sağlanmalıdır:

```
Authorization: Bearer <firebase_id_token>
```

## Yetkilendirme

Kimlik doğrulaması yapılan kullanıcılar, çeviri verilerini değiştirmek için admin rolüne sahip olmalıdır. Admin olmayan kullanıcılar, yalnızca çevirileri görüntüleyebilir. 