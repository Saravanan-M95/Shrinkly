import { Router } from 'express';
import { body } from 'express-validator';
import {
  createUrl,
  getUserUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getUrlAnalytics,
  getOverallStats,
} from '../controllers/urlController.js';
import { authenticate } from '../middleware/auth.js';
import { urlCreationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Overall stats
router.get('/stats', getOverallStats);

// CRUD
router.post(
  '/',
  urlCreationLimiter,
  [
    body('originalUrl')
      .isURL({ require_protocol: true })
      .withMessage('Please provide a valid URL with http:// or https://'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Title must be under 255 characters'),
    body('customCode')
      .optional()
      .trim()
      .isAlphanumeric()
      .isLength({ min: 3, max: 20 })
      .withMessage('Custom code must be 3-20 alphanumeric characters'),
  ],
  createUrl
);

router.get('/', getUserUrls);
router.get('/:id', getUrlById);
router.patch('/:id', updateUrl);
router.delete('/:id', deleteUrl);

// Analytics
router.get('/:id/analytics', getUrlAnalytics);

export default router;
