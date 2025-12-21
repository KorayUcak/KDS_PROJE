const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');

router.get('/', logisticsController.getLogisticsList);

router.get('/charts', logisticsController.getLogisticsCharts);

router.get('/create', logisticsController.getLogisticsCreateForm);

router.post('/create', logisticsController.createLogistics);

router.get('/:id', logisticsController.getLogisticsDetail);

router.get('/:id/edit', logisticsController.getLogisticsEditForm);

router.post('/:id/edit', logisticsController.updateLogistics);

router.post('/:id/delete', logisticsController.deleteLogistics);

router.get('/api/list', logisticsController.getLogisticsAPI);

module.exports = router;
