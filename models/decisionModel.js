const { pool } = require('../config/db');
const AdvancedMetricsSimulator = require('../utils/advancedMetricsSimulator');
const UnifiedScoringEngine = require('../utils/unifiedScoringEngine');

/**
 * Decision Support Model
 * Karar Destek Sistemi için skorlama ve analiz algoritmaları
 */
class DecisionModel {
  /**
   * Seçilen sektör için tüm ülkeleri skorla ve sırala
   * @param {number} sektorId - Seçilen sektör ID'si
   * @param {object} weights - Kullanıcının belirlediği ağırlıklar
   * @returns {Array} - Skorlanmış ve sıralanmış ülke listesi
   */
  static async getCountryRankings(sektorId, weights = {}) {
    try {
      // Varsayılan ağırlıklar
      const defaultWeights = {
        marketPotential: 30,      // Pazar potansiyeli (ithalat talebi)
        economicStability: 25,    // Ekonomik istikrar
        logisticsEase: 25,        // Lojistik kolaylığı
        sectorGrowth: 20          // Sektörel büyüme
      };

      const w = { ...defaultWeights, ...weights };

      // Kapsamlı veri çekme sorgusu
      const [rows] = await pool.query(`
        SELECT 
          u.ulke_id,
          u.ulke_adi,
          u.ISO_KODU,
          u.bolge_id,
          b.bolge_adi,
          
          -- Sektörel veriler
          COALESCE(usv.sektorel_ithalat_milyon_usd, 0) as sektorel_ithalat,
          COALESCE(usv.sektorel_ihracat_milyon_usd, 0) as sektorel_ihracat,
          COALESCE(usv.sektorel_buyume_orani_yuzde, 0) as sektorel_buyume,
          COALESCE(usv.yerli_uretim_karsilama_orani_yuzde, 0) as yerli_uretim_orani,
          COALESCE(usv.sektorel_yatirim_milyon_usd, 0) as sektorel_yatirim,
          
          -- Ekonomik veriler
          COALESCE(eg.toplam_gsyh_milyar_dolar, 0) as gsyh,
          COALESCE(eg.gsyh_kisi_basi_usd, 0) as gsyh_kisi_basi,
          COALESCE(eg.buyume_orani_yuzde, 0) as ekonomik_buyume,
          COALESCE(eg.enflasyon_orani_yuzde, 0) as enflasyon,
          COALESCE(eg.issizlik_orani_yuzde, 0) as issizlik,
          COALESCE(eg.toplam_ihracat_milyar_dolar, 0) as toplam_ihracat,
          COALESCE(eg.toplam_ithalat_milyar_dolar, 0) as toplam_ithalat,
          COALESCE(eg.nufus_milyon, 0) as nufus,
          COALESCE(eg.risk_notu_kodu, 'C') as risk_notu,
          
          -- Lojistik veriler
          COALESCE(lv.lpi_skoru_ham, 0) as lpi_skoru,
          COALESCE(lv.gumruk_bekleme_suresi_gun, 30) as gumruk_suresi,
          COALESCE(lv.konteyner_ihracat_maliyeti_usd, 5000) as konteyner_maliyeti,
          
          -- Anlaşma sayısı
          (SELECT COUNT(*) FROM ulke_anlasmalari ua WHERE ua.ulke_id = u.ulke_id) as anlasma_sayisi
          
        FROM ulkeler u
        LEFT JOIN bolgeler b ON u.bolge_id = b.bolge_id
        LEFT JOIN ulke_sektor_verileri usv ON u.ulke_id = usv.ulke_id AND usv.sektor_id = ?
        LEFT JOIN ekonomi_guncel eg ON u.ulke_id = eg.ulke_id
        LEFT JOIN lojistik_verileri lv ON u.ulke_id = lv.ulke_id
        ORDER BY u.ulke_adi
      `, [sektorId]);

      if (!rows.length) return [];

      // Normalizasyon için min-max değerleri hesapla
      const stats = this.calculateStats(rows);

      // Her ülke için skor hesapla
      const scoredCountries = rows.map(country => {
        const scores = this.calculateCountryScore(country, stats, w);
        return {
          ...country,
          scores,
          totalScore: scores.total,
          recommendation: this.getRecommendation(scores.total),
          riskLevel: this.getRiskLevel(country.risk_notu)
        };
      });

      // Toplam skora göre sırala (yüksekten düşüğe)
      scoredCountries.sort((a, b) => b.totalScore - a.totalScore);

      // Sıralama ekle
      scoredCountries.forEach((country, index) => {
        country.rank = index + 1;
      });

      return scoredCountries;
    } catch (error) {
      console.error('Ülke sıralaması hesaplanamadı:', error);
      throw error;
    }
  }

