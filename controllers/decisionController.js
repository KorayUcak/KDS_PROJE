const DecisionModel = require('../models/decisionModel');
const SectorModel = require('../models/sectorModel');
const FilterModel = require('../models/filterModel');
const DecisionLogic = require('../utils/decisionLogic');
const GlobalMarkets = require('../utils/globalMarketsData');
const UnifiedScoringEngine = require('../utils/unifiedScoringEngine');
const SectorConfig = require('../utils/sectorConfig');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Decision Support Controller
 * Karar Destek Sistemi için view ve API işlemleri
 */

// Ana sayfa - Command Center (birleşik dashboard)
exports.getCommandCenter = catchAsync(async (req, res, next) => {
  // Tüm filtre seçeneklerini veritabanından çek
  const filterOptions = await FilterModel.getAllFilterOptions();
  
  res.render('decision/command-center', {
    title: 'KDS - Command Center',
    ...filterOptions
  });
});

// Head-to-Head Karşılaştırma Sayfası
exports.getCompareDuel = catchAsync(async (req, res, next) => {
  res.render('decision/compare-duel', {
    title: 'Ülke Düellosu - Head-to-Head Karşılaştırma'
  });
});

// Eski sayfa - Sektör seçimi (yönlendirme için)
exports.getSectorSelection = catchAsync(async (req, res, next) => {
  // Tüm filtre seçeneklerini veritabanından çek
  const filterOptions = await FilterModel.getAllFilterOptions();
  
  res.render('decision/sector-select', {
    title: 'KDS - Karar Destek Sistemi',
    ...filterOptions
  });
});

// API: Filtre seçenekleri
exports.getFilterOptionsAPI = catchAsync(async (req, res, next) => {
  const filterOptions = await FilterModel.getAllFilterOptions();
  
  res.status(200).json({
    status: 'success',
    data: filterOptions
  });
});

// Ülke sıralaması sayfası
exports.getCountryRankings = catchAsync(async (req, res, next) => {
  const { sektorId } = req.params;
  
  // Ağırlıkları query string'den al veya varsayılanları kullan
  const weights = {
    marketPotential: parseInt(req.query.marketPotential) || 30,
    economicStability: parseInt(req.query.economicStability) || 25,
    logisticsEase: parseInt(req.query.logisticsEase) || 25,
    sectorGrowth: parseInt(req.query.sectorGrowth) || 20
  };

  // Sektör bilgisini getir
  const sector = await SectorModel.getById(sektorId);
  if (!sector) {
    return next(new AppError('Sektör bulunamadı', 404));
  }

  // Sektör özetini getir
  const sectorSummary = await DecisionModel.getSectorSummary(sektorId);

  // Ülke sıralamalarını getir
  const rankings = await DecisionModel.getCountryRankings(sektorId, weights);

  // Tüm sektörleri getir (sidebar için)
  const sectors = await SectorModel.getAll();

  res.render('decision/rankings', {
    title: `${sector.sektor_adi} - Ülke Sıralaması`,
    sector,
    sectorSummary,
    rankings,
    sectors,
    weights,
    topCountries: rankings.slice(0, 5)
  });
});

