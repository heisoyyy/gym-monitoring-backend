const adminService = require('../services/adminService');
const catchAsync = require('../utils/catchAsync');

const getStats = catchAsync(async (req, res, next) => {
  const stats = await adminService.getSystemStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

const getUsers = catchAsync(async (req, res, next) => {
  const users = await adminService.getAllUsers();
  res.status(200).json({
    success: true,
    data: users
  });
});

const updateUserData = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const updated = await adminService.updateUser(userId, req.body);
  res.status(200).json({
    success: true,
    message: 'User berhasil diperbarui',
    data: updated
  });
});

const deleteUserData = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  await adminService.deleteUser(userId);
  res.status(200).json({
    success: true,
    message: 'User berhasil dihapus dari sistem'
  });
});

const addExercise = catchAsync(async (req, res, next) => {
  const { name, muscleGroup, category, description } = req.body;
  if (!name || !muscleGroup) {
    return res.status(400).json({
      success: false,
      message: 'Nama gerakan dan kelompok otot harus diisi'
    });
  }

  const exercise = await adminService.createExercise(req.body);
  res.status(201).json({
    success: true,
    message: 'Gerakan latihan baru berhasil ditambahkan',
    data: exercise
  });
});

const deleteExerciseData = catchAsync(async (req, res, next) => {
  const exerciseId = req.params.id;
  await adminService.deleteExercise(exerciseId);
  res.status(200).json({
    success: true,
    message: 'Gerakan latihan berhasil dihapus dari sistem'
  });
});

module.exports = {
  getStats,
  getUsers,
  updateUserData,
  deleteUserData,
  addExercise,
  deleteExerciseData
};
