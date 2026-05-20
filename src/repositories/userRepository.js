const prisma = require('../config/prisma');

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const createUser = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
    }
  });
};

const upsertUserProfile = async (userId, profileData) => {
  return prisma.userProfile.upsert({
    where: { userId },
    update: {
      height: profileData.height,
      weight: profileData.weight,
      dateOfBirth: new Date(profileData.dateOfBirth),
      gender: profileData.gender,
      targetFitness: profileData.targetFitness,
      activityLevel: profileData.activityLevel,
      bmr: profileData.bmr,
      tdee: profileData.tdee,
      bmi: profileData.bmi,
    },
    create: {
      userId,
      height: profileData.height,
      weight: profileData.weight,
      dateOfBirth: new Date(profileData.dateOfBirth),
      gender: profileData.gender,
      targetFitness: profileData.targetFitness,
      activityLevel: profileData.activityLevel,
      bmr: profileData.bmr,
      tdee: profileData.tdee,
      bmi: profileData.bmi,
    },
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  upsertUserProfile,
};
