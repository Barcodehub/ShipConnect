const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/contentController/commentController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/', protect, commentController.createComment);
router.post('/reel', protect, commentController.createCommentReel);
router.get('/:postId', protect, commentController.getComments);
router.put('/:commentId', protect, commentController.updateComment);
router.delete('/:commentId', protect, commentController.deleteComment);


module.exports = router;