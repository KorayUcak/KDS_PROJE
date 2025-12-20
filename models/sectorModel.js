const { pool } = require('../config/db');

/**
 * Sector Model Sınıfı
 * sektorler tablosu için işlemler
 */
class SectorModel {
  /**
   * Tüm sektörleri getir
   * TABLO: sektorler (sektor_id, sektor_adi)
   */
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          sektor_id,
          sektor_id as id,
          sektor_adi
        FROM sektorler
        ORDER BY sektor_adi ASC
      `);
      return rows || [];
    } catch (error) {
      console.warn('⚠️ Sektör verisi alınamadı:', error.message);
      return [];
    }
  }

  /**
   * ID'ye göre sektör getir
   */
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM sektorler WHERE sektor_id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      console.warn('⚠️ Sektör bulunamadı:', error.message);
      return null;
    }
  }

  /**
   * Sektöre ait ülke verilerini getir (JOIN ile)
   * ulke_sektor_verileri + ulkeler tabloları
   */
  static async getSectorCountryData(sektorId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          usv.id,
          usv.ulke_id,
          usv.sektor_id,
          usv.sektorel_ihracat_milyon_usd,
          usv.sektorel_ithalat_milyon_usd,
          usv.sektorel_buyume_orani_yuzde,
          usv.sektorel_istihdam_bin_kisi,
          usv.sektorel_yatirim_milyon_usd,
          usv.yerli_uretim_karsilama_orani_yuzde,
          u.ulke_adi,
          u.ISO_KODU
        FROM ulke_sektor_verileri usv
        INNER JOIN ulkeler u ON usv.ulke_id = u.ulke_id
        WHERE usv.sektor_id = ?
        ORDER BY usv.sektorel_ihracat_milyon_usd DESC
      `, [sektorId]);
      return rows || [];
    } catch (error) {
      console.warn('⚠️ Sektör-ülke verisi alınamadı:', error.message);
      return [];
    }
  }

  /**
   * Sektör özet istatistikleri (JavaScript'te hesaplanacak)
   */
  static async getSectorStats(sektorId) {
    try {
      const data = await this.getSectorCountryData(sektorId);
      
      if (!data.length) {
        return {
          totalCountries: 0,
          totalExport: 0,
          totalImport: 0,
          avgGrowth: 0,
          totalEmployment: 0,
          totalInvestment: 0
        };
      }

      // JavaScript ile hesaplamalar (SQL'de değil)
      const totalCountries = data.length;
      const totalExport = data.reduce((sum, row) => sum + (parseFloat(row.sektorel_ihracat_milyon_usd) || 0), 0);
      const totalImport = data.reduce((sum, row) => sum + (parseFloat(row.sektorel_ithalat_milyon_usd) || 0), 0);
      const avgGrowth = data.reduce((sum, row) => sum + (parseFloat(row.sektorel_buyume_orani_yuzde) || 0), 0) / totalCountries;
      const totalEmployment = data.reduce((sum, row) => sum + (parseFloat(row.sektorel_istihdam_bin_kisi) || 0), 0);
      const totalInvestment = data.reduce((sum, row) => sum + (parseFloat(row.sektorel_yatirim_milyon_usd) || 0), 0);

      return {
        totalCountries,
        totalExport: Math.round(totalExport * 100) / 100,
        totalImport: Math.round(totalImport * 100) / 100,
        avgGrowth: Math.round(avgGrowth * 100) / 100,
        totalEmployment: Math.round(totalEmployment * 100) / 100,
        totalInvestment: Math.round(totalInvestment * 100) / 100
      };
    } catch (error) {
      console.warn('⚠️ Sektör istatistikleri hesaplanamadı:', error.message);
      return null;
    }
  }
}

module.exports = SectorModel;
