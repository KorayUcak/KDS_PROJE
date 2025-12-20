-- =============================================
-- KDS - Lojistik Verileri ve Anlaşma Tipleri
-- 17 Ülke için Lojistik Performans ve Ticaret Anlaşmaları
-- =============================================

USE kds_proje;

-- =============================================
-- 1. ANLAŞMA TİPLERİ TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS anlasma_tipleri (
    anlasma_id INT AUTO_INCREMENT PRIMARY KEY,
    anlasma_adi VARCHAR(100) NOT NULL,
    anlasma_kodu VARCHAR(20) NOT NULL UNIQUE,
    aciklama TEXT,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kod (anlasma_kodu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Anlaşma tiplerini ekle
INSERT INTO anlasma_tipleri (anlasma_adi, anlasma_kodu, aciklama) VALUES
('Gümrük Birliği', 'GB', 'AB ile Gümrük Birliği anlaşması - Sanayi ürünlerinde gümrük vergisi yok'),
('Serbest Ticaret Anlaşması', 'STA', 'İkili veya çok taraflı serbest ticaret anlaşması'),
('Tercihli Ticaret Anlaşması', 'TTA', 'Belirli ürün gruplarında indirimli tarife'),
('Standart Tarife', 'STD', 'MFN (En Çok Kayırılan Ülke) tarifesi uygulanır'),
('AB Üyesi', 'AB', 'Avrupa Birliği tam üyeliği - Tek pazar'),
('EFTA Üyesi', 'EFTA', 'Avrupa Serbest Ticaret Birliği üyesi')
ON DUPLICATE KEY UPDATE anlasma_adi = VALUES(anlasma_adi);

-- =============================================
-- 2. LOJİSTİK VERİLERİ TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS lojistik_verileri (
    lojistik_id INT AUTO_INCREMENT PRIMARY KEY,
    ulke_id INT NOT NULL,
    anlasma_id INT,
    lpi_skoru DECIMAL(3,2) COMMENT 'Lojistik Performans Endeksi (1-5)',
    gumruk_bekleme_suresi_gun DECIMAL(5,1) COMMENT 'Ortalama gümrük bekleme süresi (gün)',
    konteyner_ihracat_maliyeti_usd DECIMAL(10,2) COMMENT '20ft konteyner ihracat maliyeti (USD)',
    liman_altyapi_skoru DECIMAL(3,2) COMMENT 'Liman altyapı kalitesi (1-5)',
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ulke_id) REFERENCES ulkeler(ulke_id) ON DELETE CASCADE,
    FOREIGN KEY (anlasma_id) REFERENCES anlasma_tipleri(anlasma_id) ON DELETE SET NULL,
    UNIQUE KEY unique_ulke (ulke_id),
    INDEX idx_ulke (ulke_id),
    INDEX idx_anlasma (anlasma_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mevcut verileri temizle
DELETE FROM lojistik_verileri;

-- =============================================
-- LOJİSTİK VERİLERİNİ EKLE
-- =============================================
-- Türkiye (ulke_id=1) - Gümrük Birliği
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(1, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'GB'), 3.15, 2.5, 575, 3.8);

-- Almanya (ulke_id=2) - AB Üyesi
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(2, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'AB'), 4.20, 1.0, 1050, 4.5);

-- ABD (ulke_id=3) - Standart Tarife
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(3, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STD'), 3.89, 1.5, 1090, 4.2);

-- Çin (ulke_id=4) - Standart Tarife
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(4, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STD'), 3.61, 2.0, 620, 4.0);

-- İngiltere (ulke_id=5) - STA
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(5, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STA'), 3.99, 1.2, 1095, 4.3);

-- Fransa (ulke_id=6) - AB Üyesi
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(6, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'AB'), 3.84, 1.1, 1180, 4.1);

-- Hindistan (ulke_id=7) - Standart Tarife
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(7, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STD'), 3.18, 3.5, 420, 3.2);

-- Japonya (ulke_id=8) - Standart Tarife
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(8, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STD'), 4.03, 1.0, 1150, 4.4);

-- Güney Kore (ulke_id=9) - STA
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(9, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STA'), 3.61, 1.3, 680, 4.0);

-- İtalya (ulke_id=10) - AB Üyesi
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(10, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'AB'), 3.74, 1.4, 1145, 3.9);

-- Rusya (ulke_id=11) - Standart Tarife
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(11, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STD'), 2.76, 4.5, 1850, 2.8);

-- Avustralya (ulke_id=12) - STA
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(12, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STA'), 3.75, 1.5, 1320, 4.0);

-- Brezilya (ulke_id=13) - Standart Tarife
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(13, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STD'), 2.99, 5.0, 2215, 2.9);

-- İspanya (ulke_id=14) - AB Üyesi
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(14, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'AB'), 3.72, 1.3, 1190, 4.0);

-- Hollanda (ulke_id=15) - AB Üyesi
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(15, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'AB'), 4.02, 0.8, 1040, 4.6);

-- Polonya (ulke_id=16) - AB Üyesi
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(16, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'AB'), 3.54, 1.8, 890, 3.6);

-- BAE (ulke_id=17) - STA
INSERT INTO lojistik_verileri (ulke_id, anlasma_id, lpi_skoru, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd, liman_altyapi_skoru) VALUES
(17, (SELECT anlasma_id FROM anlasma_tipleri WHERE anlasma_kodu = 'STA'), 3.96, 1.2, 685, 4.4);

-- Kontrol sorgusu
SELECT CONCAT('Toplam ', COUNT(*), ' lojistik verisi eklendi.') AS Sonuc FROM lojistik_verileri;
SELECT 
    u.ulke_adi, 
    l.lpi_skoru, 
    l.gumruk_bekleme_suresi_gun,
    l.konteyner_ihracat_maliyeti_usd,
    a.anlasma_adi
FROM lojistik_verileri l
JOIN ulkeler u ON l.ulke_id = u.ulke_id
LEFT JOIN anlasma_tipleri a ON l.anlasma_id = a.anlasma_id
ORDER BY u.ulke_adi;
