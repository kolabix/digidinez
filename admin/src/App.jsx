import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/profile/Profile';
import Layout from './components/layout/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { restaurant, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return restaurant ? children : <Navigate to="/login" replace />;
};

// Auth Route Component (redirect if already logged in)
const AuthRoute = ({ children }) => {
  const { restaurant, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return restaurant ? <Navigate to="/dashboard" replace /> : children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public routes (redirect to dashboard if logged in) */}
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      <Route path="/register" element={
        <AuthRoute>
          <Register />
        </AuthRoute>
      } />
      
      {/* Protected routes (require authentication) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Profile Management Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Future profile sub-routes (Session 4) */}
      <Route path="/profile/edit" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Future phases - placeholders */}
      <Route path="/menu/*" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600 mt-2">Coming in Phase 4</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/qr/*" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
              <p className="text-gray-600 mt-2">Coming in Phase 5</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
