import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Input, Button, Switch, message, Tooltip, Alert } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cloneApi } from '../../api/cloneApi';
import { spacesApi } from '../../api/spacesApi';
import CollaboratorsManager from './CollaboratorsManager';
import {
  RiLinkM,
  RiLockLine,
  RiGlobalLine,
  RiRefreshLine,
  RiFileCopyLine,
  RiAlertLine,
  RiTeamLine,
} from 'react-icons/ri';

export default function SpaceCollaboratorsModal({ space, visible, onClose, onSpaceUpdated }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState('collaborators'); // 'collaborators' | 'requestLink' | 'visibility'

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
    }
  }, [visible, space]);

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

  const isCloned = Boolean(space?.clonedFrom);
  const allowCollaborators = !isCloned || space?.clonePermissions?.allowCollaborators !== false;
  const allowOthersToClone = !isCloned || space?.clonePermissions?.allowOthersToClone !== false;
  const allowPublishing = !isCloned || space?.clonePermissions?.allowPublishing !== false;

  const handleToggleVisibility = async (newVis) => {
    if (newVis === currentVisibility) return;

    if (newVis === 'public') {
      if (!allowPublishing) {
        message.warning('Publishing has been disabled for this cloned Space.');
        return;
      }

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

  const currentUserId = (user?._id || user?.id)?.toString();
  const ownerId = (space?.owner?._id || space?.owner)?.toString();
  const isOwner = Boolean(currentUserId && ownerId && currentUserId === ownerId);

  const tabItems = [
    {
      key: 'collaborators',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RiTeamLine /> Collaborators
        </span>
      ),
      children: (
        <div style={{ paddingTop: '8px' }}>
          <CollaboratorsManager
            space={space}
            isLight={isLight}
            currentUser={user}
            onCloseModal={onClose}
            onSpaceUpdated={onSpaceUpdated}
          />
        </div>
      ),
    },
    ...(isOwner ? [
      {
        key: 'requestLink',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RiLinkM /> Request Link
          </span>
        ),
        children: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
                {!allowOthersToClone && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Further Cloning Disabled"
                    description="Further cloning was disabled for this cloned Space by the original owner. You cannot enable a request link."
                    style={{ borderRadius: '10px' }}
                  />
                )}

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
                    disabled={!allowOthersToClone}
                    checked={requestLinkEnabled}
                    loading={savingRequestLink}
                    onChange={(val) => {
                      setRequestLinkEnabled(val);
                      handleSaveRequestLinkSettings(val, requestDescription);
                    }}
                  />
                </div>

                {allowOthersToClone && requestLinkEnabled && (
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
                {!allowPublishing && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Publishing Disabled"
                    description="Publishing was disabled for this cloned Space by the original owner. This Space must remain private."
                    style={{ borderRadius: '10px' }}
                  />
                )}

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
                    onClick={() => {
                      if (!allowPublishing) {
                        message.warning('Publishing has been disabled for this cloned Space.');
                        return;
                      }
                      handleToggleVisibility('public');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '12px',
                      border: `2px solid ${currentVisibility === 'public' ? 'var(--accent-color)' : isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
                      background: currentVisibility === 'public' ? (isLight ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.1)') : 'transparent',
                      cursor: allowPublishing ? 'pointer' : 'not-allowed',
                      opacity: allowPublishing ? 1 : 0.5,
                      transition: 'all 0.2s',
                    }}
                  >
                    <RiGlobalLine size={22} color={currentVisibility === 'public' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-color)' }}>Public</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {allowPublishing
                          ? 'Anyone can view, star, and discover this Space in the Community.'
                          : 'Publishing is disabled for this cloned Space.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ] : []),
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      title={isOwner ? "Space Access & Collaboration" : "Space Collaborators"}
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
        items={tabItems}
      />
    </Modal>
  );
}
