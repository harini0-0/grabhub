const express = require('express');
const router = express.Router();

const {
  getAddressesByCustomer,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');

router.get('/customer/:customerId', getAddressesByCustomer);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
