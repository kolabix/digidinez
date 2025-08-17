import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifySsgSecret } from '../middleware/ssgAuth.js';
import { 
  getProfile, 
  updateProfile, 
  toggleStatus, 
  getStats,
  uploadPrimaryLogo,
  uploadBrandMark,
  listActiveRestaurantsForSsg
} from '../controllers/restaurantController.js';
import { 
  generateQRCode, 
  getQRCode, 
  deleteQRCode, 
  getQRCodeImage 
} from '../controllers/qrController.js';
import { 
  validateUpdateProfile, 
  validateStatusToggle 
} from '../middleware/validation.js';
import { handleUploadErrors, validateImageUpload } from '../middleware/uploadMiddleware.js';
import { uploadMenuImage } from '../utils/imageUpload.js';

const router = express.Router();

/**
 * Restaurant Routes
 * Includes both profile management and QR code functionality
 */

// Public routes (no authentication required)
router.get('/:id/qr', getQRCodeImage);

// Internal SSG route protected by secret header
router.get('/ssg/list', verifySsgSecret, listActiveRestaurantsForSsg);

// Apply authentication to all other routes
router.use(protect);

// Profile management routes
router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.patch('/status', validateStatusToggle, toggleStatus);
router.get('/stats', getStats);

// Logo upload routes
router.post('/primary-logo', uploadMenuImage.single('logo'), handleUploadErrors, validateImageUpload, uploadPrimaryLogo);
router.post('/brand-mark', uploadMenuImage.single('logo'), handleUploadErrors, validateImageUpload, uploadBrandMark);

// QR code management routes
router.post('/generate-qr', generateQRCode);
router.get('/qr', getQRCode);
router.delete('/qr', deleteQRCode);

export default router;
