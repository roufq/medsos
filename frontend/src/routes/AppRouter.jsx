import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import LandingPage from '../pages/LandingPage';
import PageLoader from '../components/common/PageLoader';
import { usePlatform } from '../context/PlatformContext';
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));

const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminWorkspacePage'));
const FeaturePage = lazy(() => import('../pages/FeaturePage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ThanksPage = lazy(() => import('../pages/ThanksPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const PricingPage = lazy(() => import('../pages/PricingPage'));
const PostPage = lazy(() => import('../pages/PostPage'));
const VideoPage = lazy(() => import('../pages/VideoPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const ExplorePage = lazy(() => import('../pages/ExplorePage'));
const ShopPage = lazy(() => import('../pages/ShopPage'));
const SavedPage = lazy(() => import('../pages/SavedPage'));

const IndexPage = () => {
  const { isAuthenticated, loading } = useAuth();
  return loading ? <PageLoader /> : isAuthenticated ? <HomePage /> : <LandingPage />;
};
const VideoRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  return loading ? <PageLoader /> : isAuthenticated ? <VideoPage /> : <PostPage />;
};
const PricingRoute = () => {
  const { uploadLimitsEnabled } = usePlatform();
  return uploadLimitsEnabled ? <PrivateRoute><PricingPage /></PrivateRoute> : <Navigate to="/" replace />;
};

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
              <IndexPage />
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProfilePage />
            }
          />
          <Route path="/u/:username" element={<ProfilePage />} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/pricing" element={<PricingRoute />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/posts/:id" element={<PostPage />} />
          <Route path="/shorts" element={<Navigate to="/videos" replace />} />
          <Route path="/videos" element={<PrivateRoute><VideoPage /></PrivateRoute>} />
          <Route path="/videos/:token" element={<VideoRoute />} />
          <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/saved" element={<PrivateRoute><SavedPage /></PrivateRoute>} />
          <Route path="/network" element={<PrivateRoute><FeaturePage page="network" /></PrivateRoute>} />
          <Route path="/jobs" element={<Navigate to="/" replace />} />
          <Route path="/messages" element={<PrivateRoute><FeaturePage page="messages" /></PrivateRoute>} />
          <Route path="/analytics" element={<AdminRoute><FeaturePage page="analytics" /></AdminRoute>} />

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

          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
          <Route path="/:username" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
