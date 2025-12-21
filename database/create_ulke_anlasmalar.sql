-- Ülke-Anlaşma İlişki Tablosu
USE kds_proje;

-- Tablo oluştur
CREATE TABLE IF NOT EXISTS ulke_anlasmalar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ulke_id INT NOT NULL,
    anlasma_id INT NOT NULL,
    FOREIGN KEY (ulke_id) REFERENCES ulkeler(ulke_id) ON DELETE CASCADE,
    FOREIGN KEY (anlasma_id) REFERENCES anlasma_tipleri(anlasma_id) ON DELETE CASCADE,
    UNIQUE KEY unique_ulke_anlasma (ulke_id, anlasma_id),
    INDEX idx_ulke (ulke_id),
    INDEX idx_anlasma (anlasma_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek veriler ekle (bazı ülkelere anlaşmalar ata)
-- AB anlaşması olan ülkeler (anlasma_id = 1 varsayımı)
INSERT IGNORE INTO ulke_anlasmalar (ulke_id, anlasma_id) 
SELECT ulke_id, 1 FROM ulkeler 
WHERE ISO_KODU IN ('DE', 'FR', 'IT', 'ES', 'NL', 'PL') 
LIMIT 6;

-- EFTA anlaşması olan ülkeler (anlasma_id = 2 varsayımı)
INSERT IGNORE INTO ulke_anlasmalar (ulke_id, anlasma_id) 
SELECT ulke_id, 2 FROM ulkeler 
WHERE ISO_KODU IN ('CH', 'NO', 'IS', 'LI')
LIMIT 4;

-- STA anlaşması olan ülkeler (anlasma_id = 3 varsayımı)
INSERT IGNORE INTO ulke_anlasmalar (ulke_id, anlasma_id) 
SELECT ulke_id, 3 FROM ulkeler 
WHERE ISO_KODU IN ('TR', 'GB', 'KR', 'JP')
LIMIT 4;

SELECT 'ulke_anlasmalar tablosu başarıyla oluşturuldu!' AS Mesaj;
