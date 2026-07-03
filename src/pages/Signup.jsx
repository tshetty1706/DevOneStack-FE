import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { signup as signupApi } from '../api/auth';
import { googleAuthUrl, githubAuthUrl } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username must be under 20 characters.')
    .regex(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string()
    .min(8, 'Password needs 8+ chars, one uppercase, one number, one special character.')
    .regex(/[A-Z]/, 'Password needs 8+ chars, one uppercase, one number, one special character.')
    .regex(/[0-9]/, 'Password needs 8+ chars, one uppercase, one number, one special character.')
    .regex(/[^A-Za-z0-9]/, 'Password needs 8+ chars, one uppercase, one number, one special character.'),
});

export default function Signup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setApiError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const response = await signupApi({ username: data.username, email: data.email, password: data.password });
      setSuccessMsg(response.message || 'Account created. Please verify your email.');
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg && (msg.includes("already exists") || msg.includes("taken"))) {
        setApiError(msg);
      } else {
        setApiError(msg || 'Signup failed. Please try again.');
      }
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
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 2L6 7L16 12L26 7L16 2Z"
              fill="var(--accent-color, #6366f1)"
              stroke="var(--accent-color, #6366f1)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M6 13L16 18L26 13"
              stroke="var(--accent-color, #6366f1)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            <path
              d="M6 19L16 24L26 19"
              stroke="var(--accent-color, #6366f1)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-color)' }}>
            DevOneStack
          </span>
        </Link>

        <h1 className="auth-title">Create a New Account</h1>
        <p className="auth-subtitle">
          Join DevOneStack and manage your workspaces with ease.
        </p>

        <span className="auth-oauth-label">Sign up with:</span>
        <div className="auth-oauth-buttons">
          <a href={googleAuthUrl} className="auth-oauth-btn google">
            <FcGoogle className="oauth-icon" size={18} />
            <span>Continue with Google</span>
          </a>
          <a href={githubAuthUrl} className="auth-oauth-btn github">
            <FaGithub className="oauth-icon" size={18} />
            <span>Continue with GitHub</span>
          </a>
        </div>

        <div className="auth-divider">or</div>

        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: '#10b981', fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>
              {successMsg}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Check your email for the verification link. Once verified, you can log in.
            </p>
            <Link to="/login" className="auth-submit-btn" style={{ display: 'block', textDecoration: 'none', lineHeight: '38px', marginTop: '20px' }}>
              Go to Login Page
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-form-group">
              <label className="auth-label">Choose a Username</label>
              <div className="auth-input-wrapper">
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Create unique username"
                  {...register('username')}
                />
              </div>
              {errors.username && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.username.message}</p>}
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  className="auth-input"
                  placeholder="e.g., janedoe@email.com"
                  {...register('email')}
                />
              </div>
              {errors.email && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.email.message}</p>}
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Create a Password</label>
              <div className="auth-input-wrapper">
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  {...register('password')}
                />
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.password.message}</p>}
            </div>

            <p className="auth-terms-text">
              By continuing, you agree to our <a href="#terms" onClick={(e) => { e.preventDefault(); console.log('Terms click'); }}>Terms</a> and <a href="#privacy" onClick={(e) => { e.preventDefault(); console.log('Privacy click'); }}>Privacy Policy</a>.
            </p>

            {apiError && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '12px', textAlign: 'center' }}>{apiError}</p>}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Get Started'}
            </button>

            <Link to="/login" className="auth-footer-back-link">
              Already have an account? <span>Log in</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
