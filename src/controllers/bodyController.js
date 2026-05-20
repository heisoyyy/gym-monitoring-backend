const bodyService = require('../services/bodyService');
const { weightLogSchema } = require('../validations/bodyValidation');
const catchAsync = require('../utils/catchAsync');

const logWeight = catchAsync(async (req, res, next) => {
  const { error } = weightLogSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const userId = req.user.id;
  const { weight } = req.body;
  const result = await bodyService.logWeightOnly(userId, weight);

  res.status(200).json({
    success: true,
    message: 'Berat badan berhasil dicatat',
    data: result,
  });
});

const getHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const result = await bodyService.getBodyHistory(userId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  logWeight,
  getHistory,
};
