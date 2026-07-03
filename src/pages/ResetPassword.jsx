import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import api from '../api/axios';
import './auth.css';

const schema = z.object({
  password: z.string()
    .min(8, 'Password needs 8+ chars, one uppercase, one number, one special character.')
    .regex(/[A-Z]/, 'Password needs 8+ chars, one uppercase, one number, one special character.')
    .regex(/[0-9]/, 'Password needs 8+ chars, one uppercase, one number, one special character.')
    .regex(/[^A-Za-z0-9]/, 'Password needs 8+ chars, one uppercase, one number, one special character.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password: data.password });
      message.success({ content: 'Password reset successful! Please log in.', style: { marginTop: '60px' } });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      message.error({ content: err.response?.data?.error || 'This reset link has expired or already been used. Request a new one.', style: { marginTop: '60px' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-glow-top-left" />
      <div className="auth-glow-bottom-right" />

      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          Choose a new strong password for your DevOneStack account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-form-group">
            <label className="auth-label">New Password</label>
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

          <div className="auth-form-group">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrapper">
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'underline' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
