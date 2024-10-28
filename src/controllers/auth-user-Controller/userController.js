const User = require('../../models/User');
const Post = require('../../models/contentModel/Post');
const Comment = require('../../models/contentModel/Comment');
const cloudinary = require('../../config/cloudinary');
const Message = require('../../models/chattingModel/Message');
const Event = require('../../models/communityModel/Event');
const FriendRequest = require('../../models/contentModel/FriendRequest');
const Reel = require('../../models/reel-story-Model/Reel');
const Story = require('../../models/reel-story-Model/Story');


exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, privacy } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email, privacy },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: 'Please provide a username to search' });
    }
    const users = await User.find({ 
      username: { $regex: username, $options: 'i' } 
    }).select('username email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Eliminar reels
    const reels = await Reel.find({ author: req.user.id });
    for (const reel of reels) {
      if (reel.videoUrl) {
        const publicId = `reels/${reel.videoUrl.split('/').pop().split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
      }
    }
    await Reel.deleteMany({ author: req.user.id });

    // Eliminar historias
    const stories = await Story.find({ author: req.user.id });
    for (const story of stories) {
      if (story.mediaUrl) {
        const publicId = story.mediaUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }
    await Story.deleteMany({ author: req.user.id });

    // Eliminar todas las publicaciones del usuario
    await Post.deleteMany({ author: req.user.id });
      
    // Eliminar todos los comentarios del usuario
    await Comment.deleteMany({ author: req.user.id });
     
    // Eliminar todos los Message del usuario
    await Message.deleteMany({ author: req.user.id });

    // Eliminar todos los FriendRequest del usuario
    await FriendRequest.deleteMany({ author: req.user.id });

    // Eliminar todos los Event del usuario
    await Event.deleteMany({ author: req.user.id });

    // Eliminar el usuario
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    res.status(500).json({ message: error.message });
  }
};










exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado una imagen' });
    }

    // Sube la imagen a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_pictures',
      transformation: [{ width: 150, height: 150, crop: 'limit' }]
    });

    // Actualiza el usuario con la nueva URL de la imagen
    await User.findByIdAndUpdate(req.user.id, { profilePicture: result.secure_url });

    // Si no quieres guardar localmente, no eliminas el archivo local
    res.status(200).json({ message: 'Imagen de perfil actualizada', imageUrl: result.secure_url });
  } catch (error) {
    console.error('Error en updateProfilePicture:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar foto de perfil
exports.deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: 'Usuario o imagen no encontrada' });
    }

    // Elimina la imagen de Cloudinary
    const publicId = user.profilePicture.split('/').pop().split('.')[0]; // Obtiene el public_id
    await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);

    // Actualiza el usuario para eliminar la URL de la imagen
    await User.findByIdAndUpdate(req.user.id, { profilePicture: null });

    res.status(200).json({ message: 'Imagen de perfil eliminada' });
  } catch (error) {
    console.error('Error en deleteProfilePicture:', error);
    res.status(500).json({ message: error.message });
  }
};

