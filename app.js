const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');

// Ortam değişkenlerini yükle (diğer modüllerden önce)
dotenv.config();

const { testConnection } = require('./config/db');
const AppError = require('./utils/AppError');

// Route dosyaları
const {
  userRoutes,
  analysisRoutes,
  logRoutes,
  sectorRoutes,
  economyRoutes,
  countryRoutes,
  logisticsRoutes,
  agreementRoutes,
  decisionRoutes
} = require('./routes');

// Express uygulaması oluştur
const app = express();

// ===========================================
// MIDDLEWARE'LER
// ===========================================

// Body parser - JSON ve URL-encoded veriler için
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(methodOverride('_method'));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// View Engine ayarları
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===========================================
// ROUTE'LAR
// ===========================================

// Ana sayfa - Karar Destek Sistemi (Sektör Seçimi)
app.use('/', decisionRoutes);

// Kullanıcı Route'ları (Auth)
app.use('/users', userRoutes);

// Analiz Route'ları
app.use('/analyses', analysisRoutes);

// Sektörel Analiz Route'ları (Ana Dashboard)
app.use('/dashboard', sectorRoutes);

// Makro Ekonomi Route'ları
app.use('/economics', economyRoutes);

// Ülke İncele Route'ları
app.use('/countries', countryRoutes);

// Lojistik Verileri Route'ları
app.use('/logistics', logisticsRoutes);

// Anlaşma Tipleri Route'ları
app.use('/agreements', agreementRoutes);

// Log API Route'ları
app.use('/api/logs', logRoutes);

// ===========================================
// HATA YÖNETİMİ
// ===========================================

// 404 - Tanımsız route'lar için
app.all('*', (req, res, next) => {
  next(new AppError(`${req.originalUrl} adresi bu sunucuda bulunamadı!`, 404));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development ortamında detaylı hata
  if (process.env.NODE_ENV === 'development') {
    // API istekleri için JSON yanıt
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    }
    
    // View istekleri için hata sayfası
    return res.status(err.statusCode).render('error', {
      title: 'Hata Oluştu',
      message: err.message,
      error: err
    });
  }

  // Production ortamında
  if (err.isOperational) {
    // Operasyonel hata - güvenli mesaj göster
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    
    return res.status(err.statusCode).render('error', {
      title: 'Hata Oluştu',
      message: err.message
    });
  }

  // Programlama hatası - detay gösterme
  console.error('HATA 💥:', err);
  
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      status: 'error',
      message: 'Bir şeyler ters gitti!'
    });
  }
  
  return res.status(500).render('error', {
    title: 'Hata Oluştu',
    message: 'Bir şeyler ters gitti!'
  });
});

// ===========================================
// SUNUCU BAŞLATMA
// ===========================================

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Veritabanı bağlantısını test et
    await testConnection();

    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
      console.log(`📊 KDS Dashboard: http://localhost:${PORT}`);
      console.log(`🔗 Sayfalar:`);
      console.log(`   - Sektörel Analiz: http://localhost:${PORT}/dashboard`);
      console.log(`   - Makro Ekonomi: http://localhost:${PORT}/economics`);
      console.log(`   - Yeni Analiz: http://localhost:${PORT}/analyses/new`);
      console.log(`   - Kayıtlı Raporlar: http://localhost:${PORT}/analyses/dashboard`);
    });
  } catch (error) {
    console.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
