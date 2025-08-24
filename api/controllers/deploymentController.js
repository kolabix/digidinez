import { Restaurant } from '../models/index.js';

/**
 * Deployment Controller
 * Handles deployment triggers for GitHub Actions using workflow dispatch API
 */

// @desc    Trigger deployment
// @route   POST /deployment/trigger
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

    // Trigger GitHub Actions deployment using workflow dispatch API
    const deploymentData = await triggerGitHubActionsDeployment(restaurantId, restaurant.name);

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

// Function to trigger GitHub Actions deployment using workflow dispatch API
async function triggerGitHubActionsDeployment(restaurantId, restaurantName) {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    let workflowId = process.env.GITHUB_WORKFLOW_ID;

    if (!githubToken || !githubOwner || !githubRepo) {
      throw new Error('GitHub configuration missing. Please set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO');
    }

    console.log(`🚀 Triggering GitHub Actions deployment for restaurant ${restaurantId} (${restaurantName})`);
    console.log(`📋 Using workflow: ${workflowId} in ${githubOwner}/${githubRepo}`);

    // First, let's verify the workflow exists
    console.log('🔍 Verifying workflow exists...');
    const workflowCheckResponse = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/${workflowId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!workflowCheckResponse.ok) {
      console.error(`❌ Workflow ${workflowId} not found. Status: ${workflowCheckResponse.status}`);
      
      // Try to list available workflows
      console.log('🔍 Listing available workflows...');
      const workflowsResponse = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (workflowsResponse.ok) {
        const workflows = await workflowsResponse.json();
        console.log('📋 Available workflows:', workflows.workflows?.map(w => w.name) || []);
        
        // Try to find a matching workflow
        const matchingWorkflow = workflows.workflows?.find(w => 
          w.name.toLowerCase().includes('deploy') && 
          w.name.toLowerCase().includes('menu')
        );
        
        if (matchingWorkflow) {
          console.log(`✅ Found matching workflow: ${matchingWorkflow.name} (ID: ${matchingWorkflow.id})`);
          // Use the actual workflow ID from GitHub
          workflowId = matchingWorkflow.id;
        } else {
          throw new Error(`No suitable deployment workflow found. Available workflows: ${workflows.workflows?.map(w => w.name).join(', ') || 'none'}`);
        }
      } else {
        throw new Error(`Workflow ${workflowId} not found and could not list available workflows`);
      }
    } else {
      console.log(`✅ Workflow ${workflowId} verified successfully`);
    }

    // Create workflow dispatch payload
    const workflowPayload = {
      ref: process.env.NODE_ENV !== 'prod' ? 'staging' : 'main',
      inputs: {
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        environment: process.env.NODE_ENV,
        trigger_source: 'admin-panel'
      },
    };

    console.log('📤 Workflow dispatch payload:', JSON.stringify(workflowPayload, null, 2));

    const response = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/deploy-menu-staging.yml/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Workflow dispatch failed:', errorText);
      throw new Error(`GitHub Actions workflow dispatch failed: ${response.status} ${response.statusText}`);
    }

    console.log('✅ GitHub Actions workflow dispatched successfully');

    // Generate a unique deployment ID for tracking
    const deploymentId = `gha_${Date.now()}_${restaurantId}`;

    return {
      id: deploymentId,
      restaurantId,
      status: 'pending',
      createdAt: new Date(),
      estimatedTime: '3-5 minutes',
      message: 'Deployment triggered via GitHub Actions',
      githubWorkflow: workflowId,
      githubRepo: `${githubOwner}/${githubRepo}`,
      method: 'github-actions'
    };

  } catch (error) {
    console.error('❌ GitHub Actions deployment failed:', error);
    throw error;
  }
}

