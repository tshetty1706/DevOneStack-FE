import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, message, Spin, Result } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cloneApi } from '../api/cloneApi';
import Logo from '../components/layout/Logo';
import { RiLockLine, RiSendPlaneFill, RiGitBranchLine, RiShieldUserLine, RiCheckLine } from 'react-icons/ri';

export default function RequestLinkLanding() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [loading, setLoading] = useState(true);
  const [spaceInfo, setSpaceInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [messageText, setMessageText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (token) {
      fetchRequestInfo();
    }
  }, [token]);

  const fetchRequestInfo = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await cloneApi.getRequestLinkInfo(token);
      setSpaceInfo(res);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'This request link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      message.info('Please log in to send a clone request.');
      navigate('/login', { state: { returnUrl: `/r/${token}` } });
      return;
    }

    if (messageText.trim().length > 300) {
      message.error('Message cannot exceed 300 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await cloneApi.createPrivateSpaceRequest(token, {
        message: messageText.trim() || undefined,
      });
      setSubmitted(true);
      message.success('Your clone request has been submitted to the space owner.');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to submit clone request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isLight ? '#f8fafc' : '#08080c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Top Logo */}
      <div style={{ marginBottom: '32px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <Logo />
      </div>

      {/* Main Request Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: isLight ? '#ffffff' : '#111116',
          border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: isLight ? '0 12px 36px rgba(0,0,0,0.06)' : '0 16px 48px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : errorMsg ? (
          <Result
            status="warning"
            title="Request Link Unavailable"
            subTitle={errorMsg}
            extra={
              <Button type="primary" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            }
          />
        ) : submitted ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
            >
              <RiCheckLine />
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-color)' }}>
              Request Sent!
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your clone request has been delivered to <strong>@{spaceInfo?.ownerUsername}</strong>. Once approved, you can create a private copy in your workspace via your Inbox.
            </p>
            <Button
              type="primary"
              style={{ marginTop: '12px', borderRadius: '8px', padding: '0 24px' }}
              onClick={() => navigate(user ? `/u/${encodeURIComponent(user.username || 'user')}/dashboard` : '/')}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Header Badge & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                <RiLockLine />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Private Space Request
                </span>
                <h1 style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 800, color: 'var(--text-color)', fontFamily: 'var(--font-display)' }}>
                  {spaceInfo?.spaceName}
                </h1>
              </div>
            </div>

            {/* Owner Blurb */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: isLight ? '#f9fafb' : '#08080c',
                border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <RiShieldUserLine size={18} color="var(--text-secondary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Owner: <strong>@{spaceInfo?.ownerUsername}</strong>
              </span>
            </div>

            {/* Custom Owner Description / Blurb if provided */}
            {spaceInfo?.requestDescription && (
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-color)', lineHeight: 1.5 }}>
                {spaceInfo.requestDescription}
              </p>
            )}

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
              }}
            >
              Requesting a clone allows you to receive an independent copy in your workspace once approved by the owner.
            </div>

            {/* Auth / Request Form */}
            {!user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  You must be logged in to submit a clone request.
                </p>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/login', { state: { returnUrl: `/r/${token}` } })}
                  style={{ borderRadius: '8px', fontWeight: 600 }}
                >
                  Log in to Request Copy
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '6px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color)', display: 'block', marginBottom: '6px' }}>
                    Note to Owner (optional, max 300 chars)
                  </label>
                  <Input.TextArea
                    placeholder="Briefly mention why you'd like a copy of this Space..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    maxLength={300}
                    rows={3}
                    showCount
                    style={{
                      background: isLight ? '#f9fafb' : '#08080c',
                      border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
                      color: 'var(--text-color)',
                      borderRadius: '10px',
                    }}
                  />
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<RiSendPlaneFill />}
                  loading={submitting}
                  onClick={handleSubmitRequest}
                  style={{ borderRadius: '8px', fontWeight: 600 }}
                >
                  Submit Clone Request
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
