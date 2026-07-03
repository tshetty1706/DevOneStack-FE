import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { login } from '../api/auth';
import { googleAuthUrl, githubAuthUrl } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-glow-top-left" />
      <div className="auth-glow-bottom-right" />

      <div className="auth-card">
        {/* Brand Logo */}
        <div className="auth-brand-logo">
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
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            DevOneStack
          </span>
        </div>

        <h1 className="auth-title">Log in to DevOneStack</h1>
        <p className="auth-subtitle">
          Access your account or <Link to="/signup" className="auth-subtitle-link">sign up</Link> to create a new one.
        </p>

        <span className="auth-oauth-label">Continue with:</span>
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

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Username or Email</label>
            <span className="auth-sublabel">Enter your details</span>
            <div className="auth-input-wrapper">
              <input
                type="text"
                className="auth-input"
                placeholder="e.g., alex@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <span className="auth-sublabel">Enter your password</span>
            <div className="auth-input-wrapper">
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <a href="#forgot" className="forgot-password-link" onClick={(e) => { e.preventDefault(); console.log('Forgot password click'); }}>
                Forgot password?
              </a>
            </div>
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

          {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
