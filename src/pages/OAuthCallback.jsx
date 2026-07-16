import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Hash might look like: #token=eyJhbGciOi...
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get('token');

    if (!token) {
      navigate('/login?error=oauth_failed');
      return;
    }

    localStorage.setItem('dos_access_token', token);
    api.get('/api/auth/me')
      .then(res => {
        login(token, res.data.user);
        navigate('/dashboard');
      })
      .catch(() => {
        navigate('/login?error=oauth_failed');
      });
  }, [navigate, login]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-color, #0f0f17)',
      color: 'var(--text-color, #ffffff)',
      flexDirection: 'column',
      gap: '12px',
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
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>Completing login...</span>
    </div>
  );
}