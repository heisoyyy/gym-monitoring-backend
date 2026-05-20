const express = require('express');
const { updateProfile, getProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/profile')
  .post(updateProfile)
  .get(getProfile);

module.exports = router;
