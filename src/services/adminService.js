const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

const getSystemStats = async () => {
  const totalUsers = await prisma.user.count({
    where: { role: 'USER' }
  });
  
  const totalWorkouts = await prisma.workoutSession.count({
    where: { status: 'COMPLETED' }
  });

  const totalChats = await prisma.chatHistory.count();

  const avgWeightAgg = await prisma.userProfile.aggregate({
    _avg: {
      weight: true
    }
  });
  const averageWeight = avgWeightAgg._avg.weight ? parseFloat(avgWeightAgg._avg.weight.toFixed(1)) : 0;

  // Distribusi Target Fitness & BMI dari profil user
  const profiles = await prisma.userProfile.findMany({
    select: {
      bmi: true,
      targetFitness: true
    }
  });

  const bmiDistribution = { UNDERWEIGHT: 0, NORMAL: 0, OVERWEIGHT: 0, OBESE: 0 };
  const fitnessGoals = { BULKING: 0, CUTTING: 0, MAINTAIN: 0 };

  profiles.forEach((p) => {
    if (p.bmi) {
      if (p.bmi < 18.5) bmiDistribution.UNDERWEIGHT++;
      else if (p.bmi < 25.0) bmiDistribution.NORMAL++;
      else if (p.bmi < 30.0) bmiDistribution.OVERWEIGHT++;
      else bmiDistribution.OBESE++;
    }
    if (p.targetFitness) {
      fitnessGoals[p.targetFitness] = (fitnessGoals[p.targetFitness] || 0) + 1;
    }
  });

  return {
    totalUsers,
    totalWorkouts,
    totalChats,
    averageWeight,
    bmiDistribution,
    fitnessGoals
  };
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          height: true,
          weight: true,
          bmi: true,
          targetFitness: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const updateUser = async (userId, data) => {
  const updateData = {
    name: data.name,
    email: data.email,
    role: data.role
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  return prisma.user.update({
    where: { id: parseInt(userId) },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
};

const deleteUser = async (userId) => {
  return prisma.user.delete({
    where: { id: parseInt(userId) }
  });
};

const createExercise = async (data) => {
  return prisma.exercise.create({
    data: {
      name: data.name,
      description: data.description || '',
      category: data.category || 'Kekuatan',
      muscleGroup: data.muscleGroup
    }
  });
};

const deleteExercise = async (exerciseId) => {
  return prisma.exercise.delete({
    where: { id: parseInt(exerciseId) }
  });
};

module.exports = {
  getSystemStats,
  getAllUsers,
  updateUser,
  deleteUser,
  createExercise,
  deleteExercise
};