  /**
   * İstatistiksel değerleri hesapla (normalizasyon için)
   */
  static calculateStats(rows) {
    const getMinMax = (arr, key) => {
      const values = arr.map(r => parseFloat(r[key]) || 0).filter(v => v > 0);
      return {
        min: Math.min(...values) || 0,
        max: Math.max(...values) || 1
      };
    };

    return {
      ithalat: getMinMax(rows, 'sektorel_ithalat'),
      buyume: getMinMax(rows, 'sektorel_buyume'),
      gsyh: getMinMax(rows, 'gsyh'),
      gsyhKisiBasi: getMinMax(rows, 'gsyh_kisi_basi'),
      lpi: getMinMax(rows, 'lpi_skoru'),
      gumruk: getMinMax(rows, 'gumruk_suresi'),
      maliyet: getMinMax(rows, 'konteyner_maliyeti'),
      nufus: getMinMax(rows, 'nufus')
    };
  }

  /**
   * Ülke skorunu hesapla
   */
  static calculateCountryScore(country, stats, weights) {
    // 1. Pazar Potansiyeli Skoru (0-100)
    const ithalatNorm = this.normalize(country.sektorel_ithalat, stats.ithalat.min, stats.ithalat.max);
    const nufusNorm = this.normalize(country.nufus, stats.nufus.min, stats.nufus.max);
    const yerliUretimBonus = Math.max(0, (100 - country.yerli_uretim_orani) / 100); // Düşük yerli üretim = fırsat
    const marketPotential = (ithalatNorm * 0.5 + nufusNorm * 0.3 + yerliUretimBonus * 0.2) * 100;

    // 2. Ekonomik İstikrar Skoru (0-100)
    const gsyhNorm = this.normalize(country.gsyh_kisi_basi, stats.gsyhKisiBasi.min, stats.gsyhKisiBasi.max);
    const riskScore = this.riskToScore(country.risk_notu);
    const enflasyonPenalty = Math.max(0, 1 - (country.enflasyon / 50)); // Yüksek enflasyon ceza
    const economicStability = (gsyhNorm * 0.4 + riskScore * 0.4 + enflasyonPenalty * 0.2) * 100;

    // 3. Lojistik Kolaylığı Skoru (0-100)
    const lpiNorm = this.normalize(country.lpi_skoru, stats.lpi.min, stats.lpi.max);
    const gumrukNorm = 1 - this.normalize(country.gumruk_suresi, stats.gumruk.min, stats.gumruk.max); // Düşük = iyi
    const maliyetNorm = 1 - this.normalize(country.konteyner_maliyeti, stats.maliyet.min, stats.maliyet.max); // Düşük = iyi
    const logisticsEase = (lpiNorm * 0.4 + gumrukNorm * 0.3 + maliyetNorm * 0.3) * 100;

    // 4. Sektörel Büyüme Skoru (0-100)
    const buyumeNorm = this.normalize(country.sektorel_buyume, stats.buyume.min, stats.buyume.max);
    const yatirimPotansiyel = this.normalize(country.sektorel_yatirim, 0, 1000);
    const anlasmaBonusu = Math.min(country.anlasma_sayisi * 10, 30) / 100; // Max %30 bonus
    const sectorGrowth = (buyumeNorm * 0.5 + yatirimPotansiyel * 0.3 + anlasmaBonusu * 0.2) * 100;

    // Toplam Skor (ağırlıklı ortalama)
    const total = (
      marketPotential * (weights.marketPotential / 100) +
      economicStability * (weights.economicStability / 100) +
      logisticsEase * (weights.logisticsEase / 100) +
      sectorGrowth * (weights.sectorGrowth / 100)
    );

    return {
      marketPotential: Math.round(marketPotential * 10) / 10,
      economicStability: Math.round(economicStability * 10) / 10,
      logisticsEase: Math.round(logisticsEase * 10) / 10,
      sectorGrowth: Math.round(sectorGrowth * 10) / 10,
      total: Math.round(total * 10) / 10
    };
  }

