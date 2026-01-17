const express = require('express');
const router = express.Router();
const agreementController = require('../controllers/agreementController');

// GET: Listeleme (Aynen kalıyor)
router.get('/', agreementController.getAgreementsList);

// GET: Oluşturma Formu (Aynen kalıyor)
router.get('/create', agreementController.getAgreementCreateForm);

// POST: Yeni Kayıt (Aynen kalıyor - Create işlemi POST olmalı)
router.post('/create', agreementController.createAgreement);

// GET: Detay (Aynen kalıyor)
router.get('/:id', agreementController.getAgreementDetail);

// GET: Düzenleme Formu (Aynen kalıyor)
router.get('/:id/edit', agreementController.getAgreementEditForm);

// --- DEĞİŞEN KISIMLAR ---

// ESKİSİ: router.post('/:id/edit', agreementController.updateAgreement);
// YENİSİ (PUT): Veri güncelleme
router.put('/:id', agreementController.updateAgreement);

// ESKİSİ: router.post('/:id/delete', agreementController.deleteAgreement);
// YENİSİ (DELETE): Veri silme
router.delete('/:id', agreementController.deleteAgreement);

// API (Aynen kalıyor)
router.get('/api/list', agreementController.getAgreementsAPI);

module.exports = router;