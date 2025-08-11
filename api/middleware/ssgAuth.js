import dotenv from 'dotenv';

// Ensure env vars are loaded when middleware is imported directly
dotenv.config();

/**
 * Verify SSG build secret sent via header `x-ssg-secret`.
 * This is intended for internal pre-render scripts only.
 */
export const verifySsgSecret = (req, res, next) => {
  try {
    const configuredSecret = process.env.SSG_BUILD_SECRET;
    if (!configuredSecret) {
      return res.status(500).json({
        success: false,
        message: 'SSG secret not configured on server'
      });
    }

    const providedSecret = req.headers['x-ssg-secret'];
    if (!providedSecret || providedSecret !== configuredSecret) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};


