const prisma = require('../config/prisma');

const createBodyHistory = async (userId, data) => {
  return prisma.bodyStatusHistory.create({
    data: {
      userId,
      weight: data.weight,
      bmi: data.bmi,
      status: data.status,
      recordedAt: data.recordedAt || new Date(),
    },
  });
};

const getBodyHistoryByUserId = async (userId) => {
  return prisma.bodyStatusHistory.findMany({
    where: { userId },
    orderBy: { recordedAt: 'asc' },
  });
};

const findLatestBodyStatus = async (userId) => {
  return prisma.bodyStatusHistory.findFirst({
    where: { userId },
    orderBy: { recordedAt: 'desc' },
  });
};

module.exports = {
  createBodyHistory,
  getBodyHistoryByUserId,
  findLatestBodyStatus,
};
