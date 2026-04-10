import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import { redirectUrl } from './controllers/urlController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalLimiter, redirectLimiter } from './middleware/rateLimiter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (for Render/Heroku)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://shrinqe.com',
  'https://www.shrinqe.com',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:19006',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith('.vercel.app') || 
                     origin.includes('localhost');
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS blocked for origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', generalLimiter);

// Passport
app.use(passport.initialize());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ShrinQE API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Short URL redirect (must be after API routes)
app.get('/:code', redirectLimiter, redirectUrl);

// Error handling
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

// Database sync & server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models (use migrations in production)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synced');
    }

    app.listen(PORT, () => {
      console.log(`🚀 ShrinQE API running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Render Keep-Alive: Ping the health endpoint every 5 minutes
      // 14 minutes was too close to the 15-minute threshold; 5 minutes is standard.
      if (process.env.NODE_ENV === 'production') {
        const url = process.env.RENDER_EXTERNAL_URL || 'https://api.shrinqe.com';
        console.log(`🔌 Initializing keep-alive for: ${url}`);
        
        setInterval(async () => {
          try {
            const { data } = await axios.get(`${url}/api/health`);
            console.log('💓 Keep-alive heartbeat successful:', data.timestamp);
          } catch (err) {
            console.error('💔 Keep-alive heartbeat failed:', err.message);
            // If the primary URL fails, attempt to ping localhost as a backup
            try {
              await axios.get(`http://localhost:${PORT}/api/health`);
              console.log('💓 Keep-alive heartbeat successful (localhost fallback)');
            } catch (localErr) {
              console.error('💀 Keep-alive critical failure:', localErr.message);
            }
          }
        }, 5 * 60 * 1000); // 5 minutes
      }
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
