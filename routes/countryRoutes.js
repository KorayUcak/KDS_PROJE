const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');

// Ülke listesi sayfası
router.get('/', countryController.getCountryList);

// Ülke detay sayfası
router.get('/:id', countryController.getCountryDetail);

// API endpoint
router.get('/api/list', countryController.getCountriesAPI);

module.exports = router;
