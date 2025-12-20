const { pool } = require('../config/db');

/**
 * Kullanıcı Model Sınıfı
 * kullanicilar tablosu için CRUD işlemleri
 * 
 * TABLO ŞEMASI (DEĞİŞTİRİLEMEZ):
 * - kullanici_id (INT, PK, Auto Increment)
 * - ad_soyad (VARCHAR)
 * - email (VARCHAR)
 * - sifre_hash (VARCHAR)
 * - rol (VARCHAR, default: 'yonetici')
 * - kayit_tarihi (TIMESTAMP)
 */
class UserModel {
  /**
   * Tüm kullanıcıları getir
   */
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        kullanici_id,
        ad_soyad,
        email,
        rol,
        kayit_tarihi
      FROM kullanicilar
      ORDER BY kayit_tarihi DESC
    `);
    return rows;
  }

  /**
   * ID'ye göre kullanıcı getir
   */
  static async getById(id) {
    const [rows] = await pool.query(`
      SELECT 
        kullanici_id,
        ad_soyad,
        email,
        rol,
        kayit_tarihi
      FROM kullanicilar 
      WHERE kullanici_id = ?
    `, [id]);
    return rows[0];
  }

  /**
   * Email'e göre kullanıcı getir (Login için)
   */
  static async getByEmail(email) {
    const [rows] = await pool.query(`
      SELECT 
        kullanici_id,
        ad_soyad,
        email,
        sifre_hash,
        rol,
        kayit_tarihi
      FROM kullanicilar 
      WHERE email = ?
    `, [email]);
    return rows[0];
  }

  /**
   * Ad soyad'a göre kullanıcı getir
   */
  static async getByName(ad_soyad) {
    const [rows] = await pool.query(`
      SELECT * FROM kullanicilar WHERE ad_soyad = ?
    `, [ad_soyad]);
    return rows[0];
  }

  /**
   * Yeni kullanıcı oluştur
   * NOT: kullanici_id veritabanı tarafından otomatik atanır
   */
  static async create(data) {
    const { ad_soyad, email, sifre_hash, rol = 'user' } = data;
    
    const [result] = await pool.query(`
      INSERT INTO kullanicilar 
        (ad_soyad, email, sifre_hash, rol)
      VALUES (?, ?, ?, ?)
    `, [ad_soyad, email, sifre_hash, rol]);
    
    return result.insertId;
  }

  /**
   * Kullanıcı güncelle
   */
  static async update(id, data) {
    const { ad_soyad, email, rol } = data;
    
    const [result] = await pool.query(`
      UPDATE kullanicilar 
      SET 
        ad_soyad = COALESCE(?, ad_soyad),
        email = COALESCE(?, email),
        rol = COALESCE(?, rol)
      WHERE kullanici_id = ?
    `, [ad_soyad, email, rol, id]);
    
    return result.affectedRows;
  }

  /**
   * Şifre güncelle
   */
  static async updatePassword(id, sifre_hash) {
    const [result] = await pool.query(`
      UPDATE kullanicilar 
      SET sifre_hash = ?
      WHERE kullanici_id = ?
    `, [sifre_hash, id]);
    
    return result.affectedRows;
  }

  /**
   * Kullanıcı sil
   */
  static async delete(id) {
    const [result] = await pool.query(`
      DELETE FROM kullanicilar WHERE kullanici_id = ?
    `, [id]);
    return result.affectedRows;
  }

  /**
   * Email mevcut mu kontrol et
   */
  static async exists(email) {
    const [rows] = await pool.query(`
      SELECT kullanici_id FROM kullanicilar 
      WHERE email = ?
    `, [email]);
    return rows.length > 0;
  }
}

module.exports = UserModel;