// Ülke detay sayfası - 7 Karar Framework (YENİ: Birleşik Skorlama)
exports.getCountryDetail = catchAsync(async (req, res, next) => {
  const { sektorId, ulkeId } = req.params;

  // Sektör bilgisini getir
  const sector = await SectorModel.getById(sektorId);
  if (!sector) {
    return next(new AppError('Sektör bulunamadı', 404));
  }

  // Ülke detayını getir
  const country = await DecisionModel.getCountryDetail(ulkeId, sektorId);
  if (!country) {
    return next(new AppError('Ülke bulunamadı', 404));
  }

  // Bu ülkenin skorunu hesapla
  const rankings = await DecisionModel.getCountryRankings(sektorId);
  const countryRank = rankings.find(r => r.ulke_id == ulkeId);

  // Tüm sektörleri getir (sidebar için)
  const sectors = await SectorModel.getAll();

  // 7 Karar Framework - Executive Verdicts (YENİ: Birleşik Skorlama)
  const decisionData = {
    risk_notu_kodu: country.risk_notu_kodu,
    yerli_uretim_karsilama_orani_yuzde: country.yerli_uretim_karsilama_orani_yuzde,
    gsyh_kisi_basi_usd: country.gsyh_kisi_basi_usd,
    lpi_skoru: country.lpi_skoru,
    gumruk_bekleme_suresi_gun: country.gumruk_bekleme_suresi_gun,
    enflasyon_orani_yuzde: country.enflasyon_orani_yuzde,
    nufus_milyon: country.nufus_milyon,
    sektorel_buyume_orani_yuzde: country.sektorel_buyume_orani_yuzde,
    anlasma_sayisi: country.agreements ? country.agreements.length : 0,
    agreements: country.agreements || [],
    issizlik_orani_yuzde: country.issizlik_orani_yuzde,
    buyume_orani_yuzde: country.buyume_orani_yuzde
  };

  // YENİ: Birleşik skorlama motoru ile tutarlı sonuçlar
  const unifiedResult = UnifiedScoringEngine.calculateGlobalScore(decisionData);
  
  // Legacy decisions (geriye dönük uyumluluk)
  const legacyDecisions = DecisionLogic.getAllDecisions(decisionData);

  res.render('decision/country-detail', {
    title: `${country.ulke_adi} - ${sector.sektor_adi} Analizi`,
    sector,
    country,
    countryRank,
    sectors,
    // YENİ: Birleşik skorlama verileri
    unifiedScore: unifiedResult,
    decisions: unifiedResult.decisions,
    globalScore: unifiedResult.globalScore,
    decisionCounts: unifiedResult.counts,
    recommendation: unifiedResult.recommendation,
    // Legacy (geriye dönük uyumluluk)
    legacyDecisions
  });
});

// Ülke karşılaştırma sayfası
exports.compareCountries = catchAsync(async (req, res, next) => {
  const { sektorId } = req.params;
  const ulkeIds = req.query.countries ? req.query.countries.split(',').map(Number) : [];

  if (ulkeIds.length < 2) {
    return next(new AppError('Karşılaştırma için en az 2 ülke seçmelisiniz', 400));
  }

  const sector = await SectorModel.getById(sektorId);
  if (!sector) {
    return next(new AppError('Sektör bulunamadı', 404));
  }

  // Karşılaştırma verilerini getir
  const countries = await DecisionModel.compareCountries(ulkeIds, sektorId);

  // Sıralamaları da getir
  const rankings = await DecisionModel.getCountryRankings(sektorId);
  const comparedCountriesWithScores = countries.map(c => {
    const rank = rankings.find(r => r.ulke_id === c.ulke_id);
    return { ...c, ...rank };
  });

  res.render('decision/compare', {
    title: `Ülke Karşılaştırması - ${sector.sektor_adi}`,
    sector,
    countries: comparedCountriesWithScores,
    sectors: await SectorModel.getAll()
  });
});

// API: Ülke sıralaması (JSON) - Hybrid: DB + Global Markets
exports.getRankingsAPI = catchAsync(async (req, res, next) => {
  const { sektorId } = req.params;
  
  const weights = {
    marketPotential: parseInt(req.query.marketPotential) || 30,
    economicStability: parseInt(req.query.economicStability) || 25,
    logisticsEase: parseInt(req.query.logisticsEase) || 25,
    sectorGrowth: parseInt(req.query.sectorGrowth) || 20
  };

  // DB'den mevcut verileri çek
  let dbCountries = [];
  try {
    dbCountries = await DecisionModel.getCountryRankings(sektorId, weights);
  } catch (err) {
    console.log('DB countries fetch failed, using only global markets:', err.message);
  }

  // Global markets ile birleştir (DB verisi yoksa bile çalışır)
  const mergedCountries = GlobalMarkets.mergeWithDBData(dbCountries, weights);
  
  res.status(200).json({
    status: 'success',
    results: mergedCountries.length,
    data: {
      rankings: mergedCountries
    }
  });
});

