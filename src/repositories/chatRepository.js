const prisma = require('../config/prisma');

const saveChatMessage = async (userId, role, content) => {
  return prisma.chatHistory.create({
    data: {
      userId,
      role,
      content,
    },
  });
};

const getChatHistoryByUserId = async (userId) => {
  return prisma.chatHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
};

const clearChatHistoryByUserId = async (userId) => {
  return prisma.chatHistory.deleteMany({
    where: { userId },
  });
};

module.exports = {
  saveChatMessage,
  getChatHistoryByUserId,
  clearChatHistoryByUserId,
};
