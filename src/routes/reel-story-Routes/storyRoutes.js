const express = require('express');
const router = express.Router();
const storyController = require('../../controllers/reel-story-Controller/storyController');
const upload = require('../../middleware/upload');
const { protect } = require('../../middleware/authMiddleware');

router.post('/', protect, upload.single('media'), storyController.createStory);
router.get('/',protect, storyController.getStories);
router.put('/:storyId', protect, storyController.updateStory);
router.delete('/:storyId', protect, storyController.deleteStory);

router.put('/:storyId/privacy', protect, storyController.updateStoryPrivacy);

module.exports = router;