const User = require('../../models/User');
const Post = require('../../models/contentModel/Post');
const Comment = require('../../models/contentModel/Comment');
const cloudinary = require('../../config/cloudinary');
const upload = require('../../middleware/upload_profile');
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
    const { username, bio, email, privacy } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, bio, email, privacy },
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
      return res.status(400).json({ message: 'No se ha proporcionado ninguna imagen.' });
    }

    // Obtener el usuario actual
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si existe una imagen anterior, obtener su public_id para eliminarla después
    let oldImagePublicId = null;
    if (user.profilePicture) {
      // Extraer el public_id de la URL de Cloudinary
      const urlParts = user.profilePicture.split('/');
      const filenamePart = urlParts[urlParts.length - 1];
      oldImagePublicId = `profile-pictures/${user._id}/${filenamePart.split('.')[0]}`;
    }

    // Convertir el buffer a base64 para subirlo a Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Subir la nueva imagen a Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(dataURI, {
      folder: `profile-pictures/${user._id}`,
      transformation: [
        { width: 400, height: 400, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    // Actualizar el usuario con la nueva URL de la imagen
    user.profilePicture = cloudinaryResult.secure_url;
    await user.save();

    // Si había una imagen anterior, eliminarla de Cloudinary
    if (oldImagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (deleteError) {
        console.error('Error al eliminar la imagen anterior:', deleteError);
        // Continuamos aunque haya error en la eliminación
      }
    }

    res.json({ 
      message: 'Foto de perfil actualizada exitosamente',
      profilePicture: cloudinaryResult.secure_url 
    });

  } catch (error) {
    console.error('Error al actualizar la foto de perfil:', error);
    res.status(500).json({ 
      message: 'Error al actualizar la foto de perfil',
      error: error.message 
    });
  }
};

exports.deleteProfilePicture = async (req, res) => {
 
  //eliminar foto anterior de cloudinary y luego poner la foto por default
};











exports.updateCoverPicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ninguna imagen.' });
    }

    // Obtener el usuario actual
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si existe una imagen anterior, obtener su public_id para eliminarla después
    let oldImagePublicId = null;
    if (user.coverPicture) {
      // Extraer el public_id de la URL de Cloudinary
      const urlParts = user.coverPicture.split('/');
      const filenamePart = urlParts[urlParts.length - 1];
      oldImagePublicId = `cover-pictures/${user._id}/${filenamePart.split('.')[0]}`;
    }

    // Convertir el buffer a base64 para subirlo a Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Subir la nueva imagen a Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(dataURI, {
      folder: `cover-pictures/${user._id}`,
      transformation: [
        { width: 1200, height: 400, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    // Actualizar el usuario con la nueva URL de la imagen
    user.coverPicture = cloudinaryResult.secure_url;
    await user.save();

    // Si había una imagen anterior, eliminarla de Cloudinary
    if (oldImagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (deleteError) {
        console.error('Error al eliminar la imagen anterior:', deleteError);
        // Continuamos aunque haya error en la eliminación
      }
    }

    res.json({
      message: 'Foto de portada actualizada exitosamente',
      coverPicture: cloudinaryResult.secure_url
    });
  } catch (error) {
    console.error('Error al actualizar la foto de portada:', error);
    res.status(500).json({
      message: 'Error al actualizar la foto de portada',
      error: error.message
    });
  }
};







//url perfil user
exports.getProfileBySlug = async (req, res) => {
  try {
    const user = await User.findOne({ slug: req.params.slug })
      .select('-password -twoFactorSecret -resetPasswordToken -resetPasswordExpire')
      .populate('posts')
      .populate('friends', 'username profilePicture slug')
      .populate('community')
      .populate('events');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el perfil de usuario',
      });
    }

    // Verificar la privacidad del perfil
    if (user.privacy === 'private' && (!req.user || !user.friends.includes(req.user._id))) {
      return res.status(403).json({
        status: 'fail',
        message: 'Este perfil es privado',
      });
    }

    if (user.privacy === 'friends' && (!req.user || !user.friends.includes(req.user._id))) {
      // Si el perfil es solo para amigos, mostrar información limitada
      return res.status(200).json({
        status: 'success',
        data: {
          username: user.username,
          profilePicture: user.profilePicture,
          privacy: user.privacy,
        },
      });
    }

    // Si el perfil es público o el usuario tiene acceso, mostrar toda la información
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
    });
  }
};
