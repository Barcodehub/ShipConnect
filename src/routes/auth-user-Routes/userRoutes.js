const express = require('express');
const router = express.Router();
const userController = require('../../controllers/auth-user-Controller/userController');
const { protect } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/upload_profile');

router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);
router.get('/search', protect, userController.searchUsers);
router.delete('/account', protect, userController.deleteAccount);


// Ruta para actualizar la foto de perfil
router.put('/profile-picture', protect, upload.single('image'), userController.updateProfilePicture);

// Ruta para eliminar la foto de perfil
router.delete('/profile-picture', protect, userController.deleteProfilePicture);

//Ruta portada perfil
router.put('/cover-picture', protect, upload.single('image'), userController.updateCoverPicture);

// Nueva ruta para ver perfiles de usuario por slug
router.get('/:slug', userController.getProfileBySlug);
module.exports = router;