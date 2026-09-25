import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import OnlyLogo from '../components/layout/OnlyLogo';
import './auth.css';

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must include at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character.'),
  confirmPassword: z.string().min(1, 'Please confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(passwordValue);

  const onSubmit = async (data) => {
    if (!token) {
      setApiError('Reset token is missing or invalid. Please request a new password reset link.');
      return;
    }

    setApiError('');
    setLoading(true);

    try {
      await api.post(`/api/auth/reset-password/${token}`, { password: data.password });
      setSuccess(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'This reset link has expired or already been used. Please request a new one.';
      setApiError(errorMsg);
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
            <h1 className="auth-card-title">Reset Password</h1>
            <p className="auth-card-subtitle">
              Choose a strong new password for your DevOneStack account.
            </p>

            {/* Error Alert */}
            {apiError && (
              <div className="auth-alert-banner error" role="alert">
                <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: 0 }}>{apiError}</p>
                  {(apiError.toLowerCase().includes('expired') || apiError.toLowerCase().includes('token') || apiError.toLowerCase().includes('used')) && (
                    <Link
                      to="/forgot-password"
                      className="auth-alert-action-btn"
                      style={{ display: 'inline-block', marginTop: '6px', textDecoration: 'none' }}
                    >
                      Request a new reset link &rarr;
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Success View */}
            {success ? (
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
                  <span style={{ fontWeight: 600 }}>Password Reset Successfully!</span>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6, marginBottom: '22px' }}>
                  Your password has been updated. You can now log in to your account using your new credentials.
                </p>
                <Link
                  to="/login"
                  className="auth-cta-gradient-btn"
                  style={{ textDecoration: 'none', display: 'flex' }}
                >
                  <span className="auth-btn-text">Proceed to Login</span>
                  <FiArrowRight className="auth-btn-arrow-icon" size={16} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* New Password Field */}
                <div className="auth-form-field">
                  <label htmlFor="reset-new-password" className="auth-field-label">
                    New Password
                  </label>
                  <div className="auth-input-container">
                    <span className="auth-input-icon-left">
                      <FiLock size={15} />
                    </span>
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`auth-input-styled ${errors.password ? 'error' : ''}`}
                      placeholder="••••••••"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="auth-password-checklist">
                    <div className={`auth-check-item ${hasMinLength ? 'valid' : 'invalid'}`}>
                      <span className="auth-check-bullet">✓</span>
                      <span className="auth-check-label">At least 8 characters</span>
                    </div>
                    <div className={`auth-check-item ${hasUppercase && hasNumber ? 'valid' : 'invalid'}`}>
                      <span className="auth-check-bullet">✓</span>
                      <span className="auth-check-label">Include uppercase letter & number</span>
                    </div>
                    <div className={`auth-check-item ${hasSpecialChar ? 'valid' : 'invalid'}`}>
                      <span className="auth-check-bullet">✓</span>
                      <span className="auth-check-label">Include a special character</span>
                    </div>
                  </div>

                  {errors.password && (
                    <span className="auth-field-error-msg">{errors.password.message}</span>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="auth-form-field">
                  <label htmlFor="reset-confirm-password" className="auth-field-label">
                    Confirm New Password
                  </label>
                  <div className="auth-input-container">
                    <span className="auth-input-icon-left">
                      <FiLock size={15} />
                    </span>
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`auth-input-styled ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="auth-field-error-msg">{errors.confirmPassword.message}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="auth-cta-gradient-btn"
                  disabled={loading}
                  id="reset-submit-btn"
                  style={{ marginTop: '16px' }}
                >
                  {loading ? (
                    <>
                      <div className="auth-btn-spinner" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span className="auth-btn-text">Reset Password</span>
                      <FiArrowRight className="auth-btn-arrow-icon" size={16} />
                    </>
                  )}
                </button>

                {/* Footer Switch Link */}
                <p className="auth-footer-switch-text" style={{ marginTop: '20px' }}>
                  Remembered your password?{' '}
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