// @desc    Get deployment status
// @route   GET /deployment/:id/status
// @access  Private
export const getDeploymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurant.id;

    // Extract GitHub Actions run ID from our deployment ID
    if (!id.startsWith('gha_')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deployment ID format'
      });
    }

    // For now, return a mock status since GitHub Actions doesn't provide direct run lookup by our custom ID
    // In a production environment, you'd want to store the actual GitHub run ID in your database
    const deploymentStatus = await getGitHubActionsStatus(id, restaurantId);

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

// Function to get GitHub Actions deployment status
async function getGitHubActionsStatus(deploymentId, restaurantId) {
  try {
    // Since we don't have the actual GitHub run ID stored, we'll simulate status
    // In a real implementation, you'd store the GitHub run ID when triggering the workflow
    // and then use it to query the actual status
    
    // For now, return a simulated status based on time elapsed
    const deploymentTime = parseInt(deploymentId.split('_')[1]);
    const timeElapsed = Date.now() - deploymentTime;
    const minutesElapsed = Math.floor(timeElapsed / (1000 * 60));

    let status, message;
    if (minutesElapsed < 2) {
      status = 'building';
      message = 'Deployment building...';
    } else if (minutesElapsed < 4) {
      status = 'deploying';
      message = 'Deployment deploying...';
    } else {
      status = 'success';
      message = 'Deployment successful!';
    }

    return {
      status,
      message,
      githubStatus: status,
      url: `https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/actions`,
      createdAt: new Date(deploymentTime),
      completedAt: status === 'success' ? new Date() : null,
      estimatedTime: '3-5 minutes'
    };

  } catch (error) {
    console.error('Failed to get GitHub Actions status:', error);
    throw error;
  }
}

// @desc    Get recent deployments
// @route   GET /deployment/recent
// @access  Private
export const getRecentDeployments = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    // For now, return mock recent deployments
    // In a real implementation, you'd store deployment history in your database
    const deployments = getMockRecentDeployments(restaurantId);

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

// Function to get mock recent deployments (replace with database queries in production)
function getMockRecentDeployments(restaurantId) {
  const now = new Date();
  const deployments = [];

  // Generate mock deployments for the last few days
  for (let i = 0; i < 3; i++) {
    const deploymentTime = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    deployments.push({
      id: `gha_${deploymentTime.getTime()}_${restaurantId}`,
      restaurantId,
      status: 'success',
      message: 'Menu updated successfully',
      logoChanged: false,
      createdAt: deploymentTime,
      completedAt: new Date(deploymentTime.getTime() + (5 * 60 * 1000)), // 5 minutes later
      githubUrl: `https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/actions`,
      method: 'github-actions'
    });
  }

  return deployments;
}

