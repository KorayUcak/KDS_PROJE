const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decisionController');

// ===== VIEW ROUTES =====

// Ana sayfa - Command Center (birleşik dashboard)
router.get('/', decisionController.getCommandCenter);

// Eski sektör seçim sayfası (alternatif)
router.get('/select', decisionController.getSectorSelection);

// Sektör seçildikten sonra ülke sıralaması
router.get('/sector/:sektorId/rankings', decisionController.getCountryRankings);

// Ülke detay sayfası
router.get('/sector/:sektorId/country/:ulkeId', decisionController.getCountryDetail);

// Ülke karşılaştırma sayfası
router.get('/sector/:sektorId/compare', decisionController.compareCountries);

// ===== API ROUTES =====

// API: Filtre seçenekleri
router.get('/api/filters', decisionController.getFilterOptionsAPI);

// API: Ülke sıralaması (JSON)
router.get('/api/sector/:sektorId/rankings', decisionController.getRankingsAPI);

// API: Ülke detayı (JSON)
router.get('/api/sector/:sektorId/country/:ulkeId', decisionController.getCountryDetailAPI);

module.exports = router;

