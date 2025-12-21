const { pool } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Country Controller
 * Ülke Detay Dashboard - Time-Series Analizi
 * 
 * Veri Kaynakları:
 * 1. ekonomi_gecmis - Makro ekonomik trendler (2018-2023)
 * 2. gecmis_ulke_sektor_verileri - Sektörel gelişim trendleri
 */

// ============================================
// VERİTABANI SORGULARI
// ============================================

/**
 * Tüm ülkeleri getir
 */
const getAllCountries = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ulke_id,
        ulke_adi,
        ISO_KODU,
        bolge_id
      FROM ulkeler
      ORDER BY ulke_adi ASC
    `);
    return rows || [];
  } catch (error) {
    console.warn('⚠️ Ülke listesi alınamadı:', error.message);
    return [];
  }
};

/**
 * Ülke bilgisi getir (Temel bilgiler)
 */
const getCountryById = async (ulkeId) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM ulkeler WHERE ulke_id = ?
    `, [ulkeId]);
    return rows[0] || null;
  } catch (error) {
    console.warn('⚠️ Ülke bulunamadı:', error.message);
    return null;
  }
};

/**
 * Lojistik ve Anlaşma verileri getir (Ayrı sorgu - tablo yoksa hata vermez)
 */
const getLogisticsData = async (ulkeId) => {
  try {
    // Önce tablonun var olup olmadığını kontrol et
    const [tables] = await pool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lojistik_verileri'
    `);
    
    if (tables.length === 0) {
      console.warn('⚠️ lojistik_verileri tablosu bulunamadı');
      return null;
    }

    const [rows] = await pool.query(`
      SELECT 
        l.lpi_skoru_ham as lpi_skoru,
        l.gumruk_bekleme_suresi_gun,
        l.konteyner_ihracat_maliyeti_usd
      FROM lojistik_verileri l
      WHERE l.ulke_id = ?
    `, [ulkeId]);
    
    if (rows[0]) {
      const data = rows[0];
      return {
        lpiSkoru: parseFloat(data.lpi_skoru) || 0,
        gumrukSuresi: parseFloat(data.gumruk_bekleme_suresi_gun) || 0,
        konteynerMaliyeti: parseFloat(data.konteyner_ihracat_maliyeti_usd) || 0,
        anlasmaAdi: null,
        anlasmaKodu: null,
        hasData: true
      };
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Lojistik verisi alınamadı:', error.message);
    return null;
  }
};

/**
 * Ülkenin ekonomi geçmişi (2018-2023)
 * ekonomi_gecmis tablosundan yıla göre sıralı
 */
const getEconomyHistory = async (ulkeId) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        yil,
        toplam_gsyh_milyar_dolar,
        gsyh_kisi_basi_usd,
        buyume_orani_yuzde,
        enflasyon_orani_yuzde,
        issizlik_orani_yuzde,
        toplam_ihracat_milyar_dolar,
        toplam_ithalat_milyar_dolar,
        nufus_milyon
      FROM ekonomi_gecmis
      WHERE ulke_id = ?
      ORDER BY yil ASC
    `, [ulkeId]);
    return rows || [];
  } catch (error) {
    console.warn('⚠️ Ekonomi geçmişi alınamadı:', error.message);
    return [];
  }
};

/**
 * Ülkenin sektörel geçmişi (2018-2023)
 * gecmis_ulke_sektor_verileri + sektorler JOIN
 */
const getSectorHistory = async (ulkeId) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        gusv.yil,
        gusv.sektor_id,
        gusv.sektorel_ihracat_milyon_usd,
        gusv.sektorel_ithalat_milyon_usd,
        gusv.sektorel_buyume_orani_yuzde,
        gusv.sektorel_istihdam_bin_kisi,
        s.sektor_adi
      FROM gecmis_ulke_sektor_verileri gusv
      INNER JOIN sektorler s ON gusv.sektor_id = s.sektor_id
      WHERE gusv.ulke_id = ?
      ORDER BY gusv.yil ASC, s.sektor_adi ASC
    `, [ulkeId]);
    return rows || [];
  } catch (error) {
    console.warn('⚠️ Sektör geçmişi alınamadı:', error.message);
    return [];
  }
};

/**
 * Ülkenin güncel ekonomi verisi
 */
const getCurrentEconomy = async (ulkeId) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM ekonomi_guncel WHERE ulke_id = ?
    `, [ulkeId]);
    return rows[0] || null;
  } catch (error) {
    console.warn('⚠️ Güncel ekonomi verisi alınamadı:', error.message);
    return null;
  }
};

