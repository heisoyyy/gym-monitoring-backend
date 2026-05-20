const express = require('express');
const { sendChatMessage, getHistory, clearHistory } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/chat', sendChatMessage);
router.route('/history')
  .get(getHistory)
  .delete(clearHistory);

module.exports = router;
