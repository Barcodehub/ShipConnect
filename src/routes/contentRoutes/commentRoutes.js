const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/contentController/commentController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/', protect, commentController.createComment);
router.get('/:postId', protect, commentController.getComments);

module.exports = router;