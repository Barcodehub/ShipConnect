const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'user', 'moderator', 'community_moderator']
  },
  description: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Role', roleSchema);