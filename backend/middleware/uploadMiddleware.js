// Middleware to handle multer and other file upload errors
export const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Use "image" field name'
      });
    }
    
    // Custom file filter errors
    if (err.message.includes('Only JPEG, JPG, PNG, and WebP')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Generic multer error
    if (err instanceof Error && err.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }
    
    // Other errors - pass to next error handler
    next(err);
  } else {
    next();
  }
};

// Validation middleware for image uploads
export const validateImageUpload = (req, res, next) => {
  // Check if file was provided
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided. Please upload an image file.'
    });
  }
  
  // Additional validation can be added here
  next();
};
