const AnalysisModel = require('../models/analysisModel');
const LogModel = require('../models/logModel');
const CountryModel = require('../models/countryModel');
const SectorModel = require('../models/sectorModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Analysis Controller
 * Pazar analizi işlemleri
 * 
 * ÖNEMLİ: Tüm hesaplamalar JavaScript'te yapılır (SQL'de değil)
 * Veritabanından sadece ham veri çekilir
 */

// ============================================
// YARDIMCI FONKSİYONLAR (Veri İşleme Algoritmaları)
// ============================================

/**
 * Ham analiz verisinden KPI'ları hesapla
 * YENİ ŞEMA: analiz_id, kullanici_id, hedef_ulke_id, hedef_sektor_id, hesaplanan_skor, yonetici_notu, olusturulma_tarihi
 * JOIN: ulke_adi, ulke_kodu, sektor_adi, olusturan_kullanici
 * @param {Array} rawData - Veritabanından gelen ham veri
 * @returns {Object} - Hesaplanmış KPI değerleri
 */
const calculateKPIs = (rawData) => {
  // Toplam analiz sayısı
  const totalAnalyses = rawData.length;

  // Skoru olan analizler (tamamlanmış sayılır)
  const completedAnalyses = rawData.filter(item => item.hesaplanan_skor !== null).length;

  // Skoru olmayan analizler (devam ediyor sayılır)
  const ongoingAnalyses = rawData.filter(item => item.hesaplanan_skor === null).length;

  // En yüksek puanlı analizi bul
  let highestScore = { value: 0, country: 'N/A', analysisName: 'N/A' };
  
  rawData.forEach(item => {
    const skor = parseFloat(item.hesaplanan_skor) || 0;
    if (skor > highestScore.value) {
      highestScore = {
        value: skor,
        country: item.ulke_adi || 'Bilinmiyor',
        analysisName: `${item.ulke_adi || ''} - ${item.sektor_adi || ''}`
      };
    }
  });

  // Son incelenen (en son oluşturulan analiz)
  const sortedByDate = [...rawData].sort((a, b) => 
    new Date(b.olusturulma_tarihi) - new Date(a.olusturulma_tarihi)
  );
  const lastReviewed = sortedByDate[0] || null;

  return {
    totalAnalyses,
    completedAnalyses,
    ongoingAnalyses,
    highestScore,
    lastReviewed: lastReviewed ? {
      name: `${lastReviewed.ulke_adi || 'Bilinmiyor'} - ${lastReviewed.sektor_adi || ''}`,
      date: lastReviewed.olusturulma_tarihi
    } : null
  };
};

/**
 * Harita için ülke verilerini formatla
 * YENİ ŞEMA: ulke_kodu ve hesaplanan_skor doğrudan tabloda
 * @param {Array} rawData - Veritabanından gelen ham veri
 * @returns {Object} - jVectorMap formatında ülke kodları ve skorları
 */
const formatMapData = (rawData) => {
  const mapData = {};
  
  rawData.forEach(item => {
    const ulkeKodu = item.ulke_kodu;
    const skor = parseFloat(item.hesaplanan_skor) || 0;
    
    if (ulkeKodu && skor > 0) {
      // Aynı ülke için en yüksek skoru tut
      if (!mapData[ulkeKodu] || mapData[ulkeKodu] < skor) {
        mapData[ulkeKodu] = skor;
      }
    }
  });

  return mapData;
};

/**
 * Grafik için veri formatla (Chart.js)
 * YENİ ŞEMA: ulke_adi ve hesaplanan_skor doğrudan tabloda
 * @param {Array} rawData - Veritabanından gelen ham veri
 * @returns {Object} - Chart.js formatında labels ve data dizileri
 */
const formatChartData = (rawData) => {
  const countryScores = {};
  
  // Her analiz için ülke ve skorları topla
  rawData.forEach(item => {
    const ulkeAdi = item.ulke_adi;
    const skor = parseFloat(item.hesaplanan_skor) || 0;
    
    if (ulkeAdi && skor > 0) {
      if (!countryScores[ulkeAdi]) {
        countryScores[ulkeAdi] = [];
      }
      countryScores[ulkeAdi].push(skor);
    }
  });

  // Her ülke için ortalama skor hesapla
  const labels = [];
  const data = [];
  const backgroundColors = [];
  
  const colors = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)',
    'rgba(255, 99, 255, 0.8)',
    'rgba(99, 255, 132, 0.8)'
  ];

  Object.keys(countryScores).forEach((country, index) => {
    const scores = countryScores[country];
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    labels.push(country);
    data.push(Math.round(average * 100) / 100);
    backgroundColors.push(colors[index % colors.length]);
  });

  return { labels, data, backgroundColors };
};

