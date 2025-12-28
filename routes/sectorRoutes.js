const express = require('express');
const router = express.Router();
const sectorController = require('../controllers/sectorController');

// Sayfa Route'ları
router.get('/', sectorController.getDashboard);
router.get('/sector/:id', sectorController.getSectorDetail);

// API Route'ları
router.get('/api/sectors', sectorController.getAllSectors);
router.get('/api/sectors/:id', sectorController.getSectorData);
router.get('/api/sectors/:sektorId/compare', sectorController.getSectorComparison);

module.exports = router;