// API: Sadece Global Markets (Fallback)
exports.getGlobalMarketsAPI = catchAsync(async (req, res, next) => {
  const weights = {
    marketPotential: parseInt(req.query.marketPotential) || 30,
    economicStability: parseInt(req.query.economicStability) || 25,
    logisticsEase: parseInt(req.query.logisticsEase) || 25,
    sectorGrowth: parseInt(req.query.sectorGrowth) || 20
  };

  const globalMarkets = GlobalMarkets.getGlobalMarkets(weights);
  
  res.status(200).json({
    status: 'success',
    results: globalMarkets.length,
    data: {
      countries: globalMarkets
    }
  });
});

// API: Ülke detayı (JSON)
exports.getCountryDetailAPI = catchAsync(async (req, res, next) => {
  const { sektorId, ulkeId } = req.params;

  const country = await DecisionModel.getCountryDetail(ulkeId, sektorId);
  if (!country) {
    return next(new AppError('Ülke bulunamadı', 404));
  }

  const rankings = await DecisionModel.getCountryRankings(sektorId);
  const countryRank = rankings.find(r => r.ulke_id == ulkeId);

  res.status(200).json({
    status: 'success',
    data: {
      country,
      ranking: countryRank
    }
  });
});

// API: Karar kaydet (Decision Recording System)
exports.saveDecisionAPI = catchAsync(async (req, res, next) => {
  // DEBUG: Log incoming request body
  console.log('📥 [saveDecisionAPI] Gelen veri:', JSON.stringify(req.body, null, 2));
  
  const {
    ulke_id,
    ulke_adi,
    sektor_id,
    sektor_adi,
    karar_durumu,
    yonetici_notu,
    hesaplanan_skor
  } = req.body;

  // Gerekli alanları kontrol et - sadece ulke_id zorunlu
  if (!ulke_id) {
    console.error('❌ [saveDecisionAPI] Hata: ulke_id eksik');
    return next(new AppError('Ülke seçimi zorunludur', 400));
  }

  // Analiz adını oluştur
  const analiz_adi = `${ulke_adi || 'Ülke'} - ${sektor_adi || 'Genel'} Değerlendirmesi`;

  console.log('📝 [saveDecisionAPI] Kaydedilecek analiz:', analiz_adi);

  try {
    const result = await DecisionModel.saveDecision({
      analiz_adi,
      ulke_id,
      ulke_adi: ulke_adi || 'Bilinmeyen',
      sektor_id: sektor_id || null,
      sektor_adi: sektor_adi || 'Genel',
      karar_durumu: karar_durumu || 'İzleme Listesi',
      yonetici_notu: yonetici_notu || 'Karar kaydedildi.',
      hesaplanan_skor: parseFloat(hesaplanan_skor) || 0
    });

    console.log('✅ [saveDecisionAPI] Başarılı:', result);

    res.status(201).json({
      status: 'success',
      message: 'Karar başarıyla kaydedildi',
      data: result
    });
  } catch (dbError) {
    console.error('❌ [saveDecisionAPI] DB Hatası:', dbError.message);
    return next(new AppError(`Veritabanı hatası: ${dbError.message}`, 500));
  }
});

// API: Kayıtlı kararları getir
exports.getSavedDecisionsAPI = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 50;
  const decisions = await DecisionModel.getSavedDecisions(null, limit);

  res.status(200).json({
    status: 'success',
    results: decisions.length,
    data: {
      decisions
    }
  });
});

