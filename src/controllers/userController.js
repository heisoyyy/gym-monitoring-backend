const bodyService = require('../services/bodyService');
const { profileSchema } = require('../validations/userValidation');
const catchAsync = require('../utils/catchAsync');

const updateProfile = catchAsync(async (req, res, next) => {
  const { error } = profileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const userId = req.user.id;
  const result = await bodyService.updateProfile(userId, req.body);

  res.status(200).json({
    success: true,
    message: 'Profil berhasil diperbarui',
    data: result,
  });
});

const getProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const result = await bodyService.getUserProfileDetails(userId);

  if (!result) {
    return res.status(200).json({
      success: true,
      message: 'Profil belum dibuat',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  updateProfile,
  getProfile,
};
