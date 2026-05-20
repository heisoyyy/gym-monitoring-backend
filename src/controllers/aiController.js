const aiService = require('../services/aiService');
const catchAsync = require('../utils/catchAsync');

const sendChatMessage = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });
  }

  const result = await aiService.sendMessageToAI(userId, message);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const history = await aiService.getChatHistory(userId);

  res.status(200).json({
    success: true,
    data: history,
  });
});

const clearHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  await aiService.clearChatHistory(userId);

  res.status(200).json({
    success: true,
    message: 'Riwayat percakapan berhasil dihapus',
  });
});

module.exports = {
  sendChatMessage,
  getHistory,
  clearHistory,
};