// VIEW: Kayıtlı kararlar sayfası
exports.getSavedDecisionsPage = catchAsync(async (req, res, next) => {
  const decisions = await DecisionModel.getSavedDecisions(null, 100);
  const stats = await DecisionModel.getDecisionStats();

  res.render('decision/saved-decisions', {
    title: 'Kayıtlı Kararlar - KDS',
    decisions,
    stats
  });
});

// API: Karar durumunu güncelle
exports.updateDecisionStatusAPI = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { durum } = req.body;

  if (!durum) {
    return next(new AppError('Durum belirtilmedi', 400));
  }

  const success = await DecisionModel.updateDecisionStatus(id, durum);

  if (!success) {
    return next(new AppError('Karar bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Durum güncellendi'
  });
});

// API: Kararı sil
exports.deleteDecisionAPI = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const success = await DecisionModel.deleteDecision(id);

  if (!success) {
    return next(new AppError('Karar bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Karar silindi'
  });
});

// ==========================================
// STRATEGY WIZARD & ADVANCED FEATURES
// ==========================================

// VIEW: Strategy Wizard Sayfası
exports.getStrategyWizard = catchAsync(async (req, res, next) => {
  const { sektorId, ulkeId } = req.params;

  // Sektör bilgisini getir
  const sector = await SectorModel.getById(sektorId);
  if (!sector) {
    return next(new AppError('Sektör bulunamadı', 404));
  }

  // Wizard veri paketini getir
  const wizardData = await DecisionModel.getStrategyWizardData(ulkeId, sektorId);
  if (!wizardData) {
    return next(new AppError('Ülke bulunamadı', 404));
  }

  // Tüm sektörleri getir (sidebar için)
  const sectors = await SectorModel.getAll();

  res.render('decision/strategy-wizard', {
    title: `Strateji Wizard - ${wizardData.country.ulke_adi}`,
    sector,
    sectors,
    ...wizardData
  });
});

