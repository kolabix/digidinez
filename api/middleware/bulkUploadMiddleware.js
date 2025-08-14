import multer from 'multer';
import path from 'path';

// Multer memory storage for bulk upload files
const storage = multer.memoryStorage();

// File filter function for bulk upload
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /xlsx|xls|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'text/csv' || 
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.mimetype === 'application/vnd.ms-excel';

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
  }
};

// Create multer upload instance for bulk upload
export const uploadBulkFile = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_BULK_FILE_SIZE) || 10000000, // 10MB default
    files: 1 // Only one file at a time
  },
  fileFilter: fileFilter
});

// Middleware to handle bulk upload errors
export const handleBulkUploadErrors = (err, req, res, next) => {
  if (err) {
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB'
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
        message: 'Unexpected file field. Use "file" field name'
      });
    }
    
    // Custom file filter errors
    if (err.message.includes('Only Excel (.xlsx, .xls) and CSV files are allowed')) {
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
