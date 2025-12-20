const { pool } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Sector Controller
 * Sektörel Analiz Modülü - Bütünleşik Rapor Sistemi
 * 
 * 4 Veri Kaynağı:
 * 1. currentSectorData - ulke_sektor_verileri (Güncel Sektör)
 * 2. historicalSectorData - gecmis_ulke_sektor_verileri (Geçmiş Sektör)
 * 3. currentEconomyData - ekonomi_guncel (Güncel Ekonomi)
 * 4. historicalEconomyData - ekonomi_gecmis (Geçmiş Ekonomi)
 */

// ============================================
// VERİTABANI SORGULARI
// ============================================

/**
 * Tüm sektörleri getir
 * TABLO: sektorler (sektor_id, sektor_adi)
 */
const getAllSectors = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT sektor_id, sektor_adi
      FROM sektorler
      ORDER BY sektor_adi ASC
    `);
    return rows || [];
  } catch (error) {
    console.warn('⚠️ Sektör listesi alınamadı:', error.message);
    return [];
  }
};

/**
 * Sektör bilgisi getir
 */
const getSectorById = async (sektorId) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM sektorler WHERE sektor_id = ?
    `, [sektorId]);
    return rows[0] || null;
  } catch (error) {
    console.warn('⚠️ Sektör bulunamadı:', error.message);
    return null;
  }
};

/**
 * 1. GÜNCEL SEKTÖR VERİSİ
 * ulke_sektor_verileri + ulkeler JOIN
 */
const getCurrentSectorData = async (sektorId) => {
  try {
    // TÜM 17 ÜLKE - LIMIT YOK
    const [rows] = await pool.query(`
      SELECT 
        usv.id,
        usv.ulke_id,
        usv.sektor_id,
        usv.sektorel_ihracat_milyon_usd,
        usv.sektorel_ithalat_milyon_usd,
        usv.sektorel_buyume_orani_yuzde,
        usv.sektorel_istihdam_bin_kisi,
        usv.sektorel_yatirim_milyon_usd,
        usv.yerli_uretim_karsilama_orani_yuzde,
        usv.yillik_uretim_miktari,
        usv.kapasite_veya_altyapi_degeri,
        u.ulke_adi,
        u.ISO_KODU
      FROM ulke_sektor_verileri usv
      INNER JOIN ulkeler u ON usv.ulke_id = u.ulke_id
      WHERE usv.sektor_id = ?
      ORDER BY usv.sektorel_ihracat_milyon_usd DESC
    `, [sektorId]);
    return rows || [];
  } catch (error) {
    console.warn('⚠️ Güncel sektör verisi alınamadı:', error.message);
    return [];
  }
};

/**
 * 2. GEÇMİŞ SEKTÖR VERİSİ
 * gecmis_ulke_sektor_verileri + ulkeler JOIN
 */