// API: Strategy Wizard Data (JSON)
exports.getStrategyWizardAPI = catchAsync(async (req, res, next) => {
  const { sektorId, ulkeId } = req.params;

  const wizardData = await DecisionModel.getStrategyWizardData(ulkeId, sektorId);
  if (!wizardData) {
    return next(new AppError('Veri bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: wizardData
  });
});

// API: Gelişmiş filtreli ülke listesi
exports.getFilteredCountriesAPI = catchAsync(async (req, res, next) => {
  const { sektorId } = req.params;

  // Query parametrelerinden filtreleri al
  const filters = {
    maxRegulatoryDifficulty: req.query.maxRegulatory ? parseInt(req.query.maxRegulatory) : null,
    minCulturalSimilarity: req.query.minCultural ? parseInt(req.query.minCultural) : null,
    minDigitalAdoption: req.query.minDigital ? parseInt(req.query.minDigital) : null,
    maxDistance: req.query.maxDistance ? parseInt(req.query.maxDistance) : null,
    maxTaxRate: req.query.maxTax ? parseInt(req.query.maxTax) : null,
    maxCompetition: req.query.maxCompetition ? parseInt(req.query.maxCompetition) : null,
    minYouthRatio: req.query.minYouth ? parseInt(req.query.minYouth) : null,
    minEaseOfBusiness: req.query.minEOB ? parseInt(req.query.minEOB) : null
  };

  // Ağırlıkları al
  const weights = {
    marketPotential: parseInt(req.query.marketPotential) || 30,
    economicStability: parseInt(req.query.economicStability) || 25,
    logisticsEase: parseInt(req.query.logisticsEase) || 25,
    sectorGrowth: parseInt(req.query.sectorGrowth) || 20
  };

  // Null filtreleri temizle
  Object.keys(filters).forEach(key => {
    if (filters[key] === null) delete filters[key];
  });

  const countries = await DecisionModel.getFilteredCountries(sektorId, filters, weights);

  res.status(200).json({
    status: 'success',
    results: countries.length,
    appliedFilters: filters,
    data: {
      countries
    }
  });
});

// API: Strateji kaydet (Wizard'dan)
exports.saveStrategyAPI = catchAsync(async (req, res, next) => {
  const {
    ulke_id,
    ulke_adi,
    sektor_id,
    sektor_adi,
    hesaplanan_skor,
    karar_durumu,
    yonetici_notu,
    strategic_decisions,
    advanced_metrics,
    user_overrides
  } = req.body;

  // Gerekli alanları kontrol et
  if (!ulke_id || !sektor_id || !karar_durumu) {
    return next(new AppError('Ülke, sektör ve karar durumu zorunludur', 400));
  }

  if (!yonetici_notu || yonetici_notu.length < 10) {
    return next(new AppError('Yönetici notu en az 10 karakter olmalıdır', 400));
  }

  const result = await DecisionModel.saveStrategyDecision({
    ulke_id,
    ulke_adi,
    sektor_id,
    sektor_adi,
    hesaplanan_skor: parseFloat(hesaplanan_skor) || 0,
    karar_durumu,
    yonetici_notu,
    strategic_decisions,
    advanced_metrics,
    user_overrides
  });

  res.status(201).json({
    status: 'success',
    message: 'Strateji başarıyla kaydedildi',
    data: result
  });
});

// VIEW: Scenario Builder (Advanced Dashboard)
exports.getScenarioBuilder = catchAsync(async (req, res, next) => {
  // Tüm filtre seçeneklerini veritabanından çek
  const filterOptions = await FilterModel.getAllFilterOptions();
  
  res.render('decision/scenario-builder', {
    title: 'Senaryo Oluşturucu - KDS',
    ...filterOptions
  });
});

// ==========================================
// UNIFIED SCORING ENGINE API
// ==========================================

// API: Birleşik skorlama ile ülke değerlendirmesi
exports.getUnifiedScoreAPI = catchAsync(async (req, res, next) => {
  const countryData = req.body;
  
  if (!countryData || Object.keys(countryData).length === 0) {
    return next(new AppError('Ülke verisi gerekli', 400));
  }

  // Birleşik skorlama hesapla
  const result = UnifiedScoringEngine.calculateGlobalScore(countryData);
  
  // Tutarlılık kontrolü yap
  const validation = UnifiedScoringEngine.validateConsistency(countryData);

  res.status(200).json({
    status: 'success',
    data: {
      globalScore: result.globalScore,
      globalVerdict: result.globalVerdict,
      decisions: result.decisions,
      counts: result.counts,
      recommendation: result.recommendation,
      summary: result.summary,
      validation: {
        isConsistent: validation.isConsistent,
        message: validation.isConsistent 
          ? 'Global Skor ve 7 Karar matematiksel olarak tutarlı ✓'
          : 'UYARI: Tutarsızlık tespit edildi'
      }
    }
  });
});

// API: Birden fazla ülke için birleşik skorlama
exports.getBulkUnifiedScoresAPI = catchAsync(async (req, res, next) => {
  const { countries } = req.body;
  
  if (!countries || !Array.isArray(countries) || countries.length === 0) {
    return next(new AppError('En az bir ülke verisi gerekli', 400));
  }

  const results = countries.map(country => {
    const result = UnifiedScoringEngine.calculateGlobalScore(country);
    return {
      ulke_id: country.ulke_id,
      ulke_adi: country.ulke_adi,
      globalScore: result.globalScore,
      globalVerdict: result.globalVerdict,
      counts: result.counts,
      summary: result.summary
    };
  });

  // Skora göre sırala
  results.sort((a, b) => b.globalScore - a.globalScore);

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      rankings: results
    }
  });
});

// ==========================================
// SECTOR INTELLIGENCE API
// ==========================================

