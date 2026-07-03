import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import api from '../api/axios';
import './auth.css';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: data.email });
      setDone(true);
      message.success({ content: 'If that email exists, a link was sent.', style: { marginTop: '60px' } });
    } catch (err) {
      message.error({ content: err.response?.data?.error || 'Something went wrong.', style: { marginTop: '60px' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-glow-top-left" />
      <div className="auth-glow-bottom-right" />

      <div className="auth-card">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
          <Link to="/login" style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <span>&larr;</span> Back to Login
          </Link>
        </div>

        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: '#10b981', fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>
              Check your inbox!
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              If an account is associated with that email, we have sent instructions to reset your password.
            </p>
          </div>
        ) : (
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

            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? 'Sending link…' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
