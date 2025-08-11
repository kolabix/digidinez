import { Restaurant } from '../models/index.js';

/**
 * Deployment Controller
 * Handles deployment triggers for Vercel
 */

// @desc    Trigger deployment
// @route   POST /api/deployment/trigger
// @access  Private
export const triggerDeployment = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    
    // Get current restaurant data
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Trigger real Vercel deployment
    const deploymentData = await triggerVercelDeployment(restaurantId, restaurant.name);

    res.json({
      success: true,
      message: 'Deployment triggered successfully',
      data: {
        deployment: deploymentData
      }
    });

  } catch (error) {
    console.error('Deployment trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while triggering deployment',
      error: error.message
    });
  }
};

// Function to trigger Vercel deployment
async function triggerVercelDeployment(restaurantId, restaurantName) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken || !projectId) {
      throw new Error('Vercel configuration missing. Please set VERCEL_TOKEN and VERCEL_PROJECT_ID');
    }

    console.log(`🚀 Triggering Vercel deployment for restaurant ${restaurantId} (${restaurantName})`);

    // Create deployment payload
    const deploymentPayload = {
      name: 'public-menu',
      projectId: projectId,
      target: 'production',
      alias: [`menu-${restaurantId}.${process.env.VERCEL_DOMAIN || 'digidinez.vercel.app'}`],
      environment: {
        RESTAURANT_ID: restaurantId,
        SELECTIVE_BUILD: 'true'
      },
      // Optional: Add metadata
      meta: {
        restaurantId,
        restaurantName,
        trigger: 'admin-panel',
        timestamp: new Date().toISOString()
      }
    };

    // Add team ID if specified
    if (teamId) {
      deploymentPayload.teamId = teamId;
    }

    // Make API call to Vercel
    const response = await fetch('https://api.vercel.com/v1/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deploymentPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Vercel API error: ${errorData.error?.message || response.statusText}`);
    }

    const deployment = await response.json();

    console.log(`✅ Vercel deployment triggered successfully: ${deployment.url}`);

    return {
      id: deployment.id,
      restaurantId,
      status: 'pending',
      createdAt: new Date(),
      estimatedTime: '1-2 minutes',
      message: 'Deployment triggered successfully',
      vercelUrl: deployment.url,
      vercelId: deployment.id
    };

  } catch (error) {
    console.error('Vercel deployment failed:', error);
    throw error;
  }
}

// @desc    Get deployment status
// @route   GET /api/deployment/:id/status
// @access  Private
export const getDeploymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurant.id;

    // Query Vercel API for actual deployment status
    const deploymentStatus = await getVercelDeploymentStatus(id);

    res.json({
      success: true,
      data: {
        deployment: {
          id,
          restaurantId,
          ...deploymentStatus,
          updatedAt: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Get deployment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching deployment status',
      error: error.message
    });
  }
};

// Function to get Vercel deployment status
async function getVercelDeploymentStatus(deploymentId) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken) {
      throw new Error('Vercel configuration missing. Please set VERCEL_TOKEN');
    }

    let url = `https://api.vercel.com/v1/deployments/${deploymentId}`;
    if (teamId) {
      url += `?teamId=${teamId}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Vercel API error: ${errorData.error?.message || response.statusText}`);
    }

    const deployment = await response.json();

    // Map Vercel status to our format
    const statusMap = {
      'READY': 'success',
      'BUILDING': 'building',
      'DEPLOYING': 'deploying',
      'ERROR': 'failed',
      'CANCELED': 'failed'
    };

    const status = statusMap[deployment.readyState] || 'pending';
    const message = deployment.readyState === 'READY' ? 'Deployment successful!' :
                   deployment.readyState === 'ERROR' ? `Deployment failed: ${deployment.errorMessage || 'Unknown error'}` :
                   `Deployment ${deployment.readyState?.toLowerCase() || 'in progress'}...`;

    return {
      status,
      message,
      vercelStatus: deployment.readyState,
      url: deployment.url,
      createdAt: deployment.createdAt,
      completedAt: deployment.readyState === 'READY' ? deployment.readyAt : null
    };

  } catch (error) {
    console.error('Failed to get Vercel deployment status:', error);
    throw error;
  }
}

// @desc    Get recent deployments
// @route   GET /api/deployment/recent
// @access  Private
export const getRecentDeployments = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    // Query actual deployment history from Vercel
    const deployments = await getVercelRecentDeployments(restaurantId);

    res.json({
      success: true,
      data: {
        deployments
      }
    });

  } catch (error) {
    console.error('Get recent deployments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent deployments',
      error: error.message
    });
  }
};

// Function to get recent Vercel deployments
async function getVercelRecentDeployments(restaurantId) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken || !projectId) {
      throw new Error('Vercel configuration missing. Please set VERCEL_TOKEN and VERCEL_PROJECT_ID');
    }

    let url = `https://api.vercel.com/v1/deployments?projectId=${projectId}&limit=10`;
    if (teamId) {
      url += `&teamId=${teamId}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Vercel API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const deployments = data.deployments || [];

    // Filter and map deployments for this restaurant
    const restaurantDeployments = deployments
      .filter(deployment => {
        // Check if this deployment was for this restaurant
        const meta = deployment.meta || {};
        return meta.restaurantId === restaurantId;
      })
      .map(deployment => {
        const statusMap = {
          'READY': 'success',
          'BUILDING': 'building',
          'DEPLOYING': 'deploying',
          'ERROR': 'failed',
          'CANCELED': 'failed'
        };

        return {
          id: deployment.id,
          restaurantId,
          status: statusMap[deployment.readyState] || 'pending',
          message: deployment.readyState === 'READY' ? 'Menu updated successfully' :
                   deployment.readyState === 'ERROR' ? 'Deployment failed' :
                   'Deployment in progress',
          logoChanged: false, // TODO: Track logo changes
          createdAt: new Date(deployment.createdAt),
          completedAt: deployment.readyState === 'READY' ? new Date(deployment.readyAt) : null,
          vercelUrl: deployment.url,
          vercelStatus: deployment.readyState
        };
      })
      .slice(0, 5); // Return only last 5 deployments

    return restaurantDeployments;

  } catch (error) {
    console.error('Failed to get Vercel recent deployments:', error);
    throw error;
  }
}
