import React, { useState, useEffect } from 'react';
import { Modal, Switch, Button, message, Tooltip, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { inboxApi } from '../../api/inboxApi';
import { cloneApi } from '../../api/cloneApi';
import UserMiniProfileModal from '../community/UserMiniProfileModal';
import {
  RiCheckDoubleLine,
  RiCloseLine,
  RiUserAddLine,
  RiHeartFill,
  RiChat1Line,
  RiStarFill,
  RiGitBranchLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiAlertLine,
  RiInboxLine,
} from 'react-icons/ri';

function formatCompactTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSecs = Math.floor((now - date) / 1000);
  if (diffSecs < 60) return 'just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo`;
}

export default function InboxModal({ visible, onClose, onUnreadCountChange }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'invitations' | 'notifications'
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({ requests: 0, invitations: 0, notifications: 0 });

  // Accept Request Modal State
  const [acceptingRequest, setAcceptingRequest] = useState(null);
  const [allowPublishing, setAllowPublishing] = useState(false);
  const [allowCollaborators, setAllowCollaborators] = useState(false);
  const [allowOthersToClone, setAllowOthersToClone] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Executing clone state
  const [executingCloneId, setExecutingCloneId] = useState(null);

  // Preview profile state
  const [previewUsername, setPreviewUsername] = useState(null);

  useEffect(() => {
    if (visible && user) {
      fetchUnreadCounts();
      fetchTabItems(activeTab);
    }
  }, [visible, activeTab, user]);

  const fetchUnreadCounts = async () => {
    try {
      const res = await inboxApi.getUnreadCount();
      setUnreadCounts({
        requests: res.requestsCount || 0,
        invitations: res.invitationsCount || 0,
        notifications: res.notificationsCount || 0,
      });
      if (onUnreadCountChange) onUnreadCountChange(res.totalUnread || 0);
    } catch (e) {
      console.error('Failed to fetch unread counts', e);
    }
  };

  const fetchTabItems = async (tab) => {
    try {
      setLoading(true);
      const res = await inboxApi.getItems({ tab, page: 1, limit: 30 });
      setItems(res.items || []);
    } catch (err) {
      message.error('Failed to load inbox items.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await inboxApi.markRead(activeTab);
      fetchUnreadCounts();
      fetchTabItems(activeTab);
      message.success('Marked all as read.');
    } catch (err) {
      message.error('Failed to mark items as read.');
    }
  };

  const handleOpenAcceptModal = (reqItem) => {
    setAcceptingRequest(reqItem);
    setAllowPublishing(false);
    setAllowCollaborators(false);
    setAllowOthersToClone(false);
  };

  const handleConfirmAcceptRequest = async () => {
    if (!acceptingRequest) return;
    try {
      setSubmittingAction(true);
      await inboxApi.handleCloneRequestAction(acceptingRequest._id, {
        action: 'accept',
        permissions: {
          allowPublishing,
          allowCollaborators,
          allowOthersToClone,
        },
      });
      message.success('Clone request approved.');
      setAcceptingRequest(null);
      fetchTabItems('requests');
      fetchUnreadCounts();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectRequest = async (reqId, isBlock = false) => {
    try {
      await inboxApi.handleCloneRequestAction(reqId, {
        action: isBlock ? 'reject_block' : 'reject',
      });
      message.success(isBlock ? 'Request rejected and user blocked for this Space.' : 'Request rejected.');
      fetchTabItems('requests');
      fetchUnreadCounts();
    } catch (err) {
      message.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleInvitationAction = async (inviteId, action) => {
    try {
      const res = await inboxApi.handleCollaborationInviteAction(inviteId, { action });
      message.success(action === 'accept' ? 'Collaboration invitation accepted!' : 'Invitation declined.');
      fetchTabItems('invitations');
      fetchUnreadCounts();
      if (action === 'accept' && res.spaceId) {
        onClose();
        navigate(`/u/${encodeURIComponent(user.username || 'user')}/spaces/${res.spaceId}`);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleExecuteClone = async (reqId) => {
    try {
      setExecutingCloneId(reqId);
      const res = await cloneApi.executeApprovedClone(reqId);
      message.success('Clone created successfully! Opening your new Space...');
      onClose();
      navigate(`/u/${encodeURIComponent(user.username || 'user')}/spaces/${res.space._id}`);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to clone Space.');
    } finally {
      setExecutingCloneId(null);
    }
  };

  const anyToggleOn = allowPublishing || allowCollaborators || allowOthersToClone;

  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <RiUserAddLine size={16} color="#3b82f6" />;
      case 'post_like':
        return <RiHeartFill size={16} color="#ef4444" />;
      case 'post_comment':
        return <RiChat1Line size={16} color="#10b981" />;
      case 'space_starred':
        return <RiStarFill size={16} color="#f59e0b" />;
      case 'clone_completed':
        return <RiGitBranchLine size={16} color="#8b5cf6" />;
      default:
        return <RiInboxLine size={16} color="var(--accent-color)" />;
    }
  };

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width={560}
        closeIcon={null}
        destroyOnClose
        styles={{
          content: {
            background: isLight ? '#ffffff' : '#141419',
            border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '16px',
            padding: 0,
            overflow: 'hidden',
            boxShadow: isLight ? '0 12px 36px rgba(0,0,0,0.08)' : '0 16px 48px rgba(0,0,0,0.6)',
          },
          body: {
            padding: 0,
            height: '560px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
          header: {
            display: 'none',
          },
        }}
      >
        <div
          data-lenis-prevent="true"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Header with 3 Tabs + Mark Read + Close */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px 0',
              flexShrink: 0,
              borderBottom: `1px solid ${isLight ? '#f0f0f0' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '24px' }}>
              {[
                { key: 'requests', label: 'Requests', count: unreadCounts.requests },
                { key: 'invitations', label: 'Invitations', count: unreadCounts.invitations },
                { key: 'notifications', label: 'Notifications', count: unreadCounts.notifications },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0 0 14px',
                      fontSize: '15px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--text-color)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: 'var(--accent-color)',
                          color: '#ffffff',
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-1px',
                          left: 0,
                          right: 0,
                          height: '2.5px',
                          background: isLight ? '#0f172a' : '#ffffff',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Actions: Mark read & Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '14px' }}>
              <Tooltip title="Mark all read" placement="bottom">
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RiCheckDoubleLine size={18} />
                </button>
              </Tooltip>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RiCloseLine size={20} />
              </button>
            </div>
          </div>

          {/* Tab Content List */}
          <div
            data-lenis-prevent="true"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              padding: '12px 16px',
              scrollbarWidth: 'thin',
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="medium" />
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--text-secondary)',
                  gap: '8px',
                }}
              >
                <RiInboxLine size={36} style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>No items in {activeTab}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeTab === 'requests' &&
                  items.map((req) => {
                    const isReceived = req.isReceived;
                    const requester = req.requester || {};
                    const space = req.space || {};

                    return (
                      <div
                        key={req._id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          padding: '14px',
                          borderRadius: '12px',
                          background: isLight ? '#f9fafb' : '#0d0d12',
                          border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.04)'}`,
                          marginBottom: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              onClick={() => setPreviewUsername(requester.username)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#ffffff',
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                            >
                              {(requester.displayName?.[0] || requester.username?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', color: 'var(--text-color)' }}>
                                <strong
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setPreviewUsername(requester.username)}
                                >
                                  @{requester.username || 'user'}
                                </strong>{' '}
                                {isReceived ? 'requested a clone of' : 'requested clone of'}{' '}
                                <strong>{space.name || 'Private Space'}</strong>
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {formatCompactTime(req.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Status Tag */}
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              textTransform: 'capitalize',
                              background:
                                req.status === 'accepted'
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : req.status === 'rejected' || req.status === 'expired'
                                  ? 'rgba(239, 68, 68, 0.12)'
                                  : 'rgba(99, 102, 241, 0.12)',
                              color:
                                req.status === 'accepted'
                                  ? '#10b981'
                                  : req.status === 'rejected' || req.status === 'expired'
                                  ? '#ef4444'
                                  : 'var(--accent-color)',
                            }}
                          >
                            {req.status}
                          </span>
                        </div>

                        {req.message && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              background: isLight ? '#ffffff' : '#14141b',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontStyle: 'italic',
                            }}
                          >
                            "{req.message}"
                          </div>
                        )}

                        {/* Actions for Space Owner */}
                        {isReceived && req.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <Button size="small" danger onClick={() => handleRejectRequest(req._id, false)}>
                              Reject
                            </Button>
                            <Button size="small" danger type="dashed" onClick={() => handleRejectRequest(req._id, true)}>
                              Reject & Block
                            </Button>
                            <Button size="small" type="primary" onClick={() => handleOpenAcceptModal(req)}>
                              Accept
                            </Button>
                          </div>
                        )}

                        {/* Actions for Requester if Accepted */}
                        {!isReceived && req.status === 'accepted' && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <Button
                              size="small"
                              type="primary"
                              icon={<RiGitBranchLine />}
                              loading={executingCloneId === req._id}
                              onClick={() => handleExecuteClone(req._id)}
                            >
                              Create Copy in My Workspace
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {activeTab === 'invitations' &&
                  items.map((inv) => {
                    const inviter = inv.invitedBy || {};
                    const space = inv.space || {};

                    return (
                      <div
                        key={inv._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '14px',
                          borderRadius: '12px',
                          background: isLight ? '#f9fafb' : '#0d0d12',
                          border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.04)'}`,
                          marginBottom: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'rgba(99, 102, 241, 0.1)',
                              color: 'var(--accent-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              flexShrink: 0,
                            }}
                          >
                            <RiShieldCheckLine />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', color: 'var(--text-color)' }}>
                              <strong>@{inviter.username || 'owner'}</strong> invited you to collaborate on{' '}
                              <strong>{space.name || 'Space'}</strong> as <em>{inv.role}</em>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {formatCompactTime(inv.createdAt)}
                            </span>
                          </div>
                        </div>

                        {inv.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button size="small" onClick={() => handleInvitationAction(inv._id, 'decline')}>
                              Decline
                            </Button>
                            <Button size="small" type="primary" onClick={() => handleInvitationAction(inv._id, 'accept')}>
                              Accept
                            </Button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                            {inv.status}
                          </span>
                        )}
                      </div>
                    );
                  })}

                {activeTab === 'notifications' &&
                  items.map((notif) => {
                    const actor = notif.actor || {};

                    return (
                      <div
                        key={notif._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '12px 14px',
                          borderBottom: `1px solid ${isLight ? '#f3f4f6' : 'rgba(255,255,255,0.04)'}`,
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: isLight ? '#f1f5f9' : '#1a1a24',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {renderNotificationIcon(notif.type)}
                          </div>

                          <div style={{ fontSize: '13px', color: 'var(--text-color)', lineHeight: 1.4 }}>
                            <strong>{actor.displayName || actor.username || 'Someone'}</strong> {notif.message}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {formatCompactTime(notif.createdAt)}
                          </span>
                          {!notif.isRead && (
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--accent-color)',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Acceptance Permission Toggles Modal */}
      <Modal
        open={!!acceptingRequest}
        onCancel={() => setAcceptingRequest(null)}
        title="Approve Clone Request"
        centered
        width={480}
        styles={{
          content: {
            background: isLight ? '#ffffff' : '#111116',
            borderRadius: '16px',
          },
        }}
        footer={[
          <Button key="cancel" onClick={() => setAcceptingRequest(null)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={submittingAction}
            onClick={handleConfirmAcceptRequest}
          >
            Confirm Approval
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          {/* Main Warning Alert */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <RiAlertLine size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>They will get a full copy of this Space. You can't take it back.</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Configure permissions granted to @{acceptingRequest?.requester?.username} for their copy:
          </p>

          {/* Switch 1: Allow publishing */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color)' }}>Allow publishing</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                They can make their copy public and show it in Discover/feed
              </div>
            </div>
            <Switch checked={allowPublishing} onChange={setAllowPublishing} />
          </div>

          {/* Switch 2: Allow collaborators */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color)' }}>Allow collaborators</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                They can invite other users to edit or view their copy
              </div>
            </div>
            <Switch checked={allowCollaborators} onChange={setAllowCollaborators} />
          </div>

          {/* Switch 3: Allow others to clone */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color)' }}>Allow others to clone</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                They can enable request-based cloning for their copy
              </div>
            </div>
            <Switch checked={allowOthersToClone} onChange={setAllowOthersToClone} />
          </div>

          {/* Conditional extra warning if any switch enabled */}
          {anyToggleOn && (
            <div
              style={{
                fontSize: '12px',
                color: '#f59e0b',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              This person will be able to share or publish this content. You can't take back copies that others make.
            </div>
          )}
        </div>
      </Modal>

      {/* User Mini Profile Preview Modal */}
      {previewUsername && (
        <UserMiniProfileModal
          username={previewUsername}
          visible={!!previewUsername}
          onClose={() => setPreviewUsername(null)}
        />
      )}
    </>
  );
}
