const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { createCommunity, getPublicCommunities, joinCommunity, approveJoinRequest } = require('../../controllers/communityController/communityController');


router.post('/', protect, createCommunity);
router.get('/public', protect, getPublicCommunities);
router.post('/join/:id', protect, joinCommunity);
router.post('/approve/:id/:userId', protect, approveJoinRequest);

module.exports = router;