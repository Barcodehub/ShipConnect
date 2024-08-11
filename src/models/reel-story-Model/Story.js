const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: {
    type: String,
    required: true
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  mediaUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Expira después de 24 horas
  }
}, { timestamps: true });

module.exports = mongoose.model('Story', StorySchema);