  /**
   * Min-Max normalizasyon
   */
  static normalize(value, min, max) {
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /**
   * Risk notunu skora çevir
   */
  static riskToScore(riskNotu) {
    const riskScores = {
      'AAA': 1.0, 'AA+': 0.95, 'AA': 0.90, 'AA-': 0.85,
      'A+': 0.80, 'A': 0.75, 'A-': 0.70,
      'BBB+': 0.65, 'BBB': 0.60, 'BBB-': 0.55,
      'BB+': 0.50, 'BB': 0.45, 'BB-': 0.40,
      'B+': 0.35, 'B': 0.30, 'B-': 0.25,
      'CCC': 0.20, 'CC': 0.15, 'C': 0.10, 'D': 0.05
    };
    return riskScores[riskNotu] || 0.5;
  }

  /**
   * Skora göre öneri metni
   */
  static getRecommendation(score) {
    if (score >= 80) return { text: 'Çok Uygun', class: 'excellent', icon: '🌟' };
    if (score >= 65) return { text: 'Uygun', class: 'good', icon: '✅' };
    if (score >= 50) return { text: 'Potansiyel Var', class: 'moderate', icon: '📊' };
    if (score >= 35) return { text: 'Riskli', class: 'risky', icon: '⚠️' };
    return { text: 'Önerilmez', class: 'poor', icon: '❌' };
  }

  /**
   * Risk seviyesi belirleme
   */
  static getRiskLevel(riskNotu) {
    if (['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-'].includes(riskNotu)) {
      return { level: 'low', text: 'Düşük Risk', class: 'risk-low' };
    }
    if (['BBB+', 'BBB', 'BBB-', 'BB+', 'BB'].includes(riskNotu)) {
      return { level: 'medium', text: 'Orta Risk', class: 'risk-medium' };
    }
    return { level: 'high', text: 'Yüksek Risk', class: 'risk-high' };
  }

  /**
   * Tek bir ülkenin detaylı analizini getir
   */
  static async getCountryDetail(ulkeId, sektorId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          u.ulke_id,
          u.ulke_adi,
          u.ISO_KODU,
          u.latitude,
          u.longitude,
          b.bolge_adi,
          
          -- Sektörel veriler
          usv.*,
          
          -- Ekonomik veriler
          eg.*,
          
          -- Lojistik veriler
          lv.lpi_skoru_ham as lpi_skoru,
          lv.gumruk_bekleme_suresi_gun,
          lv.konteyner_ihracat_maliyeti_usd,
          
          -- Sektör adı
          s.sektor_adi
          
        FROM ulkeler u
        LEFT JOIN bolgeler b ON u.bolge_id = b.bolge_id
        LEFT JOIN ulke_sektor_verileri usv ON u.ulke_id = usv.ulke_id AND usv.sektor_id = ?
        LEFT JOIN ekonomi_guncel eg ON u.ulke_id = eg.ulke_id
        LEFT JOIN lojistik_verileri lv ON u.ulke_id = lv.ulke_id
        LEFT JOIN sektorler s ON s.sektor_id = ?
        WHERE u.ulke_id = ?
      `, [sektorId, sektorId, ulkeId]);

      if (!rows[0]) return null;

      // Ülkenin anlaşmalarını getir
      const [agreements] = await pool.query(`
        SELECT at.anlasma_adi, at.anlasma_kodu
        FROM ulke_anlasmalari ua
        JOIN anlasma_tipleri at ON ua.anlasma_id = at.anlasma_id
        WHERE ua.ulke_id = ?
      `, [ulkeId]);

      return {
        ...rows[0],
        agreements
      };
    } catch (error) {
      console.error('Ülke detayı alınamadı:', error);
      throw error;
    }
  }

  /**
   * Karşılaştırma için birden fazla ülke verisi getir (Deep Sector Intelligence)
   */
  static async compareCountries(ulkeIds, sektorId) {
    try {
      const placeholders = ulkeIds.map(() => '?').join(',');
      const [rows] = await pool.query(`
        SELECT 
          u.ulke_id,
          u.ulke_adi,
          u.ISO_KODU,
          b.bolge_adi,
          
          -- Sektörel Veriler (Deep Intelligence)
          COALESCE(usv.sektorel_ithalat_milyon_usd, 0) as sektorel_ithalat,
          COALESCE(usv.sektorel_ihracat_milyon_usd, 0) as sektorel_ihracat,
          COALESCE(usv.sektorel_buyume_orani_yuzde, 0) as sektorel_buyume,
          COALESCE(usv.yerli_uretim_karsilama_orani_yuzde, 0) as yerli_uretim_orani,
          COALESCE(usv.sektorel_yatirim_milyon_usd, 0) as sektorel_yatirim,
          COALESCE(usv.sektorel_istihdam_bin_kisi, 0) as sektorel_istihdam,
          COALESCE(usv.kapasite_veya_altyapi_degeri, 0) as kapasite_altyapi,
          
          -- Ekonomik Veriler
          COALESCE(eg.toplam_gsyh_milyar_dolar, 0) as gsyh,
          COALESCE(eg.gsyh_kisi_basi_usd, 0) as gsyh_kisi_basi,
          COALESCE(eg.nufus_milyon, 0) as nufus,
          COALESCE(eg.buyume_orani_yuzde, 0) as ekonomik_buyume,
          COALESCE(eg.enflasyon_orani_yuzde, 0) as enflasyon,
          COALESCE(eg.issizlik_orani_yuzde, 0) as issizlik,
          COALESCE(eg.risk_notu_kodu, 'C') as risk_notu,
          
          -- Lojistik Veriler
          COALESCE(lv.lpi_skoru_ham, 0) as lpi_skoru,
          COALESCE(lv.gumruk_bekleme_suresi_gun, 30) as gumruk_suresi,
          COALESCE(lv.konteyner_ihracat_maliyeti_usd, 5000) as konteyner_maliyeti,
          
          -- Anlaşma sayısı
          (SELECT COUNT(*) FROM ulke_anlasmalari ua WHERE ua.ulke_id = u.ulke_id) as anlasma_sayisi
          
        FROM ulkeler u
        LEFT JOIN bolgeler b ON u.bolge_id = b.bolge_id
        LEFT JOIN ulke_sektor_verileri usv ON u.ulke_id = usv.ulke_id AND usv.sektor_id = ?
        LEFT JOIN ekonomi_guncel eg ON u.ulke_id = eg.ulke_id
        LEFT JOIN lojistik_verileri lv ON u.ulke_id = lv.ulke_id
        WHERE u.ulke_id IN (${placeholders})
      `, [sektorId, ...ulkeIds]);

      // Her ülke için pazar fırsatı hesapla (100 - yerli üretim oranı)
      const enrichedRows = rows.map(row => ({
        ...row,
        pazar_firsati: Math.max(0, 100 - parseFloat(row.yerli_uretim_orani || 0)),
        doygunluk_seviyesi: this.getSaturationLevel(row.yerli_uretim_orani),
        toplam_adreslenebilir_pazar: (parseFloat(row.gsyh_kisi_basi || 0) * parseFloat(row.nufus || 0)) / 1000 // Milyar USD
      }));

      return enrichedRows;
    } catch (error) {
      console.error('Karşılaştırma verisi alınamadı:', error);
      throw error;
    }
  }

  /**
   * Doygunluk seviyesini belirle
   */
  static getSaturationLevel(yerliUretimOrani) {
    const oran = parseFloat(yerliUretimOrani) || 0;
    if (oran >= 80) return { level: 'high', text: 'Yüksek Doygunluk (Zor Pazar)', class: 'saturation-high', color: '#f44336' };
    if (oran >= 50) return { level: 'medium', text: 'Orta Doygunluk', class: 'saturation-medium', color: '#ffc107' };
    if (oran >= 20) return { level: 'low', text: 'Düşük Doygunluk (Fırsat)', class: 'saturation-low', color: '#00ff88' };
    return { level: 'very-low', text: 'Çok Düşük (Yüksek Fırsat)', class: 'saturation-very-low', color: '#4cc9f0' };
  }

  /**
   * Karar kaydet (kayitli_analizler tablosuna)
   * 
   * GERÇEK TABLO ŞEMASI:
   * - analiz_id (INT, PK, Auto Increment)
   * - kullanici_id (INT, FK)
   * - hedef_ulke_id (INT, FK -> ulkeler.ulke_id)
   * - hedef_sektor_id (INT, FK -> sektorler.sektor_id)
   * - hesaplanan_skor (DECIMAL)
   * - yonetici_notu (TEXT)
   * - aciklama (TEXT)
   * - olusturulma_tarihi (TIMESTAMP)
   * 
   * NOT: Mock data'daki ulke_id'ler DB'deki gerçek ID'lerle eşleşmeyebilir.
   * Bu yüzden ulke_adi'na göre gerçek ID'yi DB'den buluyoruz.
   */
  static async saveDecision(decisionData) {
    console.log('📝 [DecisionModel.saveDecision] Gelen data:', JSON.stringify(decisionData, null, 2));
    
    try {
      const {
        kullanici_id = 1, // Varsayılan kullanıcı (auth yoksa)
        ulke_id,
        ulke_adi,
        sektor_id,
        sektor_adi,
        karar_durumu,
        yonetici_notu,
        hesaplanan_skor
      } = decisionData;

      // 1. Ülke adına göre GERÇEK ulke_id'yi veritabanından bul
      let gercek_ulke_id = null;
      if (ulke_adi) {
        console.log('🔍 [DecisionModel.saveDecision] Ülke adı ile DB\'de arama:', ulke_adi);
        
        const [ulkeRows] = await pool.query(
          'SELECT ulke_id FROM ulkeler WHERE ulke_adi = ? OR ulke_adi LIKE ? LIMIT 1',
          [ulke_adi, `%${ulke_adi}%`]
        );
        
        if (ulkeRows.length > 0) {
          gercek_ulke_id = ulkeRows[0].ulke_id;
          console.log('✅ [DecisionModel.saveDecision] DB\'de ülke bulundu:', { ulke_adi, gercek_ulke_id });
        } else {
          console.log('⚠️ [DecisionModel.saveDecision] Ülke DB\'de bulunamadı, NULL olarak kaydedilecek');
        }
      }

      // 2. Sektör adına göre GERÇEK sektor_id'yi veritabanından bul
      let gercek_sektor_id = sektor_id;
      if (sektor_adi && !sektor_id) {
        console.log('🔍 [DecisionModel.saveDecision] Sektör adı ile DB\'de arama:', sektor_adi);
        
        const [sektorRows] = await pool.query(
          'SELECT sektor_id FROM sektorler WHERE sektor_adi = ? OR sektor_adi LIKE ? LIMIT 1',
          [sektor_adi, `%${sektor_adi}%`]
        );
        
        if (sektorRows.length > 0) {
          gercek_sektor_id = sektorRows[0].sektor_id;
          console.log('✅ [DecisionModel.saveDecision] DB\'de sektör bulundu:', { sektor_adi, gercek_sektor_id });
        }
      }

      // aciklama alanı = karar durumu + ülke/sektör bilgisi
      const aciklama = `[${karar_durumu || 'Değerlendirme'}] ${ulke_adi || 'Ülke'} - ${sektor_adi || 'Genel'}`;

      console.log('🔄 [DecisionModel.saveDecision] SQL parametreleri:', {
        kullanici_id,
        hedef_ulke_id: gercek_ulke_id,
        hedef_sektor_id: gercek_sektor_id,
        hesaplanan_skor,
        aciklama
      });

      // INSERT - Gerçek şemaya uygun (DB'den bulunan ID'lerle)
      const [result] = await pool.query(`
        INSERT INTO kayitli_analizler 
        (kullanici_id, hedef_ulke_id, hedef_sektor_id, hesaplanan_skor, yonetici_notu, aciklama)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        kullanici_id,
        gercek_ulke_id,  // Mock ID yerine DB'deki gerçek ID
        gercek_sektor_id || null,
        hesaplanan_skor || 0,
        yonetici_notu || '',
        aciklama
      ]);

