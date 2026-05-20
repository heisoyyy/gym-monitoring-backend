const express = require('express');
const { logWeight, getHistory } = require('../controllers/bodyController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/history')
  .post(logWeight)
  .get(getHistory);

module.exports = router;
