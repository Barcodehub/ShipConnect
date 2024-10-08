const Story = require('../../models/reel-story-Model/Story');
const cloudinary = require('../../config/cloudinary');
const fs = require('fs').promises;
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const User = require('../../models/User');

exports.createStory = async (req, res) => {
  try {
    let mediaUrl = '';
    let mediaPublicId = ''; // Variable para el public_id

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'stories',
      });
      console.log('Cloudinary upload result:', result);
      mediaUrl = result.secure_url;
      mediaPublicId = result.public_id; // Guardar el public_id
    }

    const { content, privacy } = req.body;

    const newStory = new Story({
      author: req.user.id,
      content: content,
      mediaUrl: mediaUrl,
      mediaPublicId: mediaPublicId, // Guardar el public_id en la base de datos
      privacy: privacy
    });

    await newStory.save();
    console.log('Story saved:', newStory);

    // Actualizar el usuario para incluir el nuevo Story
    await User.findByIdAndUpdate(req.user.id, { $push: { stories: newStory._id } });

    // Eliminar el archivo local después de subirlo a Cloudinary
    await fs.unlink(req.file.path);
    console.log('Local file deleted:', req.file.path);

    res.status(201).json(newStory);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getStories = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');
    const friendIds = user.friends.map(friend => friend._id);
    const stories = await Story.find({
      $or: [
        { author: req.user.id },
        { author: { $in: friendIds }, privacy: 'friends' },
        { privacy: 'public' }
      ]
    }).populate('author', 'username').sort('-createdAt');
    res.json(stories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateStoryPrivacy = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { privacy } = req.body;
    const story = await Story.findOneAndUpdate(
      { _id: storyId, author: req.user.id },
      { privacy },
      { new: true }
    );
    if (!story) {
      return res.status(404).json({ message: 'story not found or you are not the author' });
    }
    res.json(story);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateStory = async (req, res) => {
  try {
    const { content } = req.body;
    const story = await Story.findOneAndUpdate(
      { _id: req.params.storyId, author: req.user.id },
      { content },
      { new: true, runValidators: true }
    );
    if (!story) {
      return res.status(404).json({ message: 'Story not found or you are not the author' });
    }
    res.json(story);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.storyId, author: req.user.id });
    if (!story) {
      return res.status(404).json({ message: 'Story not found or you are not the author' });
    }
    console.log('Deleting media with public_id:', story.mediaPublicId);
    // Si hay un public_id de media, eliminar el archivo de Cloudinary
    if (story.mediaPublicId) {
      await cloudinary.uploader.destroy(story.mediaPublicId);
    }

    // Eliminar el documento Story de la base de datos
    await Story.findByIdAndDelete(req.params.storyId);

    // Actualizar el usuario para eliminar la referencia a la historia
    await User.findByIdAndUpdate(req.user.id, { $pull: { stories: req.params.storyId } });

    res.json({ message: 'Story and associated media deleted successfully' });
  } catch (error) {
    console.error('Error in deleteStory:', error);
    res.status(500).json({ message: error.message });
  }
};