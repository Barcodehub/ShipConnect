const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Community', CommunitySchema);