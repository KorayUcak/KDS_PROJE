# Analiz Modülü Geliştirme Dökümanı

## 📋 Genel Bakış

Bu dokümantasyon, KDS (Küresel Pazar Araştırması Karar Destek Sistemi) projesinde **Analiz Ekle** sayfası ve **Analiz Detay** sayfasının geliştirilmesi hakkında detaylı bilgi içermektedir.

## 🗄️ Veritabanı Yapısı

### Ana Tablolar

#### 1. `kayitli_analizler` (Ana Analiz Tablosu)
```sql
- analiz_id (INT, PK, Auto Increment)
- kullanici_id (INT, FK -> kullanicilar)
- hedef_ulke_id (INT, FK -> ulkeler)
- hedef_sektor_id (INT, FK -> sektorler)
- hesaplanan_skor (DECIMAL(5,2))
- yonetici_notu (TEXT)
- aciklama (TEXT)
- olusturulma_tarihi (TIMESTAMP)
```

#### 2. İlişkili Tablolar
- `ulkeler`: Ülke bilgileri (ulke_id, ulke_adi, ISO_KODU)
- `sektorler`: Sektör bilgileri (sektor_id, sektor_adi)
- `kullanicilar`: Kullanıcı bilgileri (kullanici_id, ad_soyad, email)
- `ekonomi_guncel`: Ekonomik veriler (GSYİH, büyüme, enflasyon, vb.)
- `ulke_sektor_verileri`: Sektörel veriler (ihracat, ithalat, büyüme, vb.)

## 🎨 Geliştirilen Özellikler

### 1. Analiz Ekle Sayfası (`/analyses/new`)

#### Yeni Özellikler:
- ✅ **3 Adımlı Form Yapısı**
  - Adım 1: Sektör Seçimi
  - Adım 2: Ülke Seçimi (arama özelliği ile)
  - Adım 3: Analiz Detayları

- ✅ **Gelişmiş Validasyonlar**
  - Zorunlu alan kontrolü
  - Gerçek zamanlı hata mesajları
  - Veritabanı seviyesinde varlık kontrolü

- ✅ **Kullanıcı Deneyimi İyileştirmeleri**
  - Ülke arama fonksiyonu
  - Karakter sayacı (açıklama: 500, yönetici notu: 300)
  - Seçim özeti görüntüleme
  - Yükleme durumu göstergesi
  - Başarı/hata bildirimleri

- ✅ **Responsive Tasarım**
  - Mobil uyumlu
  - Modern gradient renkler
  - İkonlu arayüz

#### Teknik Detaylar:
```javascript
// Form Gönderimi
POST /analyses
Body: {
  kullanici_id: 1,
  parametreler: {
    hedef_sektor_id: number,
    hedef_ulke_id: number,
    aciklama: string (optional),
    yonetici_notu: string (optional)
  }
}
```

### 2. Analiz Detay Sayfası (`/analyses/:id/detail`)

#### Yeni Özellikler:
- ✅ **Kapsamlı Bilgi Görüntüleme**
  - Özet kartlar (Ülke, Sektör, Skor, Tarih)
  - Breadcrumb navigasyon
  - Durum rozetleri (Tamamlandı/İşlemde)

- ✅ **Detaylı Bilgi Bölümleri**
  - Genel Bilgiler (ID, ülke, sektör, kullanıcı, tarih, skor)
  - Açıklama kartı
  - Yönetici notu kartı
  - Analiz durumu göstergeleri

- ✅ **İşlem Butonları**
  - Geri dön
  - Düzenle (placeholder)
  - Sil (onay ile)

- ✅ **Boş Durum Yönetimi**
  - Açıklama/not yoksa özel mesaj
  - Analiz bulunamazsa yönlendirme seçenekleri

#### Teknik Detaylar:
```javascript
// Analiz Getirme
GET /analyses/:id/detail

// Analiz Silme
DELETE /analyses/:id
```

### 3. Pazar Skoru Hesaplama Algoritması

