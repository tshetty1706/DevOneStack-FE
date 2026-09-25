import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotFoundPage from '../../pages/NotFoundPage';

/**
 * Wrap any route that requires authentication and user authorization.
 *
 * If a username parameter is in the URL (/u/:username/...), it checks that
 * the requested username belongs to the authenticated user. If mismatched or
 * unauthorized, it renders the DevOneStack 404 NotFoundPage without revealing
 * whether the other user's resource exists.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { username } = useParams();

  // While the initial /api/auth/me check is in-flight, show a spinner
  // so we don't flash the login page to an authenticated user.
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary, #0f0f17)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a username parameter is specified in URL, verify ownership
  if (username && user.username && username !== user.username) {
    return <NotFoundPage />;
  }

  return children;
}
