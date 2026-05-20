const prisma = require('../config/prisma');

const getAllExercises = async () => {
  return prisma.exercise.findMany();
};

const findExerciseById = async (id) => {
  return prisma.exercise.findUnique({
    where: { id },
  });
};

const searchExercises = async (query) => {
  return prisma.exercise.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { category: { contains: query } },
        { muscleGroup: { contains: query } },
      ],
    },
  });
};

module.exports = {
  getAllExercises,
  findExerciseById,
  searchExercises,
};
