const Post = require('../../models/contentModel/Post');
const Comment = require('../../models/contentModel/Comment');

exports.togglePostLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    const likeIndex = comment.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(req.user.id);
    }
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeLike = async (req, res) => {
  try {
    const { type, id } = req.params;
    let result;
    if (type === 'post') {
      result = await Post.findByIdAndUpdate(id, { $pull: { likes: req.user.id } }, { new: true });
    } else if (type === 'comment') {
      result = await Comment.findByIdAndUpdate(id, { $pull: { likes: req.user.id } }, { new: true });
    } else {
      return res.status(400).json({ message: 'Invalid like type' });
    }
    if (!result) {
      return res.status(404).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found` });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};