const getHistoricalSectorData = async (sektorId) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        gusv.id,
        gusv.ulke_id,
        gusv.sektor_id,
        gusv.yil,
        gusv.sektorel_ihracat_milyon_usd,
        gusv.sektorel_ithalat_milyon_usd,
        gusv.sektorel_buyume_orani_yuzde,
        gusv.sektorel_istihdam_bin_kisi,
        gusv.sektorel_yatirim_milyon_usd,
        gusv.yerli_uretim_karsilama_orani_yuzde,
        gusv.yillik_uretim_miktari,
        u.ulke_adi,
        u.ISO_KODU
      FROM gecmis_ulke_sektor_verileri gusv
      INNER JOIN ulkeler u ON gusv.ulke_id = u.ulke_id
      WHERE gusv.sektor_id = ?
      ORDER BY u.ulke_adi ASC, gusv.yil ASC
    `, [sektorId]);
    return rows || [];
  } catch (error) {
    console.warn('⚠️ Geçmiş sektör verisi alınamadı:', error.message);
    return [];
  }
};

/**
 * 3. GÜNCEL EKONOMİ VERİSİ
 * ekonomi_guncel + ulkeler JOIN (Sektördeki ülkeler için)
 */
const getCurrentEconomyData = async (ulkeIds) => {
  if (!ulkeIds || ulkeIds.length === 0) return [];
  
  try {
    const placeholders = ulkeIds.map(() => '?').join(',');
    const [rows] = await pool.query(`
      SELECT 
        eg.id,
        eg.ulke_id,
        eg.toplam_gsyh_milyar_dolar,
        eg.gsyh_kisi_basi_usd,
        eg.buyume_orani_yuzde,
        eg.enflasyon_orani_yuzde,
        eg.issizlik_orani_yuzde,
        eg.toplam_ihracat_milyar_dolar,
        eg.toplam_ithalat_milyar_dolar,
        eg.nufus_milyon,
        eg.risk_notu_kodu,
        u.ulke_adi,
        u.ISO_KODU
      FROM ekonomi_guncel eg
      INNER JOIN ulkeler u ON eg.ulke_id = u.ulke_id
      WHERE eg.ulke_id IN (${placeholders})
      ORDER BY eg.toplam_gsyh_milyar_dolar DESC
    `, ulkeIds);
    return rows || [];
  } catch (error) {
    console.warn('⚠️ Güncel ekonomi verisi alınamadı:', error.message);
    return [];
  }
};

/**
 * 4. GEÇMİŞ EKONOMİ VERİSİ
 * ekonomi_gecmis + ulkeler JOIN (Sektördeki ülkeler için)
 */
const getHistoricalEconomyData = async (ulkeIds) => {
  if (!ulkeIds || ulkeIds.length === 0) return [];
  
  try {
    const placeholders = ulkeIds.map(() => '?').join(',');
    const [rows] = await pool.query(`
      SELECT 
        eg.id,
        eg.ulke_id,
        eg.yil,
        eg.toplam_gsyh_milyar_dolar,
        eg.gsyh_kisi_basi_usd,
        eg.buyume_orani_yuzde,
        eg.enflasyon_orani_yuzde,
        eg.issizlik_orani_yuzde,
        eg.toplam_ihracat_milyar_dolar,
        eg.toplam_ithalat_milyar_dolar,
        eg.nufus_milyon,
        u.ulke_adi,
        u.ISO_KODU
      FROM ekonomi_gecmis eg
      INNER JOIN ulkeler u ON eg.ulke_id = u.ulke_id
      WHERE eg.ulke_id IN (${placeholders})
      ORDER BY u.ulke_adi ASC, eg.yil ASC
    `, ulkeIds);
    return rows || [];
  } catch (error) {
    console.warn('⚠️ Geçmiş ekonomi verisi alınamadı:', error.message);
    return [];
  }
};

// ============================================
// VERİ İŞLEME FONKSİYONLARI
// ============================================

/**
 * Harita verisi formatla (ihracat bazlı)
 */
const formatMapData = (data) => {
  const mapData = {};
  data.forEach(row => {
    if (row.ISO_KODU) {
      mapData[row.ISO_KODU] = parseFloat(row.sektorel_ihracat_milyon_usd) || 0;
    }
  });
  return mapData;
};

/**
 * Grafik verisi formatla - TÜM 17 ÜLKE
 */
const formatChartData = (data) => {
  const labels = [];
  const exportValues = [];
  const importValues = [];
  const growthValues = [];
  const investmentValues = [];
  const employmentValues = [];
  
  // TÜM ÜLKELER - LIMIT YOK
  data.forEach(row => {
    labels.push(row.ulke_adi || 'Bilinmiyor');
    exportValues.push(parseFloat(row.sektorel_ihracat_milyon_usd) || 0);
    importValues.push(parseFloat(row.sektorel_ithalat_milyon_usd) || 0);
    growthValues.push(parseFloat(row.sektorel_buyume_orani_yuzde) || 0);
    investmentValues.push(parseFloat(row.sektorel_yatirim_milyon_usd) || 0);
    employmentValues.push(parseFloat(row.sektorel_istihdam_bin_kisi) || 0);
  });

  return { labels, exportValues, importValues, growthValues, investmentValues, employmentValues };
};

/**
 * KPI istatistikleri hesapla
 */
const calculateStats = (data) => {
  if (!data || data.length === 0) {
    return {
      totalCountries: 0,
      totalExport: 0,
      totalImport: 0,
      avgGrowth: 0,
      totalEmployment: 0,
      totalInvestment: 0
    };
  }

  const totalExport = data.reduce((sum, r) => sum + (parseFloat(r.sektorel_ihracat_milyon_usd) || 0), 0);
  const totalImport = data.reduce((sum, r) => sum + (parseFloat(r.sektorel_ithalat_milyon_usd) || 0), 0);
  const totalEmployment = data.reduce((sum, r) => sum + (parseFloat(r.sektorel_istihdam_bin_kisi) || 0), 0);
  const totalInvestment = data.reduce((sum, r) => sum + (parseFloat(r.sektorel_yatirim_milyon_usd) || 0), 0);
  const avgGrowth = data.reduce((sum, r) => sum + (parseFloat(r.sektorel_buyume_orani_yuzde) || 0), 0) / data.length;

  return {
    totalCountries: data.length,
    totalExport: Math.round(totalExport),
    totalImport: Math.round(totalImport),
    avgGrowth: Math.round(avgGrowth * 10) / 10,
    totalEmployment: Math.round(totalEmployment),
    totalInvestment: Math.round(totalInvestment)
  };
};

/**
 * Tablo verisi formatla - TÜM SÜTUNLAR
 */
const formatTableData = (data) => {
  return data.map(row => ({
    ulke_id: row.ulke_id,
    ulke_adi: row.ulke_adi,
    iso_kodu: row.ISO_KODU,
    ihracat: parseFloat(row.sektorel_ihracat_milyon_usd) || 0,
    ithalat: parseFloat(row.sektorel_ithalat_milyon_usd) || 0,
    buyume: parseFloat(row.sektorel_buyume_orani_yuzde) || 0,
    yatirim: parseFloat(row.sektorel_yatirim_milyon_usd) || 0,
    istihdam: parseFloat(row.sektorel_istihdam_bin_kisi) || 0,
    yerliUretim: parseFloat(row.yerli_uretim_karsilama_orani_yuzde) || 0,
    uretim: parseFloat(row.yillik_uretim_miktari) || 0,
    kapasite: parseFloat(row.kapasite_veya_altyapi_degeri) || 0,
    ticaretDengesi: (parseFloat(row.sektorel_ihracat_milyon_usd) || 0) - (parseFloat(row.sektorel_ithalat_milyon_usd) || 0),
    isHighGrowth: parseFloat(row.sektorel_buyume_orani_yuzde) > 5,
    isExporter: (parseFloat(row.sektorel_ihracat_milyon_usd) || 0) > (parseFloat(row.sektorel_ithalat_milyon_usd) || 0)
  }));
};

// ============================================
// CONTROLLER FONKSİYONLARI
// ============================================

/**
 * Sektörel Dashboard - Ana sayfa
 */
exports.getDashboard = catchAsync(async (req, res, next) => {
  const sectors = await getAllSectors();
  
  // Her sektör için özet istatistik
  const sectorsWithStats = await Promise.all(
    sectors.map(async (sector) => {
      const data = await getCurrentSectorData(sector.sektor_id);
      const stats = calculateStats(data);
      return { ...sector, stats };
    })
  );

  res.render('sectors/dashboard', {
    title: 'Sektörel Analiz - KDS',
    activePage: 'sectors',
    breadcrumb: [{ name: 'Sektörel Analiz', url: '/dashboard' }],
    sectors: sectorsWithStats,
    hasData: sectorsWithStats.length > 0
  });
});

/**
 * Sektör Detay Sayfası - BÜTÜNLEŞİK RAPOR
 * 4 veri kaynağını paralel çeker ve tek sayfada gösterir
 */
exports.getSectorDetail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Sektör bilgisi
  const sector = await getSectorById(id);
  
  if (!sector) {
    return next(new AppError('Sektör bulunamadı', 404));
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 BÜTÜNLEŞİK RAPOR: ${sector.sektor_adi} (ID: ${id})`);

  // 1. Önce güncel sektör verisini çek (ülke ID'lerini almak için)
  const currentSectorData = await getCurrentSectorData(id);
  
  // Ülke ID'lerini çıkar
  const ulkeIds = [...new Set(currentSectorData.map(row => row.ulke_id))];
  
  console.log(`📦 Güncel Sektör Verisi: ${currentSectorData.length} kayıt`);
  console.log(`🌍 İlgili Ülke Sayısı: ${ulkeIds.length}`);

  // 2. Paralel olarak diğer 3 veri kaynağını çek
  const [historicalSectorData, currentEconomyData, historicalEconomyData] = await Promise.all([
    getHistoricalSectorData(id),
    getCurrentEconomyData(ulkeIds),
    getHistoricalEconomyData(ulkeIds)
  ]);

  console.log(`📜 Geçmiş Sektör Verisi: ${historicalSectorData.length} kayıt`);
  console.log(`💰 Güncel Ekonomi Verisi: ${currentEconomyData.length} kayıt`);
  console.log(`📈 Geçmiş Ekonomi Verisi: ${historicalEconomyData.length} kayıt`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Veri işleme
  const hasData = currentSectorData.length > 0;
  const mapData = formatMapData(currentSectorData);
  const chartData = formatChartData(currentSectorData);
  const stats = calculateStats(currentSectorData);
  const tableData = formatTableData(currentSectorData);

  // Geçmiş sektör verisini formatla
  const historicalSectorFormatted = historicalSectorData.map(row => ({
    ulke_adi: row.ulke_adi,
    iso_kodu: row.ISO_KODU,
    yil: row.yil,
    ihracat: parseFloat(row.sektorel_ihracat_milyon_usd) || 0,
    ithalat: parseFloat(row.sektorel_ithalat_milyon_usd) || 0,
    buyume: parseFloat(row.sektorel_buyume_orani_yuzde) || 0,
    istihdam: parseFloat(row.sektorel_istihdam_bin_kisi) || 0,
    yatirim: parseFloat(row.sektorel_yatirim_milyon_usd) || 0
  }));

  // Güncel ekonomi verisini formatla
  const currentEconomyFormatted = currentEconomyData.map(row => ({
    ulke_adi: row.ulke_adi,
    iso_kodu: row.ISO_KODU,
    gsyh: parseFloat(row.toplam_gsyh_milyar_dolar) || 0,
    gsyhKisiBasi: parseFloat(row.gsyh_kisi_basi_usd) || 0,
    buyume: parseFloat(row.buyume_orani_yuzde) || 0,
    enflasyon: parseFloat(row.enflasyon_orani_yuzde) || 0,
    issizlik: parseFloat(row.issizlik_orani_yuzde) || 0,
    ihracat: parseFloat(row.toplam_ihracat_milyar_dolar) || 0,
    ithalat: parseFloat(row.toplam_ithalat_milyar_dolar) || 0,
    nufus: parseFloat(row.nufus_milyon) || 0,
    riskNotu: row.risk_notu_kodu || '-'
  }));

  // Geçmiş ekonomi verisini formatla
  const historicalEconomyFormatted = historicalEconomyData.map(row => ({
    ulke_adi: row.ulke_adi,
    iso_kodu: row.ISO_KODU,
    yil: row.yil,
    gsyh: parseFloat(row.toplam_gsyh_milyar_dolar) || 0,
    buyume: parseFloat(row.buyume_orani_yuzde) || 0,
    enflasyon: parseFloat(row.enflasyon_orani_yuzde) || 0,
    issizlik: parseFloat(row.issizlik_orani_yuzde) || 0,
    ihracat: parseFloat(row.toplam_ihracat_milyar_dolar) || 0,
    ithalat: parseFloat(row.toplam_ithalat_milyar_dolar) || 0
  }));

  // Trend verisi hazırla (ülke bazında geçmiş ihracat)
  const trendData = {};
  historicalSectorFormatted.forEach(row => {
    if (!trendData[row.ulke_adi]) {
      trendData[row.ulke_adi] = [];
    }
    trendData[row.ulke_adi].push({ yil: row.yil, ihracat: row.ihracat });
  });
  // Yıla göre sırala
  Object.keys(trendData).forEach(ulke => {
    trendData[ulke].sort((a, b) => a.yil - b.yil);
  });

  // View'a gönder
  res.render('sectors/detail', {
    title: `${sector.sektor_adi} - Bütünleşik Rapor`,
    activePage: 'sectors',
    breadcrumb: [
      { name: 'Sektörel Analiz', url: '/dashboard' },
      { name: sector.sektor_adi, url: `/dashboard/sector/${id}` }
    ],
    sector,
    hasData,
    
    // GRAFİK VERİLERİ (17 ülke)
    mapData: JSON.stringify(mapData),
    chartLabels: JSON.stringify(chartData.labels),
    chartExportValues: JSON.stringify(chartData.exportValues),
    chartImportValues: JSON.stringify(chartData.importValues),
    chartGrowthValues: JSON.stringify(chartData.growthValues),
    chartInvestmentValues: JSON.stringify(chartData.investmentValues),
    chartEmploymentValues: JSON.stringify(chartData.employmentValues),
    
    // KPI ve TABLO
    stats,
    tableData,
    
    // TREND VERİSİ
    trendData: JSON.stringify(trendData),
    
    // BÖLÜM 2: Geçmiş Sektör
    historicalSectorData: historicalSectorFormatted,
    hasHistoricalSector: historicalSectorFormatted.length > 0,
    
    // BÖLÜM 3: Güncel Ekonomi
    currentEconomyData: currentEconomyFormatted,
    hasCurrentEconomy: currentEconomyFormatted.length > 0,
    
    // BÖLÜM 4: Geçmiş Ekonomi
    historicalEconomyData: historicalEconomyFormatted,
    hasHistoricalEconomy: historicalEconomyFormatted.length > 0
  });
});

/**
 * Sektör listesi API
 */
exports.getAllSectors = catchAsync(async (req, res, next) => {
  const sectors = await getAllSectors();

  res.status(200).json({
    status: 'success',
    results: sectors.length,
    data: { sectors }
  });
});

/**
 * Sektör detay API
 */
exports.getSectorData = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const sector = await getSectorById(id);
  const currentSectorData = await getCurrentSectorData(id);
  const stats = calculateStats(currentSectorData);

  if (!sector) {
    return next(new AppError('Sektör bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { sector, currentSectorData, stats }
  });
});
