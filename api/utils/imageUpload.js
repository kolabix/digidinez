import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const menuImagesDir = path.join(uploadsDir, 'menu-images');

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(menuImagesDir)) {
  fs.mkdirSync(menuImagesDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, menuImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: restaurantId_menuItemId_timestamp.extension
    const uniqueName = `${req.restaurant.id}_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, and WebP images are allowed'));
  }
};

// Create multer upload instance
export const uploadMenuImage = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000, // 5MB default
    files: 1 // Only one file at a time
  },
  fileFilter: fileFilter
});

// Helper function to delete image file
export const deleteImageFile = (imagePath) => {
  try {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image file:', error);
    return false;
  }
};

// Helper function to get full image path
export const getImagePath = (filename) => {
  if (!filename) return null;
  return path.join(menuImagesDir, filename);
};

// Helper function to get image URL for client
export const getImageUrl = (filename) => {
  if (!filename) return null;
  
  // In development, return full API URL
  if (process.env.NODE_ENV === 'development') {
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    return `${apiUrl}/uploads/menu-images/${filename}`;
  }
  
  // In production, return relative path (will be served by same domain)
  return `/uploads/menu-images/${filename}`;
};

// Validate image file exists
export const validateImageExists = (filename) => {
  if (!filename) return false;
  const fullPath = getImagePath(filename);
  return fs.existsSync(fullPath);
};

// Get image file info
export const getImageInfo = (filename) => {
  if (!filename) return null;
  
  const fullPath = getImagePath(filename);
  if (!fs.existsSync(fullPath)) return null;
  
  try {
    const stats = fs.statSync(fullPath);
    return {
      filename,
      size: stats.size,
      uploadedAt: stats.birthtime,
      url: getImageUrl(filename)
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    return null;
  }
};
