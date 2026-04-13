const express = require('express');
const router = express.Router();
const { getAllCustomers, getCustomerById, getCustomerOrders, getOrderItems } = require('../controllers/customerController');

router.get('/',                              getAllCustomers);
router.get('/:id/orders',                   getCustomerOrders);
router.get('/:id/orders/:orderId/items',    getOrderItems);
router.get('/:id',                          getCustomerById);

module.exports = router;
