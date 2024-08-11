const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl: {
    type: String,
    required: true
  },
  description: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Reel', ReelSchema);