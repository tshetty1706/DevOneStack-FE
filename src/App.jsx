import React, { useEffect, Suspense, lazy } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ThemeToggle from './components/layout/ThemeToggle';
import Lenis from 'lenis';

// Route-level code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SpaceDashboard = lazy(() => import('./pages/SpaceDashboard'));
const CreateSpace = lazy(() => import('./pages/CreateSpace'));
const Profile = lazy(() => import('./pages/Profile'));
const Community = lazy(() => import('./pages/Community'));
const RequestLinkLanding = lazy(() => import('./pages/RequestLinkLanding'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
import NotFoundPage from './pages/NotFoundPage';
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// High-efficiency TanStack QueryClient with reasonable staleTime and gcTime
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 3, // 3 minutes stale time to avoid duplicate requests
      gcTime: 1000 * 60 * 10,   // 10 minutes cache retention
      retry: 1,
    },
  },
});

function PageLoadingFallback() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '3px solid rgba(99, 102, 241, 0.2)',
        borderTopColor: '#6366f1',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/u/${encodeURIComponent(user.username || 'user')}/dashboard`} replace />;
}

function SpaceRedirect() {
  const { user, loading } = useAuth();
  const { spaceId } = useParams();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/u/${encodeURIComponent(user.username || 'user')}/spaces/${spaceId}`} replace />;
}

function CreateSpaceRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/u/${encodeURIComponent(user.username || 'user')}/spaces/create`} replace />;
}

function ProfileRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/u/${encodeURIComponent(user.username || 'user')}/profile`} replace />;
}

function AppContent() {
  const { theme } = useTheme();

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: theme === 'dark' ? '#6366f1' : '#4f46e5',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Community Routes */}
            <Route path="/community" element={<Community />} />
            <Route path="/u/:username/community" element={<Community />} />
            <Route path="/r/:token" element={<RequestLinkLanding />} />

            {/* Username-based Protected Routes */}
            <Route path="/u/:username/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/u/:username/spaces/create" element={
              <ProtectedRoute><CreateSpace /></ProtectedRoute>
            } />
            <Route path="/u/:username/spaces/:spaceId" element={
              <ProtectedRoute><SpaceDashboard /></ProtectedRoute>
            } />
            <Route path="/u/:username/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            {/* Automatic URL redirects to authenticated username paths */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/spaces/create" element={<CreateSpaceRedirect />} />
            <Route path="/spaces/:spaceId" element={<SpaceRedirect />} />
            <Route path="/profile" element={<ProfileRedirect />} />

            {/* Global 404 Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        {/* Global Dark / Light Mode Toggle Button */}
        <ThemeToggle />
      </Router>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
