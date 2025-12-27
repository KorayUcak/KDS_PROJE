const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decisionController');

// ===== ANA SAYFALAR =====

// Ana sayfa - Basit Karar Destek Sistemi
router.get('/', decisionController.getCommandCenter);

// Head-to-Head Karşılaştırma Sayfası
router.get('/compare', decisionController.getCompareDuel);

// Kayıtlı kararlar sayfası
router.get('/decisions', decisionController.getSavedDecisionsPage);

// ===== API ROUTES =====

// API: Filtre seçenekleri
router.get('/api/filters', decisionController.getFilterOptionsAPI);

// API: Global Markets (30+ ülke)
router.get('/api/global-markets', decisionController.getGlobalMarketsAPI);

// API: Ülke sıralaması (JSON) - Hybrid: DB + Global
router.get('/api/sector/:sektorId/rankings', decisionController.getRankingsAPI);

// API: Karar kaydet
router.post('/api/decisions', decisionController.saveDecisionAPI);

// API: Kayıtlı kararları getir
router.get('/api/decisions', decisionController.getSavedDecisionsAPI);

// API: Karar durumunu güncelle
router.patch('/api/decisions/:id/status', decisionController.updateDecisionStatusAPI);

// API: Kararı sil
router.delete('/api/decisions/:id', decisionController.deleteDecisionAPI);

module.exports = router;
