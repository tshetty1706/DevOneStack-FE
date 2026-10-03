import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Input, Select, Button, Switch, message, Tooltip, Spin, Alert } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { collaborationApi } from '../../api/collaborationApi';
import { cloneApi } from '../../api/cloneApi';
import { spacesApi } from '../../api/spacesApi';
import {
  RiUserAddLine,
  RiLinkM,
  RiLockLine,
  RiGlobalLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiFileCopyLine,
  RiShieldCheckLine,
  RiAlertLine,
} from 'react-icons/ri';

export default function SpaceCollaboratorsModal({ space, visible, onClose, onSpaceUpdated }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState('collaborators'); // 'collaborators' | 'requestLink' | 'visibility'

  // Collaborators Tab State
  const [collaborators, setCollaborators] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingCollabs, setLoadingCollabs] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);

  // Request Link Tab State
  const [requestLinkEnabled, setRequestLinkEnabled] = useState(space?.requestLinkEnabled || false);
  const [requestLinkToken, setRequestLinkToken] = useState(space?.requestLinkToken || '');
  const [requestDescription, setRequestDescription] = useState(space?.requestDescription || '');
  const [savingRequestLink, setSavingRequestLink] = useState(false);
  const [regeneratingToken, setRegeneratingToken] = useState(false);

  // Visibility Tab State
  const [currentVisibility, setCurrentVisibility] = useState(space?.visibility || 'private');
  const [changingVisibility, setChangingVisibility] = useState(false);

  useEffect(() => {
    if (visible && space) {
      setRequestLinkEnabled(space.requestLinkEnabled || false);
      setRequestLinkToken(space.requestLinkToken || '');
      setRequestDescription(space.requestDescription || '');
      setCurrentVisibility(space.visibility || 'private');
      fetchCollaborators();
    }
  }, [visible, space]);

  const fetchCollaborators = async () => {
    if (!space?._id) return;
    try {
      setLoadingCollabs(true);
      const res = await collaborationApi.getCollaborators(space._id);
      setCollaborators(res.collaborators || []);
      setPendingInvites(res.pendingInvites || []);
    } catch (err) {
      // If error, ignore silently or report
    } finally {
      setLoadingCollabs(false);
    }
  };

  const handleSendInvite = async () => {
    const trimmed = inviteUsername.trim();
    if (!trimmed) {
      message.warning('Please enter an exact username.');
      return;
    }

    try {
      setInviting(true);
      const res = await collaborationApi.inviteCollaborator(space._id, {
        username: trimmed,
        role: inviteRole,
      });
      message.success(res.message || 'Invitation sent successfully.');
      setInviteUsername('');
      fetchCollaborators();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await collaborationApi.updateCollaboratorRole(space._id, userId, { role: newRole });
      message.success('Collaborator role updated.');
      fetchCollaborators();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      await collaborationApi.removeCollaborator(space._id, userId);
      message.success('Collaborator removed.');
      fetchCollaborators();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to remove collaborator.');
    }
  };

  const handleSaveRequestLinkSettings = async (enabledVal, descVal) => {
    try {
      setSavingRequestLink(true);
      const res = await cloneApi.toggleRequestLink(space._id, {
        enabled: enabledVal !== undefined ? enabledVal : requestLinkEnabled,
        description: descVal !== undefined ? descVal : requestDescription,
      });
      setRequestLinkEnabled(res.requestLinkEnabled);
      setRequestLinkToken(res.requestLinkToken);
      if (onSpaceUpdated) onSpaceUpdated({ ...space, requestLinkEnabled: res.requestLinkEnabled, requestLinkToken: res.requestLinkToken });
      message.success('Request link settings updated.');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSavingRequestLink(false);
    }
  };

  const handleRegenerateToken = async () => {
    Modal.confirm({
      title: 'Regenerate Request Link',
      content: 'Any previously shared request links will stop working immediately. Are you sure?',
      okText: 'Regenerate',
      okType: 'danger',
      onOk: async () => {
        try {
          setRegeneratingToken(true);
          const res = await cloneApi.regenerateRequestLink(space._id);
          setRequestLinkToken(res.requestLinkToken);
          message.success('Request link token regenerated.');
        } catch (err) {
          message.error(err.response?.data?.message || 'Failed to regenerate link.');
        } finally {
          setRegeneratingToken(false);
        }
      },
    });
  };

  const handleCopyRequestLink = () => {
    if (!requestLinkToken) return;
    const url = `${window.location.origin}/r/${requestLinkToken}`;
    navigator.clipboard.writeText(url);
    message.success('Request link copied to clipboard!');
  };

  const handleToggleVisibility = async (newVis) => {
    if (newVis === currentVisibility) return;

    if (newVis === 'public') {
      Modal.confirm({
        title: 'Make Space Public?',
        icon: <RiAlertLine style={{ color: '#f59e0b' }} />,
        content: (
          <div>
            <p>Publishing will make this Space visible to anyone and eligible for Community Discover & Search.</p>
            <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
              DevOneStack runs an automated secret scan. Ensure no API keys, private credentials, or secrets are exposed in your notes or snippets.
            </p>
          </div>
        ),
        okText: 'Run Scan & Publish',
        onOk: async () => {
          try {
            setChangingVisibility(true);
            const res = await spacesApi.updateSpace(space._id, { visibility: 'public' });
            setCurrentVisibility('public');
            message.success('Space is now Public!');
            if (onSpaceUpdated) onSpaceUpdated(res.space || res);
          } catch (err) {
            message.error(err.response?.data?.message || 'Failed to change visibility.');
          } finally {
            setChangingVisibility(false);
          }
        },
      });
    } else {
      Modal.confirm({
        title: 'Make Space Private?',
        content: 'This Space will immediately be removed from Discover, Feed, and Search. Only you and approved collaborators will have access.',
        okText: 'Make Private',
        onOk: async () => {
          try {
            setChangingVisibility(true);
            const res = await spacesApi.updateSpace(space._id, { visibility: 'private' });
            setCurrentVisibility('private');
            message.success('Space is now Private.');
            if (onSpaceUpdated) onSpaceUpdated(res.space || res);
          } catch (err) {
            message.error(err.response?.data?.message || 'Failed to change visibility.');
          } finally {
            setChangingVisibility(false);
          }
        },
      });
    }
  };

  const isOwner = user && (user._id === (space?.owner?._id || space?.owner) || user.id === (space?.owner?._id || space?.owner));

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={560}
      title="Space Access & Collaboration"
      destroyOnClose
      styles={{
        content: {
          background: isLight ? '#ffffff' : '#111116',
          borderRadius: '16px',
        },
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'collaborators',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RiUserAddLine /> Collaborators
              </span>
            ),
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
                {/* Invite Form */}
                {isOwner && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '14px',
                      borderRadius: '12px',
                      background: isLight ? '#f9fafb' : '#0a0a0f',
                      border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <Input
                      placeholder="Enter exact username..."
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      onPressEnter={handleSendInvite}
                      style={{ flex: 1 }}
                    />
                    <Select
                      value={inviteRole}
                      onChange={setInviteRole}
                      options={[
                        { value: 'editor', label: 'Editor' },
                        { value: 'viewer', label: 'Viewer' },
                      ]}
                      style={{ width: '100px' }}
                    />
                    <Button type="primary" loading={inviting} onClick={handleSendInvite}>
                      Invite
                    </Button>
                  </div>
                )}

                {/* Collaborators List */}
                {loadingCollabs ? (
                  <div style={{ padding: '24px 0', textAlign: 'center' }}>
                    <Spin size="small" />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Active Members ({collaborators.length}/5)
                    </div>

                    {collaborators.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                        No collaborators added yet.
                      </p>
                    ) : (
                      collaborators.map((c) => {
                        const colUser = c.user || {};
                        return (
                          <div
                            key={colUser._id || colUser.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              background: isLight ? '#f9fafb' : '#0e0e14',
                              border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.04)'}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-color)' }}>
                                @{colUser.username}
                              </span>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                ({colUser.displayName})
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {isOwner ? (
                                <Select
                                  value={c.role}
                                  onChange={(val) => handleRoleChange(colUser._id || colUser.id, val)}
                                  size="small"
                                  options={[
                                    { value: 'editor', label: 'Editor' },
                                    { value: 'viewer', label: 'Viewer' },
                                  ]}
                                  style={{ width: '90px' }}
                                />
                              ) : (
                                <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{c.role}</span>
                              )}

                              {isOwner && (
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<RiDeleteBinLine />}
                                  onClick={() => handleRemoveCollaborator(colUser._id || colUser.id)}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Pending Invites */}
                    {pendingInvites.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Pending Invites
                        </div>
                        {pendingInvites.map((inv) => (
                          <div
                            key={inv._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: isLight ? '#f3f4f6' : '#14141d',
                              fontSize: '13px',
                              marginBottom: '4px',
                            }}
                          >
                            <span>
                              @{inv.inviteeUsername} (<em>{inv.role}</em>)
                            </span>
                            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>Invited</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'requestLink',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RiLinkM /> Request Link
              </span>
            ),
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color)' }}>
                      Enable Clone Request Link
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Allow people with the link to request a clone of your private Space
                    </div>
                  </div>
                  <Switch
                    checked={requestLinkEnabled}
                    loading={savingRequestLink}
                    onChange={(val) => {
                      setRequestLinkEnabled(val);
                      handleSaveRequestLinkSettings(val, requestDescription);
                    }}
                  />
                </div>

                {requestLinkEnabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Link display & copy */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Shareable Request Link
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Input
                          readOnly
                          value={requestLinkToken ? `${window.location.origin}/r/${requestLinkToken}` : 'Generating...'}
                          style={{ flex: 1 }}
                        />
                        <Button icon={<RiFileCopyLine />} onClick={handleCopyRequestLink}>
                          Copy
                        </Button>
                        <Tooltip title="Regenerate link token">
                          <Button
                            icon={<RiRefreshLine />}
                            loading={regeneratingToken}
                            onClick={handleRegenerateToken}
                          />
                        </Tooltip>
                      </div>
                    </div>

                    {/* Blurb */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Landing Page Blurb (optional)
                      </label>
                      <Input.TextArea
                        placeholder="Brief overview shown on the request page..."
                        value={requestDescription}
                        onChange={(e) => setRequestDescription(e.target.value)}
                        onBlur={() => handleSaveRequestLinkSettings(requestLinkEnabled, requestDescription)}
                        maxLength={250}
                        rows={2}
                        showCount
                      />
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'visibility',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RiGlobalLine /> Visibility
              </span>
            ),
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Private Option */}
                  <div
                    onClick={() => handleToggleVisibility('private')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '12px',
                      border: `2px solid ${currentVisibility === 'private' ? 'var(--accent-color)' : isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
                      background: currentVisibility === 'private' ? (isLight ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.1)') : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <RiLockLine size={22} color={currentVisibility === 'private' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-color)' }}>Private</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Only you and accepted collaborators can access this Space.
                      </div>
                    </div>
                  </div>

                  {/* Public Option */}
                  <div
                    onClick={() => handleToggleVisibility('public')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '12px',
                      border: `2px solid ${currentVisibility === 'public' ? 'var(--accent-color)' : isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
                      background: currentVisibility === 'public' ? (isLight ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.1)') : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <RiGlobalLine size={22} color={currentVisibility === 'public' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-color)' }}>Public</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Anyone can view, star, and discover this Space in the Community.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
