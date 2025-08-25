import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  triggerDeployment, 
  getDeploymentStatus, 
  getRecentDeployments,
  testGitHubConfig
} from '../controllers/deploymentController.js';

const router = express.Router();

/**
 * Deployment Routes
 */

// Public test endpoint (no authentication required)
router.get('/test-config-public', testGitHubConfig);

// Apply authentication to all other routes
router.use(protect);

// Test GitHub Actions configuration
router.get('/test-config', testGitHubConfig);

// Trigger new deployment
router.post('/trigger', triggerDeployment);

// Get deployment status
router.get('/:id/status', getDeploymentStatus);

// Get recent deployments
router.get('/recent', getRecentDeployments);

export default router;