/**
 * Son analizleri getir (sıralı)
 * YENİ ŞEMA: olusturulma_tarihi kullanılıyor
 * @param {Array} rawData - Veritabanından gelen ham veri
 * @param {number} limit - Kaç adet getirileceği
 * @returns {Array} - Son N analiz
 */
const getRecentAnalyses = (rawData, limit = 5) => {
  return [...rawData]
    .sort((a, b) => 
      new Date(b.olusturulma_tarihi) - new Date(a.olusturulma_tarihi)
    )
    .slice(0, limit);
};

// ============================================
// CONTROLLER FONKSİYONLARI
// ============================================

/**
 * Dashboard sayfası - Ana kontrol paneli
 * ekonomi_guncel ve ulke_sektor_verileri tablolarından veri çeker
 * ulkeler tablosu ile JOIN yaparak ISO_KODU alır
 */
exports.getDashboard = catchAsync(async (req, res, next) => {
  const { pool } = require('../config/db');
  
  // ADIM 1: Ekonomi verilerini ISO koduyla birlikte çek (17 ülke - LIMIT YOK)
  const [ekonomiData] = await pool.query(`
    SELECT 
      e.*,
      u.ulke_adi,
      u.ISO_KODU
    FROM ekonomi_guncel e
    JOIN ulkeler u ON e.ulke_id = u.ulke_id
    ORDER BY e.toplam_gsyh_milyar_dolar DESC
  `);
  
  // ADIM 2: Kayıtlı analizleri çek
  const rawAnalyses = await AnalysisModel.getAll();

  // GUARD CLAUSE: Ekonomi verisi var mı?
  const hasData = Array.isArray(ekonomiData) && ekonomiData.length > 0;

  // ============================================
  // ADIM 3: KPI HESAPLAMALARI (Gerçek Zamanlı Global Özet)
  // ============================================
  let stats = {
    // 1. Küresel Pazar Hacmi - Tüm ülkelerin GSYİH toplamı
    globalGDP: 0,
    globalGDPFormatted: '$0',
    
    // 2. Ortalama Büyüme - Tüm ülkelerin büyüme ortalaması
    avgGrowth: 0,
    
    // 3. En Yüksek Enflasyon - Max enflasyon ve ülke adı
    maxInflation: 0,
    maxInflationCountry: '-',
    
    // 4. Toplam Nüfus - Pazar büyüklüğü
    totalPopulation: 0,
    
    // Ek bilgiler
    totalCountries: ekonomiData.length,
    totalExport: 0,
    totalImport: 0
  };
  
  if (hasData) {
    // 1. Küresel Pazar Hacmi (Trilyon $ formatında)
    const totalGDP = ekonomiData.reduce((sum, e) => sum + parseFloat(e.toplam_gsyh_milyar_dolar || 0), 0);
    stats.globalGDP = totalGDP;
    // Trilyon formatı: 45200 milyar = 45.2 trilyon
    stats.globalGDPFormatted = `$${(totalGDP / 1000).toFixed(1)} Trilyon`;
    
    // 2. Ortalama Büyüme
    const growthSum = ekonomiData.reduce((sum, e) => sum + parseFloat(e.buyume_orani_yuzde || 0), 0);
    stats.avgGrowth = (growthSum / ekonomiData.length).toFixed(2);
    
    // 3. En Yüksek Enflasyon
    const highestInflation = ekonomiData.reduce((max, e) => 
      parseFloat(e.enflasyon_orani_yuzde || 0) > parseFloat(max.enflasyon_orani_yuzde || 0) ? e : max
    , ekonomiData[0]);
    stats.maxInflation = parseFloat(highestInflation.enflasyon_orani_yuzde || 0).toFixed(1);
    stats.maxInflationCountry = highestInflation.ulke_adi;
    
    // 4. Toplam Nüfus (Milyar formatında)
    const totalPop = ekonomiData.reduce((sum, e) => sum + parseFloat(e.nufus_milyon || 0), 0);
    stats.totalPopulation = totalPop;
    stats.totalPopulationFormatted = totalPop >= 1000 
      ? `${(totalPop / 1000).toFixed(2)} Milyar` 
      : `${totalPop.toFixed(0)} Milyon`;
    
    // Ek: İhracat/İthalat
    stats.totalExport = ekonomiData.reduce((sum, e) => sum + parseFloat(e.toplam_ihracat_milyar_dolar || 0), 0);
    stats.totalImport = ekonomiData.reduce((sum, e) => sum + parseFloat(e.toplam_ithalat_milyar_dolar || 0), 0);
  }
  
  // ============================================
  // ADIM 4: HARİTA VERİSİ - ISO_KODU: GSYİH değeri
  // ============================================
  const mapData = {};
  ekonomiData.forEach(e => {
    if (e.ISO_KODU) {
      mapData[e.ISO_KODU] = parseFloat(e.toplam_gsyh_milyar_dolar || 0);
    }
  });
  
  // ============================================
  // ADIM 5: GRAFİK VERİSİ - 17 Ülke GSYİH (Büyükten Küçüğe Sıralı)
  // ============================================
  const gdpData = {
    labels: [],
    data: [],
    backgroundColors: []
  };
  
  // Gradient renk paleti (17 ülke için)
  const colors = [
    'rgba(220, 53, 69, 0.85)',   // Kırmızı
    'rgba(255, 87, 51, 0.85)',   // Turuncu-Kırmızı
    'rgba(255, 128, 0, 0.85)',   // Turuncu
    'rgba(255, 193, 7, 0.85)',   // Sarı
    'rgba(40, 167, 69, 0.85)',   // Yeşil
    'rgba(32, 201, 151, 0.85)',  // Turkuaz
    'rgba(23, 162, 184, 0.85)',  // Cyan
    'rgba(0, 123, 255, 0.85)',   // Mavi
    'rgba(102, 16, 242, 0.85)',  // Mor
    'rgba(111, 66, 193, 0.85)',  // Açık Mor
    'rgba(232, 62, 140, 0.85)',  // Pembe
    'rgba(253, 126, 20, 0.85)',  // Açık Turuncu
    'rgba(108, 117, 125, 0.85)', // Gri
    'rgba(52, 58, 64, 0.85)',    // Koyu Gri
    'rgba(0, 86, 179, 0.85)',    // Koyu Mavi
    'rgba(25, 135, 84, 0.85)',   // Koyu Yeşil
    'rgba(13, 110, 253, 0.85)'   // Primary Mavi
  ];
  
  // Tüm 17 ülke (GSYİH'ya göre büyükten küçüğe sıralı - zaten SQL'de sıraladık)
  ekonomiData.forEach((e, i) => {
    gdpData.labels.push(e.ulke_adi);
    gdpData.data.push(parseFloat(e.toplam_gsyh_milyar_dolar || 0));
    gdpData.backgroundColors.push(colors[i % colors.length]);
  });
  
  // Son analizler
  const recentAnalyses = getRecentAnalyses(rawAnalyses, 5);

  // Sistem durumu
  const systemStatus = {
    status: 'online',
    dbConnection: true,
    lastUpdate: new Date().toISOString()
  };

  // DEBUG: Terminalde veriyi kontrol et
  console.log('📊 Dashboard Data:');
  console.log('  - Ülke sayısı:', ekonomiData.length);
  console.log('  - Küresel GSYİH:', stats.globalGDPFormatted);
  console.log('  - Ortalama Büyüme:', stats.avgGrowth + '%');
  console.log('  - En Yüksek Enflasyon:', stats.maxInflation + '% -', stats.maxInflationCountry);
  console.log('  - Toplam Nüfus:', stats.totalPopulationFormatted);
  console.log('  - Map Data:', mapData);

  // ADIM 6: View'a gönder
  res.render('analyses/dashboard', {
    title: 'Genel Bakış - KDS',
    activePage: 'dashboard',
    breadcrumb: [{ name: 'Genel Bakış', url: '/analyses/dashboard' }],
    hasData,
    stats,
    mapData: JSON.stringify(mapData),
    gdpData: JSON.stringify(gdpData),
    recentAnalyses,
    systemStatus,
    analyses: rawAnalyses,
    ekonomiData
  });
});

