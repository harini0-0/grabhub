const express = require('express');
const router = express.Router();

const {
  getSubscriptionsByCustomer,
  createSubscription,
  toggleAutoRenew,
  cancelSubscription
} = require('../controllers/subscriptionController');

router.get('/customer/:customerId', getSubscriptionsByCustomer);
router.post('/', createSubscription);
router.put('/:id/toggle-renew', toggleAutoRenew);
router.put('/:id/cancel', cancelSubscription);

module.exports = router;