#### Hesaplama Kriterleri:
1. **GSYİH Büyüklüğü** (Ağırlık: %20)
   - 5 trilyon $ üzeri = 100 puan
   
2. **Büyüme Oranı** (Ağırlık: %15)
   - -5% = 0 puan, +5% = 100 puan

3. **Enflasyon** (Ağırlık: %10)
   - Düşük enflasyon = yüksek puan
   - Her %1 enflasyon = -5 puan

4. **Sektörel İhracat** (Ağırlık: %20)
   - 10 milyar $ üzeri = 100 puan

5. **Sektörel Büyüme** (Ağırlık: %15)
   - -5% = 0 puan, +5% = 100 puan

6. **Yerli Üretim Karşılama Oranı** (Ağırlık: %10)
   - Düşük oran = yüksek ithalat fırsatı
   - %0 = 100 puan, %100 = 0 puan

7. **Risk Notu** (Ağırlık: %10)
   - 10 üzerinden değerlendirme

#### API Endpoint:
```javascript
// Skor Hesaplama
POST /analyses/:id/calculate-score
Response: {
  status: 'success',
  data: {
    analysis: {...},
    score: 75.42
  }
}
```

## 📁 Değiştirilen Dosyalar

### 1. Views (Görünüm Dosyaları)
- ✅ `/views/analyses/new.ejs` - Tamamen yeniden tasarlandı
- ✅ `/views/analyses/detail.ejs` - Kapsamlı iyileştirmeler

### 2. Controllers (Kontrol Dosyaları)
- ✅ `/controllers/analysisController.js`
  - `calculateMarketScore()` - Yeni skor hesaplama fonksiyonu
  - `createAnalysis()` - Geliştirilmiş validasyonlar
  - `calculateAndSaveScore()` - Yeni endpoint

### 3. Routes (Yönlendirme Dosyaları)
- ✅ `/routes/analysisRoutes.js`
  - `POST /:id/calculate-score` - Yeni route

### 4. Models (Veri Modelleri)
- ℹ️ `/models/analysisModel.js` - Mevcut yapı korundu

## 🎯 Kullanım Senaryoları

### Senaryo 1: Yeni Analiz Oluşturma
1. `/analyses/new` sayfasına git
2. Sektör seç (örn: Otomotiv)
3. Ülke ara ve seç (örn: Almanya)
4. Açıklama ekle (opsiyonel)
5. Yönetici notu ekle (opsiyonel)
6. "Analiz Oluştur" butonuna tıkla
7. Başarılı mesajı sonrası dashboard'a yönlendirilir

### Senaryo 2: Analiz Detaylarını Görüntüleme
1. Dashboard'da bir analiz satırına tıkla
2. Detay sayfasında tüm bilgileri görüntüle
3. Özet kartlarda hızlı bilgi al
4. Açıklama ve notları oku
5. Durum göstergelerini kontrol et

### Senaryo 3: Analiz Silme
1. Analiz detay sayfasında "Sil" butonuna tıkla
2. Onay dialogunu onayla
3. Başarılı mesajı sonrası dashboard'a dön

### Senaryo 4: Pazar Skoru Hesaplama
```javascript
// API üzerinden
fetch('/analyses/123/calculate-score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => {
  console.log('Hesaplanan Skor:', data.data.score);
});
```

## 🔍 Validasyon Kuralları

### Frontend Validasyonları:
- ✅ Sektör seçimi zorunlu
- ✅ Ülke seçimi zorunlu
- ✅ Açıklama max 500 karakter
- ✅ Yönetici notu max 300 karakter

### Backend Validasyonları:
- ✅ Parametreler kontrolü
- ✅ Ülke ID varlık kontrolü
- ✅ Sektör ID varlık kontrolü
- ✅ Kullanıcı ID kontrolü
- ✅ Veri tipi kontrolü (parseInt)

## 🎨 Tasarım Özellikleri

### Renk Paleti:
- **Primary Gradient**: `#667eea` → `#764ba2`
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Danger**: `#ef4444`
- **Info**: `#3b82f6`

