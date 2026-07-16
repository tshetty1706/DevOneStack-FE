import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FcGoogle } from 'react-icons/fc';
import { login as loginApi } from '../api/auth';
import { googleAuthUrl } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './auth.css';
import OnlyLog from '../components/layout/OnlyLogo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state?.email) {
      setValue('email', location.state.email);
    }
    const params = new URLSearchParams(location.search);
    const errType = params.get('error');
    const provider = params.get('provider');

    if (errType === 'account_exists') {
      const pName = provider === 'local' ? 'email/password' : provider === 'google' ? 'Google' : provider;
      setApiError(`An account with this email already exists via ${pName}. Please sign in using that method below.`);
    } else if (errType === 'oauth_failed') {
      setApiError('Sign-in failed. Try again or use email instead.');
    }
  }, [location, setValue]);

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const response = await loginApi({ email: data.email, password: data.password });
      login(response.accessToken, response.user);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong on our end. Try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-glow-top-left" />
      <div className="auth-glow-bottom-right" />

      <div className="auth-card">
        {/* Back Link */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
          <Link to="/" style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text-color)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            <span>&larr;</span> Back to Home
          </Link>
        </div>

        {/* Brand Logo */}
        <Link to="/" className="auth-brand-logo" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', width: 'fit-content', margin: '0 auto 16px auto' }}>

          <OnlyLog className='auth-brand-logo' />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-color)' }}>
            DevOneStack
          </span>
        </Link>

        <h1 className="auth-title">Log in to DevOneStack</h1>
        <p className="auth-subtitle">
          Access your account or <Link to="/signup" className="auth-subtitle-link">sign up</Link> to create a new one.
        </p>

        <span className="auth-oauth-label">Continue with:</span>
        <div className="auth-oauth-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
          <a href={googleAuthUrl} className="auth-oauth-btn google">
            <FcGoogle className="oauth-icon" size={18} />
            <span>Continue with Google</span>
          </a>
        </div>

        <div className="auth-divider">or</div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <input
                type="email"
                className="auth-input"
                placeholder="e.g., alex@email.com"
                {...register('email')}
              />
            </div>
            {errors.email && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.email.message}</p>}
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                {...register('password')}
              />
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>
            {errors.password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.password.message}</p>}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="auth-checkbox-group">
              <input
                type="checkbox"
                className="auth-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="auth-checkbox-label">Remember me</span>
            </label>
          </div>

          {apiError && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '12px', textAlign: 'center' }}>{apiError}</p>}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}