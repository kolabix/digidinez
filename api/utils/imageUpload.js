import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { uploadBufferToS3, deleteS3Object } from './s3Upload.js';

// Multer memory storage (we upload buffers directly to S3)
const storage = multer.memoryStorage();

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

// ---------- AWS S3 helpers (public uploads) ----------

// Upload a buffer from multer memory storage to S3 (public)
export const uploadBufferToBlob = async (restaurantId, file, category = 'food-images') => {
  // This function is kept for backward compatibility but now uses S3
  return await uploadBufferToS3(restaurantId, file, category);
};

// Delete a previously uploaded S3 object using either key or public URL
export const deleteBlobObject = async (keyOrUrl) => {
  // This function is kept for backward compatibility but now uses S3
  return await deleteS3Object(keyOrUrl);
};