### Responsive Breakpoints:
- Desktop: > 768px
- Mobile: ≤ 768px

### İkonlar:
- 🌍 Ülke
- 🏭 Sektör
- ⭐ Skor
- 📅 Tarih
- 📋 Analiz
- 💼 Yönetici

## 🚀 Test Senaryoları

### Test 1: Form Validasyonu
```javascript
// Sektör seçmeden gönder
// Beklenen: "⚠️ Lütfen bir sektör seçiniz." hatası

// Ülke seçmeden gönder
// Beklenen: "⚠️ Lütfen bir ülke seçiniz." hatası
```

### Test 2: Ülke Arama
```javascript
// "Türk" yaz
// Beklenen: Türkiye görünsün

// "Alm" yaz
// Beklenen: Almanya görünsün
```

### Test 3: Karakter Sayacı
```javascript
// Açıklama alanına 100 karakter yaz
// Beklenen: "100 / 500 karakter" görünsün
```

### Test 4: Analiz Oluşturma
```javascript
// Tüm alanları doldur ve gönder
// Beklenen: Başarı mesajı ve yönlendirme
```

### Test 5: Analiz Silme
```javascript
// Sil butonuna tıkla ve onayla
// Beklenen: "✅ Analiz başarıyla silindi!" ve yönlendirme
```

## 📊 Veritabanı İlişkileri

```
kayitli_analizler
    ├── kullanici_id → kullanicilar.kullanici_id
    ├── hedef_ulke_id → ulkeler.ulke_id
    └── hedef_sektor_id → sektorler.sektor_id

Skor Hesaplama İçin:
    ├── hedef_ulke_id → ekonomi_guncel.ulke_id
    └── (hedef_ulke_id, hedef_sektor_id) → ulke_sektor_verileri
```

## 🔧 Gelecek Geliştirmeler

### Önerilen İyileştirmeler:
1. ✏️ Analiz düzenleme sayfası
2. 📊 Skor hesaplama otomasyonu (analiz oluşturulurken)
3. 📈 Grafik ve görselleştirmeler
4. 🔔 Bildirim sistemi
5. 📤 Rapor dışa aktarma (PDF, Excel)
6. 🔍 Gelişmiş filtreleme ve arama
7. 📱 PWA desteği
8. 🌐 Çoklu dil desteği

## 🐛 Bilinen Sorunlar

### Lint Uyarıları:
- EJS dosyalarında JavaScript linter uyarıları (normal, göz ardı edilebilir)
- Satır 244, 248: `<%= %>` syntax'ı linter tarafından hata olarak işaretleniyor

### Çözüm:
Bu uyarılar EJS template syntax'ından kaynaklanmaktadır ve işlevselliği etkilememektedir.

## 📝 Notlar

1. **Güvenlik**: Kullanıcı kimlik doğrulaması session üzerinden yapılmalı (şu an hardcoded: kullanici_id = 1)
2. **Performans**: Büyük veri setlerinde sayfalama eklenebilir
3. **Hata Yönetimi**: Tüm hata durumları yakalanmış ve kullanıcı dostu mesajlar gösteriliyor
4. **Loglama**: Tüm önemli işlemler sistem loglarına kaydediliyor

## 🎓 Kod Örnekleri

### Yeni Analiz Oluşturma (Frontend)
```javascript
const formData = {
  kullanici_id: 1,
  parametreler: {
    hedef_sektor_id: 5,
    hedef_ulke_id: 12,
    aciklama: "2024 yılı analizi",
    yonetici_notu: "Öncelikli pazar"
  }
};

fetch('/analyses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

### Skor Hesaplama (Backend)
```javascript
const skor = await calculateMarketScore(ulkeId, sektorId);
// Skor: 0-100 arası decimal değer
```

## 📞 Destek

Sorularınız için:
- 📧 Email: support@kds-proje.com
- 📚 Dokümantasyon: /docs
- 🐛 Bug Report: /issues

---

**Son Güncelleme**: 23 Aralık 2024
**Versiyon**: 2.0.0
**Geliştirici**: KDS Development Team
