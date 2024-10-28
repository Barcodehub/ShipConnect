const express = require('express');
const router = express.Router();
const userController = require('../../controllers/auth-user-Controller/userController');
const { protect } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/upload');

router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);
router.get('/search', protect, userController.searchUsers);
router.delete('/account', protect, userController.deleteAccount);


// Ruta para actualizar la foto de perfil
router.put('/profile-picture', protect, upload.single('image'), userController.updateProfilePicture);

// Ruta para eliminar la foto de perfil
router.delete('/profile-picture', protect, userController.deleteProfilePicture);
module.exports = router;