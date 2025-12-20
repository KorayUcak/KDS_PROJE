const { pool } = require('../config/db');

/**
 * Log Model Sınıfı
 * sistem_loglari tablosu için işlemler
 * 
 * TABLO ŞEMASI (DEĞİŞTİRİLEMEZ):
 * - log_id (INT, PK, Auto Increment)
 * - kullanici_id (INT, FK)
 * - islem_tipi (VARCHAR)
 * - aciklama (VARCHAR)
 * - tarih (TIMESTAMP)
 */
class LogModel {
  /**
   * Yeni log kaydı oluştur
   */
  static async create(data) {
    const { 
      kullanici_id = null, 
      islem_tipi, 
      aciklama = null
    } = data;
    
    const [result] = await pool.query(`
      INSERT INTO sistem_loglari 
        (kullanici_id, islem_tipi, aciklama)
      VALUES (?, ?, ?)
    `, [kullanici_id, islem_tipi, aciklama]);
    
    return result.insertId;
  }

  /**
   * Tüm logları getir (sayfalama ile)
   */
  static async getAll(limit = 100, offset = 0) {
    const [rows] = await pool.query(`
      SELECT 
        l.log_id,
        l.kullanici_id,
        l.islem_tipi,
        l.aciklama,
        l.tarih,
        u.ad_soyad
      FROM sistem_loglari l
      LEFT JOIN kullanicilar u ON l.kullanici_id = u.kullanici_id
      ORDER BY l.tarih DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
  }

  /**
   * Kullanıcıya ait logları getir
   */
  static async getByUserId(kullanici_id, limit = 50) {
    const [rows] = await pool.query(`
      SELECT * FROM sistem_loglari 
      WHERE kullanici_id = ?
      ORDER BY tarih DESC
      LIMIT ?
    `, [kullanici_id, limit]);
    return rows;
  }

  /**
   * İşlem tipine göre logları getir
   */
  static async getByType(islem_tipi, limit = 50) {
    const [rows] = await pool.query(`
      SELECT 
        l.*,
        u.ad_soyad
      FROM sistem_loglari l
      LEFT JOIN kullanicilar u ON l.kullanici_id = u.kullanici_id
      WHERE l.islem_tipi = ?
      ORDER BY l.tarih DESC
      LIMIT ?
    `, [islem_tipi, limit]);
    return rows;
  }

  /**
   * Tarih aralığına göre logları getir
   */
  static async getByDateRange(baslangic, bitis) {
    const [rows] = await pool.query(`
      SELECT 
        l.*,
        u.ad_soyad
      FROM sistem_loglari l
      LEFT JOIN kullanicilar u ON l.kullanici_id = u.kullanici_id
      WHERE l.tarih BETWEEN ? AND ?
      ORDER BY l.tarih DESC
    `, [baslangic, bitis]);
    return rows;
  }

  /**
   * Eski logları temizle (belirli günden eski)
   */
  static async deleteOldLogs(days = 30) {
    const [result] = await pool.query(`
      DELETE FROM sistem_loglari 
      WHERE tarih < DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);
    return result.affectedRows;
  }

  /**
   * Log istatistiklerini getir
   */
  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        islem_tipi,
        COUNT(*) as toplam,
        DATE(tarih) as gun
      FROM sistem_loglari
      WHERE tarih >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY islem_tipi, DATE(tarih)
      ORDER BY gun DESC, islem_tipi
    `);
    return rows;
  }

  // ============================================
  // YARDIMCI LOG FONKSİYONLARI
  // ============================================

  /**
   * Info log kaydet
   */
  static async info(islem_tipi, aciklama, kullanici_id = null) {
    return this.create({
      kullanici_id,
      islem_tipi,
      aciklama
    });
  }

  /**
   * Warning log kaydet
   */
  static async warning(islem_tipi, aciklama, kullanici_id = null) {
    return this.create({
      kullanici_id,
      islem_tipi,
      aciklama
    });
  }

  /**
   * Error log kaydet
   */
  static async error(islem_tipi, aciklama, kullanici_id = null) {
    return this.create({
      kullanici_id,
      islem_tipi,
      aciklama
    });
  }
}

module.exports = LogModel;
