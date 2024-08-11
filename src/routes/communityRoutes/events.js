const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { createEvent, getEvents } = require('../../controllers/communityController/eventController');

router.post('/:communityId', protect, createEvent);
router.get('/:communityId', protect, getEvents);

module.exports = router;