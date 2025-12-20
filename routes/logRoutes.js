const express = require('express');
const logController = require('../controllers/logController');

const router = express.Router();

/**
 * Log Route'ları
 * /api/logs prefix'i ile kullanılır
 * NOT: Bu route'lar genellikle admin yetkisi gerektirir
 */

// Log istatistikleri
router.get('/stats', logController.getLogStats);

// Tarih aralığına göre loglar
router.get('/date-range', logController.getLogsByDateRange);

// Eski logları temizle
router.delete('/cleanup', logController.cleanOldLogs);

// Seviyeye göre loglar
router.get('/level/:level', logController.getLogsByLevel);

// İşlem tipine göre loglar
router.get('/type/:type', logController.getLogsByType);

// Kullanıcıya ait loglar
router.get('/user/:userId', logController.getUserLogs);

// Tüm loglar ve manuel log ekleme
router
  .route('/')
  .get(logController.getAllLogs)
  .post(logController.createLog);

module.exports = router;
