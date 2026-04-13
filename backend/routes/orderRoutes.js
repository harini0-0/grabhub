const express = require('express');
const router = express.Router();

const {
  getOrdersByCustomer,
  getOrderById,
  placeOrder,
  cancelOrder
} = require('../controllers/orderController');

router.get('/customer/:customerId', getOrdersByCustomer);
router.get('/:id', getOrderById);
router.post('/', placeOrder);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
