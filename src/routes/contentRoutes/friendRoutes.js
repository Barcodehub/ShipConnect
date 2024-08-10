const express = require('express');
const router = express.Router();
const friendController = require('../../controllers/contentController/friendController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/request', protect, friendController.sendFriendRequest);
router.post('/respond', protect, friendController.respondToFriendRequest);
router.get('/requests', protect, friendController.getFriendRequests);

module.exports = router;