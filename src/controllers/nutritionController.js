const nutritionService = require('../services/nutritionService');
const bodyService = require('../services/bodyService');
const catchAsync = require('../utils/catchAsync');

const getNutritionPlan = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const plan = await nutritionService.getNutritionPlan(userId);

  if (!plan) {
    return res.status(200).json({
      success: true,
      message: 'Rencana nutrisi belum dihitung. Lengkapi profil terlebih dahulu.',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});

const getRecommendations = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const profileDetails = await bodyService.getUserProfileDetails(userId);
  
  if (!profileDetails) {
    return res.status(200).json({
      success: true,
      message: 'Profil belum dibuat. Menampilkan rekomendasi makanan general (Maintain).',
      data: nutritionService.getMealRecommendations('MAINTAIN'),
    });
  }

  const { targetFitness } = profileDetails.profile;
  const recommendations = nutritionService.getMealRecommendations(targetFitness);

  res.status(200).json({
    success: true,
    data: recommendations,
  });
});

module.exports = {
  getNutritionPlan,
  getRecommendations,
};
