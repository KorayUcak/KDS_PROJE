const { pool } = require('../config/db');

class AgreementModel {
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          anlasma_id,
          anlasma_adi,
          anlasma_kodu
        FROM anlasma_tipleri
        ORDER BY anlasma_adi ASC
      `);
      return rows || [];
    } catch (error) {
      console.error('Anlaşma tipleri alınamadı:', error);
      throw error;
    }
  }

  static async getById(anlasmaId) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM anlasma_tipleri WHERE anlasma_id = ?
      `, [anlasmaId]);
      return rows[0] || null;
    } catch (error) {
      console.error('Anlaşma tipi bulunamadı:', error);
      throw error;
    }
  }

  static async getByCode(anlasmaKodu) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM anlasma_tipleri WHERE anlasma_kodu = ?
      `, [anlasmaKodu]);
      return rows[0] || null;
    } catch (error) {
      console.error('Anlaşma kodu bulunamadı:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await pool.query(`
        INSERT INTO anlasma_tipleri 
        (anlasma_adi, anlasma_kodu)
        VALUES (?, ?)
      `, [data.anlasma_adi, data.anlasma_kodu]);
      return result.insertId;
    } catch (error) {
      console.error('Anlaşma tipi eklenemedi:', error);
      throw error;
    }
  }

  static async update(anlasmaId, data) {
    try {
      const [result] = await pool.query(`
        UPDATE anlasma_tipleri 
        SET 
          anlasma_adi = ?,
          anlasma_kodu = ?
        WHERE anlasma_id = ?
      `, [data.anlasma_adi, data.anlasma_kodu, anlasmaId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Anlaşma tipi güncellenemedi:', error);
      throw error;
    }
  }

  static async delete(anlasmaId) {
    try {
      const [result] = await pool.query(`
        DELETE FROM anlasma_tipleri WHERE anlasma_id = ?
      `, [anlasmaId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Anlaşma tipi silinemedi:', error);
      throw error;
    }
  }

  static async getCountriesByAgreement(anlasmaId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          u.ulke_id,
          u.ulke_adi,
          u.ISO_KODU
        FROM ulke_anlasmalari ua
        INNER JOIN ulkeler u ON ua.ulke_id = u.ulke_id
        WHERE ua.anlasma_id = ?
        ORDER BY u.ulke_adi ASC
      `, [anlasmaId]);
      return rows || [];
    } catch (error) {
      console.error('Anlaşma ülkeleri alınamadı:', error);
      throw error;
    }
  }

  static async getStatistics() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          a.anlasma_id,
          a.anlasma_adi,
          a.anlasma_kodu,
          COUNT(ua.ulke_id) as ulke_sayisi
        FROM anlasma_tipleri a
        LEFT JOIN ulke_anlasmalari ua ON a.anlasma_id = ua.anlasma_id
        GROUP BY a.anlasma_id, a.anlasma_adi, a.anlasma_kodu
        ORDER BY ulke_sayisi DESC, a.anlasma_adi ASC
      `);
      return rows || [];
    } catch (error) {
      console.error('Anlaşma istatistikleri alınamadı:', error);
      throw error;
    }
  }
}

module.exports = AgreementModel;
