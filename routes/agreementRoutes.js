const express = require('express');
const router = express.Router();
const agreementController = require('../controllers/agreementController');

router.get('/', agreementController.getAgreementsList);

router.get('/create', agreementController.getAgreementCreateForm);

router.post('/create', agreementController.createAgreement);

router.get('/:id', agreementController.getAgreementDetail);

router.get('/:id/edit', agreementController.getAgreementEditForm);

router.post('/:id/edit', agreementController.updateAgreement);

router.post('/:id/delete', agreementController.deleteAgreement);

router.get('/api/list', agreementController.getAgreementsAPI);

module.exports = router;