// ============================================
// VERİ İŞLEME FONKSİYONLARI
// ============================================

/**
 * Ekonomi verisini Chart.js formatına dönüştür
 */
const formatEconomyTrends = (economyData) => {
  const years = [];
  const gdpTrend = [];
  const gdpPerCapitaTrend = [];
  const growthTrend = [];
  const inflationTrend = [];
  const unemploymentTrend = [];
  const exportTrend = [];
  const importTrend = [];

  economyData.forEach(row => {
    years.push(row.yil);
    gdpTrend.push(parseFloat(row.toplam_gsyh_milyar_dolar) || 0);
    gdpPerCapitaTrend.push(parseFloat(row.gsyh_kisi_basi_usd) || 0);
    growthTrend.push(parseFloat(row.buyume_orani_yuzde) || 0);
    inflationTrend.push(parseFloat(row.enflasyon_orani_yuzde) || 0);
    unemploymentTrend.push(parseFloat(row.issizlik_orani_yuzde) || 0);
    exportTrend.push(parseFloat(row.toplam_ihracat_milyar_dolar) || 0);
    importTrend.push(parseFloat(row.toplam_ithalat_milyar_dolar) || 0);
  });

  return {
    years,
    gdpTrend,
    gdpPerCapitaTrend,
    growthTrend,
    inflationTrend,
    unemploymentTrend,
    exportTrend,
    importTrend
  };
};

/**
 * Sektör verisini Multi-Line Chart formatına dönüştür
 * Her sektör için ayrı bir dataset oluştur
 */
const formatSectorTrends = (sectorData) => {
  // Benzersiz yılları ve sektörleri bul
  const yearsSet = new Set();
  const sectorsMap = new Map();

  sectorData.forEach(row => {
    yearsSet.add(row.yil);
    
    if (!sectorsMap.has(row.sektor_id)) {
      sectorsMap.set(row.sektor_id, {
        id: row.sektor_id,
        name: row.sektor_adi,
        data: {}
      });
    }
    
    sectorsMap.get(row.sektor_id).data[row.yil] = {
      ihracat: parseFloat(row.sektorel_ihracat_milyon_usd) || 0,
      ithalat: parseFloat(row.sektorel_ithalat_milyon_usd) || 0,
      buyume: parseFloat(row.sektorel_buyume_orani_yuzde) || 0,
      istihdam: parseFloat(row.sektorel_istihdam_bin_kisi) || 0
    };
  });

  // Yılları sırala
  const years = Array.from(yearsSet).sort((a, b) => a - b);
  
  // Her sektör için ihracat trend dizisi oluştur
  const sectors = [];
  const colors = [
    'rgba(66, 153, 225, 1)',   // Mavi
    'rgba(72, 187, 120, 1)',   // Yeşil
    'rgba(237, 137, 54, 1)',   // Turuncu
    'rgba(159, 122, 234, 1)',  // Mor
    'rgba(245, 101, 101, 1)',  // Kırmızı
    'rgba(56, 178, 172, 1)',   // Teal
    'rgba(246, 173, 85, 1)',   // Sarı
    'rgba(160, 174, 192, 1)',  // Gri
  ];

  let colorIndex = 0;
  sectorsMap.forEach((sector, sectorId) => {
    const exportData = years.map(year => sector.data[year]?.ihracat || 0);
    
    sectors.push({
      id: sector.id,
      name: sector.name,
      color: colors[colorIndex % colors.length],
      exportData
    });
    
    colorIndex++;
  });

  return { years, sectors };
};

// ============================================
// CONTROLLER FONKSİYONLARI
// ============================================

/**
 * Ülke Listesi Sayfası
 */
exports.getCountryList = catchAsync(async (req, res, next) => {
  const countries = await getAllCountries();

  res.render('countries/index', {
    title: 'Ülke İncele - KDS',
    activePage: 'countries',
    breadcrumb: [{ name: 'Ülke İncele', url: '/countries' }],
    countries,
    hasData: countries.length > 0
  });
});

/**
 * Ülke Detay Dashboard
 * Time-Series analizi ile ekonomi ve sektör trendleri
 */
