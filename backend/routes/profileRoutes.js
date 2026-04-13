const express = require('express');
const router = express.Router();

const { generateProfile, getRecommendations } = require('../controllers/profileController');

router.get('/:customerId/recommendations', getRecommendations);
router.get('/:customerId', generateProfile);

module.exports = router;