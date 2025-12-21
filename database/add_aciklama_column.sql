-- Add aciklama column to kayitli_analizler table
USE kds_proje;

ALTER TABLE kayitli_analizler 
ADD COLUMN aciklama TEXT NULL AFTER yonetici_notu;

SELECT 'aciklama sütunu başarıyla eklendi!' AS Mesaj;
