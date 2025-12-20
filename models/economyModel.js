const { pool } = require('../config/db');

/**
 * Economy Model Sınıfı
 * ekonomi_guncel tablosu için işlemler
 */
class EconomyModel {
  /**
   * Tüm ülkelerin ekonomi verilerini getir
   */
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          eg.id,
          eg.ulke_id,
          eg.toplam_gsyh_milyar_dolar,
          eg.gsyh_kisi_basi_usd,
          eg.enflasyon_orani_yuzde,
          eg.issizlik_orani_yuzde,
          eg.dis_borc_milyar_usd,
          eg.cari_denge_milyar_usd,
          eg.doviz_rezervi_milyar_usd,
          eg.faiz_orani_yuzde,
          eg.risk_notu_kodu,
          u.ulke_adi,
          u.ISO_KODU
        FROM ekonomi_guncel eg
        INNER JOIN ulkeler u ON eg.ulke_id = u.ulke_id
        ORDER BY eg.toplam_gsyh_milyar_dolar DESC
      `);
      return rows || [];
    } catch (error) {
      console.warn('⚠️ Ekonomi verisi alınamadı:', error.message);
      return [];
    }
  }

  /**
   * Ülke ID'sine göre ekonomi verisi getir
   */
  static async getByCountryId(ulkeId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          eg.*,
          u.ulke_adi,
          u.ISO_KODU
        FROM ekonomi_guncel eg
        INNER JOIN ulkeler u ON eg.ulke_id = u.ulke_id
        WHERE eg.ulke_id = ?
      `, [ulkeId]);
      return rows[0] || null;
    } catch (error) {
      console.warn('⚠️ Ülke ekonomi verisi bulunamadı:', error.message);
      return null;
    }
  }

  /**
   * ISO koduna göre ekonomi verisi getir
   */
  static async getByIsoCode(isoCode) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          eg.*,
          u.ulke_adi,
          u.ISO_KODU
        FROM ekonomi_guncel eg
        INNER JOIN ulkeler u ON eg.ulke_id = u.ulke_id
        WHERE u.ISO_KODU = ?
      `, [isoCode]);
      return rows[0] || null;
    } catch (error) {
      console.warn('⚠️ Ülke ekonomi verisi bulunamadı:', error.message);
      return null;
    }
  }

  /**
   * Risk notuna göre ülkeleri getir
   */
  static async getByRiskRating(riskNotu) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          eg.*,
          u.ulke_adi,
          u.ISO_KODU
        FROM ekonomi_guncel eg
        INNER JOIN ulkeler u ON eg.ulke_id = u.ulke_id
        WHERE eg.risk_notu_kodu = ?
        ORDER BY eg.toplam_gsyh_milyar_dolar DESC
      `, [riskNotu]);
      return rows || [];
    } catch (error) {
      console.warn('⚠️ Risk notuna göre veriler alınamadı:', error.message);
      return [];
    }
  }

  /**
   * Ekonomi karşılaştırma verileri (Harita için)
   */
  static async getMapData(metric = 'gsyh_kisi_basi_usd') {
    try {
      const validMetrics = [
        'toplam_gsyh_milyar_dolar', 'gsyh_kisi_basi_usd', 'enflasyon_orani_yuzde',
        'issizlik_orani_yuzde', 'dis_borc_milyar_usd', 'faiz_orani_yuzde'
      ];
      
      if (!validMetrics.includes(metric)) {
        metric = 'gsyh_kisi_basi_usd';
      }

      const [rows] = await pool.query(`
        SELECT 
          u.ISO_KODU,
          u.ulke_adi,
          eg.${metric} as value
        FROM ekonomi_guncel eg
        INNER JOIN ulkeler u ON eg.ulke_id = u.ulke_id
        WHERE eg.${metric} IS NOT NULL
      `);
      return rows || [];
    } catch (error) {
      console.warn('⚠️ Harita verisi alınamadı:', error.message);
      return [];
    }
  }
}

module.exports = EconomyModel;
