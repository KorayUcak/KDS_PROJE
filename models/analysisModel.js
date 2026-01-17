const { pool } = require('../config/db');

/**
 * Analiz Model Sınıfı
 * kayitli_analizler tablosu için CRUD işlemleri
 * 
 * TABLO ŞEMASI (DEĞİŞTİRİLEMEZ):
 * - analiz_id (INT, PK, Auto Increment)
 * - kullanici_id (INT, FK)
 * - hedef_ulke_id (INT, FK)
 * - hedef_sektor_id (INT, FK)
 * - hesaplanan_skor (DECIMAL)
 * - yonetici_notu (TEXT)
 * - olusturulma_tarihi (TIMESTAMP)
 * 
 * NOT: Tüm metodlar "safe" - tablo yoksa veya boşsa hata vermez
 */
class AnalysisModel {
  /**
   * Tüm analizleri getir (JOIN ile ülke ve sektör adları)
   */
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          a.analiz_id,
          a.analiz_id as id,
          a.kullanici_id,
          a.hedef_ulke_id,
          a.hedef_sektor_id,
          a.hesaplanan_skor,
          a.yonetici_notu,
          a.aciklama,
          a.olusturulma_tarihi,
          u.ulke_adi,
          u.ISO_KODU as ulke_kodu,
          s.sektor_adi,
          k.ad_soyad as olusturan_kullanici
        FROM kayitli_analizler a
        LEFT JOIN ulkeler u ON a.hedef_ulke_id = u.ulke_id
        LEFT JOIN sektorler s ON a.hedef_sektor_id = s.sektor_id
        LEFT JOIN kullanicilar k ON a.kullanici_id = k.kullanici_id
        ORDER BY a.olusturulma_tarihi DESC
      `);
      return rows || [];
    } catch (error) {
      console.warn('⚠️ Analiz verisi alınamadı:', error.message);
      return [];
    }
  }

  /**
   * Kullanıcıya ait analizleri getir
   */
  static async getByUserId(kullanici_id) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          a.analiz_id,
          a.analiz_id as id,
          a.hedef_ulke_id,
          a.hedef_sektor_id,
          a.hesaplanan_skor,
          a.yonetici_notu,
          a.aciklama,
          a.olusturulma_tarihi,
          u.ulke_adi,
          u.ISO_KODU as ulke_kodu,
          s.sektor_adi
        FROM kayitli_analizler a
        LEFT JOIN ulkeler u ON a.hedef_ulke_id = u.ulke_id
        LEFT JOIN sektorler s ON a.hedef_sektor_id = s.sektor_id
        WHERE a.kullanici_id = ?
        ORDER BY a.olusturulma_tarihi DESC
      `, [kullanici_id]);
      return rows || [];
    } catch (error) {
      console.warn('⚠️ Kullanıcı analizleri alınamadı:', error.message);
      return [];
    }
  }

  /**
   * ID'ye göre analiz getir
   */
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          a.analiz_id,
          a.analiz_id as id,
          a.kullanici_id,
          a.hedef_ulke_id,
          a.hedef_sektor_id,
          a.hesaplanan_skor,
          a.yonetici_notu,
          a.aciklama,
          a.olusturulma_tarihi,
          u.ulke_adi,
          u.ISO_KODU as ulke_kodu,
          s.sektor_adi,
          k.ad_soyad as olusturan_kullanici
        FROM kayitli_analizler a
        LEFT JOIN ulkeler u ON a.hedef_ulke_id = u.ulke_id
        LEFT JOIN sektorler s ON a.hedef_sektor_id = s.sektor_id
        LEFT JOIN kullanicilar k ON a.kullanici_id = k.kullanici_id
        WHERE a.analiz_id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      console.warn('⚠️ Analiz bulunamadı:', error.message);
      return null;
    }
  }

  /**
   * Yeni analiz oluştur
   */
  static async create(data) {
    const { 
      kullanici_id, 
      hedef_ulke_id, 
      hedef_sektor_id, 
      hesaplanan_skor = null,
      yonetici_notu = null,
      aciklama = null
    } = data;
    
    const [result] = await pool.query(`
      INSERT INTO kayitli_analizler 
        (kullanici_id, hedef_ulke_id, hedef_sektor_id, hesaplanan_skor, yonetici_notu, aciklama)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      kullanici_id, 
      hedef_ulke_id, 
      hedef_sektor_id, 
      hesaplanan_skor,
      yonetici_notu,
      aciklama
    ]);
    
    return result.insertId;
  }

  /**
   * Analiz güncelle
   */
  static async update(id, data) {
    const { hedef_ulke_id, hedef_sektor_id, hesaplanan_skor, yonetici_notu, aciklama } = data;
    
    const [result] = await pool.query(`
      UPDATE kayitli_analizler 
      SET 
        hedef_ulke_id = COALESCE(?, hedef_ulke_id),
        hedef_sektor_id = COALESCE(?, hedef_sektor_id),
        hesaplanan_skor = COALESCE(?, hesaplanan_skor),
        yonetici_notu = COALESCE(?, yonetici_notu),
        aciklama = COALESCE(?, aciklama)
      WHERE analiz_id = ?
    `, [hedef_ulke_id, hedef_sektor_id, hesaplanan_skor, yonetici_notu, aciklama, id]);
    
    return result.affectedRows;
  }

  /**
   * Skor kaydet
   */
  static async saveScore(id, hesaplanan_skor) {
    const [result] = await pool.query(`
      UPDATE kayitli_analizler 
      SET hesaplanan_skor = ?
      WHERE analiz_id = ?
    `, [hesaplanan_skor, id]);
    
    return result.affectedRows;
  }

  /**
   * Analiz sil
   */
  static async delete(id) {
    const [result] = await pool.query(`
      DELETE FROM kayitli_analizler WHERE analiz_id = ?
    `, [id]);
    return result.affectedRows;
  }
  // --- İŞ KURALI FONKSİYONU ---
  static async checkDuplicateToday(kullaniciId, ulkeId, sektorId) {
    // Bugünün tarihini al (YYYY-MM-DD formatında)
    const today = new Date().toISOString().slice(0, 10);
    
    const sql = `
      SELECT analiz_id 
      FROM kayitli_analizler 
      WHERE kullanici_id = ? 
      AND hedef_ulke_id = ? 
      AND hedef_sektor_id = ?
      AND DATE(olusturulma_tarihi) = ?
    `;
    
    const [rows] = await db.execute(sql, [kullaniciId, ulkeId, sektorId, today]);
    return rows.length > 0; // Kayıt varsa true döner
  }

  /**
   * Kullanıcının analiz sayısını getir
   */
  static async countByUserId(kullanici_id) {
    try {
      const [rows] = await pool.query(`
        SELECT COUNT(*) as toplam FROM kayitli_analizler 
        WHERE kullanici_id = ?
      `, [kullanici_id]);
      return rows[0].toplam;
    } catch (error) {
      return 0;
    }
  }
// --- İŞ KURALI FONKSİYONU (DÜZELTİLDİ) ---
  static async checkDuplicateToday(kullaniciId, ulkeId, sektorId) {
    // Bugünün tarihini al (YYYY-MM-DD formatında)
    const today = new Date().toISOString().slice(0, 10);
    
    const sql = `
      SELECT analiz_id 
      FROM kayitli_analizler 
      WHERE kullanici_id = ? 
      AND hedef_ulke_id = ? 
      AND hedef_sektor_id = ?
      AND DATE(olusturulma_tarihi) = ?
    `;
    
    // DÜZELTME: 'db.execute' yerine 'pool.query' kullanıldı
    const [rows] = await pool.query(sql, [kullaniciId, ulkeId, sektorId, today]);
    return rows.length > 0; // Kayıt varsa true döner
  }
}

module.exports = AnalysisModel;