// API: Sektör zekası - global istatistikler + algoritma ağırlıkları
exports.getSectorIntelligenceAPI = catchAsync(async (req, res, next) => {
  const { sektorId } = req.params;
  const sectorName = req.query.name || '';

  // Sektör bilgisi
  let sector = null;
  if (sektorId && sektorId !== 'null') {
    sector = await SectorModel.getById(sektorId);
  }

  // Sektör arketipi ve ağırlıkları
  const archetype = SectorConfig.getSectorArchetype(sector?.sektor_adi || sectorName || parseInt(sektorId) || 0);
  const insight = SectorConfig.getSectorInsight(sector?.sektor_adi || sectorName || parseInt(sektorId) || 0);

  // Sektör istatistikleri (DB'den)
  let sectorStats = {
    avgGrowth: 0,
    totalVolume: 0,
    countryCount: 0,
    topRegion: 'Bilinmiyor'
  };

  if (sektorId && sektorId !== 'null') {
    try {
      const summary = await DecisionModel.getSectorSummary(sektorId);
      if (summary && summary.stats) {
        sectorStats = {
          avgGrowth: parseFloat(summary.stats.ortalama_buyume) || 0,
          totalVolume: parseFloat(summary.stats.toplam_ithalat) || 0,
          countryCount: parseInt(summary.stats.ulke_sayisi) || 0,
          topRegion: 'Avrupa' // Placeholder - DB'den hesaplanabilir
        };
      }
    } catch (err) {
      console.log('Sector stats fetch error:', err.message);
    }
  }

  // Global Markets'tan ek istatistikler
  const globalMarkets = GlobalMarkets.getGlobalMarkets();
  if (globalMarkets.length > 0) {
    const avgGrowth = globalMarkets.reduce((sum, c) => sum + (c.sektorel_buyume || 0), 0) / globalMarkets.length;
    const totalVolume = globalMarkets.reduce((sum, c) => sum + (c.sektorel_ithalat || 0), 0);
    
    // En yüksek hacimli bölgeyi bul
    const regionVolumes = {};
    globalMarkets.forEach(c => {
      const region = c.bolge_adi || 'Diğer';
      regionVolumes[region] = (regionVolumes[region] || 0) + (c.sektorel_ithalat || 0);
    });
    const topRegion = Object.entries(regionVolumes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Bilinmiyor';

    // DB verisi yoksa global verilerden kullan
    if (sectorStats.avgGrowth === 0) sectorStats.avgGrowth = avgGrowth;
    if (sectorStats.totalVolume === 0) sectorStats.totalVolume = totalVolume;
    if (sectorStats.topRegion === 'Bilinmiyor') sectorStats.topRegion = topRegion;
    if (sectorStats.countryCount === 0) sectorStats.countryCount = globalMarkets.length;
  }

  res.status(200).json({
    status: 'success',
    data: {
      sector: sector || { sektor_id: sektorId, sektor_adi: sectorName || 'Genel' },
      archetype: {
        name: archetype.name,
        icon: archetype.icon,
        description: archetype.description
      },
      weights: archetype.weights,
      insight: insight.insight,
      priorityFactors: insight.priorityFactors,
      ignoredFactors: insight.ignoredFactors,
      stats: {
        avgGrowth: sectorStats.avgGrowth.toFixed(1),
        totalVolume: sectorStats.totalVolume,
        totalVolumeFormatted: formatVolume(sectorStats.totalVolume),
        countryCount: sectorStats.countryCount,
        topRegion: sectorStats.topRegion
      }
    }
  });
});

// API: Tüm sektör arketiplerini getir
exports.getSectorArchetypesAPI = catchAsync(async (req, res, next) => {
  const archetypes = SectorConfig.getAllArchetypes();
  
  res.status(200).json({
    status: 'success',
    data: {
      archetypes
    }
  });
});

// Helper: Format volume to human readable
function formatVolume(value) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}T`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}B`;
  } else {
    return `$${value.toFixed(0)}M`;
  }
}

