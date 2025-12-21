-- Ülke-Anlaşma İlişkilerini Güncelle
USE kds_proje;

-- Önce mevcut verileri temizle
TRUNCATE TABLE ulke_anlasmalar;

-- Gümrük Birliği (GB) - anlasma_id = 1
-- AB ülkeleri
INSERT INTO ulke_anlasmalar (ulke_id, anlasma_id) VALUES
(2, 1),  -- Almanya
(7, 1),  -- Fransa
(8, 1),  -- İtalya
(12, 1), -- İspanya
(14, 1), -- Hollanda
(17, 1); -- Polonya

-- Serbest Ticaret Anlaşması (STA) - anlasma_id = 2
-- Türkiye'nin STA'sı olan ülkeler
INSERT INTO ulke_anlasmalar (ulke_id, anlasma_id) VALUES
(1, 2),  -- Türkiye
(6, 2),  -- İngiltere
(5, 2),  -- Güney Kore
(3, 2),  -- ABD
(4, 2),  -- Çin
(10, 2), -- Hindistan
(13, 2), -- Brezilya
(9, 2),  -- Rusya
(16, 2), -- Avustralya
(15, 2), -- BAE
(11, 2); -- Mısır

SELECT 'Ülke-anlaşma ilişkileri başarıyla güncellendi!' AS Mesaj;
SELECT anlasma_id, COUNT(*) as ulke_sayisi FROM ulke_anlasmalar GROUP BY anlasma_id;
