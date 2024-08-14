const express = require('express');
const router = express.Router();
const likeController = require('../../controllers/contentController/likeController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/post/:postId', protect, likeController.togglePostLike);
router.post('/reel/:reelId', protect, likeController.toggleReelLike);
router.post('/story/:storyId', protect, likeController.toggleStoryLike);
router.post('/comment/:commentId', protect, likeController.toggleCommentLike);

module.exports = router;