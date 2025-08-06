import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthRoute } from './components/auth/AuthRoute';
import { ToastProvider } from './components/common/Toast';
import { MenuManagement } from './pages/MenuManagement';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Auth Routes - Redirect to dashboard if logged in */}
            <Route element={<AuthRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes - Require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/menu/categories" element={<MenuManagement />} />
                <Route path="/menu/tags" element={<MenuManagement />} />
                <Route path="/menu/items" element={<MenuManagement />} />
                <Route path="/menu/bulk-upload" element={<MenuManagement />} />
              </Route>
            </Route>

            {/* Catch all - redirect to dashboard or login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
