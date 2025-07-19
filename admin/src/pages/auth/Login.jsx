import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/forms/LoginForm';

const Login = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle registration success message
  useEffect(() => {
    if (location.state?.successMessage) {
      setRegistrationSuccess(location.state.successMessage);
      // Clear the message after 5 seconds
      setTimeout(() => {
        setRegistrationSuccess('');
      }, 5000);
    }
  }, [location.state]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (credentials) => {
    clearError(); // Clear any previous auth errors
    const result = await login(credentials.identifier, credentials.password);
    if (result.success) {
      navigate('/dashboard');
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            DigiDinez Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your restaurant dashboard
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10 border border-gray-200">
          {/* Registration success message */}
          {registrationSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {registrationSuccess}
            </div>
          )}

          <LoginForm 
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Register your restaurant
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
