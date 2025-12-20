const EconomyModel = require('../models/economyModel');
const CountryModel = require('../models/countryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Economy Controller
 * Makro Ekonomi Modülü
 */

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Risk notu rengini belirle
 */
const getRiskColor = (riskNotu) => {
  if (!riskNotu) return 'gray';
  
  const rating = riskNotu.toUpperCase();
  
  if (rating.startsWith('AAA') || rating.startsWith('AA')) return 'green';
  if (rating.startsWith('A')) return 'lightgreen';
  if (rating.startsWith('BBB')) return 'yellow';
  if (rating.startsWith('BB')) return 'orange';
  if (rating.startsWith('B')) return 'red';
  return 'darkred'; // CCC ve altı
};

/**
 * Harita verisi formatla
 */
const formatMapData = (economyData, metric) => {
  const mapData = {};
  
  economyData.forEach(row => {
    if (row.ISO_KODU && row.value !== null) {
      mapData[row.ISO_KODU] = parseFloat(row.value) || 0;
    }
  });

  return mapData;
};

/**
 * KPI kartları için veri formatla
 */
const formatKPIData = (countryEconomy) => {
  if (!countryEconomy) {
    return {
      enflasyon: { value: '-', status: 'neutral' },
      issizlik: { value: '-', status: 'neutral' },
      gsyhKisiBasi: { value: '-', status: 'neutral' },
      riskNotu: { value: '-', color: 'gray' }
    };
  }

  const enflasyon = parseFloat(countryEconomy.enflasyon_orani_yuzde) || 0;
  const issizlik = parseFloat(countryEconomy.issizlik_orani_yuzde) || 0;
  const gsyhKisiBasi = parseFloat(countryEconomy.gsyh_kisi_basi_usd) || 0;
  const riskNotu = countryEconomy.risk_notu_kodu || '-';

  return {
    enflasyon: {
      value: enflasyon.toFixed(1) + '%',
      status: enflasyon < 5 ? 'good' : enflasyon < 10 ? 'warning' : 'danger'
    },
    issizlik: {
      value: issizlik.toFixed(1) + '%',
      status: issizlik < 5 ? 'good' : issizlik < 10 ? 'warning' : 'danger'
    },
    gsyhKisiBasi: {
      value: '$' + gsyhKisiBasi.toLocaleString('tr-TR'),
      status: gsyhKisiBasi > 30000 ? 'good' : gsyhKisiBasi > 10000 ? 'warning' : 'danger'
    },
    riskNotu: {
      value: riskNotu,
      color: getRiskColor(riskNotu)
    },
    // Ek veriler
    gsyh: countryEconomy.toplam_gsyh_milyar_dolar ? '$' + parseFloat(countryEconomy.toplam_gsyh_milyar_dolar).toLocaleString('tr-TR') + 'B' : '-',
    disBorc: countryEconomy.dis_borc_milyar_usd ? '$' + parseFloat(countryEconomy.dis_borc_milyar_usd).toLocaleString('tr-TR') + 'B' : '-',
    cariDenge: countryEconomy.cari_denge_milyar_usd ? '$' + parseFloat(countryEconomy.cari_denge_milyar_usd).toLocaleString('tr-TR') + 'B' : '-',
    faizOrani: countryEconomy.faiz_orani_yuzde ? parseFloat(countryEconomy.faiz_orani_yuzde).toFixed(1) + '%' : '-',
    dovizRezervi: countryEconomy.doviz_rezervi_milyar_usd ? '$' + parseFloat(countryEconomy.doviz_rezervi_milyar_usd).toLocaleString('tr-TR') + 'B' : '-'
  };
};

// ============================================
// CONTROLLER FONKSİYONLARI
// ============================================

/**
 * Makro Ekonomi Dashboard
 */
exports.getDashboard = catchAsync(async (req, res, next) => {
  // Tüm ülkeleri getir (dropdown için)
  const countries = await CountryModel.getAll();
  
  // Tüm ekonomi verilerini getir
  const allEconomyData = await EconomyModel.getAll();
  const hasData = allEconomyData.length > 0;

  // Varsayılan olarak ilk ülkeyi veya Türkiye'yi seç
  let selectedCountry = null;
  let selectedEconomy = null;
  let kpiData = null;

  if (hasData) {
    // URL'den ülke seçimi varsa onu kullan
    const selectedIso = req.query.country || 'TR';
    selectedEconomy = await EconomyModel.getByIsoCode(selectedIso);
    
    if (selectedEconomy) {
      selectedCountry = {
        id: selectedEconomy.ulke_id,
        ulke_adi: selectedEconomy.ulke_adi,
        ISO_KODU: selectedEconomy.ISO_KODU
      };
      kpiData = formatKPIData(selectedEconomy);
    }
  }

  // Harita verisi (Kişi başı GSYH)
  const mapRawData = await EconomyModel.getMapData('gsyh_kisi_basi_usd');
  const mapData = {};
  mapRawData.forEach(row => {
    if (row.ISO_KODU) {
      mapData[row.ISO_KODU] = row.value;
    }
  });

  res.render('economics/dashboard', {
    title: 'Makro Ekonomi - KDS',
    activePage: 'economics',
    breadcrumb: [{ name: 'Makro Ekonomi', url: '/economics' }],
    countries,
    allEconomyData,
    selectedCountry,
    selectedEconomy,
    kpiData,
    mapData: JSON.stringify(mapData),
    hasData
  });
});

/**
 * Ülke ekonomi detayı API
 */
exports.getCountryEconomy = catchAsync(async (req, res, next) => {
  const { countryId } = req.params;
  
  const economy = await EconomyModel.getByCountryId(countryId);

  if (!economy) {
    return next(new AppError('Ülke ekonomi verisi bulunamadı', 404));
  }

  const kpiData = formatKPIData(economy);

  res.status(200).json({
    status: 'success',
    data: { economy, kpiData }
  });
});

/**
 * ISO koduna göre ekonomi verisi API
 */
exports.getEconomyByIso = catchAsync(async (req, res, next) => {
  const { iso } = req.params;
  
  const economy = await EconomyModel.getByIsoCode(iso.toUpperCase());

  if (!economy) {
    return next(new AppError('Ülke ekonomi verisi bulunamadı', 404));
  }

  const kpiData = formatKPIData(economy);

  res.status(200).json({
    status: 'success',
    data: { economy, kpiData }
  });
});

/**
 * Tüm ekonomi verileri API
 */
exports.getAllEconomyData = catchAsync(async (req, res, next) => {
  const data = await EconomyModel.getAll();

  res.status(200).json({
    status: 'success',
    results: data.length,
    data: { economies: data }
  });
});
