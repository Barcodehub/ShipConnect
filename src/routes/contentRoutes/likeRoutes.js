const express = require('express');
const router = express.Router();
const likeController = require('../../controllers/contentController/likeController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/post/:postId', protect, likeController.togglePostLike);
router.post('/comment/:commentId', protect, likeController.toggleCommentLike);

module.exports = router;