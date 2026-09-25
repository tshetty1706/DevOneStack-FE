import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FcGoogle } from 'react-icons/fc';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { login as loginApi, googleAuthUrl } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import AuthHeroLogin from '../components/auth/AuthHeroLogin';
import AccountNotFoundModal from '../components/auth/AccountNotFoundModal';
import OnlyLogo from '../components/layout/OnlyLogo';
import './auth.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorType, setErrorType] = useState(''); // 'account_not_found', 'locked', 'unverified', 'invalid_credentials', 'general'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [modalProvider, setModalProvider] = useState('credentials');
  const [modalCustomMsg, setModalCustomMsg] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch('email', '');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle passed email state and URL query params (e.g. OAuth errors or verification success)
  useEffect(() => {
    if (location.state?.email) {
      setValue('email', location.state.email);
    }

    const params = new URLSearchParams(location.search);
    const errParam = params.get('error');
    const providerParam = params.get('provider');
    const verifiedParam = params.get('verified');

    if (verifiedParam === 'true' || location.state?.verified) {
      setSuccessMsg('Verification passed! Please log in with your email and password.');
    }

    if (errParam === 'account_not_found') {
      setModalProvider(providerParam || 'oauth');
      setModalCustomMsg("We couldn't find a DevOneStack account associated with this login method.");
      setShowNotFoundModal(true);
    } else if (errParam === 'account_exists') {
      const pName = providerParam === 'local' ? 'email/password' : providerParam === 'google' ? 'Google' : providerParam;
      setApiError(`An account with this email already exists via ${pName}. Please sign in using that method.`);
      setErrorType('account_exists');
    } else if (errParam === 'oauth_failed') {
      setApiError('Sign-in failed. Try again or use email instead.');
      setErrorType('oauth_failed');
    }
  }, [location, setValue]);

  const onSubmit = async (data) => {
    setApiError('');
    setErrorType('');
    setLoading(true);

    try {
      const response = await loginApi({ email: data.email, password: data.password });
      login(response.accessToken, response.user);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const errorMsg = err.response?.data?.error || 'Something went wrong on our end. Try again shortly.';

      if (status === 423 || errorMsg.toLowerCase().includes('locked')) {
        setErrorType('locked');
        setApiError('Too many failed attempts. Account locked for 15 minutes.');
      } else if (status === 403 || err.response?.data?.unverified) {
        setErrorType('unverified');
        setApiError('Please verify your email address before logging in.');
      } else if (
        status === 404 ||
        errorMsg.toLowerCase().includes('not found') ||
        errorMsg.toLowerCase().includes('no user') ||
        errorMsg.toLowerCase().includes('does not exist')
      ) {
        setErrorType('account_not_found');
        setModalProvider('credentials');
        setShowNotFoundModal(true);
      } else if (status === 401) {
        setErrorType('invalid_credentials');
        setApiError('Incorrect email or password.');
      } else {
        setErrorType('general');
        setApiError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotFoundModal = () => {
    setModalProvider('credentials');
    setShowNotFoundModal(true);
  };

  const [resendStatus, setResendStatus] = useState('');
  const handleResendVerification = async () => {
    if (!emailValue) return;
    try {
      setResendStatus('Sending verification email...');
      await api.post('/api/auth/resend-verification', { email: emailValue });
      setResendStatus('Verification email sent! Check your inbox or terminal.');
    } catch (err) {
      setResendStatus('Failed to resend. Please try again in a moment.');
    }
  };

  return (
    <div className="auth-page-root">
      {/* Background Cyber Grid and Ambient Glows */}
      <div className="auth-bg-grid-layer" />
      <div className="auth-glow-spot-1" />
      <div className="auth-glow-spot-2" />
      <div className="auth-glow-spot-3" />

      {/* Main 2-Column Section */}
      <main className="auth-main-content">
        <div className="auth-layout-grid">
          {/* Left Column: Hero & 3D Laptop Preview */}
          <AuthHeroLogin />

          {/* Right Column: Glassmorphism Login Card */}
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

              {/* Card Title & Subtitle */}
              <h1 className="auth-card-title">Log in to DevOneStack</h1>
              <p className="auth-card-subtitle">
                Access your account or <Link to="/signup" className="auth-subtitle-link">sign up</Link> to create a new one.
              </p>

              {/* Google Social Auth */}
              <div className="auth-social-buttons">
                <a href={googleAuthUrl} className="auth-social-btn google" id="google-login-btn">
                  <FcGoogle size={18} />
                  <span>Continue with Google</span>
                </a>
              </div>

              {/* Or Divider */}
              <div className="auth-divider-wrap">or</div>

              {/* Success Banner */}
              {successMsg && !apiError && (
                <div className="auth-alert-banner success" role="status" style={{ marginBottom: '16px' }}>
                  <FiCheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ margin: 0, fontWeight: 500 }}>{successMsg}</span>
                </div>
              )}

              {/* Error Alert Banner */}
              {apiError && (
                <div className="auth-alert-banner error" role="alert">
                  <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: 0 }}>{apiError}</p>
                    {errorType === 'invalid_credentials' && (
                      <button
                        type="button"
                        className="auth-alert-action-btn"
                        onClick={handleOpenNotFoundModal}
                      >
                        Don't have an account? Click here
                      </button>
                    )}
                    {errorType === 'unverified' && (
                      <div style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          className="auth-alert-action-btn"
                          onClick={handleResendVerification}
                        >
                          Resend verification email &rarr;
                        </button>
                        {resendStatus && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#10b981' }}>
                            {resendStatus}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Credentials Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Email Field */}
                <div className="auth-form-field">
                  <label htmlFor="login-email" className="auth-field-label">
                    Email Address
                  </label>
                  <div className="auth-input-container">
                    <span className="auth-input-icon-left">
                      <FiMail size={15} />
                    </span>
                    <input
                      id="login-email"
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

                {/* Password Field */}
                <div className="auth-form-field">
                  <label htmlFor="login-password" className="auth-field-label">
                    Password
                  </label>
                  <div className="auth-input-container">
                    <span className="auth-input-icon-left">
                      <FiLock size={15} />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
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
                  {errors.password && (
                    <span className="auth-field-error-msg">{errors.password.message}</span>
                  )}
                </div>

                {/* Inline Forgot Password Link */}
                <div className="auth-inline-forgot-wrapper">
                  <Link to="/forgot-password" className="auth-forgot-link">
                    Forgot password?
                  </Link>
                </div>

                {/* Remember Me Checkbox */}
                <label className="auth-checkbox-row">
                  <input
                    type="checkbox"
                    className="auth-custom-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="auth-checkbox-text">Remember me</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="auth-cta-gradient-btn"
                  disabled={loading}
                  id="login-submit-btn"
                >
                  {loading ? (
                    <>
                      <div className="auth-btn-spinner" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span className="auth-btn-text">Log In</span>
                      <FiArrowRight className="auth-btn-arrow-icon" size={16} />
                    </>
                  )}
                </button>

                {/* Footer Switch Link */}
                <p className="auth-footer-switch-text">
                  Don't have an account?{' '}
                  <Link to="/signup" className="auth-switch-link">
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Account Not Found Modal */}
      <AccountNotFoundModal
        isOpen={showNotFoundModal}
        onClose={() => setShowNotFoundModal(false)}
        email={emailValue}
        provider={modalProvider}
        customMessage={modalCustomMsg}
      />
    </div>
  );
}