// @desc    Test GitHub configuration
// @route   GET /api/deployment/test-config
// @access  Private
export const testGitHubConfig = async (req, res) => {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    const workflowId = process.env.GITHUB_WORKFLOW_ID;

    // Check if required variables are set
    const config = {
      githubToken: githubToken ? '✅ Set' : '❌ Missing',
      githubOwner: githubOwner ? '✅ Set' : '❌ Missing',
      githubRepo: githubRepo ? '✅ Set' : '❌ Missing',
      workflowId: workflowId ? '✅ Set' : '❌ Missing',
      hasRequiredConfig: !!(githubToken && githubOwner && githubRepo)
    };

    if (!githubToken || !githubOwner || !githubRepo) {
      return res.status(400).json({
        success: false,
        message: 'GitHub configuration incomplete',
        data: { config }
      });
    }

    // Test GitHub API connection
    try {
      console.log('🧪 Testing GitHub API connection...');
      
      // Test 1: Check if we can access the repository
      console.log(`🧪 Testing repository access: ${githubOwner}/${githubRepo}`);
      const repoResponse = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (repoResponse.ok) {
        const repo = await repoResponse.json();
        config.repoName = repo.name;
        config.repoStatus = '✅ Connected';
        console.log(`✅ Repository access successful: ${repo.name}`);
      } else {
        const errorText = await repoResponse.text();
        config.repoStatus = `❌ Repository access failed: ${repoResponse.status} ${repoResponse.statusText}`;
        console.error('❌ Repository access failed:', errorText.substring(0, 200));
      }

      // Test 2: List all available workflows
      console.log(`🧪 Testing workflows access...`);
      const workflowsResponse = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (workflowsResponse.ok) {
        const workflows = await workflowsResponse.json();
        const availableWorkflows = workflows.workflows || [];
        config.workflowsStatus = `✅ Connected - Found ${availableWorkflows.length} workflows`;
        config.availableWorkflows = availableWorkflows.map(w => ({
          id: w.id,
          name: w.name,
          state: w.state,
          path: w.path
        }));
        console.log(`✅ Workflows access successful: Found ${availableWorkflows.length} workflows`);
        
        // Test 3: Check if our specific workflow exists
        console.log(`🧪 Testing specific workflow access: ${workflowId}`);
        const workflowResponse = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/${workflowId}`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (workflowResponse.ok) {
          const workflow = await workflowResponse.json();
          config.workflowStatus = `✅ Connected - ${workflow.state}`;
          config.targetWorkflow = {
            id: workflow.id,
            name: workflow.name,
            state: workflow.state,
            path: workflow.path
          };
          console.log(`✅ Target workflow access successful: ${workflow.name} (${workflow.state})`);
        } else {
          const errorText = await workflowResponse.text();
          config.workflowStatus = `❌ Target workflow not found: ${workflowResponse.status} ${workflowResponse.statusText}`;
          console.error('❌ Target workflow not found:', errorText.substring(0, 200));
          
          // Suggest alternative workflows
          const deploymentWorkflows = availableWorkflows.filter(w => 
            w.name.toLowerCase().includes('deploy') && w.name.toLowerCase().includes('menu')
          );
          
          if (deploymentWorkflows.length > 0) {
            config.suggestedWorkflows = deploymentWorkflows.map(w => w.name);
            config.workflowStatus += `. Suggested workflows: ${deploymentWorkflows.map(w => w.name).join(', ')}`;
          }
        }
      } else {
        const errorText = await workflowsResponse.text();
        config.workflowsStatus = `❌ Workflows access failed: ${workflowsResponse.status} ${workflowsResponse.statusText}`;
        config.workflowStatus = '❌ Not tested due to workflows access failure';
        console.error('❌ Workflows access failed:', errorText.substring(0, 200));
      }

      // Test 4: Check if we can list recent workflow runs
      if (config.workflowStatus?.includes('✅')) {
        console.log(`🧪 Testing workflow runs access...`);
        try {
          const runsResponse = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/${workflowId}/runs?per_page=1`, {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });

          if (runsResponse.ok) {
            const runs = await runsResponse.json();
            config.runsStatus = `✅ Connected - Found ${runs.total_count || 0} runs`;
            console.log(`✅ Workflow runs access successful: Found ${runs.total_count || 0} runs`);
          } else {
            const errorText = await runsResponse.text();
            config.runsStatus = `❌ Workflow runs access failed: ${runsResponse.status} ${runsResponse.statusText}`;
            console.error('❌ Workflow runs access failed:', errorText.substring(0, 200));
          }
        } catch (runsError) {
          config.runsStatus = `❌ Workflow runs access failed: ${runsError.message}`;
        }
      } else {
        config.runsStatus = '❌ Not tested due to workflow access failure';
      }

    } catch (apiError) {
      config.repoStatus = config.repoStatus || `❌ API Error: ${apiError.message}`;
      config.workflowsStatus = config.workflowsStatus || '❌ Not tested due to repository access failure';
      config.workflowStatus = config.workflowStatus || '❌ Not tested due to workflows access failure';
      config.runsStatus = config.runsStatus || '❌ Not tested due to workflow access failure';
      console.error('❌ GitHub API connection test failed:', apiError);
    }

    res.json({
      success: true,
      message: 'GitHub configuration test completed',
      data: { config }
    });

  } catch (error) {
    console.error('GitHub config test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while testing GitHub configuration',
      error: error.message
    });
  }
};
