import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { User } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
  scope: ['profile', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('No email found in Google profile'), null);
    }

    let user = await User.findOne({
      where: { email },
    });

    if (user) {
      // Update provider info if user exists but used different provider
      if (user.provider !== 'google') {
        user.provider = 'google';
        user.providerId = profile.id;
        user.avatarUrl = profile.photos?.[0]?.value || user.avatarUrl;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        name: profile.displayName,
        avatarUrl: profile.photos?.[0]?.value,
        provider: 'google',
        providerId: profile.id,
        isVerified: true,
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Microsoft OAuth Strategy
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/microsoft/callback`,
  scope: ['user.read'],
  tenant: 'common',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('No email found in Microsoft profile'), null);
    }

    let user = await User.findOne({
      where: { email },
    });

    if (user) {
      if (user.provider !== 'microsoft') {
        user.provider = 'microsoft';
        user.providerId = profile.id;
        await user.save();
      }
    } else {
      user = await User.create({
        email,
        name: profile.displayName,
        provider: 'microsoft',
        providerId: profile.id,
        isVerified: true,
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
