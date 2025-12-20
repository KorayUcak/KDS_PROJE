const express = require('express');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

/**
 * Analiz Route'ları
 * /analyses prefix'i ile kullanılır
 */

// Sayfa Route'ları (GET - Views)
router.get('/dashboard', analysisController.getDashboard);
router.get('/new', analysisController.getNewAnalysisPage);

// API Route'ları
// Özel route'lar (parametreli route'lardan önce)
router.get('/type/:type', analysisController.getAnalysesByType);
router.get('/user/:userId', analysisController.getUserAnalyses);

// Standart CRUD route'ları
router
  .route('/')
  .get(analysisController.getAllAnalyses)
  .post(analysisController.createAnalysis);

router
  .route('/:id')
  .get(analysisController.getAnalysis)
  .patch(analysisController.updateAnalysis)
  .delete(analysisController.deleteAnalysis);

// Analiz sonuçlarını kaydet
router.patch('/:id/results', analysisController.saveResults);

module.exports = router;
