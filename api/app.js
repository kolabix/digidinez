import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import deploymentRoutes from './routes/deploymentRoutes.js';
import { handleUploadErrors } from './middleware/uploadMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration - Allow all origins for development
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route - Make sure this is defined
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbStatus] || 'unknown';

  res.json({
    success: true,
    message: 'DigiDinez API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatusText,
      connected: dbStatus === 1,
      name: 'digidinez'
    },
    features: {
      authentication: 'enabled',
      cookieParser: 'enabled'
    },
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DigiDinez API' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/menu/tags', tagRoutes);
app.use('/menu', menuRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/deployment', deploymentRoutes);

// Handle upload errors
app.use(handleUploadErrors);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;