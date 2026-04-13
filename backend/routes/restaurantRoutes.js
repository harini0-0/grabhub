const express = require('express');
const router = express.Router();

const {
  getAllRestaurants,
  getRestaurantMenu,
  getRestaurantCuisine,
  getRestaurantHours,
  addMenuItemToRestaurant,
  updateMenuItem,
  removeMenuItemFromRestaurant
} = require('../controllers/restaurantController');

// Public routes
router.get('/',              getAllRestaurants);
router.get('/:id/menu',     getRestaurantMenu);
router.get('/:id/cuisine',  getRestaurantCuisine);
router.get('/:id/hours',    getRestaurantHours);

// Admin routes (menu CRUD)
router.post('/:id/menu',            addMenuItemToRestaurant);
router.put('/:id/menu/:itemId',     updateMenuItem);
router.delete('/:id/menu/:itemId',  removeMenuItemFromRestaurant);

module.exports = router;
