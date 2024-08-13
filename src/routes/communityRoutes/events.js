const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { createEvent, getEvents, 
    updateEvent, 
    deleteEvent, 
    getGroupFeed  } = require('../../controllers/communityController/eventController');

router.post('/:communityId', protect, createEvent);
router.get('/:communityId', protect, getEvents);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.get('/feed/:communityId', protect, getGroupFeed);

module.exports = router;