import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  generateQRCode, 
  getQRCode, 
  deleteQRCode, 
  getQRCodeImage 
} from '../controllers/qrController.js';

const router = express.Router();

/**
 * QR Code Routes
 * All routes except getQRCodeImage require authentication
 */

// Public route to get QR code info for any restaurant (no auth required)
router.get('/:id/qr', getQRCodeImage);

// Protected routes (require authentication)
router.use(protect);

// Generate or regenerate QR code for current restaurant
router.post('/generate-qr', generateQRCode);

// Get current restaurant's QR code information
router.get('/qr', getQRCode);

// Delete current restaurant's QR code
router.delete('/qr', deleteQRCode);

export default router;
