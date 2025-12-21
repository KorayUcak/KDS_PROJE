-- KDS Projesi - Trigger'lar
-- Veritabanı: kds_proje
-- Kullanıcı: root / Şifre: root

USE kds_proje;

-- ===========================================
-- TRIGGER 2: Ekonomi Verisi Güncelleme Takibi
-- ===========================================
-- Ekonomi verileri güncellendiğinde sistem loguna kayıt atar

DELIMITER $$

CREATE TRIGGER trg_ekonomi_guncelleme_log
AFTER UPDATE ON ekonomi_guncel
FOR EACH ROW
BEGIN
    -- Güncelleme logunu sistem_loglari tablosuna ekle
    INSERT INTO sistem_loglari (log_tipi, mesaj, olusturulma_tarihi)
    VALUES (
        'EKONOMI_UPDATE',
        CONCAT('Ekonomi verisi güncellendi - Ülke ID: ', NEW.ulke_id, 
               ', Büyüme: ', NEW.buyume_orani_yuzde, '%'),
        NOW()
    );
END$$

DELIMITER ;

-- ===========================================
-- TRIGGER 3: Anlaşma-Ülke İlişkisi Kontrolü
-- ===========================================
-- Yeni ülke-anlaşma ilişkisi eklenirken duplicate kontrolü yapar
-- Aynı ülke-anlaşma kombinasyonu varsa hata verir

DELIMITER $$

CREATE TRIGGER trg_ulke_anlasma_duplicate_kontrol
BEFORE INSERT ON ulke_anlasmalari
FOR EACH ROW
BEGIN
    DECLARE duplicate_count INT;
    
    -- Aynı ülke_id ve anlasma_id kombinasyonu var mı kontrol et
    SELECT COUNT(*) INTO duplicate_count
    FROM ulke_anlasmalari
    WHERE ulke_id = NEW.ulke_id 
      AND anlasma_id = NEW.anlasma_id;
    
    -- Eğer varsa hata fırlat
    IF duplicate_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu ülke-anlaşma ilişkisi zaten mevcut!';
    END IF;
END$$

DELIMITER ;

-- ===========================================
-- Trigger'ları Kontrol Et
-- ===========================================

-- Mevcut trigger'ları listele
SHOW TRIGGERS FROM kds_proje;

-- ===========================================
-- Test Komutları (Yorum satırı olarak)
-- ===========================================

-- Test 2: Ekonomi verisini güncelle (trigger otomatik guncelleme_tarihi ekler)
-- UPDATE ekonomi_guncel SET buyume_orani_yuzde = 3.5 WHERE ulke_id = 1;
-- SELECT ulke_id, buyume_orani_yuzde, guncelleme_tarihi FROM ekonomi_guncel WHERE ulke_id = 1;

-- Test 3: Duplicate ülke-anlaşma ilişkisi eklemeye çalış (hata vermeli)
-- INSERT INTO ulke_anlasmalari (ulke_id, anlasma_id) VALUES (1, 1);
-- INSERT INTO ulke_anlasmalari (ulke_id, anlasma_id) VALUES (1, 1); -- Bu hata verecek

SELECT 'Trigger\'lar başarıyla oluşturuldu!' AS Mesaj;
