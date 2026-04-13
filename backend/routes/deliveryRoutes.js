const express = require('express');
const router = express.Router();

const deliveryController = require('../controllers/deliveryController');

// 🚴 GET delivery orders
router.get('/orders', deliveryController.getDeliveryOrders);

module.exports = router;