// Yeni analiz sayfası - Sektör ve Ülkeleri veritabanından çek
exports.getNewAnalysisPage = catchAsync(async (req, res, next) => {
  // Veritabanından sektör ve ülke listelerini al
  const sectors = await SectorModel.getAll();
  const countries = await CountryModel.getAll();
  
  res.render('analyses/new', {
    title: 'Yeni Rapor Oluştur - KDS',
    activePage: 'new-analysis',
    sectors,  // Sektör listesi
    countries // Ülke listesi (ISO kodları ile)
  });
});

// Tüm analizleri listele (API)
exports.getAllAnalyses = catchAsync(async (req, res, next) => {
  const analyses = await AnalysisModel.getAll();

  res.status(200).json({
    status: 'success',
    results: analyses.length,
    data: { analyses }
  });
});

// Kullanıcının analizlerini getir
exports.getUserAnalyses = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  const analyses = await AnalysisModel.getByUserId(userId);

  res.status(200).json({
    status: 'success',
    results: analyses.length,
    data: { analyses }
  });
});

// Tek analiz detayı
exports.getAnalysis = catchAsync(async (req, res, next) => {
  const analysis = await AnalysisModel.getById(req.params.id);

  if (!analysis) {
    return next(new AppError('Bu ID ile analiz bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { analysis }
  });
});

// Yeni analiz oluştur
exports.createAnalysis = catchAsync(async (req, res, next) => {
  const { kullanici_id, parametreler } = req.body;

  // Gerekli alan kontrolü
  if (!parametreler || !parametreler.hedef_ulke_id || !parametreler.hedef_sektor_id) {
    return next(new AppError('Ülke ve sektör seçimi zorunludur', 400));
  }

  const newAnalysisId = await AnalysisModel.create({
    kullanici_id: parseInt(kullanici_id) || 1,
    hedef_ulke_id: parseInt(parametreler.hedef_ulke_id),
    hedef_sektor_id: parseInt(parametreler.hedef_sektor_id),
    hesaplanan_skor: null,
    yonetici_notu: parametreler.aciklama || null
  });

  // Log kaydet
  await LogModel.info(
    'ANALYSIS_CREATE', 
    `Yeni analiz oluşturuldu: Ülke ${parametreler.ulke}, Sektör ${parametreler.sektor}`, 
    kullanici_id
  );

  const newAnalysis = await AnalysisModel.getById(newAnalysisId);

  res.status(201).json({
    status: 'success',
    message: 'Analiz başarıyla oluşturuldu',
    data: { analysis: newAnalysis }
  });
});

// Analiz güncelle
exports.updateAnalysis = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { analiz_adi, analiz_tipi, parametreler, durum } = req.body;

  const affectedRows = await AnalysisModel.update(id, {
    analiz_adi,
    analiz_tipi,
    parametreler,
    durum
  });

  if (affectedRows === 0) {
    return next(new AppError('Bu ID ile analiz bulunamadı', 404));
  }

  // Log kaydet
  await LogModel.info('ANALYSIS_UPDATE', `Analiz güncellendi: ID ${id}`, null);

  const updatedAnalysis = await AnalysisModel.getById(id);

  res.status(200).json({
    status: 'success',
    message: 'Analiz başarıyla güncellendi',
    data: { analysis: updatedAnalysis }
  });
});

