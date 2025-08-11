import { Restaurant } from '../models/index.js';

/**
 * Deployment Controller
 * Handles deployment triggers for Vercel using REST API
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

    // Trigger real Vercel deployment using REST API
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

// Function to trigger Vercel deployment using REST API
async function triggerVercelDeployment(restaurantId, restaurantName) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const projectName = process.env.VERCEL_PROJECT_NAME || 'public-menu';
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken) {
      throw new Error('Vercel configuration missing. Please set VERCEL_TOKEN');
    }

    console.log(`🚀 Triggering Vercel deployment for restaurant ${restaurantId} (${restaurantName})`);
    console.log(`📋 Using project: ${projectName}${teamId ? `, team ID: ${teamId}` : ''}`);

    // First, clear any existing environment variables to prevent caching issues
    console.log('🧹 Clearing old environment variables...');
    try {
      // Clear the RESTAURANT_ID variable if it exists
      const clearResponse = await fetch(`https://api.vercel.com/v6/projects/${projectName}/env/RESTAURANT_ID${teamId ? `?teamId=${teamId}` : ''}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${vercelToken}`
        }
      });
      
      if (clearResponse.ok) {
        console.log('✅ Cleared old RESTAURANT_ID environment variable');
      } else if (clearResponse.status === 404) {
        console.log('ℹ️ No existing RESTAURANT_ID variable to clear');
      } else {
        console.warn('⚠️ Could not clear old environment variable:', clearResponse.status);
      }
    } catch (clearError) {
      console.warn('⚠️ Error clearing environment variables:', clearError.message);
    }

    // For git-based deployments, we need to trigger a new deployment from the repository
    // The simplest way is to use the Vercel dashboard API to trigger a deployment
    console.log('🚀 Triggering git-based deployment...');
    
    // Create a deployment payload that triggers a git build
    // According to Vercel API docs, we need to use 'name' and 'gitSource'
    // Note: We don't set environment variables anymore because Vercel caches them
    // Instead, we pass the restaurant ID through metadata, which gets read during build
    const deploymentPayload = {
      name: projectName,
      target: 'production',
      // This will trigger a build from the git repository
      gitSource: {
        type: 'github',
        ref: 'main', // or your default branch
        repoId: process.env.VERCEL_GITHUB_REPO_ID // optional: specific repo ID
      },
      // Add metadata - this is how we pass restaurant-specific data
      // The build process can read this metadata to determine which restaurant to build
      meta: {
        restaurantId,
        restaurantName,
        trigger: 'admin-panel',
        timestamp: new Date().toISOString()
      }
    };

    // Note: teamId is handled by the Authorization header context
    // We don't need to pass it in the payload
    console.log('📤 Deployment payload:', JSON.stringify(deploymentPayload, null, 2));

    // Use the main deployments endpoint to trigger a git-based deployment
    // If teamId is specified, we might need to use a different endpoint or query parameter
    let deploymentUrl = 'https://api.vercel.com/v6/deployments';
    if (teamId) {
      deploymentUrl += `?teamId=${teamId}`;
    }

    const response = await fetch(deploymentUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deploymentPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Deployment creation failed:', errorText);
      
      // If the git-based approach fails, try a simpler approach
      console.log('🔄 Trying alternative deployment method...');
      
      // Try to trigger a deployment by updating the project (this often triggers a rebuild)
      const updateResponse = await fetch(`https://api.vercel.com/v6/projects/${projectName}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Just update the project to trigger a rebuild
          name: projectName
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Project updated, this should trigger a rebuild');
        // Return a mock deployment response since we can't get the actual deployment ID
        return {
          id: `trigger_${Date.now()}`,
          restaurantId,
          status: 'pending',
          createdAt: new Date(),
          estimatedTime: '2-3 minutes',
          message: 'Deployment triggered via project update (rebuild)',
          vercelUrl: `https://${projectName}.vercel.app`,
          method: 'project-update'
        };
      } else {
        const updateErrorText = await updateResponse.text();
        throw new Error(`Both deployment methods failed. Deploy: ${errorText}, Update: ${updateErrorText}`);
      }
    }

    const deployment = await response.json();
    console.log(`✅ Vercel deployment created successfully:`, {
      id: deployment.id,
      url: deployment.url,
      status: deployment.readyState
    });

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
    console.error('❌ Vercel deployment failed:', error);
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

    // Query Vercel API for actual deployment status using SDK
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

// Function to get Vercel deployment status using REST API
async function getVercelDeploymentStatus(deploymentId) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken) {
      throw new Error('Vercel configuration missing. Please set VERCEL_TOKEN');
    }

    let url = `https://api.vercel.com/v6/deployments/${deploymentId}`;
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

    // Query actual deployment history from Vercel using SDK
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

// Function to get recent Vercel deployments using REST API
async function getVercelRecentDeployments(restaurantId) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const projectName = process.env.VERCEL_PROJECT_NAME || 'public-menu';
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken) {
      throw new Error('Vercel configuration missing. Please set VERCEL_TOKEN');
    }

    let url = `https://api.vercel.com/v6/deployments?projectId=${projectName}&limit=20`;
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

// @desc    Test Vercel configuration
// @route   GET /api/deployment/test-config
// @access  Private
export const testVercelConfig = async (req, res) => {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const projectName = process.env.VERCEL_PROJECT_NAME || 'public-menu';
    const teamId = process.env.VERCEL_TEAM_ID;

    // Check if required variables are set
    const config = {
      vercelToken: vercelToken ? '✅ Set' : '❌ Missing',
      projectName: projectName ? '✅ Set' : '❌ Missing',
      teamId: teamId ? '✅ Set' : '❌ Missing',
      hasRequiredConfig: !!(vercelToken)
    };

    if (!vercelToken) {
      return res.status(400).json({
        success: false,
        message: 'Vercel configuration incomplete',
        data: { config }
      });
    }

    // Test Vercel REST API connection
    try {
      console.log('🧪 Testing Vercel REST API connection...');
      
      // Test 1: Check if we can access the project
      console.log(`🧪 Testing project access: ${projectName}`);
      let projectUrl = `https://api.vercel.com/v6/projects/${projectName}`;
      if (teamId) {
        projectUrl += `?teamId=${teamId}`;
      }

      const projectResponse = await fetch(projectUrl, {
        headers: {
          'Authorization': `Bearer ${vercelToken}`
        }
      });

      if (projectResponse.ok) {
        const project = await projectResponse.json();
        config.projectName = project.name;
        config.projectStatus = '✅ Connected';
        console.log(`✅ Project access successful: ${project.name}`);
      } else {
        const errorText = await projectResponse.text();
        config.projectStatus = `❌ Project access failed: ${projectResponse.status} ${projectResponse.statusText}`;
        console.error('❌ Project access failed:', errorText.substring(0, 200));
      }

      // Test 2: Check if we can list deployments
      console.log(`🧪 Testing deployments access for project: ${projectName}`);
      let deploymentsUrl = `https://api.vercel.com/v6/deployments?projectId=${projectName}&limit=1`;
      if (teamId) {
        deploymentsUrl += `&teamId=${teamId}`;
      }

      const deploymentsResponse = await fetch(deploymentsUrl, {
        headers: {
          'Authorization': `Bearer ${vercelToken}`
        }
      });

      if (deploymentsResponse.ok) {
        const deployments = await deploymentsResponse.json();
        config.deploymentsStatus = `✅ Connected - Found ${deployments.deployments?.length || 0} deployments`;
        console.log(`✅ Deployments access successful: Found ${deployments.deployments?.length || 0} deployments`);
      } else {
        const errorText = await deploymentsResponse.text();
        config.deploymentsStatus = `❌ Deployments access failed: ${deploymentsResponse.status} ${deploymentsResponse.statusText}`;
        console.error('❌ Deployments access failed:', errorText.substring(0, 200));
      }

      // Test 3: Check if we can create environment variables
      console.log(`🧪 Testing environment variable creation...`);
      try {
        const envResponse = await fetch(`https://api.vercel.com/v6/projects/${projectName}/env`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: 'TEST_VAR',
            value: 'test_value',
            target: ['preview'],
            type: 'plain'
          })
        });

        if (envResponse.ok) {
          config.envVarStatus = '✅ Can create environment variables';
          console.log('✅ Environment variable creation successful');
        } else {
          const errorText = await envResponse.text();
          config.envVarStatus = `⚠️ Limited access: ${envResponse.status} ${envResponse.statusText}`;
          console.log('⚠️ Environment variable creation limited:', errorText.substring(0, 200));
        }
      } catch (envError) {
        config.envVarStatus = `⚠️ Limited access: ${envError.message}`;
        console.log('⚠️ Environment variable creation limited:', envError.message);
      }

    } catch (apiError) {
      config.projectStatus = config.projectStatus || `❌ API Error: ${apiError.message}`;
      config.deploymentsStatus = config.deploymentsStatus || '❌ Not tested due to project access failure';
      config.envVarStatus = config.envVarStatus || '❌ Not tested due to project access failure';
      console.error('❌ Vercel REST API connection test failed:', apiError);
    }

    res.json({
      success: true,
      message: 'Vercel configuration test completed',
      data: { config }
    });

  } catch (error) {
    console.error('Vercel config test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while testing Vercel configuration',
      error: error.message
    });
  }
};
