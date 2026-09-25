import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUserX, FiX, FiArrowRight, FiRotateCcw } from 'react-icons/fi';

export default function AccountNotFoundModal({
  isOpen,
  onClose,
  email = '',
  provider = 'credentials',
  customMessage = '',
}) {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const createBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the primary button when modal opens
      createBtnRef.current?.focus();

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateAccount = () => {
    onClose();
    navigate('/signup', { state: { email } });
  };

  const getMessage = () => {
    if (customMessage) return customMessage;
    if (provider === 'google') {
      return "We couldn't find a DevOneStack account associated with this Google account. Create a new account to get started.";
    }
    if (provider === 'github') {
      return "We couldn't find a DevOneStack account associated with this GitHub account. Create a new account to get started.";
    }
    return "We couldn't find a DevOneStack account with these credentials. Create an account to start organizing your developer workspace.";
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="not-found-modal-title"
    >
      <div className="auth-modal-card" ref={modalRef}>
        {/* Close Button */}
        <button
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <FiX size={18} />
        </button>

        {/* Glowing Icon Header */}
        <div className="auth-modal-icon-wrapper">
          <div className="auth-modal-icon-glow" />
          <div className="auth-modal-icon-badge">
            <FiUserX size={28} className="auth-modal-icon" />
          </div>
        </div>

        {/* Modal Text Content */}
        <h2 id="not-found-modal-title" className="auth-modal-title">
          Account Not Found
        </h2>

        <p className="auth-modal-description">
          {getMessage()}
        </p>

        {email && provider === 'credentials' && (
          <div className="auth-modal-email-pill">
            <span className="email-label">Attempted email:</span>
            <span className="email-value">{email}</span>
          </div>
        )}

        {/* Actions */}
        <div className="auth-modal-actions">
          <button
            ref={createBtnRef}
            type="button"
            className="auth-modal-btn primary"
            onClick={handleCreateAccount}
          >
            <span>Create Account</span>
            <FiArrowRight size={16} />
          </button>

          <button
            type="button"
            className="auth-modal-btn secondary"
            onClick={onClose}
          >
            <FiRotateCcw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
