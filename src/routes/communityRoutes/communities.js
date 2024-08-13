const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { isCommunityModerator } = require('../../middleware/roleMiddleware');
const { createCommunity, getPublicCommunities, joinCommunity, approveJoinRequest, assignModerator,
    updateCommunity,
    deleteCommunity } = require('../../controllers/communityController/communityController');


router.post('/', protect, createCommunity);
router.get('/public', protect, getPublicCommunities);
router.post('/join/:id', protect, joinCommunity);
router.post('/approve/:id/:userId', protect, approveJoinRequest);
router.post('/:id/moderators', protect, assignModerator);
router.put('/:id', protect, updateCommunity);
router.delete('/:id', protect, deleteCommunity);

module.exports = router;