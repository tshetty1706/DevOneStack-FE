import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { signup } from '../api/auth';
import { googleAuthUrl, githubAuthUrl } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './auth.css';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await signup({ name: username, email, password });
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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

        <h1 className="auth-title">Create a New Account</h1>
        <p className="auth-subtitle">
          Join DevOneStack and manage your finances with ease.
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

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Choose a Username</label>
            <div className="auth-input-wrapper">
              <input
                type="text"
                className="auth-input"
                placeholder="Create unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <input
                type="email"
                className="auth-input"
                placeholder="e.g., janedoe@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Create a Password</label>
            <div className="auth-input-wrapper">
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <p className="auth-terms-text">
            By continuing, you agree to our <a href="#terms" onClick={(e) => { e.preventDefault(); console.log('Terms click'); }}>Terms</a> and <a href="#privacy" onClick={(e) => { e.preventDefault(); console.log('Privacy click'); }}>Privacy Policy</a>.
          </p>

          {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Get Started'}
          </button>

          <Link to="/login" className="auth-footer-back-link">
            Already have an account? <span>Log in</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
