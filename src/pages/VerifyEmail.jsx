import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { message } from 'antd';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('This verification link has expired or already been used.');
      setVerifying(false);
      return;
    }

    api.get(`/api/auth/verify-email/${token}`)
      .then((res) => {
        login(res.data.accessToken, res.data.user);
        message.success({ content: 'Email verified successfully! Welcome aboard.', style: { marginTop: '60px' } });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'This verification link has expired or already been used.');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token, navigate, login]);

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
      padding: '24px',
      textAlign: 'center',
    }}>
      {verifying ? (
        <>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(99,102,241,0.2)',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>Verifying your email...</span>
        </>
      ) : error ? (
        <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <h2 style={{ color: '#ef4444', fontSize: '20px', fontWeight: 600 }}>Verification Failed</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{error}</p>
          <Link to="/login" style={{ color: '#6366f1', textDecoration: 'underline', fontSize: '14px' }}>Back to Login</Link>
        </div>
      ) : (
        <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <h2 style={{ color: '#10b981', fontSize: '20px', fontWeight: 600 }}>Email Verified!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Taking you to your dashboard...</p>
        </div>
      )}
    </div>
  );
}
