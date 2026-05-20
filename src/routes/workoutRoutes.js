const express = require('express');
const {
  getExercises,
  getSchedules,
  saveSchedule,
  getOrCreateSession,
  updateAttendance,
  getSessionsHistory,
  addExerciseToSession,
  updateExerciseLog,
  deleteExerciseFromSession,
} = require('../controllers/workoutController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

// Latihan database
router.get('/exercises', getExercises);

// Jadwal mingguan
router.route('/schedules')
  .get(getSchedules)
  .post(saveSchedule);

// Sesi latihan harian & absensi
router.get('/sessions', getOrCreateSession);
router.get('/sessions/history', getSessionsHistory);
router.patch('/sessions/:id/attendance', updateAttendance);

// Mengelola latihan di dalam sesi
router.post('/sessions/:id/exercises', addExerciseToSession);
router.route('/sessions/:id/exercises/:exerciseLogId')
  .patch(updateExerciseLog)
  .delete(deleteExerciseFromSession);

module.exports = router;
