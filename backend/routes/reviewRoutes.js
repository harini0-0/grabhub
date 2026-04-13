const express = require('express');
const router = express.Router();
const { getRestaurantReviews, addReview } = require('../controllers/reviewController');

router.get('/:restaurantId', getRestaurantReviews);
router.post('/',             addReview);

module.exports = router;