      console.log('✅ [DecisionModel.saveDecision] INSERT başarılı, ID:', result.insertId);

      return {
        success: true,
        id: result.insertId,
        message: 'Karar başarıyla kaydedildi',
        saved_ulke_id: gercek_ulke_id,
        saved_sektor_id: gercek_sektor_id
      };
    } catch (error) {
      console.error('❌ [DecisionModel.saveDecision] Hata:', error.message);
      console.error('SQL State:', error.sqlState);
      console.error('SQL:', error.sql);
      throw error;
    }
  }

  /**
   * Kayıtlı kararları getir (tüm analizler)
   */
  static async getSavedDecisions(kullaniciId = null, limit = 50) {
    try {
      const query = `
        SELECT 
          a.analiz_id as id,
          a.kullanici_id,
          a.hedef_ulke_id,
          a.hedef_sektor_id,
          a.hesaplanan_skor,
          a.yonetici_notu,
          a.aciklama,
          a.olusturulma_tarihi,
          u.ulke_adi,
          s.sektor_adi
        FROM kayitli_analizler a
        LEFT JOIN ulkeler u ON a.hedef_ulke_id = u.ulke_id
        LEFT JOIN sektorler s ON a.hedef_sektor_id = s.sektor_id
        ORDER BY a.olusturulma_tarihi DESC
        LIMIT ?
      `;

      const [rows] = await pool.query(query, [limit]);
      
      return rows.map(row => ({
        ...row,
        kullanici_adi: 'Admin'
      }));
    } catch (error) {
      console.error('Kayıtlı kararlar alınamadı:', error);
      return [];
    }
  }

  /**
   * Tek bir karar getir (ID ile)
   */
  static async getDecisionById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          a.analiz_id as id,
          a.kullanici_id,
          a.hedef_ulke_id,
          a.hedef_sektor_id,
          a.hesaplanan_skor,
          a.yonetici_notu,
          a.aciklama,
          a.olusturulma_tarihi,
          u.ulke_adi,
          s.sektor_adi
        FROM kayitli_analizler a
        LEFT JOIN ulkeler u ON a.hedef_ulke_id = u.ulke_id
        LEFT JOIN sektorler s ON a.hedef_sektor_id = s.sektor_id
        WHERE a.analiz_id = ?
      `, [id]);

      if (!rows[0]) return null;

      return {
        ...rows[0],
        kullanici_adi: 'Admin'
      };
    } catch (error) {
      console.error('Karar bulunamadı:', error);
      return null;
    }
  }

  /**
   * Karar notunu güncelle
   */
  static async updateDecisionStatus(id, newNote) {
    try {
      const [result] = await pool.query(`
        UPDATE kayitli_analizler 
        SET yonetici_notu = ?
        WHERE analiz_id = ?
      `, [newNote, id]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Not güncellenemedi:', error);
      throw error;
    }
  }

  /**
   * Kararı sil
   */
  static async deleteDecision(id) {
    try {
      const [result] = await pool.query(`
        DELETE FROM kayitli_analizler WHERE analiz_id = ?
      `, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Karar silinemedi:', error);
      throw error;
    }
  }

  /**
   * Karar istatistiklerini getir
   */
  static async getDecisionStats() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          COUNT(*) as toplam,
          AVG(hesaplanan_skor) as ortalama_skor,
          MAX(hesaplanan_skor) as max_skor,
          MIN(hesaplanan_skor) as min_skor
        FROM kayitli_analizler
      `);
      
      return {
        toplam: rows[0]?.toplam || 0,
        ortalama_skor: Math.round(rows[0]?.ortalama_skor || 0),
        max_skor: rows[0]?.max_skor || 0,
        min_skor: rows[0]?.min_skor || 0
      };
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
      return { toplam: 0, ortalama_skor: 0, max_skor: 0, min_skor: 0 };
    }
  }

  /**
   * Sektör özeti getir
   */
  static async getSectorSummary(sektorId) {
    try {
      const [sectorInfo] = await pool.query(
        'SELECT * FROM sektorler WHERE sektor_id = ?',
        [sektorId]
      );

      const [stats] = await pool.query(`
        SELECT 
          COUNT(DISTINCT usv.ulke_id) as ulke_sayisi,
          SUM(usv.sektorel_ithalat_milyon_usd) as toplam_ithalat,
          SUM(usv.sektorel_ihracat_milyon_usd) as toplam_ihracat,
          AVG(usv.sektorel_buyume_orani_yuzde) as ortalama_buyume,
          SUM(usv.sektorel_istihdam_bin_kisi) as toplam_istihdam
        FROM ulke_sektor_verileri usv
        WHERE usv.sektor_id = ?
      `, [sektorId]);

      return {
        sector: sectorInfo[0],
        stats: stats[0]
      };
    } catch (error) {
      console.error('Sektör özeti alınamadı:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * ADVANCED METRICS & STRATEGIC DECISIONS
   * ==========================================
   */

  /**
   * Gelişmiş metrikleri getir (simüle edilmiş)
   */
  static getAdvancedMetrics(countryData) {
    return AdvancedMetricsSimulator.getAllAdvancedMetrics(countryData);
  }

  /**
   * 7 Stratejik Karar önerisi getir
   * Artık Birleşik Skorlama Motoru kullanılıyor
   * Bu sayede Global Skor ve 7 Karar matematiksel olarak tutarlı
   */
  static getStrategicDecisions(countryData) {
    // YENİ: Birleşik Skorlama Motoru ile tutarlı sonuçlar
    return UnifiedScoringEngine.calculateGlobalScore(countryData);
  }

  /**
   * Legacy: Eski 7 karar sistemi (geriye dönük uyumluluk için)
   */
  static getLegacyStrategicDecisions(countryData) {
    const advancedMetrics = this.getAdvancedMetrics(countryData);
    return AdvancedMetricsSimulator.getEnhancedStrategicDecisions(countryData, advancedMetrics);
  }

  /**
   * Strategy Wizard için tam veri paketi getir
   * Artık Birleşik Skorlama Motoru kullanılıyor
   */
  static async getStrategyWizardData(ulkeId, sektorId) {
    try {
      // Ülke detayını getir
      const countryDetail = await this.getCountryDetail(ulkeId, sektorId);
      if (!countryDetail) return null;

      // Sıralama bilgisini getir
      const rankings = await this.getCountryRankings(sektorId);
      const countryRank = rankings.find(r => r.ulke_id == ulkeId);

      // Gelişmiş metrikleri hesapla (legacy)
      const advancedMetrics = this.getAdvancedMetrics({
        ulke_id: ulkeId,
        bolge_id: countryDetail.bolge_id,
        risk_notu_kodu: countryDetail.risk_notu_kodu,
        gumruk_bekleme_suresi_gun: countryDetail.gumruk_bekleme_suresi_gun,
        gsyh_kisi_basi_usd: countryDetail.gsyh_kisi_basi_usd,
        nufus_milyon: countryDetail.nufus_milyon,
        latitude: countryDetail.latitude,
        longitude: countryDetail.longitude,
        yerli_uretim_karsilama_orani_yuzde: countryDetail.yerli_uretim_karsilama_orani_yuzde,
        lpi_skoru: countryDetail.lpi_skoru_ham
      });

      // YENİ: Birleşik Skorlama ile 7 Stratejik Karar
      const countryDataForScoring = {
        risk_notu_kodu: countryDetail.risk_notu_kodu,
        yerli_uretim_karsilama_orani_yuzde: countryDetail.yerli_uretim_karsilama_orani_yuzde,
        gsyh_kisi_basi_usd: countryDetail.gsyh_kisi_basi_usd,
        lpi_skoru: countryDetail.lpi_skoru_ham,
        gumruk_bekleme_suresi_gun: countryDetail.gumruk_bekleme_suresi_gun,
        enflasyon_orani_yuzde: countryDetail.enflasyon_orani_yuzde,
        nufus_milyon: countryDetail.nufus_milyon,
        sektorel_buyume_orani_yuzde: countryDetail.sektorel_buyume_orani_yuzde,
        anlasma_sayisi: countryDetail.agreements?.length || 0,
        agreements: countryDetail.agreements,
        issizlik_orani_yuzde: countryDetail.issizlik_orani_yuzde,
        buyume_orani_yuzde: countryDetail.buyume_orani_yuzde
      };

      const unifiedResult = UnifiedScoringEngine.calculateGlobalScore(countryDataForScoring);

      return {
        country: countryDetail,
        ranking: countryRank,
        advancedMetrics,
        // YENİ: Birleşik skorlama sonuçları
        strategicDecisions: unifiedResult.decisions,
        globalScore: unifiedResult.globalScore,
        globalVerdict: unifiedResult.globalVerdict,
        decisionCounts: unifiedResult.counts,
        recommendation: unifiedResult.recommendation,
        summary: unifiedResult.summary,
        // Eski uyumluluk için de skor
        score: unifiedResult.globalScore
      };
    } catch (error) {
      console.error('Strategy Wizard verisi alınamadı:', error);
      throw error;
    }
  }

  /**
   * Gelişmiş filtreleme ile ülke ara
   */
  static async getFilteredCountries(sektorId, filters = {}, weights = {}) {
    try {
      // Tüm ülkeleri getir
      let countries = await this.getCountryRankings(sektorId, weights);

      // Gelişmiş metrikleri ekle
      countries = countries.map(country => {
        const advMetrics = this.getAdvancedMetrics({
          ulke_id: country.ulke_id,
          bolge_id: country.bolge_id,
          risk_notu_kodu: country.risk_notu,
          gumruk_bekleme_suresi_gun: country.gumruk_suresi,
          gsyh_kisi_basi_usd: country.gsyh_kisi_basi,
          nufus_milyon: country.nufus,
          yerli_uretim_karsilama_orani_yuzde: country.yerli_uretim_orani,
          lpi_skoru: country.lpi_skoru
        });
        
        return {
          ...country,
          advancedMetrics: advMetrics
        };
      });

      // Filtreleme uygula
      if (filters.maxRegulatoryDifficulty) {
        countries = countries.filter(c => 
          c.advancedMetrics.regulatory.score <= filters.maxRegulatoryDifficulty
        );
      }

      if (filters.minCulturalSimilarity) {
        countries = countries.filter(c => 
          c.advancedMetrics.cultural.score >= filters.minCulturalSimilarity
        );
      }

      if (filters.minDigitalAdoption) {
        countries = countries.filter(c => 
          c.advancedMetrics.digital.score >= filters.minDigitalAdoption
        );
      }

      if (filters.maxDistance) {
        countries = countries.filter(c => 
          c.advancedMetrics.distance.km <= filters.maxDistance
        );
      }

      if (filters.maxTaxRate) {
        countries = countries.filter(c => 
          c.advancedMetrics.tax.rate <= filters.maxTaxRate
        );
      }

      if (filters.maxCompetition) {
        countries = countries.filter(c => 
          c.advancedMetrics.competition.score <= filters.maxCompetition
        );
      }

      if (filters.minYouthRatio) {
        countries = countries.filter(c => 
          c.advancedMetrics.youth.ratio >= filters.minYouthRatio
        );
      }

      if (filters.minEaseOfBusiness) {
        countries = countries.filter(c => 
          c.advancedMetrics.easeOfBusiness.score >= filters.minEaseOfBusiness
        );
      }

      return countries;
    } catch (error) {
      console.error('Filtrelenmiş ülkeler alınamadı:', error);
      throw error;
    }
  }

  /**
   * Strateji önerileriyle birlikte karar kaydet
   */
  static async saveStrategyDecision(decisionData) {
    try {
      const {
        kullanici_id = 1,
        ulke_id,
        ulke_adi,
        sektor_id,
        sektor_adi,
        hesaplanan_skor,
        karar_durumu,
        yonetici_notu,
        strategic_decisions = [],
        advanced_metrics = {},
        user_overrides = {}
      } = decisionData;

      // Analiz adını oluştur
      const analiz_adi = `[STRATEJİ] ${ulke_adi} - ${sektor_adi}`;

      // Parametreleri hazırla
      const parametreler = JSON.stringify({
        ulke_id,
        ulke_adi,
        sektor_id,
        sektor_adi,
        advanced_metrics,
        user_overrides
      });

      // Sonuçları hazırla
      const sonuclar = JSON.stringify({
        hesaplanan_skor,
        karar_durumu,
        yonetici_notu,
        strategic_decisions,
        karar_tarihi: new Date().toISOString()
      });

      // Durumu belirle
      let durum = 'taslak';
      if (karar_durumu === 'Priority Target (High Focus)' || karar_durumu === 'Ready to Launch') {
        durum = 'tamamlandi';
      } else if (karar_durumu === 'Do Not Enter' || karar_durumu === 'Risk/Avoid') {
        durum = 'iptal';
      } else if (karar_durumu === 'Pilot Project' || karar_durumu === 'Watchlist (Monitoring)') {
        durum = 'devam_ediyor';
      }

      const [result] = await pool.query(`
        INSERT INTO kayitli_analizler 
        (kullanici_id, analiz_adi, analiz_tipi, parametreler, sonuclar, durum)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [kullanici_id, analiz_adi, 'strateji_wizard', parametreler, sonuclar, durum]);

      return {
        success: true,
        id: result.insertId,
        message: 'Strateji başarıyla kaydedildi'
      };
    } catch (error) {
      console.error('Strateji kaydedilemedi:', error);
      throw error;
    }
  }
}

module.exports = DecisionModel;

