const Post = require('../../models/contentModel/Post');
const User = require('../../models/User');
const FriendRequest = require('../../models/contentModel/FriendRequest');

exports.createPost = async (req, res) => {
  try {
    const { content, privacy } = req.body;
    const post = await Post.create({ author: req.user.id, content, privacy });
    await User.findByIdAndUpdate(req.user.id, { $push: { posts: post._id } });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');
    const friendIds = user.friends.map(friend => friend._id);

    const posts = await Post.find({
      $or: [
        { author: req.user.id },
        { shares: req.user.id }, // Posts compartidos por el usuario
        { author: { $in: friendIds }, privacy: 'friends' },
        { privacy: 'public' }
      ]
    })
      .populate('author', 'username profilePicture')
      .sort('-createdAt');
    
    res.json(posts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.sharePost = async (req, res) => {
  try {
    const { postId } = req.body; // ID del post original

    // Verificar si el post original existe
    const originalPost = await Post.findById(postId).populate('author', 'username profilePicture');
    if (!originalPost) {
      return res.status(404).json({ message: 'El post original no existe.' });
    }

    // Crear el post compartido
    const sharedPost = new Post({
      author: req.user.id, // Usuario que comparte el post
      content: '', // Opcional: contenido adicional al compartir
      privacy: originalPost.privacy, // Hereda la privacidad del post original
      sharedPost: {
        post: originalPost._id,
        sharedBy: req.user.id
      }
    });

    await sharedPost.save();

    res.status(201).json(sharedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getNewsFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');
    const friendIds = user.friends.map(friend => friend._id);
    const posts = await Post.find({
      $or: [
        { author: { $in: friendIds } },
        { author: req.user.id },
        { privacy: 'public' }
      ]
    }).populate('author', 'username profilePicture').sort('-createdAt');
    res.json(posts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [
        { author: req.user.id },
        { shares: req.user.id } // Incluye posts que el usuario compartió
      ]
    })
      .populate('author', 'username profilePicture')
      .sort('-createdAt');
    
    res.json(posts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Crear nuevo endpoint para obtener posts por userId
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;

    const posts = await Post.find({
      $or: [
        { author: userId },
        { shares: userId } // Posts compartidos por el usuario
      ]
    })
      .populate('author', 'username profilePicture')
      .sort('-createdAt');
    
    res.json(posts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.updatePostPrivacy = async (req, res) => {
  try {
    const { postId } = req.params;
    const { privacy } = req.body;
    const post = await Post.findOneAndUpdate(
      { _id: postId, author: req.user.id },
      { privacy },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found or you are not the author' });
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.postId, author: req.user.id });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or you are not the author' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findOneAndUpdate(
      { _id: req.params.postId, author: req.user.id },
      { content },
      { new: true, runValidators: true }
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found or you are not the author' });
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



