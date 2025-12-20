-- =============================================
-- KDS - Küresel Pazar Araştırması Karar Destek Sistemi
-- Veritabanı Şeması
-- =============================================

-- Veritabanını oluştur (eğer yoksa)
CREATE DATABASE IF NOT EXISTS kds_proje CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kds_proje;

-- =============================================
-- 1. KULLANICILAR TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS kullanicilar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_adi VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    sifre_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'analist', 'kullanici') DEFAULT 'kullanici',
    aktif BOOLEAN DEFAULT TRUE,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    son_giris_tarihi TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_kullanici_adi (kullanici_adi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. KAYITLI ANALİZLER TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS kayitli_analizler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_id INT,
    analiz_adi VARCHAR(200) NOT NULL,
    analiz_tipi VARCHAR(50) NOT NULL,
    parametreler JSON,
    sonuclar JSON,
    durum ENUM('taslak', 'devam_ediyor', 'tamamlandi', 'iptal') DEFAULT 'taslak',
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE SET NULL,
    INDEX idx_kullanici (kullanici_id),
    INDEX idx_durum (durum),
    INDEX idx_tarih (olusturma_tarihi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. SİSTEM LOGLARI TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS sistem_loglari (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_id INT,
    islem_tipi VARCHAR(50) NOT NULL,
    detay TEXT,
    ip_adresi VARCHAR(45),
    seviye ENUM('info', 'warning', 'error', 'debug') DEFAULT 'info',
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE SET NULL,
    INDEX idx_islem (islem_tipi),
    INDEX idx_seviye (seviye),
    INDEX idx_tarih (olusturma_tarihi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ÖRNEK VERİLER (Demo)
-- =============================================

-- Demo kullanıcı
INSERT INTO kullanicilar (kullanici_adi, email, sifre_hash, rol) VALUES
('admin', 'admin@kds.com', 'admin123', 'admin'),
('analist1', 'analist@kds.com', 'analist123', 'analist');

-- Demo analizler
INSERT INTO kayitli_analizler (kullanici_id, analiz_adi, analiz_tipi, parametreler, sonuclar, durum) VALUES
(1, 'Türkiye Pazar Analizi', 'pazar_buyuklugu', 
 '{"hedef_bolge": "avrupa", "yil": 2024}',
 '{"ulke": "Türkiye", "ulke_kodu": "TR", "pazar_skoru": 85, "buyume_orani": 12.5, "risk_seviyesi": "orta"}',
 'tamamlandi'),

(1, 'Almanya Rekabet Analizi', 'rekabet_analizi',
 '{"hedef_bolge": "avrupa", "sektor": "teknoloji"}',
 '{"ulke": "Almanya", "ulke_kodu": "DE", "pazar_skoru": 78, "rekabet_yogunlugu": "yuksek", "firsat_skoru": 72}',
 'tamamlandi'),

(1, 'ABD Trend Analizi', 'trend_analizi',
 '{"hedef_bolge": "kuzey_amerika", "donem": "Q4-2024"}',
 '{"ulke": "ABD", "ulke_kodu": "US", "pazar_skoru": 92, "trend_yonu": "yukari", "guven_endeksi": 88}',
 'tamamlandi'),

(2, 'Çin Fırsat Analizi', 'firsat_analizi',
 '{"hedef_bolge": "asya_pasifik", "sektor": "e-ticaret"}',
 '{"ulke": "Çin", "ulke_kodu": "CN", "pazar_skoru": 88, "firsat_puani": 91, "giris_bariyeri": "yuksek"}',
 'tamamlandi'),

(2, 'İngiltere Risk Değerlendirme', 'risk_degerlendirme',
 '{"hedef_bolge": "avrupa", "risk_tipleri": ["politik", "ekonomik"]}',
 '{"ulke": "İngiltere", "ulke_kodu": "GB", "pazar_skoru": 75, "risk_skoru": 35, "tavsiye": "dikkatli_yatirim"}',
 'devam_ediyor'),

(1, 'Japonya SWOT Analizi', 'swot',
 '{"hedef_bolge": "asya_pasifik"}',
 '{"ulke": "Japonya", "ulke_kodu": "JP", "pazar_skoru": 82, "guclu_yanlar": 4, "zayif_yanlar": 2}',
 'tamamlandi'),

(2, 'Fransa Pazar Araştırması', 'pazar_buyuklugu',
 '{"hedef_bolge": "avrupa", "sektor": "otomotiv"}',
 '{"ulke": "Fransa", "ulke_kodu": "FR", "pazar_skoru": 70, "pazar_buyuklugu_milyar": 45.2}',
 'taslak');

-- Demo loglar
INSERT INTO sistem_loglari (kullanici_id, islem_tipi, detay, seviye) VALUES
(1, 'LOGIN_SUCCESS', 'Admin kullanıcısı giriş yaptı', 'info'),
(1, 'ANALYSIS_CREATE', 'Türkiye Pazar Analizi oluşturuldu', 'info'),
(2, 'ANALYSIS_CREATE', 'Çin Fırsat Analizi oluşturuldu', 'info'),
(1, 'ANALYSIS_COMPLETE', 'ABD Trend Analizi tamamlandı', 'info'),
(NULL, 'SYSTEM_START', 'Sistem başlatıldı', 'info');

-- =============================================
-- TAMAMLANDI
-- =============================================
SELECT 'Veritabanı şeması ve demo veriler başarıyla oluşturuldu!' AS Mesaj;
