import React, { useState, useEffect, useRef } from 'react';
import { FiMail, FiX, FiArrowRight, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiKey } from 'react-icons/fi';
import { forgotPassword as forgotPasswordApi } from '../../api/auth';

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  initialEmail = '',
}) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const modalRef = useRef(null);
  const emailInputRef = useRef(null);
  const backToLoginBtnRef = useRef(null);

  // Sync initial email and handle modal focus & escape listener
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setEmailError('');
      setApiError('');
      setSubmitted(false);
      setLoading(false);

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Autofocus email input after modal animation/mount
      const focusTimer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, initialEmail, onClose]);

  // When submitted successfully, focus the Back to Login button
  useEffect(() => {
    if (submitted) {
      backToLoginBtnRef.current?.focus();
    }
  }, [submitted]);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    const trimmed = typeof val === 'string' ? val.trim() : '';
    if (!trimmed) {
      return 'Email address is required.';
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setApiError('');
    const trimmedEmail = email.trim();
    const validationError = validateEmail(trimmedEmail);

    if (validationError) {
      setEmailError(validationError);
      emailInputRef.current?.focus();
      return;
    }

    setEmailError('');
    setLoading(true);

    try {
      await forgotPasswordApi(trimmedEmail);
      setSubmitted(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Unable to send reset instructions. Please try again shortly.';
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-modal-title"
    >
      <div className="auth-modal-card" ref={modalRef}>
        {/* Close Button */}
        <button
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
          disabled={loading}
        >
          <FiX size={18} />
        </button>

        {submitted ? (
          /* ================= SUCCESS STATE ================= */
          <div style={{ textAlign: 'center', width: '100%' }}>
            {/* Glowing Success Badge */}
            <div className="auth-modal-icon-wrapper">
              <div
                className="auth-modal-icon-glow"
                style={{ background: 'rgba(16, 185, 129, 0.35)' }}
              />
              <div
                className="auth-modal-icon-badge"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                }}
              >
                <FiCheckCircle size={28} className="auth-modal-icon" />
              </div>
            </div>

            <h2 id="forgot-password-modal-title" className="auth-modal-title">
              Forgot your password?
            </h2>

            <p
              className="auth-modal-description"
              style={{
                color: 'var(--text-secondary, #cbd5e1)',
                fontSize: '14px',
                lineHeight: 1.6,
                marginTop: '12px',
                marginBottom: '24px',
              }}
            >
              If an account is associated with that email, a password reset link has been sent.
            </p>

            <div className="auth-modal-actions">
              <button
                ref={backToLoginBtnRef}
                type="button"
                className="auth-modal-btn primary"
                onClick={onClose}
                id="forgot-modal-back-btn"
              >
                <FiArrowLeft size={16} />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= INITIAL / INPUT STATE ================= */
          <div style={{ width: '100%' }}>
            {/* Glowing Key Icon Header */}
            <div className="auth-modal-icon-wrapper">
              <div className="auth-modal-icon-glow" />
              <div className="auth-modal-icon-badge">
                <FiKey size={26} className="auth-modal-icon" />
              </div>
            </div>

            {/* Modal Title & Description */}
            <h2 id="forgot-password-modal-title" className="auth-modal-title">
              Forgot your password?
            </h2>

            <p className="auth-modal-description">
              Enter the email address associated with your account. If an account is eligible for password recovery, we'll send you instructions.
            </p>

            {/* Network / General API Error Alert */}
            {apiError && (
              <div
                className="auth-alert-banner error"
                role="alert"
                style={{ marginBottom: '16px', textAlign: 'left' }}
              >
                <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{apiError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ textAlign: 'left', width: '100%' }}>
              <div className="auth-form-field" style={{ marginBottom: '16px' }}>
                <label htmlFor="forgot-modal-email" className="auth-field-label">
                  Email address
                </label>
                <div className="auth-input-container">
                  <span className="auth-input-icon-left">
                    <FiMail size={15} />
                  </span>
                  <input
                    id="forgot-modal-email"
                    ref={emailInputRef}
                    type="email"
                    autoComplete="email"
                    className={`auth-input-styled ${emailError ? 'error' : ''}`}
                    placeholder="e.g., alex@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    disabled={loading}
                  />
                </div>
                {emailError && (
                  <span className="auth-field-error-msg">{emailError}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="auth-modal-actions">
                <button
                  type="submit"
                  className="auth-modal-btn primary"
                  disabled={loading}
                  id="forgot-modal-submit-btn"
                >
                  {loading ? (
                    <>
                      <div className="auth-btn-spinner" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <FiArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="auth-modal-btn secondary"
                  onClick={onClose}
                  disabled={loading}
                  id="forgot-modal-cancel-btn"
                >
                  <FiArrowLeft size={15} />
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
