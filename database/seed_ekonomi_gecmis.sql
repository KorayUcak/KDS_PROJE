-- =============================================
-- KDS - Ekonomi Geçmişi Örnek Verileri
-- 17 Ülke için 2018-2023 Dönemi
-- =============================================

-- Önce tabloyu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS ekonomi_gecmis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ulke_id INT NOT NULL,
    yil INT NOT NULL,
    toplam_gsyh_milyar_dolar DECIMAL(15,2),
    gsyh_kisi_basi_usd DECIMAL(15,2),
    buyume_orani_yuzde DECIMAL(5,2),
    enflasyon_orani_yuzde DECIMAL(5,2),
    issizlik_orani_yuzde DECIMAL(5,2),
    toplam_ihracat_milyar_dolar DECIMAL(15,2),
    toplam_ithalat_milyar_dolar DECIMAL(15,2),
    nufus_milyon DECIMAL(10,2),
    FOREIGN KEY (ulke_id) REFERENCES ulkeler(ulke_id),
    UNIQUE KEY unique_ulke_yil (ulke_id, yil),
    INDEX idx_ulke (ulke_id),
    INDEX idx_yil (yil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mevcut verileri temizle
DELETE FROM ekonomi_gecmis;

-- =============================================
-- TÜRKİYE (ulke_id = 1)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(1, 2018, 778.00, 9454, 3.0, 16.3, 11.0, 168.0, 223.0, 82.3),
(1, 2019, 761.00, 9127, 0.9, 15.2, 13.7, 171.0, 210.0, 83.4),
(1, 2020, 720.00, 8538, 1.8, 12.3, 13.1, 169.0, 219.0, 84.3),
(1, 2021, 819.00, 9587, 11.4, 19.6, 12.0, 225.0, 271.0, 85.0),
(1, 2022, 906.00, 10500, 5.5, 72.3, 10.4, 254.0, 364.0, 85.3),
(1, 2023, 1108.00, 12800, 4.5, 53.9, 9.4, 256.0, 362.0, 85.8);

-- =============================================
-- ALMANYA (ulke_id = 2)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(2, 2018, 3963.00, 47603, 1.1, 1.9, 3.4, 1561.0, 1286.0, 83.0),
(2, 2019, 3889.00, 46468, 1.1, 1.4, 3.1, 1489.0, 1234.0, 83.5),
(2, 2020, 3889.00, 46208, -3.7, 0.4, 3.8, 1380.0, 1172.0, 83.8),
(2, 2021, 4259.00, 50802, 2.6, 3.2, 3.6, 1631.0, 1419.0, 83.9),
(2, 2022, 4082.00, 48756, 1.8, 8.7, 3.1, 1655.0, 1571.0, 84.1),
(2, 2023, 4456.00, 53000, 0.3, 5.9, 3.0, 1700.0, 1550.0, 84.4);

-- =============================================
-- ABD (ulke_id = 3)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(3, 2018, 20580.00, 62823, 2.9, 2.4, 3.9, 1664.0, 2614.0, 327.0),
(3, 2019, 21433.00, 65052, 2.3, 1.8, 3.7, 1643.0, 2567.0, 329.0),
(3, 2020, 21060.00, 63544, -2.8, 1.2, 8.1, 1424.0, 2407.0, 331.0),
(3, 2021, 23315.00, 70249, 5.9, 4.7, 5.4, 1754.0, 2935.0, 332.0),
(3, 2022, 25462.00, 76330, 2.1, 8.0, 3.6, 2065.0, 3276.0, 333.0),
(3, 2023, 27000.00, 80500, 2.5, 4.1, 3.7, 2100.0, 3200.0, 335.0);

-- =============================================
-- ÇİN (ulke_id = 4)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(4, 2018, 13894.00, 9977, 6.7, 2.1, 3.8, 2487.0, 2136.0, 1393.0),
(4, 2019, 14280.00, 10217, 6.0, 2.9, 3.6, 2499.0, 2078.0, 1398.0),
(4, 2020, 14722.00, 10500, 2.2, 2.5, 4.2, 2590.0, 2056.0, 1402.0),
(4, 2021, 17734.00, 12551, 8.4, 0.9, 4.0, 3364.0, 2688.0, 1412.0),
(4, 2022, 17963.00, 12720, 3.0, 2.0, 4.3, 3594.0, 2716.0, 1412.0),
(4, 2023, 17700.00, 12600, 5.2, 0.2, 5.2, 3380.0, 2560.0, 1410.0);

-- =============================================
-- İNGİLTERE (ulke_id = 5)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(5, 2018, 2828.00, 42491, 1.4, 2.5, 4.0, 487.0, 674.0, 66.5),
(5, 2019, 2833.00, 42354, 1.6, 1.8, 3.8, 469.0, 692.0, 66.8),
(5, 2020, 2707.00, 40285, -11.0, 0.9, 4.5, 403.0, 634.0, 67.1),
(5, 2021, 3131.00, 46510, 7.6, 2.6, 4.5, 468.0, 693.0, 67.3),
(5, 2022, 3070.00, 45461, 4.3, 9.1, 3.7, 505.0, 731.0, 67.5),
(5, 2023, 3300.00, 48700, 0.5, 7.3, 4.2, 520.0, 750.0, 67.7);

-- =============================================
-- FRANSA (ulke_id = 6)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(6, 2018, 2790.00, 41464, 1.8, 2.1, 9.0, 582.0, 673.0, 67.3),
(6, 2019, 2729.00, 40494, 1.8, 1.3, 8.4, 570.0, 651.0, 67.4),
(6, 2020, 2639.00, 39030, -7.9, 0.5, 8.0, 488.0, 582.0, 67.6),
(6, 2021, 2957.00, 43659, 6.8, 2.1, 7.9, 585.0, 714.0, 67.7),
(6, 2022, 2782.00, 41000, 2.5, 5.9, 7.3, 625.0, 780.0, 67.8),
(6, 2023, 3000.00, 44200, 0.9, 4.9, 7.1, 640.0, 760.0, 67.9);

-- =============================================
-- HİNDİSTAN (ulke_id = 7)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(7, 2018, 2702.00, 2010, 6.5, 3.4, 5.3, 324.0, 514.0, 1353.0),
(7, 2019, 2870.00, 2100, 3.9, 4.8, 5.3, 323.0, 478.0, 1366.0),
(7, 2020, 2671.00, 1930, -6.6, 6.2, 7.1, 291.0, 394.0, 1380.0),
(7, 2021, 3150.00, 2240, 8.7, 5.5, 5.8, 395.0, 573.0, 1393.0),
(7, 2022, 3385.00, 2380, 7.2, 6.7, 4.8, 453.0, 714.0, 1407.0),
(7, 2023, 3700.00, 2600, 7.8, 5.4, 4.5, 480.0, 720.0, 1420.0);

-- =============================================
-- JAPONYA (ulke_id = 8)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(8, 2018, 4971.00, 39290, 0.6, 1.0, 2.4, 738.0, 748.0, 126.5),
(8, 2019, 5082.00, 40247, 0.0, 0.5, 2.4, 706.0, 721.0, 126.3),
(8, 2020, 5040.00, 40048, -4.3, 0.0, 2.8, 641.0, 635.0, 125.8),
(8, 2021, 4940.00, 39340, 2.1, -0.2, 2.8, 756.0, 773.0, 125.5),
(8, 2022, 4231.00, 33815, 1.0, 2.5, 2.6, 747.0, 898.0, 125.1),
(8, 2023, 4200.00, 33700, 1.9, 3.2, 2.6, 760.0, 880.0, 124.5);

-- =============================================
-- GÜNEY KORE (ulke_id = 9)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(9, 2018, 1725.00, 33423, 2.9, 1.5, 3.8, 605.0, 535.0, 51.6),
(9, 2019, 1651.00, 31937, 2.2, 0.4, 3.8, 542.0, 503.0, 51.7),
(9, 2020, 1644.00, 31762, -0.7, 0.5, 4.0, 513.0, 467.0, 51.8),
(9, 2021, 1810.00, 35004, 4.1, 2.5, 3.7, 644.0, 615.0, 51.7),
(9, 2022, 1673.00, 32418, 2.6, 5.1, 2.9, 684.0, 731.0, 51.6),
(9, 2023, 1700.00, 33000, 1.4, 3.6, 2.7, 650.0, 680.0, 51.5);

-- =============================================
-- İTALYA (ulke_id = 10)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(10, 2018, 2092.00, 34619, 0.9, 1.2, 10.6, 547.0, 501.0, 60.4),
(10, 2019, 2005.00, 33228, 0.5, 0.6, 9.9, 533.0, 474.0, 60.3),
(10, 2020, 1896.00, 31676, -9.0, -0.1, 9.3, 480.0, 422.0, 59.9),
(10, 2021, 2114.00, 35657, 7.0, 1.9, 9.5, 610.0, 567.0, 59.3),
(10, 2022, 2010.00, 34085, 3.7, 8.7, 8.1, 656.0, 692.0, 59.0),
(10, 2023, 2200.00, 37400, 0.7, 5.7, 7.6, 680.0, 670.0, 58.8);

-- =============================================
-- RUSYA (ulke_id = 11)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(11, 2018, 1657.00, 11289, 2.8, 2.9, 4.8, 450.0, 238.0, 146.8),
(11, 2019, 1693.00, 11585, 2.0, 4.5, 4.6, 422.0, 244.0, 146.2),
(11, 2020, 1483.00, 10127, -2.7, 3.4, 5.8, 337.0, 232.0, 145.9),
(11, 2021, 1778.00, 12173, 5.6, 6.7, 4.8, 494.0, 296.0, 145.6),
(11, 2022, 2240.00, 15345, -2.1, 13.8, 3.9, 588.0, 259.0, 145.2),
(11, 2023, 1900.00, 13100, 3.6, 5.9, 3.2, 420.0, 280.0, 144.8);

-- =============================================
-- AVUSTRALYA (ulke_id = 12)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(12, 2018, 1433.00, 57305, 2.8, 1.9, 5.3, 257.0, 236.0, 25.0),
(12, 2019, 1396.00, 55060, 1.9, 1.6, 5.2, 271.0, 221.0, 25.4),
(12, 2020, 1331.00, 51812, -0.3, 0.9, 6.5, 251.0, 212.0, 25.7),
(12, 2021, 1553.00, 59934, 5.2, 2.8, 5.1, 342.0, 261.0, 25.9),
(12, 2022, 1675.00, 64491, 3.7, 6.6, 3.5, 405.0, 298.0, 26.0),
(12, 2023, 1700.00, 65000, 2.1, 5.6, 3.7, 380.0, 310.0, 26.2);

-- =============================================
-- BREZİLYA (ulke_id = 13)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(13, 2018, 1885.00, 9001, 1.8, 3.7, 12.3, 239.0, 181.0, 209.5),
(13, 2019, 1877.00, 8897, 1.2, 3.7, 11.9, 224.0, 177.0, 211.0),
(13, 2020, 1445.00, 6797, -3.3, 3.2, 13.5, 209.0, 158.0, 212.6),
(13, 2021, 1649.00, 7707, 5.0, 8.3, 13.2, 280.0, 219.0, 214.0),
(13, 2022, 1920.00, 8917, 2.9, 9.3, 9.3, 334.0, 272.0, 215.3),
(13, 2023, 2100.00, 9700, 2.9, 4.6, 7.8, 340.0, 260.0, 216.4);

-- =============================================
-- İSPANYA (ulke_id = 14)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(14, 2018, 1426.00, 30524, 2.3, 1.7, 15.3, 345.0, 378.0, 46.7),
(14, 2019, 1394.00, 29614, 2.1, 0.7, 14.1, 334.0, 366.0, 47.1),
(14, 2020, 1281.00, 27057, -11.3, -0.3, 15.5, 296.0, 309.0, 47.4),
(14, 2021, 1427.00, 30103, 5.5, 3.0, 14.8, 378.0, 403.0, 47.4),
(14, 2022, 1397.00, 29350, 5.5, 8.3, 12.9, 420.0, 468.0, 47.6),
(14, 2023, 1500.00, 31400, 2.5, 3.4, 11.7, 440.0, 460.0, 47.8);

-- =============================================
-- HOLLANDA (ulke_id = 15)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(15, 2018, 914.00, 53106, 2.4, 1.6, 3.8, 723.0, 643.0, 17.2),
(15, 2019, 909.00, 52448, 2.0, 2.7, 3.4, 709.0, 636.0, 17.3),
(15, 2020, 913.00, 52397, -3.9, 1.1, 3.8, 674.0, 595.0, 17.4),
(15, 2021, 1018.00, 58061, 4.9, 2.8, 4.2, 836.0, 757.0, 17.5),
(15, 2022, 991.00, 56489, 4.3, 11.6, 3.5, 941.0, 876.0, 17.6),
(15, 2023, 1100.00, 62500, 0.3, 4.1, 3.6, 920.0, 850.0, 17.6);

-- =============================================
-- POLONYA (ulke_id = 16)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(16, 2018, 586.00, 15424, 5.4, 1.6, 3.9, 261.0, 267.0, 38.0),
(16, 2019, 596.00, 15693, 4.7, 2.3, 3.3, 264.0, 263.0, 38.0),
(16, 2020, 599.00, 15803, -2.0, 3.4, 3.2, 271.0, 264.0, 37.9),
(16, 2021, 679.00, 17999, 6.8, 5.1, 3.4, 338.0, 339.0, 37.7),
(16, 2022, 688.00, 18232, 5.1, 14.4, 2.9, 352.0, 378.0, 37.8),
(16, 2023, 850.00, 22500, 0.2, 11.4, 2.8, 380.0, 370.0, 37.8);

-- =============================================
-- BAE (ulke_id = 17)
-- =============================================
INSERT INTO ekonomi_gecmis (ulke_id, yil, toplam_gsyh_milyar_dolar, gsyh_kisi_basi_usd, buyume_orani_yuzde, enflasyon_orani_yuzde, issizlik_orani_yuzde, toplam_ihracat_milyar_dolar, toplam_ithalat_milyar_dolar, nufus_milyon) VALUES
(17, 2018, 422.00, 43005, 1.2, 3.1, 2.6, 317.0, 261.0, 9.8),
(17, 2019, 421.00, 43103, 3.4, -1.9, 2.5, 314.0, 262.0, 9.8),
(17, 2020, 359.00, 36285, -4.8, -2.1, 3.2, 269.0, 227.0, 9.9),
(17, 2021, 415.00, 41476, 3.9, 0.2, 3.1, 335.0, 276.0, 10.0),
(17, 2022, 507.00, 50349, 7.9, 4.8, 2.9, 422.0, 324.0, 10.1),
(17, 2023, 500.00, 49500, 3.4, 3.1, 2.8, 430.0, 340.0, 10.1);

-- Kontrol sorgusu
SELECT CONCAT('Toplam ', COUNT(*), ' ekonomi geçmişi kaydı eklendi.') AS Sonuc FROM ekonomi_gecmis;
SELECT ulke_id, COUNT(*) as kayit_sayisi FROM ekonomi_gecmis GROUP BY ulke_id ORDER BY ulke_id;
