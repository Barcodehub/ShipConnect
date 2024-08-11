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
require('dotenv').config();
const app = express();

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3002', // Your content-request-service URL
  credentials: true
}));
// Middleware
app.use(express.json({ limit: '10kb' })); // Limita el tamaño del body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Configuración de seguridad
app.use(helmet()); // Cabeceras HTTP seguras
app.use(xss()); // Sanitización contra XSS
app.use(mongoSanitize()); // Prevención de inyección NoSQL

// Rate limiting
const limiter = rateLimit({
  max: 100, // Máximo 100 solicitudes
  windowMs: 60 * 60 * 1000, // 1 hora
  message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo en una hora.',
});
app.use('/api', limiter);

// Configuración de sesiones
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Usar HTTPS en producción
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana
  },
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// CSRF protection
app.use(csrf({ cookie: true }));

app.get('/api/auth/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Rutas
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/contentRoutes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/contentRoutes/commentRoutes');
const likeRoutes = require('./routes/contentRoutes/likeRoutes');
const friendRoutes = require('./routes/contentRoutes/friendRoutes');
const storyRoutes = require('./routes/reel-story-Routes/storyRoutes');
const reelRoutes = require('./routes/reel-story-Routes/reelRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/friends', friendRoutes);

app.use('/api/stories', storyRoutes);
app.use('/api/reels', reelRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));