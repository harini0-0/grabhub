const express = require('express');
const router = express.Router();

const {
  addFavourite,
  getFavourites,
  deleteFavourite
} = require('../controllers/favouritesController');

router.post('/', addFavourite);
router.get('/:customerId', getFavourites);
router.delete('/:id', deleteFavourite);

module.exports = router;