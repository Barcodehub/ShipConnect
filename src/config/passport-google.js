const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
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
        user = new User({
          googleId: profile.id,
          username: profile.displayName || profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          profilePicture: profile.photos[0]?.value || '',
          // You can add more fields as needed
        });
        await user.save();
      } else {
        // If user exists but doesn't have googleId, update the account
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

module.exports = passport;