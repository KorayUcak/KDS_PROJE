/**
 * MySQL Veritabanı Bağlantı Havuzu
 * mysql2/promise kullanarak async/await desteği sağlar
 */
const mysql = require('mysql2/promise');

// Bağlantı havuzu oluştur
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Veritabanı bağlantısını test et
 * Basit bir SELECT 1 sorgusu ile bağlantıyı doğrular
 */
const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Veritabanına başarıyla bağlanıldı');
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
    console.error('   Hata kodu:', error.code);
    console.error('   Host:', process.env.DB_HOST);
    console.error('   Port:', process.env.DB_PORT);
    console.error('   User:', process.env.DB_USER);
    console.error('   Database:', process.env.DB_NAME);
    process.exit(1);
  }
};

module.exports = {
  pool,
  testConnection
};
