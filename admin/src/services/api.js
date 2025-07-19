import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      console.log('Unauthorized access - redirecting to login');
      // We'll handle this in the AuthContext
    } else if (error.response?.status === 500) {
      console.error('Server error');
    }
    
    return Promise.reject(error);
  }
);

export default api;
