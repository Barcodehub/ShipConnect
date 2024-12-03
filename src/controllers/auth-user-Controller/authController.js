const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sendEmail = require('../../utils/emailService');
const crypto = require('crypto');
const Role = require('../../models/Role');
require('dotenv').config();

// Google OAuth Strategy Configuration
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (!user) {
        // Create new user if not exists
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName || profile.emails[0].value.split('@')[0],
          profilePicture: profile.photos[0]?.value || '',
        });
      } else if (!user.googleId) {
        // If user exists but hasn't linked Google before
        user.googleId = profile.id;
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));
} else {
  console.warn('Google OAuth credentials not configured. Google authentication will be unavailable.');
}

// Serialize and Deserialize User for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

exports.signup = async (req, res) => {
    try {
      const userRole = await Role.findOne({ name: 'user' });
      const newUser = await User.create({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        roles: [userRole._id],
      });
  
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
  
      res.status(201).json({
        status: 'success',
        token,
        data: {
          user: newUser,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

exports.login = async (req, res) => {
  
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor proporcione email y contraseña',
      });
    }

    // Intentar encontrar al usuario por email
    const user = await User.findOne({ email }).select('+password');

   
    // Verificar si la contraseña es correcta
    const isCorrectPassword = user && await user.correctPassword(password, user.password);
    //console.log('Contraseña correcta:', isCorrectPassword);

    if (!user || !isCorrectPassword) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email o contraseña incorrectos',
      });
    }

    user.isOnline = true;
    await user.save();
    
    // Si el usuario tiene 2FA habilitado, no inicie sesión aún
    if (user.twoFactorSecret) {
      return res.status(200).json({
        status: 'success',
        message: 'Por favor, proporcione el código 2FA',
        requiresTwoFactor: true,
        user: { _id: user._id },
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

      // Establecer un temporizador para cambiar online a false al expirar el token
  const expirationTime = parseInt(process.env.JWT_EXPIRATION) * 24 * 60 * 60 * 1000; // Convierte a milisegundos
  setTimeout(async () => {
    user.isOnline = false;
    await user.save();
  }, expirationTime);


    res.status(200).json({
      status: 'success',
      token,
      user: { _id: user._id, email: user.email }, // Incluye el id y el email del usuario
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    
      // Actualiza el estado `online` a false
      await User.findByIdAndUpdate(req.user.id, { isOnline: false });
    

    // Limpia la cookie de sesión
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({ status: 'success', message: 'Cierre de sesión exitoso' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Error al cerrar sesión' });
  }
};


exports.generateTwoFactor = async (req, res) => {
  console.log('Generando 2FA para el usuario:', req.user);
  try {
    const secret = speakeasy.generateSecret({ length: 32 });
    console.log('Secret generado:', secret);
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado',
      });
    }

    user.twoFactorSecret = secret.base32;
    await user.save();
    console.log('Usuario actualizado con 2FA secret');

    res.status(200).json({
      status: 'success',
      data: {
        secret: secret.base32, // Enviar solo la clave secreta
      },
    });
  } catch (error) {
    console.error('Error en generateTwoFactor:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.verifyTwoFactor = async (req, res) => {
  try {
      const { token, userId } = req.body;

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({
              status: 'fail',
              message: 'Usuario no encontrado',
          });
      }

      const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token,
      });

      if (!verified) {
          return res.status(400).json({
              status: 'fail',
              message: 'Código 2FA inválido',
          });
      }

      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '1d',
      });

      res.status(200).json({
          status: 'success',
          token: jwtToken,
      });
  } catch (error) {
      res.status(400).json({
          status: 'fail',
          message: error.message,
      });
  }
};


// Google Authentication Handlers
exports.googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Redirect to frontend with the token
    //res.redirect(`${process.env.FRONTEND_URL}/home?token=${token}`);
    // Enviar el token al frontend
    //return res.json({ token });
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    
  })(req, res, next);
};


exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getCsrfToken = (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  };




  exports.forgotPassword = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();
  
      const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
      });
  
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  exports.resetPassword = async (req, res) => {
    try {
      const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid token' });
      }
  
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
  
      res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
