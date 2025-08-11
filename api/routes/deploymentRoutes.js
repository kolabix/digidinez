import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  triggerDeployment, 
  getDeploymentStatus, 
  getRecentDeployments,
  testVercelConfig
} from '../controllers/deploymentController.js';

const router = express.Router();

/**
 * Deployment Routes
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(protect);

// Test Vercel configuration
router.get('/test-config', testVercelConfig);

// Trigger new deployment
router.post('/trigger', triggerDeployment);

// Get deployment status
router.get('/:id/status', getDeploymentStatus);

// Get recent deployments
router.get('/recent', getRecentDeployments);

export default router;
