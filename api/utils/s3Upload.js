import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Initialize S3 client with Lambda-optimized configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined, // Use IAM role when running on Lambda
  maxAttempts: 3, // Optimize for Lambda cold starts
  requestHandler: undefined, // Use default handler for Lambda
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

if (!BUCKET_NAME) {
  throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
}

// Helper function to build S3 object keys
const buildRestaurantAssetKey = (restaurantId, originalName, category = 'food-images') => {
  const safeExt = path.extname(originalName || '').toLowerCase() || '.bin';
  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  // S3 structure: restaurants/{id}/food-images/* or restaurants/{id}/logos/* or restaurants/{id}/branding/*
  return `restaurants/${restaurantId}/${category}/${unique}${safeExt}`;
};

// Generate public URL for S3 objects
const generatePublicUrl = (key) => {
  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
};

// Upload a buffer to S3 (Lambda-optimized)
export const uploadBufferToS3 = async (restaurantId, file, category = 'food-images') => {
  if (!file || !file.buffer) {
    throw new Error('No file buffer provided');
  }

  const key = buildRestaurantAssetKey(restaurantId, file.originalname, category);
  
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    CacheControl: 'public, max-age=31536000, immutable',
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    return {
      key,
      publicUrl: generatePublicUrl(key),
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

// Delete an object from S3
export const deleteS3Object = async (keyOrUrl) => {
  if (!keyOrUrl) return false;

  let key;
  
  // If it's a full URL, extract the key
  if (keyOrUrl.startsWith('http')) {
    const url = new URL(keyOrUrl);
    key = url.pathname.substring(1); // Remove leading slash
  } else {
    key = keyOrUrl;
  }

  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    // Don't throw error if object doesn't exist
    if (error.name === 'NoSuchKey') {
      return true;
    }
    throw new Error(`Failed to delete object from S3: ${error.message}`);
  }
};

// Check if an object exists in S3
export const checkS3ObjectExists = async (key) => {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return false;
    }
    throw error;
  }
};

// Generate presigned URL for temporary access (if needed)
export const generatePresignedUrl = async (key, operation = 'getObject', expiresIn = 3600) => {
  const command = operation === 'getObject' 
    ? new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key })
    : new PutObjectCommand({ Bucket: BUCKET_NAME, Key: key });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
};

// Upload raw buffer to S3 (for QR codes, icons, etc.) - Lambda-optimized
export const uploadRawBufferToS3 = async (key, buffer, contentType, cacheControl = 'public, max-age=31536000, immutable') => {
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: cacheControl,
    // ACL removed - bucket policy handles public access
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    return {
      key,
      publicUrl: generatePublicUrl(key),
      size: buffer.length,
      contentType,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('S3 raw buffer upload error:', error);
    throw new Error(`Failed to upload buffer to S3: ${error.message}`);
  }
};
