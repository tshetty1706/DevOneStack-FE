import React, { useState, useEffect, useRef } from 'react';
import { FiCheck, FiCopy, FiArrowRight, FiX } from 'react-icons/fi';
import { RiSparklingLine } from 'react-icons/ri';
import '../../pages/auth.css';

/**
 * GeneratedUsernameModal
 * Shown immediately after a user's first successful login to display
 * their uniquely generated username.
 */
export default function GeneratedUsernameModal({
  isOpen,
  onClose,
  username = '',
}) {
  const [copied, setCopied] = useState(false);
  const continueBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      continueBtnRef.current?.focus();
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

  if (!isOpen || !username) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      // Fallback if clipboard API is restricted
      try {
        const textArea = document.createElement('textarea');
        textArea.value = username;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch (fallbackErr) {
        console.error('Failed to copy username:', fallbackErr);
      }
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="username-modal-title"
    >
      <div className="auth-modal-card auth-modal-username-card">
        {/* Close Button */}
        <button
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <FiX size={18} />
        </button>

        {/* Glowing Celebration Header Badge */}
        <div className="auth-modal-icon-wrapper">
          <div className="auth-modal-icon-glow" />
          <div className="auth-modal-icon-badge" style={{ background: 'rgba(49, 46, 129, 0.85)', borderColor: '#818cf8' }}>
            <RiSparklingLine size={26} style={{ color: '#a5b4fc' }} />
          </div>
        </div>

        {/* Modal Title & Subtitle */}
        <h2 id="username-modal-title" className="auth-modal-title">
          Welcome to DevOneStack! 🚀
        </h2>

        <p className="auth-modal-subtitle-text" style={{ fontSize: '14.5px', fontWeight: 600, color: '#c7d2fe', margin: '0 0 6px 0' }}>
          Your username is
        </p>

        {/* Prominent Generated Username Box with Copy Action */}
        <div className="auth-modal-username-wrapper" style={{ margin: '14px 0 16px' }}>
          <div className="auth-modal-username-box">
            <div className="auth-modal-username-content">
              <span className="auth-modal-username-prefix">@</span>
              <span className="auth-modal-username-text" title={`@${username}`}>
                {username}
              </span>
            </div>
            <button
              type="button"
              className={`auth-modal-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              aria-label="Copy username to clipboard"
              title={copied ? "Copied!" : "Copy username"}
            >
              {copied ? (
                <>
                  <FiCheck size={14} className="copy-icon check" />
                  <span className="copy-text">Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy size={14} className="copy-icon" />
                  <span className="copy-text">Copy Username</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="auth-modal-description" style={{ marginBottom: '22px', fontSize: '13px', color: '#94a3b8' }}>
          This username identifies you across DevOneStack.
        </p>

        {/* Actions */}
        <div className="auth-modal-actions" style={{ marginTop: '8px' }}>
          <button
            ref={continueBtnRef}
            type="button"
            className="auth-modal-btn primary"
            onClick={onClose}
            id="continue-to-app-btn"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>Continue</span>
            <FiArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
