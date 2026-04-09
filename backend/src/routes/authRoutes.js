import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import { signup, login, getMe, oauthCallback, updateProfile, forgotPassword, verifyOtp, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Email/Password Auth
router.post(
  '/signup',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain a number'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
  ],
  signup
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Profile
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateProfile);

// Password Reset
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  forgotPassword
);

router.post(
  '/verify-otp',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  verifyOtp
);

router.post(
  '/reset-password',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain a number'),
  ],
  resetPassword
);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google_failed`,
  }),
  oauthCallback
);

export default router;
