const express = require('express');
const chatController = require('../../controllers/chattingController/chatController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/messages/:friendId', protect, chatController.getMessages);
router.post('/messages', protect, chatController.sendMessage);

module.exports = router;