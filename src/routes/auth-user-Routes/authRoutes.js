const express = require('express');
const authController = require('../../controllers/auth-user-Controller/authController');
const { protect } = require('../../middleware/authMiddleware');
const { forgotPassword, resetPassword } = require('../../controllers/auth-user-Controller/authController');
const router = express.Router();

router.get('/csrf-token', authController.getCsrfToken);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);
router.post('/generateTwoFactor', protect, authController.generateTwoFactor);
router.post('/verifyTwoFactor', protect, authController.verifyTwoFactor);
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, authController.getMe);

module.exports = router;