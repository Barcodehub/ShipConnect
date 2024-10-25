/**
 * @fileoverview
 * Copyright (c) 2024 Brayan Alexander Barco Cardenas. All Rights Reserved.
 *
 * Licensed under the MIT License with Attribution Clause. You may obtain a copy of the License at
 * https://github.com/Barcodehub/ShipConnect
 *
 * This file is part of ShipConnect.
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/database');
const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');
const setupSocketIO = require('./socket');
const initAdmin = require('./config/initAdmin');
const app = express();

const corsOptions = {
  origin: 'http://localhost:3002', // URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  credentials: true
};

app.use(cors(corsOptions));

// Socket.io setup con CORS
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions
});

connectDB();
initAdmin();
setupMiddleware(app);
setupRoutes(app);
setupSocketIO(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));