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

    // First, set environment variables for this deployment
    console.log('🔧 Setting environment variables for selective build...');
    
    const envVars = [
      {
        key: 'RESTAURANT_ID',
        value: restaurantId,
        target: ['production', 'preview'],
        type: 'plain'
      },
      {
        key: 'SELECTIVE_BUILD',
        value: 'true',
        target: ['production', 'preview'],
        type: 'plain'
      }
    ];

    // Set environment variables via REST API
    for (const envVar of envVars) {
      try {
        const envResponse = await fetch(`https://api.vercel.com/v6/projects/${projectName}/env`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(envVar)
        });

        if (envResponse.ok) {
          console.log(`✅ Set environment variable: ${envVar.key}=${envVar.value}`);
        } else {
          console.warn(`⚠️ Could not set environment variable ${envVar.key}: ${envResponse.status} ${envResponse.statusText}`);
        }
      } catch (envError) {
        console.warn(`⚠️ Could not set environment variable ${envVar.key}:`, envError.message);
      }
    }

    // Trigger deployment by creating a new deployment
    console.log('🚀 Creating new deployment...');
    
    const deploymentPayload = {
      name: projectName,
      projectId: projectName,
      target: 'production',
      // Add metadata
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

    const response = await fetch('https://api.vercel.com/v6/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deploymentPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vercel API error: ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 200)}`);
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
