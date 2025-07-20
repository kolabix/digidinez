import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RegisterForm } from '../../components/forms/RegisterForm';

export const Register = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const { register, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRegister = async (restaurantData) => {
    setSuccessMessage('');
    clearError(); // Clear any previous auth errors
    
    const result = await register(restaurantData);
    
    if (result.success) {
      // Immediately redirect to login with success message
      navigate('/login', { 
        state: { 
          successMessage: result.message || 'Registration successful! Please login to continue.' 
        } 
      });
    }
    
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create Restaurant Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join DigiDinez and digitize your menu
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10 border border-gray-200">
          <RegisterForm 
            onSubmit={handleRegister}
            loading={loading}
            error={error}
            successMessage={successMessage}
          />

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
