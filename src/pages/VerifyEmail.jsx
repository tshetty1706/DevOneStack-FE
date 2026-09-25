import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import api from '../api/axios';
import OnlyLogo from '../components/layout/OnlyLogo';
import './auth.css';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Verification token is missing. Please check your link.');
      setVerifying(false);
      return;
    }

    api.get(`/api/auth/verify-email/${token}`)
      .then((res) => {
        setSuccess(true);
        const email = res.data?.email || '';
        setVerifiedEmail(email);

        // Try to close tab if opened in separate window/tab, or redirect to login after 2.5 seconds
        setTimeout(() => {
          try {
            if (window.opener) {
              window.close();
            }
          } catch (e) {
            // Ignored if browser blocks window.close()
          }
          navigate('/login?verified=true', { state: { email, verified: true } });
        }, 2500);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'This verification link has expired or already been used.');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token, navigate]);

  return (
    <div className="auth-page-root">
      {/* Background Cyber Grid & Ambient Glows */}
      <div className="auth-bg-grid-layer" />
      <div className="auth-glow-spot-1" />
      <div className="auth-glow-spot-2" />
      <div className="auth-glow-spot-3" />

      <main className="auth-main-content">
        <div className="auth-card-column" style={{ maxWidth: '440px' }}>
          <div className="auth-glass-card" style={{ textAlign: 'center', padding: '36px 28px' }}>
            {/* Brand Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Link to="/" className="auth-card-brand-logo" style={{ margin: 0 }}>
                <OnlyLogo width={26} height={26} />
                <span className="auth-card-brand-title" style={{ fontSize: '18px' }}>DevOneStack</span>
              </Link>
            </div>

            {verifying ? (
              <div style={{ padding: '24px 0' }}>
                <div className="auth-btn-spinner" style={{ width: 36, height: 36, margin: '0 auto 18px auto' }} />
                <h2 className="auth-card-title" style={{ textAlign: 'center', fontSize: '20px' }}>
                  Verifying your email...
                </h2>
                <p className="auth-card-subtitle" style={{ textAlign: 'center', marginBottom: 0 }}>
                  Please wait while we confirm your account.
                </p>
              </div>
            ) : success ? (
              <div style={{ padding: '8px 0' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px auto',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <FiCheckCircle size={28} style={{ color: '#10b981' }} />
                </div>

                <h2 className="auth-card-title" style={{ textAlign: 'center', color: '#10b981', fontSize: '22px', marginBottom: '8px' }}>
                  Verification Passed!
                </h2>
                <p className="auth-card-subtitle" style={{ textAlign: 'center', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Your email has been verified successfully. Redirecting you to the login page...
                </p>

                <Link
                  to="/login?verified=true"
                  state={{ email: verifiedEmail, verified: true }}
                  className="auth-cta-gradient-btn"
                  style={{ textDecoration: 'none', display: 'flex' }}
                >
                  <span className="auth-btn-text">Proceed to Login</span>
                  <FiArrowRight className="auth-btn-arrow-icon" size={16} />
                </Link>
              </div>
            ) : (
              <div style={{ padding: '8px 0' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px auto',
                  }}
                >
                  <FiAlertCircle size={28} style={{ color: '#ef4444' }} />
                </div>

                <h2 className="auth-card-title" style={{ textAlign: 'center', fontSize: '20px', marginBottom: '8px' }}>
                  Verification Link Expired
                </h2>
                <p className="auth-card-subtitle" style={{ textAlign: 'center', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '24px' }}>
                  {error}
                </p>

                <Link
                  to="/login"
                  className="auth-cta-gradient-btn"
                  style={{ textDecoration: 'none', display: 'flex' }}
                >
                  <span className="auth-btn-text">Go to Login Page</span>
                  <FiArrowRight className="auth-btn-arrow-icon" size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
