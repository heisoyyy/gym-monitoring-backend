const express = require('express');
const {
  getStats,
  getUsers,
  updateUserData,
  deleteUserData,
  addExercise,
  deleteExerciseData
} = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUserData);
router.delete('/users/:id', deleteUserData);
router.post('/exercises', addExercise);
router.delete('/exercises/:id', deleteExerciseData);

module.exports = router;
