import express from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getMenuItemsByCategory,
  bulkUpdateMenuItems,
  uploadMenuItemImage,
  deleteMenuItemImage,
  getMenuItemImage
} from '../controllers/menuController.js';
import { protect } from '../middleware/auth.js';
import {
  validateCreateMenuItem,
  validateUpdateMenuItem,
  validateObjectId,
  validateCategory,
  validateMenuQuery
} from '../middleware/validation.js';
import { uploadMenuImage } from '../utils/imageUpload.js';

const router = express.Router();

// All menu routes require authentication
router.use(protect);

// Menu Items CRUD
router.route('/items')
  .get(validateMenuQuery, getMenuItems)           // GET /api/menu/items
  .post(validateCreateMenuItem, createMenuItem);  // POST /api/menu/items

router.route('/items/bulk')
  .put(bulkUpdateMenuItems);   // PUT /api/menu/items/bulk

router.route('/items/category/:category')
  .get(validateCategory, validateMenuQuery, getMenuItemsByCategory); // GET /api/menu/items/category/:category

router.route('/items/:id')
  .get(validateObjectId, getMenuItem)                           // GET /api/menu/items/:id
  .put(validateObjectId, validateUpdateMenuItem, updateMenuItem) // PUT /api/menu/items/:id
  .delete(validateObjectId, deleteMenuItem);                    // DELETE /api/menu/items/:id

router.route('/items/:id/toggle')
  .patch(validateObjectId, toggleAvailability);  // PATCH /api/menu/items/:id/toggle

// Image upload routes
router.route('/items/:id/image')
  .get(validateObjectId, getMenuItemImage)                                    // GET /api/menu/items/:id/image
  .post(validateObjectId, uploadMenuImage.single('image'), uploadMenuItemImage) // POST /api/menu/items/:id/image
  .delete(validateObjectId, deleteMenuItemImage);                             // DELETE /api/menu/items/:id/image

export default router;