// Analiz sonuçlarını kaydet
exports.saveResults = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { sonuclar } = req.body;

  if (!sonuclar) {
    return next(new AppError('Sonuç verisi gereklidir', 400));
  }

  const affectedRows = await AnalysisModel.saveResults(id, sonuclar);

  if (affectedRows === 0) {
    return next(new AppError('Bu ID ile analiz bulunamadı', 404));
  }

  // Log kaydet
  await LogModel.info('ANALYSIS_COMPLETE', `Analiz tamamlandı: ID ${id}`, null);

  const updatedAnalysis = await AnalysisModel.getById(id);

  res.status(200).json({
    status: 'success',
    message: 'Analiz sonuçları kaydedildi',
    data: { analysis: updatedAnalysis }
  });
});

// Analiz sil
exports.deleteAnalysis = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Önce analizi bul (log için)
  const analysis = await AnalysisModel.getById(id);
  
  if (!analysis) {
    return next(new AppError('Bu ID ile analiz bulunamadı', 404));
  }

  await AnalysisModel.delete(id);

  // Log kaydet
  await LogModel.info(
    'ANALYSIS_DELETE', 
    `Analiz silindi: ${analysis.analiz_adi}`, 
    analysis.kullanici_id
  );

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Analiz tipine göre listele
exports.getAnalysesByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  
  const analyses = await AnalysisModel.getByType(type);

  res.status(200).json({
    status: 'success',
    results: analyses.length,
    data: { analyses }
  });
});
