import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const urlCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 URLs per minute
  message: {
    success: false,
    message: 'Too many URLs created. Please try again after a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 redirects per minute
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
