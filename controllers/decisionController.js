const DecisionModel = require('../models/decisionModel');
const SectorModel = require('../models/sectorModel');
const FilterModel = require('../models/filterModel');
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

// Ülke detay sayfası
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

  res.render('decision/country-detail', {
    title: `${country.ulke_adi} - ${sector.sektor_adi} Analizi`,
    sector,
    country,
    countryRank,
    sectors
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

// API: Ülke sıralaması (JSON)
exports.getRankingsAPI = catchAsync(async (req, res, next) => {
  const { sektorId } = req.params;
  
  const weights = {
    marketPotential: parseInt(req.query.marketPotential) || 30,
    economicStability: parseInt(req.query.economicStability) || 25,
    logisticsEase: parseInt(req.query.logisticsEase) || 25,
    sectorGrowth: parseInt(req.query.sectorGrowth) || 20
  };

  const rankings = await DecisionModel.getCountryRankings(sektorId, weights);
  
  res.status(200).json({
    status: 'success',
    results: rankings.length,
    data: {
      rankings
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

