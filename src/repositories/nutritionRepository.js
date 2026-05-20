const prisma = require('../config/prisma');

const upsertNutritionPlan = async (userId, planData) => {
  return prisma.nutritionPlan.upsert({
    where: { userId },
    update: {
      dailyCalories: planData.dailyCalories,
      protein: planData.protein,
      carbs: planData.carbs,
      fat: planData.fat,
    },
    create: {
      userId,
      dailyCalories: planData.dailyCalories,
      protein: planData.protein,
      carbs: planData.carbs,
      fat: planData.fat,
    },
  });
};

const getNutritionPlanByUserId = async (userId) => {
  return prisma.nutritionPlan.findUnique({
    where: { userId },
  });
};

module.exports = {
  upsertNutritionPlan,
  getNutritionPlanByUserId,
};
