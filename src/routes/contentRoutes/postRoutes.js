const express = require('express');
const router = express.Router();
const postController = require('../../controllers/contentController/postController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/', protect, postController.createPost);
router.get('/', protect, postController.getPosts);
router.post('/:postId/share', protect, postController.sharePost);
router.get('/news-feed', protect, postController.getNewsFeed);
router.patch('/:postId/privacy', protect, postController.updatePostPrivacy);
router.delete('/:postId', protect, postController.deletePost);
router.put('/:postId', protect, postController.updatePost);


module.exports = router;