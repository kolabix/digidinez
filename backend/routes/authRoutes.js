import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect); // All routes below this middleware require authentication

router.get('/me', getMe);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

export default router;
