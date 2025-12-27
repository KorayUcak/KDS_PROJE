const { pool } = require('../config/db');

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
   * Karşılaştırma için birden fazla ülke verisi getir
   */
  static async compareCountries(ulkeIds, sektorId) {
    try {
      const placeholders = ulkeIds.map(() => '?').join(',');
      const [rows] = await pool.query(`
        SELECT 
          u.ulke_id,
          u.ulke_adi,
          u.ISO_KODU,
          
          COALESCE(usv.sektorel_ithalat_milyon_usd, 0) as sektorel_ithalat,
          COALESCE(usv.sektorel_ihracat_milyon_usd, 0) as sektorel_ihracat,
          COALESCE(usv.sektorel_buyume_orani_yuzde, 0) as sektorel_buyume,
          
          COALESCE(eg.toplam_gsyh_milyar_dolar, 0) as gsyh,
          COALESCE(eg.gsyh_kisi_basi_usd, 0) as gsyh_kisi_basi,
          COALESCE(eg.risk_notu_kodu, 'C') as risk_notu,
          
          COALESCE(lv.lpi_skoru_ham, 0) as lpi_skoru,
          COALESCE(lv.gumruk_bekleme_suresi_gun, 30) as gumruk_suresi,
          COALESCE(lv.konteyner_ihracat_maliyeti_usd, 5000) as konteyner_maliyeti
          
        FROM ulkeler u
        LEFT JOIN ulke_sektor_verileri usv ON u.ulke_id = usv.ulke_id AND usv.sektor_id = ?
        LEFT JOIN ekonomi_guncel eg ON u.ulke_id = eg.ulke_id
        LEFT JOIN lojistik_verileri lv ON u.ulke_id = lv.ulke_id
        WHERE u.ulke_id IN (${placeholders})
      `, [sektorId, ...ulkeIds]);

      return rows;
    } catch (error) {
      console.error('Karşılaştırma verisi alınamadı:', error);
      throw error;
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
}

module.exports = DecisionModel;

