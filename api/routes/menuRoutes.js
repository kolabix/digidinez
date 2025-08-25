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
  getMenuItemImage,
  getPublicMenu,
  // Category methods
  getMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  reorderCategories
} from '../controllers/menuController.js';
import { bulkUpload, downloadTemplate } from '../controllers/bulkUploadController.js';
import { protect } from '../middleware/auth.js';
import {
  validateCreateMenuItem,
  validateUpdateMenuItem,
  validateObjectId,
  validateCategory,
  validateMenuQuery,
  validateCreateMenuCategory,
  validateUpdateMenuCategory
} from '../middleware/validation.js';
import { uploadMenuImage } from '../utils/imageUpload.js';
import { uploadBulkFile, handleBulkUploadErrors } from '../middleware/bulkUploadMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public/:restaurantId', getPublicMenu);

// All other menu routes require authentication
router.use(protect);

// Menu Items CRUD
router.route('/items')
  .get(validateMenuQuery, getMenuItems)           // GET /menu/items
  .post(validateCreateMenuItem, createMenuItem);  // POST /menu/items

router.route('/items/bulk')
  .put(bulkUpdateMenuItems);   // PUT /menu/items/bulk

router.route('/items/category/:category')
  .get(validateCategory, validateMenuQuery, getMenuItemsByCategory); // GET /menu/items/category/:category

router.route('/items/:id')
  .get(validateObjectId, getMenuItem)                           // GET /menu/items/:id
  .put(validateObjectId, validateUpdateMenuItem, updateMenuItem) // PUT /menu/items/:id
  .delete(validateObjectId, deleteMenuItem);                    // DELETE /menu/items/:id

router.route('/items/:id/toggle')
  .patch(validateObjectId, toggleAvailability);  // PATCH /menu/items/:id/toggle

// Image upload routes
router.route('/items/:id/image')
  .get(validateObjectId, getMenuItemImage)                                    // GET /menu/items/:id/image
  .post(validateObjectId, uploadMenuImage.single('image'), uploadMenuItemImage) // POST /menu/items/:id/image
  .delete(validateObjectId, deleteMenuItemImage);                             // DELETE /menu/items/:id/image

// Category routes
router.route('/categories')
  .get(getMenuCategories)                                 // GET /menu/categories
  .post(validateCreateMenuCategory, createMenuCategory);  // POST /menu/categories

router.route('/categories/reorder')
  .patch(reorderCategories);                              // PATCH /menu/categories/reorder

router.route('/categories/:id')
  .put(validateObjectId, validateUpdateMenuCategory, updateMenuCategory)  // PUT /menu/categories/:id
  .delete(validateObjectId, deleteMenuCategory);                          // DELETE /menu/categories/:id

// Bulk upload routes
router.route('/bulk-upload')
  .post(uploadBulkFile.single('file'), handleBulkUploadErrors, bulkUpload);  // POST /menu/bulk-upload

router.route('/bulk-upload/template')
  .get(downloadTemplate);  // GET /menu/bulk-upload/template

export default router;
