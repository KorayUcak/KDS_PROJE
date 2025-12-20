const express = require('express');
const router = express.Router();
const economyController = require('../controllers/economyController');

// Sayfa Route'ları
router.get('/', economyController.getDashboard);

// API Route'ları
router.get('/api/all', economyController.getAllEconomyData);
router.get('/api/country/:countryId', economyController.getCountryEconomy);
router.get('/api/iso/:iso', economyController.getEconomyByIso);

module.exports = router;
