const express = require('express');
const router = express.Router();

const deliveryController = require('../controllers/deliveryController');

router.get('/partners',    deliveryController.getAllPartners);
router.get('/partner/:id', deliveryController.getPartnerDetails);
router.get('/orders',      deliveryController.getDeliveryOrders);

module.exports = router;