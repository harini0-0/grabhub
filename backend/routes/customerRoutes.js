const express = require('express');
const router = express.Router();

const {
  getAllCustomers,
  getCustomerById,
  registerCustomer,
  loginCustomer,
  updateCustomer,
  deactivateCustomer
} = require('../controllers/customerController');

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deactivateCustomer);

module.exports = router;
