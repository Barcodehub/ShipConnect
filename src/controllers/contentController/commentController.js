const Comment = require('../../models/contentModel/Comment');
const Post = require('../../models/contentModel/Post');

exports.createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const comment = await Comment.create({ author: req.user.id, post: postId, content });
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId }).populate('author', 'username').sort('-createdAt');
    res.json(comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.commentId, author: req.user.id },
      { content },
      { new: true, runValidators: true }
    );
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or you are not the author' });
    }
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.commentId, author: req.user.id });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or you are not the author' });
    }
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};