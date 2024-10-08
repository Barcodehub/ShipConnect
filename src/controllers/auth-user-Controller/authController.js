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

// Configuración de Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT || 3000}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));
} else {
  console.warn('Credenciales de Google OAuth no configuradas. La autenticación de Google no estará disponible.');
}

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

    // Si el usuario tiene 2FA habilitado, no inicie sesión aún
    if (user.twoFactorSecret) {
      return res.status(200).json({
        status: 'success',
        message: 'Por favor, proporcione el código 2FA',
        requiresTwoFactor: true,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.generateTwoFactor = async (req, res) => {
  console.log('Generando 2FA para el usuario:', req.user);
  try {
    const secret = speakeasy.generateSecret({ length: 32 });
    console.log('Secret generado:', secret);
    const user = await User.findById(req.user._id);
    console.log('Usuario encontrado:', user);
    user.twoFactorSecret = secret.base32;
    await user.save();
    console.log('Usuario actualizado con 2FA secret');

    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: 'socialfull',
      issuer: 'YourCompany',
    });

    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
    console.log('QR code generado');

    res.status(200).json({
      status: 'success',
      data: {
        qrCodeDataUrl,
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
    const { token } = req.body;
    const user = await User.findById(req.user.id);

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

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.redirect('/dashboard');
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