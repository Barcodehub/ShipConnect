const express = require('express');
const router = express.Router();
const reelController = require('../../controllers/reel-story-Controller/reelController');
const upload = require('../../middleware/upload');
const { protect } = require('../../middleware/authMiddleware');

router.post('/', protect, upload.single('video'), reelController.createReel);
router.get('/',protect, reelController.getReels);
router.put('/:reelId', protect, reelController.updateReel);
router.delete('/:reelId', protect, reelController.deleteReel);

router.put('/:reelId/privacy', protect, reelController.updateReelPrivacy);

module.exports = router;