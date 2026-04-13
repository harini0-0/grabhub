const express = require('express');
const router = express.Router();

const {
  getAllRestaurants,
  getRestaurantMenu,
  getRestaurantCuisine
} = require('../controllers/restaurantController');

router.get('/', getAllRestaurants);
router.get('/:id/menu', getRestaurantMenu);
router.get('/:id/cuisine', getRestaurantCuisine);

module.exports = router;