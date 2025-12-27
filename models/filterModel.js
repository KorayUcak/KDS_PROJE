const { pool } = require('../config/db');

/**
 * Filter Model - Veritabanından filtre seçeneklerini çeker
 */
class FilterModel {
  /**
   * Tüm bölgeleri getir
   */
  static async getRegions() {
    try {
      const [rows] = await pool.query(`
        SELECT bolge_id, bolge_adi 
        FROM bolgeler 
        ORDER BY bolge_adi ASC
      `);
      return rows || [];
    } catch (error) {
      console.error('Bölgeler alınamadı:', error);
      return [];
    }
  }

  /**
   * Tüm anlaşma tiplerini getir
   */
  static async getAgreementTypes() {
    try {
      const [rows] = await pool.query(`
        SELECT anlasma_id, anlasma_adi, anlasma_kodu 
        FROM anlasma_tipleri 
        ORDER BY anlasma_adi ASC
      `);
      return rows || [];
    } catch (error) {
      console.error('Anlaşma tipleri alınamadı:', error);
      return [];
    }
  }

  /**
   * Mevcut risk notlarını getir
   */
  static async getRiskRatings() {
    try {
      const [rows] = await pool.query(`
        SELECT DISTINCT risk_notu_kodu 
        FROM ekonomi_guncel 
        WHERE risk_notu_kodu IS NOT NULL
        ORDER BY risk_notu_kodu ASC
      `);
      return rows.map(r => r.risk_notu_kodu) || [];
    } catch (error) {
      console.error('Risk notları alınamadı:', error);
      return [];
    }
  }

  /**
   * Ekonomik istatistikleri getir (min/max değerler için)
   */
  static async getEconomicStats() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          MIN(gsyh_kisi_basi_usd) as min_gdp_per_capita,
          MAX(gsyh_kisi_basi_usd) as max_gdp_per_capita,
          MIN(nufus_milyon) as min_population,
          MAX(nufus_milyon) as max_population,
          MIN(toplam_gsyh_milyar_dolar) as min_gdp,
          MAX(toplam_gsyh_milyar_dolar) as max_gdp
        FROM ekonomi_guncel
      `);
      return rows[0] || {};
    } catch (error) {
      console.error('Ekonomik istatistikler alınamadı:', error);
      return {};
    }
  }

  /**
   * Lojistik istatistiklerini getir
   */
  static async getLogisticsStats() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          MIN(lpi_skoru_ham) as min_lpi,
          MAX(lpi_skoru_ham) as max_lpi,
          MIN(gumruk_bekleme_suresi_gun) as min_customs,
          MAX(gumruk_bekleme_suresi_gun) as max_customs,
          MIN(konteyner_ihracat_maliyeti_usd) as min_shipping,
          MAX(konteyner_ihracat_maliyeti_usd) as max_shipping
        FROM lojistik_verileri
      `);
      return rows[0] || {};
    } catch (error) {
      console.error('Lojistik istatistikler alınamadı:', error);
      return {};
    }
  }

  /**
   * Tüm filtre seçeneklerini getir
   */
  static async getAllFilterOptions() {
    const [sectors, regions, agreements, riskRatings, economicStats, logisticsStats] = await Promise.all([
      this.getSectors(),
      this.getRegions(),
      this.getAgreementTypes(),
      this.getRiskRatings(),
      this.getEconomicStats(),
      this.getLogisticsStats()
    ]);

    return {
      sectors,
      regions,
      agreements,
      riskRatings,
      economicStats,
      logisticsStats
    };
  }

  /**
   * Sektörleri getir
   */
  static async getSectors() {
    try {
      const [rows] = await pool.query(`
        SELECT sektor_id, sektor_adi 
        FROM sektorler 
        ORDER BY sektor_adi ASC
      `);
      return rows || [];
    } catch (error) {
      console.error('Sektörler alınamadı:', error);
      return [];
    }
  }
}

module.exports = FilterModel;

