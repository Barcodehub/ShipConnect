const Reel = require('../../models/reel-story-Model/Reel');
const cloudinary = require('../../config/cloudinary');
const fs = require('fs').promises;
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const User = require('../../models/User');
exports.createReel = async (req, res) => {
  try {
    let videoUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "reels",
      });
      videoUrl = result.secure_url;
    }

    const { description, privacy } = req.body;

    const newReel = new Reel({
      author: req.user.id,
      videoUrl: videoUrl,
      description: description,
      privacy: privacy
    });

    await newReel.save();
    
    // Actualizar el usuario para incluir el nuevo reel
    await User.findByIdAndUpdate(req.user.id, { $push: { reels: newReel._id } });

    console.log('Ruta del archivo:', req.file.path);

    try {
      // Intentar eliminar el archivo usando la versión de promesas
      await fs.unlink(req.file.path);
      console.log('Archivo eliminado correctamente');
    } catch (unlinkError) {
      if (unlinkError.code === 'ENOENT') {
        console.log('El archivo no existe en la ruta especificada');
      } else {
        console.error('Error al eliminar el archivo:', unlinkError);
      }
    }
    
    res.status(201).json(newReel);
  } catch (error) {
    console.error('Error en createReel:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getReels = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');
    const friendIds = user.friends.map(friend => friend._id);
    const reels = await Reel.find({
      $or: [
        { author: req.user.id },
        { author: { $in: friendIds }, privacy: 'friends' },
        { privacy: 'public' }
      ]
    }).populate('author', 'username').sort('-createdAt');
    res.json(reels);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReelPrivacy = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { privacy } = req.body;
    const reel = await Reel.findOneAndUpdate(
      { _id: reelId, author: req.user.id },
      { privacy },
      { new: true }
    );
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found or you are not the author' });
    }
    res.json(reel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReel = async (req, res) => {
  try {
    const { description } = req.body;
    const reel = await Reel.findOneAndUpdate(
      { _id: req.params.reelId, author: req.user.id },
      { description },
      { new: true, runValidators: true }
    );
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found or you are not the author' });
    }
    res.json(reel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findOneAndDelete({ _id: req.params.reelId, author: req.user.id });
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found or you are not the author' });
    }
    res.json({ message: 'Reel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};