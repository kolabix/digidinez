import api from './api';

// Deployment Service for Vercel integration
const deploymentService = {
  // Trigger a new deployment on Vercel
  async triggerDeployment() {
    try {
      const response = await api.post('/deployment/trigger');
      return response.data;
    } catch (error) {
      console.error('Deployment trigger failed:', error);
      throw error;
    }
  },

  // Check deployment status
  async getDeploymentStatus(deploymentId) {
    try {
      const response = await api.get(`/deployment/${deploymentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get deployment status:', error);
      throw error;
    }
  },

  // Get recent deployments
  async getRecentDeployments() {
    try {
      const response = await api.get('/deployment/recent');
      return response.data;
    } catch (error) {
      console.error('Failed to get recent deployments:', error);
      throw error;
    }
  }
};

export default deploymentService;
