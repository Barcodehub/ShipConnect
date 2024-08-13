const express = require('express');
const router = express.Router();
const userController = require('../../controllers/auth-user-Controller/userController');
const { protect } = require('../../middleware/authMiddleware');

router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);
router.get('/search', protect, userController.searchUsers);
router.delete('/account', protect, userController.deleteAccount);

module.exports = router;