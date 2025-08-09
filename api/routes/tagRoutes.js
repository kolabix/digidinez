import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getPublicTags
} from '../controllers/tagController.js';

const router = express.Router();

// Validation rules for tag creation and updates
const tagValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Tag name must be between 1 and 30 characters')
    .matches(/^[a-zA-Z0-9\s\-'&]+$/)
    .withMessage('Tag name can only contain letters, numbers, spaces, hyphens, apostrophes, and ampersands'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color (e.g., #FF0000 or #F00)')
];

const updateTagValidationRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Tag name must be between 1 and 30 characters')
    .matches(/^[a-zA-Z0-9\s\-'&]+$/)
    .withMessage('Tag name can only contain letters, numbers, spaces, hyphens, apostrophes, and ampersands'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color (e.g., #FF0000 or #F00)'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Protected routes (require authentication)
router.get('/', protect, getTags);
router.post('/', protect, tagValidationRules, createTag);
router.put('/:id', protect, updateTagValidationRules, updateTag);
router.delete('/:id', protect, deleteTag);

// Public routes (no authentication required)
router.get('/public/:restaurantId', getPublicTags);

export default router;
