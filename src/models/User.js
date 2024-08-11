const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: [true, 'Por favor proporcione un email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Por favor proporcione una contraseña'],
    minlength: 8,
    select: false,
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  reels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }],
  stories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
  community: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  
  twoFactorSecret: String,
  googleId: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);