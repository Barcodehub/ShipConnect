const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

const setupMiddleware = (app) => {
  app.use(express.json({ limit: process.env.BODY_LIMIT || '10kb' })); // Limita el tamaño del body
  app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '10kb' }));
  app.use(cookieParser());

  // Configuración de seguridad
  app.use(helmet()); // Cabeceras HTTP seguras
  app.use(xss()); // Sanitización contra XSS
  app.use(mongoSanitize()); // Prevención de inyección NoSQL

  // Rate limiting
  const limiter = rateLimit({
    max: process.env.RATE_LIMIT_MAX || 100, // Máximo 100 solicitudes
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000,  // 1 hora
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
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: process.env.SESSION_MAX_AGE || 1000 * 60 * 60 * 24 * 7,
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
};

module.exports = setupMiddleware;