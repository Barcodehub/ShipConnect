/**
 * @fileoverview
 * Copyright (c) 2024 Brayan Alexander Barco Cardenas. All Rights Reserved.
 *
 * Licensed under the MIT License with Attribution Clause. You may obtain a copy of the License at
 * https://github.com/Barcodehub/ShipConnect
 *
 * This file is part of ShipConnect.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },

  bio: String,
  
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
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
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

   // Nuevo campo para la foto de perfil
   profilePicture: {
    type: String,
    default: '' // URL por defecto si lo deseas
  },

     // Nuevo campo para la foto de portada
     coverPicture: {
      type: String,
      default: '' // URL por defecto si lo deseas
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    isOnline: { type: Boolean, default: false }, // Indica si el usuario está conectado
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isModified('username')) return next(); // Middleware para generar el slug antes de guardar
  this.slug = this.username.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  next();
});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);