exports.getCountryDetail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // DEBUG LOG
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 İstenen Ülke ID:', id);
  console.log('🔍 req.params:', req.params);
  
  // ID kontrolü
  if (!id || isNaN(parseInt(id))) {
    console.log('❌ Geçersiz ID formatı:', id);
    return next(new AppError('Geçersiz ülke ID formatı', 400));
  }
  
  // Ülke bilgisi
  const country = await getCountryById(parseInt(id));
  
  console.log('🔍 Bulunan Ülke:', country ? country.ulke_adi : 'YOK');
  
  if (!country) {
    console.log('❌ Ülke bulunamadı - ID:', id);
    return next(new AppError('Ülke bulunamadı', 404));
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌍 ÜLKE DETAY: ${country.ulke_adi} (${country.ISO_KODU})`);

  // Paralel veri çekme
  const [economyHistory, sectorHistory, currentEconomy, logisticsData] = await Promise.all([
    getEconomyHistory(id),
    getSectorHistory(id),
    getCurrentEconomy(id),
    getLogisticsData(id)
  ]);

  // Lojistik verisi için varsayılan değerler
  const logistics = logisticsData || {
    lpiSkoru: 0,
    gumrukSuresi: 0,
    konteynerMaliyeti: 0,
    anlasmaAdi: null,
    anlasmaKodu: null,
    hasData: false
  };

  console.log('📦 Lojistik Verisi:', logistics.hasData ? 'VAR' : 'YOK');

  console.log(`📈 Ekonomi Geçmişi: ${economyHistory.length} yıl`);
  console.log(`🏭 Sektör Geçmişi: ${sectorHistory.length} kayıt`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Veri işleme
  const economyTrends = formatEconomyTrends(economyHistory);
  const sectorTrends = formatSectorTrends(sectorHistory);

  // Güncel KPI'lar
  const currentKPIs = currentEconomy ? {
    gsyh: parseFloat(currentEconomy.toplam_gsyh_milyar_dolar) || 0,
    gsyhKisiBasi: parseFloat(currentEconomy.gsyh_kisi_basi_usd) || 0,
    enflasyon: parseFloat(currentEconomy.enflasyon_orani_yuzde) || 0,
    issizlik: parseFloat(currentEconomy.issizlik_orani_yuzde) || 0,
    riskNotu: currentEconomy.risk_notu_kodu || '-'
  } : null;

  // Tablo için ekonomi verisi formatla
  const economyTableData = economyHistory.map(row => ({
    yil: row.yil,
    gsyh: parseFloat(row.toplam_gsyh_milyar_dolar) || 0,
    gsyhKisiBasi: parseFloat(row.gsyh_kisi_basi_usd) || 0,
    buyume: parseFloat(row.buyume_orani_yuzde) || 0,
    enflasyon: parseFloat(row.enflasyon_orani_yuzde) || 0,
    issizlik: parseFloat(row.issizlik_orani_yuzde) || 0,
    ihracat: parseFloat(row.toplam_ihracat_milyar_dolar) || 0,
    ithalat: parseFloat(row.toplam_ithalat_milyar_dolar) || 0
  }));

  console.log('📊 Ekonomi Tablo Verisi:', economyTableData.length, 'kayıt');

  // View'a gönder
  res.render('countries/detail', {
    title: `${country.ulke_adi} - Ülke Analizi`,
    activePage: 'countries',
    breadcrumb: [
      { name: 'Ülke İncele', url: '/countries' },
      { name: country.ulke_adi, url: `/countries/${id}` }
    ],
    country,
    hasData: economyHistory.length > 0,
    currentKPIs,
    
    // Lojistik verileri (ayrı obje olarak)
    logistics,
    
    // Chart.js için hazır veriler (JSON string)
    economyYears: JSON.stringify(economyTrends.years),
    gdpTrend: JSON.stringify(economyTrends.gdpTrend),
    gdpPerCapitaTrend: JSON.stringify(economyTrends.gdpPerCapitaTrend),
    inflationTrend: JSON.stringify(economyTrends.inflationTrend),
    growthTrend: JSON.stringify(economyTrends.growthTrend),
    unemploymentTrend: JSON.stringify(economyTrends.unemploymentTrend),
    exportTrend: JSON.stringify(economyTrends.exportTrend),
    importTrend: JSON.stringify(economyTrends.importTrend),
    
    // Tablo için veri
    economyTableData: JSON.stringify(economyTableData),
    
    // Sektörel trend verileri
    sectorYears: JSON.stringify(sectorTrends.years),
    sectorDatasets: JSON.stringify(sectorTrends.sectors),
    hasSectorData: sectorTrends.sectors.length > 0
  });
});

/**
 * Ülke listesi API
 */
exports.getCountriesAPI = catchAsync(async (req, res, next) => {
  const countries = await getAllCountries();

  res.status(200).json({
    status: 'success',
    results: countries.length,
    data: { countries }
  });
});
