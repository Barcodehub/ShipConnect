const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/database');
const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');
const setupSocketIO = require('./socket');
const initAdmin = require('./initAdmin');
const app = express();

//chat inicio
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3002",
    methods: ["GET", "POST"],
    credentials: true
  }
});

connectDB();
initAdmin();
setupMiddleware(app);
setupRoutes(app);
setupSocketIO(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));