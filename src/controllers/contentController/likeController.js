const Post = require('../../models/contentModel/Post');
const Comment = require('../../models/contentModel/Comment');
const Reel = require('../../models/reel-story-Model/Reel');
const Story = require('../../models/reel-story-Model/Story');


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


exports.toggleReelLike = async (req, res) => {
  try {
    const { reelId } = req.params;
    const reel = await Reel.findById(reelId);
    const likeIndex = reel.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      reel.likes.splice(likeIndex, 1);
    } else {
      reel.likes.push(req.user.id);
    }
    await reel.save();
    res.json(reel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.toggleStoryLike = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    const likeIndex = story.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      story.likes.splice(likeIndex, 1);
    } else {
      story.likes.push(req.user.id);
    }
    await story.save();
    res.json(story);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};