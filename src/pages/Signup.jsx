import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FcGoogle } from 'react-icons/fc';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { signup as signupApi, googleSignupUrl } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import AuthHeroSignup from '../components/auth/AuthHeroSignup';
import OnlyLogo from '../components/layout/OnlyLogo';
import './auth.css';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string()
    .min(8, 'Password needs 8+ chars, one uppercase, one number, one special character.')
    .regex(/[A-Z]/, 'Password needs at least one uppercase letter.')
    .regex(/[0-9]/, 'Password needs at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password needs at least one special character.'),
});

export default function Signup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const passwordVal = watch('password', '');
  const hasMinLength = passwordVal.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordVal);
  const hasNumber = /[0-9]/.test(passwordVal);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(passwordVal);

  useEffect(() => {
    if (user) {
      const uname = user.username || 'user';
      navigate(`/u/${encodeURIComponent(uname)}/dashboard`);
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setApiError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await signupApi({
        email: data.email,
        password: data.password,
      });
      setSuccessMsg(response.message || 'Account created successfully! Please verify your email.');
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg && msg.includes('already exists')) {
        setApiError(msg);
      } else {
        setApiError(msg || 'Signup failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      {/* Background Cyber Grid & Ambient Glows */}
      <div className="auth-bg-grid-layer" />
      <div className="auth-glow-spot-1" />
      <div className="auth-glow-spot-2" />
      <div className="auth-glow-spot-3" />

      {/* Main 2-Column Section */}
      <main className="auth-main-content">
        <div className="auth-layout-grid">
          {/* Left Column: Hero & My Spaces Showcase */}
          <AuthHeroSignup />

          {/* Right Column: Glassmorphic Signup Card */}
          <div className="auth-card-column">
            <div className="auth-glass-card">
              {/* Back to Home Link */}
              <div className="auth-card-top-nav">
                <Link to="/" className="auth-back-link">
                  <FiArrowLeft className="auth-back-arrow-icon" size={15} />
                  <span>Back to Home</span>
                </Link>
              </div>

              {/* Brand Logo */}
              <Link to="/" className="auth-card-brand-logo">
                <OnlyLogo width={22} height={22} />
                <span className="auth-card-brand-title">DevOneStack</span>
              </Link>

              {/* Title & Subtitle */}
              <h1 className="auth-card-title">Create a New Account</h1>
              <p className="auth-card-subtitle">
                Join DevOneStack and manage your workspaces with ease.
              </p>

              {/* Google Social Auth Button */}
              <div className="auth-social-buttons">
                <a href={googleSignupUrl} className="auth-social-btn google" id="google-signup-btn">
                  <FcGoogle size={18} />
                  <span>Continue with Google</span>
                </a>
              </div>

              {/* Or Divider */}
              <div className="auth-divider-wrap">or</div>

              {/* Error Banner */}
              {apiError && (
                <div className="auth-alert-banner error" role="alert">
                  <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: 0 }}>{apiError}</p>
                    {apiError.includes('already exists') && (
                      <Link
                        to="/login"
                        className="auth-alert-action-btn"
                        style={{ textDecoration: 'none', display: 'inline-flex', marginTop: '6px' }}
                      >
                        Go to Login Page →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Success Message Banner */}
              {successMsg ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div className="auth-alert-banner success" style={{ justifyContent: 'center' }}>
                    <FiCheck size={18} style={{ color: '#10b981' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>{successMsg}</p>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: '14px 0 20px 0' }}>
                    We've sent a confirmation email with a verification link. Once verified, you can sign in to your new workspace.
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
              ) : (
                /* Registration Form */
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* Email Address */}
                  <div className="auth-form-field">
                    <label htmlFor="signup-email" className="auth-field-label">
                      Email Address
                    </label>
                    <div className="auth-input-container">
                      <span className="auth-input-icon-left">
                        <FiMail size={15} />
                      </span>
                      <input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        className={`auth-input-styled ${errors.email ? 'error' : ''}`}
                        placeholder="e.g., janedoe@email.com"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <span className="auth-field-error-msg">{errors.email.message}</span>
                    )}
                  </div>

                  {/* Create a Password */}
                  <div className="auth-form-field">
                    <label htmlFor="signup-password" className="auth-field-label">
                      Create a Password
                    </label>
                    <div className="auth-input-container">
                      <span className="auth-input-icon-left">
                        <FiLock size={15} />
                      </span>
                      <input
                        id="signup-password"
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

                    {/* Dynamic Password Checklist */}
                    <div className="auth-password-checklist">
                      <div className={`auth-check-item ${hasMinLength ? 'valid' : 'invalid'}`}>
                        <span className="auth-check-bullet">✓</span>
                        <span className="auth-check-label">At least 8 characters</span>
                      </div>
                      <div className={`auth-check-item ${hasUppercase && hasNumber ? 'valid' : 'invalid'}`}>
                        <span className="auth-check-bullet">✓</span>
                        <span className="auth-check-label">Include a number and uppercase letter</span>
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="auth-cta-gradient-btn"
                    disabled={loading}
                    id="signup-submit-btn"
                  >
                    {loading ? (
                      <>
                        <div className="auth-btn-spinner" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span className="auth-btn-text">Get Started</span>
                        <FiArrowRight className="auth-btn-arrow-icon" size={16} />
                      </>
                    )}
                  </button>

                  {/* Terms & Conditions Note */}
                  <p className="auth-terms-caption">
                    By continuing, you agree to our{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()}>Terms</a> and{' '}
                    <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                  </p>

                  {/* Footer Switch Link */}
                  <p className="auth-footer-switch-text">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-switch-link">
                      Log in
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}