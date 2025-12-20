const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * Kullanıcı Route'ları
 * /users prefix'i ile kullanılır
 */

// Sayfa Route'ları (GET)
router.get('/login', authController.getLoginPage);
router.get('/register', authController.getRegisterPage);

// Auth API Route'ları (POST)
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// GET logout (link ile çıkış için)
router.get('/logout', authController.logout);

// Kullanıcı işlemleri
router.get('/:id', authController.getCurrentUser);
router.patch('/update-password', authController.updatePassword);

module.exports = router;
