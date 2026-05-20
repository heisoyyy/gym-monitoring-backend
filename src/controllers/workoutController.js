const workoutService = require('../services/workoutService');
const exerciseRepository = require('../repositories/exerciseRepository');
const {
  scheduleSchema,
  sessionAttendanceSchema,
  getOrCreateSessionSchema,
  logExerciseSchema,
  updateExerciseLogSchema,
} = require('../validations/workoutValidation');
const catchAsync = require('../utils/catchAsync');

// --- EXERCISES ---
const getExercises = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  let exercises;
  if (q) {
    exercises = await exerciseRepository.searchExercises(q);
  } else {
    exercises = await exerciseRepository.getAllExercises();
  }

  res.status(200).json({
    success: true,
    data: exercises,
  });
});

// --- SCHEDULES ---
const getSchedules = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const schedules = await workoutService.getSchedules(userId);

  res.status(200).json({
    success: true,
    data: schedules,
  });
});

const saveSchedule = catchAsync(async (req, res, next) => {
  const { error } = scheduleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const userId = req.user.id;
  const { dayOfWeek, title } = req.body;
  const result = await workoutService.saveSchedule(userId, dayOfWeek, title);

  res.status(200).json({
    success: true,
    message: 'Jadwal latihan berhasil diperbarui',
    data: result,
  });
});

// --- SESSIONS & ATTENDANCE ---
const getOrCreateSession = catchAsync(async (req, res, next) => {
  const { error } = getOrCreateSessionSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const userId = req.user.id;
  const { date } = req.query;
  const session = await workoutService.getOrCreateSessionByDate(userId, date);

  res.status(200).json({
    success: true,
    data: session,
  });
});

const updateAttendance = catchAsync(async (req, res, next) => {
  const { error } = sessionAttendanceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const userId = req.user.id;
  const sessionId = parseInt(req.params.id);
  const result = await workoutService.recordSessionAttendance(userId, sessionId, req.body);

  res.status(200).json({
    success: true,
    message: 'Kehadiran latihan berhasil diperbarui',
    data: result,
  });
});

const getSessionsHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const history = await workoutService.getSessions(userId);

  res.status(200).json({
    success: true,
    data: history,
  });
});

// --- LOG EXERCISE TO SESSION ---
const addExerciseToSession = catchAsync(async (req, res, next) => {
  const { error } = logExerciseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const sessionId = parseInt(req.params.id);
  const result = await workoutService.logExerciseToSession(sessionId, req.body);

  res.status(201).json({
    success: true,
    message: 'Latihan berhasil ditambahkan ke sesi',
    data: result,
  });
});

const updateExerciseLog = catchAsync(async (req, res, next) => {
  const { error } = updateExerciseLogSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const exerciseLogId = parseInt(req.params.exerciseLogId);
  const result = await workoutService.updateExerciseLog(exerciseLogId, req.body);

  res.status(200).json({
    success: true,
    message: 'Log latihan berhasil diperbarui',
    data: result,
  });
});

const deleteExerciseFromSession = catchAsync(async (req, res, next) => {
  const exerciseLogId = parseInt(req.params.exerciseLogId);
  await workoutService.removeExerciseFromSession(exerciseLogId);

  res.status(200).json({
    success: true,
    message: 'Latihan berhasil dihapus dari sesi',
  });
});

module.exports = {
  getExercises,
  getSchedules,
  saveSchedule,
  getOrCreateSession,
  updateAttendance,
  getSessionsHistory,
  addExerciseToSession,
  updateExerciseLog,
  deleteExerciseFromSession,
};
