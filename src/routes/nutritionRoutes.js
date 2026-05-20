const express = require('express');
const { getNutritionPlan, getRecommendations } = require('../controllers/nutritionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/plan', getNutritionPlan);
router.get('/recommendations', getRecommendations);

module.exports = router;
