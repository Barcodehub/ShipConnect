/**
 * @fileoverview
 * Copyright (c) 2024 Brayan Alexander Barco Cardenas. All Rights Reserved.
 *
 * Licensed under the MIT License with Attribution Clause. You may obtain a copy of the License at
 * https://github.com/Barcodehub/ShipConnect
 *
 * This file is part of ShipConnect.
 */

const authRoutes = require('./auth-user-Routes/authRoutes');
const postRoutes = require('./contentRoutes/postRoutes');
const userRoutes = require('./auth-user-Routes/userRoutes');
const commentRoutes = require('./contentRoutes/commentRoutes');
const likeRoutes = require('./contentRoutes/likeRoutes');
const friendRoutes = require('./contentRoutes/friendRoutes');
const storyRoutes = require('./reel-story-Routes/storyRoutes');
const reelRoutes = require('./reel-story-Routes/reelRoutes');
const communityRoutes = require('./communityRoutes/communities');
const eventsRoutes = require('./communityRoutes/events');
const chatRoutes = require('./chattingRoutes/chatRoutes');
const adminRoutes = require('./auth-user-Routes/adminRoutes');

const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/likes', likeRoutes);
  app.use('/api/friends', friendRoutes);
  app.use('/api/stories', storyRoutes);
  app.use('/api/reels', reelRoutes);
  app.use('/api/communities', communityRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/admin', adminRoutes);
};

module.exports = setupRoutes;