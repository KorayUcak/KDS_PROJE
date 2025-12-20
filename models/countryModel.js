const { pool } = require('../config/db');

/**
 * Country Model Sınıfı
 * ulkeler tablosu için işlemler
 * 
 * Veritabanındaki ISO_KODU sütununu kullanır
 */
class CountryModel {
  /**
   * Tüm ülkeleri getir
   * TABLO: ulkeler (ulke_id, ulke_adi, bolge_id, latitude, longitude, ISO_KODU)
   * @returns {Array} - Ülke listesi (ISO kodları ile)
   */
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          ulke_id,
          ulke_id as id,
          ulke_adi,
          ISO_KODU,
          bolge_id
        FROM ulkeler
        ORDER BY ulke_adi ASC
      `);
      return rows || [];
    } catch (error) {
      console.warn('⚠️ Ülke verisi alınamadı:', error.message);
      return [];
    }
  }

  /**
   * ISO koduna göre ülke getir
   * @param {string} isoCode - ISO 2 karakter ülke kodu (TR, DE, US...)
   */
  static async getByIsoCode(isoCode) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM ulkeler WHERE ISO_KODU = ?
      `, [isoCode]);
      return rows[0] || null;
    } catch (error) {
      console.warn('⚠️ Ülke bulunamadı:', error.message);
      return null;
    }
  }

  /**
   * Bölgeye göre ülkeleri getir
   * @param {string} bolge - Bölge adı
   */
  static async getByRegion(bolge) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM ulkeler WHERE bolge = ? ORDER BY ulke_adi ASC
      `, [bolge]);
      return rows || [];
    } catch (error) {
      console.warn('⚠️ Bölge ülkeleri alınamadı:', error.message);
      return [];
    }
  }
}

module.exports = CountryModel;
