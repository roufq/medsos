import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';

const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const FeaturePage = lazy(() => import('../pages/FeaturePage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ThanksPage = lazy(() => import('../pages/ThanksPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const PostPage = lazy(() => import('../pages/PostPage'));
const VideoPage = lazy(() => import('../pages/VideoPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const ShopPage = lazy(() => import('../pages/ShopPage'));
const SavedPage = lazy(() => import('../pages/SavedPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <PageLoader />;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return <PageLoader />;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <PageLoader />;
  }
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/thanks" element={<PublicRoute><ThanksPage /></PublicRoute>} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="/u/:username" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/post/:id" element={<PrivateRoute><PostPage /></PrivateRoute>} />
          <Route path="/shorts" element={<Navigate to="/videos" replace />} />
          <Route path="/videos" element={<PrivateRoute><VideoPage /></PrivateRoute>} />
          <Route path="/videos/:token" element={<PrivateRoute><VideoPage /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
          <Route path="/shop" element={<PrivateRoute><ShopPage /></PrivateRoute>} />
          <Route path="/saved" element={<PrivateRoute><SavedPage /></PrivateRoute>} />
          <Route path="/network" element={<PrivateRoute><FeaturePage title="Network" /></PrivateRoute>} />
          <Route path="/jobs" element={<Navigate to="/" replace />} />
          <Route path="/messages" element={<PrivateRoute><FeaturePage title="Messages" /></PrivateRoute>} />
          <Route path="/analytics" element={<AdminRoute><FeaturePage title="Analytics" /></AdminRoute>} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminDashboardPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
