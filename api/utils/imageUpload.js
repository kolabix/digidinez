import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { put, del } from '@vercel/blob';

// Multer memory storage (we upload buffers directly to Blob)
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

// ---------- Vercel Blob helpers (public uploads) ----------

const BLOB_PUBLIC_BASE = process.env.BLOB_PUBLIC_BASE;

if (!BLOB_PUBLIC_BASE) {
  // Keep lazy validation to avoid crashing import-time in certain contexts
  // Actual operations will throw if this is missing
}

const buildRestaurantAssetKey = (restaurantId, originalName, category = 'food-images') => {
  const safeExt = path.extname(originalName || '').toLowerCase() || '.bin';
  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  // Public Menu uploads structure:
  // restaurants/{id}/food-images/* or restaurants/{id}/logos/*
  return `restaurants/${restaurantId}/${category}/${unique}${safeExt}`;
};

// Upload a buffer from multer memory storage to Vercel Blob (public)
export const uploadBufferToBlob = async (restaurantId, file, category = 'food-images') => {
  if (!file || !file.buffer) {
    throw new Error('No file buffer provided');
  }
  const key = buildRestaurantAssetKey(restaurantId, file.originalname, category);
  const { url } = await put(key, file.buffer, {
    access: 'public',
    contentType: file.mimetype,
    cacheControl: 'public, max-age=31536000, immutable'
  });

  return {
    key,
    publicUrl: url,
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date()
  };
};

// Delete a previously uploaded Blob object using either key or public URL
export const deleteBlobObject = async (keyOrUrl) => {
  if (!keyOrUrl) return false;
  const base = process.env.BLOB_PUBLIC_BASE;
  if (!base) throw new Error('BLOB_PUBLIC_BASE is not set');

  const target = keyOrUrl.startsWith('http') && keyOrUrl.includes(base)
    ? keyOrUrl
    : `${base}/${keyOrUrl}`;

  await del(target);
  return true;
};

