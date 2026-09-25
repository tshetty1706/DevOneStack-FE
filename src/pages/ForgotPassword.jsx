import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiMail, FiArrowRight, FiArrowLeft, FiAlertCircle, FiCheck, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import OnlyLogo from '../components/layout/OnlyLogo';
import './auth.css';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: data.email });
      setDone(true);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      {/* Background Cyber Grid and Ambient Glows */}
      <div className="auth-bg-grid-layer" />
      <div className="auth-glow-spot-1" />
      <div className="auth-glow-spot-2" />
      <div className="auth-glow-spot-3" />

      <main className="auth-main-content">
        <div className="auth-card-column" style={{ maxWidth: '440px' }}>
          <div className="auth-glass-card">
            {/* Back to Login Link */}
            <div className="auth-card-top-nav">
              <Link to="/login" className="auth-back-link">
                <FiArrowLeft className="auth-back-arrow-icon" size={15} />
                <span>Back to Login</span>
              </Link>
            </div>

            {/* Brand Logo */}
            <Link to="/" className="auth-card-brand-logo">
              <OnlyLogo width={22} height={22} />
              <span className="auth-card-brand-title">DevOneStack</span>
            </Link>

            {/* Card Title & Subtitle */}
            <h1 className="auth-card-title">Forgot Password</h1>
            <p className="auth-card-subtitle">
              Enter your account's email address and we'll send you a link to reset your password.
            </p>

            {/* Error Alert */}
            {apiError && (
              <div className="auth-alert-banner error" role="alert">
                <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{apiError}</span>
              </div>
            )}

            {done ? (
              <div style={{ textAlign: 'center', padding: '16px 0 8px 0' }}>
                <div
                  className="auth-alert-banner success"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto 16px auto',
                    padding: '10px 18px',
                  }}
                >
                  <FiCheckCircle size={18} style={{ color: '#10b981' }} />
                  <span style={{ fontWeight: 600 }}>Check your inbox!</span>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6, marginBottom: '22px' }}>
                  If an account is associated with that email, we have sent instructions to reset your password. The link will expire in 1 hour.
                </p>
                <Link
                  to="/login"
                  className="auth-cta-gradient-btn"
                  style={{ textDecoration: 'none', display: 'flex' }}
                >
                  <span className="auth-btn-text">Return to Login</span>
                  <FiArrowRight className="auth-btn-arrow-icon" size={16} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Email Field */}
                <div className="auth-form-field">
                  <label htmlFor="forgot-email" className="auth-field-label">
                    Email Address
                  </label>
                  <div className="auth-input-container">
                    <span className="auth-input-icon-left">
                      <FiMail size={15} />
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      className={`auth-input-styled ${errors.email ? 'error' : ''}`}
                      placeholder="e.g., alex@email.com"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <span className="auth-field-error-msg">{errors.email.message}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="auth-cta-gradient-btn"
                  disabled={loading}
                  id="forgot-submit-btn"
                  style={{ marginTop: '16px' }}
                >
                  {loading ? (
                    <>
                      <div className="auth-btn-spinner" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <span className="auth-btn-text">Send Reset Link</span>
                      <FiArrowRight className="auth-btn-arrow-icon" size={16} />
                    </>
                  )}
                </button>

                {/* Footer Switch Link */}
                <p className="auth-footer-switch-text" style={{ marginTop: '20px' }}>
                  Remember your password?{' '}
                  <Link to="/login" className="auth-switch-link">
                    Log in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
