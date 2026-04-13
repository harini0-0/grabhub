const express = require('express');
const router = express.Router();

const {
  getBillingByCustomer,
  getBillingById
} = require('../controllers/billingController');

router.get('/customer/:customerId', getBillingByCustomer);
router.get('/:id', getBillingById);

module.exports = router;
