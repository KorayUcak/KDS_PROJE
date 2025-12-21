const { pool } = require('../config/db');

class LogisticsModel {
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          l.id as lojistik_id,
          l.ulke_id,
          l.lpi_skoru_ham as lpi_skoru,
          l.gumruk_bekleme_suresi_gun,
          l.konteyner_ihracat_maliyeti_usd,
          u.ulke_adi,
          u.ISO_KODU
        FROM lojistik_verileri l
        INNER JOIN ulkeler u ON l.ulke_id = u.ulke_id
        ORDER BY u.ulke_adi ASC
      `);
      return rows || [];
    } catch (error) {
      console.error('Lojistik verileri alınamadı:', error);
      throw error;
    }
  }

  static async getById(lojistikId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          l.id as lojistik_id,
          l.ulke_id,
          l.lpi_skoru_ham as lpi_skoru,
          l.gumruk_bekleme_suresi_gun,
          l.konteyner_ihracat_maliyeti_usd,
          u.ulke_adi,
          u.ISO_KODU
        FROM lojistik_verileri l
        INNER JOIN ulkeler u ON l.ulke_id = u.ulke_id
        WHERE l.id = ?
      `, [lojistikId]);
      return rows[0] || null;
    } catch (error) {
      console.error('Lojistik verisi bulunamadı:', error);
      throw error;
    }
  }

  static async getByCountryId(ulkeId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          l.id as lojistik_id,
          l.ulke_id,
          l.lpi_skoru_ham as lpi_skoru,
          l.gumruk_bekleme_suresi_gun,
          l.konteyner_ihracat_maliyeti_usd
        FROM lojistik_verileri l
        WHERE l.ulke_id = ?
      `, [ulkeId]);
      return rows[0] || null;
    } catch (error) {
      console.error('Ülke lojistik verisi bulunamadı:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await pool.query(`
        INSERT INTO lojistik_verileri 
        (ulke_id, lpi_skoru_ham, gumruk_bekleme_suresi_gun, konteyner_ihracat_maliyeti_usd)
        VALUES (?, ?, ?, ?)
      `, [
        data.ulke_id,
        data.lpi_skoru,
        data.gumruk_bekleme_suresi_gun,
        data.konteyner_ihracat_maliyeti_usd
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Lojistik verisi eklenemedi:', error);
      throw error;
    }
  }

  static async update(lojistikId, data) {
    try {
      const [result] = await pool.query(`
        UPDATE lojistik_verileri 
        SET 
          lpi_skoru_ham = ?,
          gumruk_bekleme_suresi_gun = ?,
          konteyner_ihracat_maliyeti_usd = ?
        WHERE id = ?
      `, [
        data.lpi_skoru,
        data.gumruk_bekleme_suresi_gun,
        data.konteyner_ihracat_maliyeti_usd,
        lojistikId
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lojistik verisi güncellenemedi:', error);
      throw error;
    }
  }

  static async delete(lojistikId) {
    try {
      const [result] = await pool.query(`
        DELETE FROM lojistik_verileri WHERE id = ?
      `, [lojistikId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lojistik verisi silinemedi:', error);
      throw error;
    }
  }

  static async getStatistics() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          COUNT(*) as toplam_kayit,
          AVG(lpi_skoru_ham) as ortalama_lpi,
          AVG(gumruk_bekleme_suresi_gun) as ortalama_gumruk_suresi,
          AVG(konteyner_ihracat_maliyeti_usd) as ortalama_maliyet
        FROM lojistik_verileri
      `);
      return rows[0] || null;
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
      throw error;
    }
  }
}

module.exports = LogisticsModel;
