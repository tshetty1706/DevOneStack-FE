import React, { useState, useEffect, useMemo } from 'react';
import { Input, Select, Button, Popconfirm, message, Spin, Tooltip, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  RiUserAddLine,
  RiShieldUserLine,
  RiDeleteBinLine,
  RiCloseLine,
  RiLogoutBoxRLine,
  RiTimeLine,
  RiCheckLine,
  RiInformationLine,
  RiTeamLine,
} from 'react-icons/ri';
import { collaborationApi } from '../../api/collaborationApi';
import { spaceKeys } from '../../hooks/useSpaces';
import { timeAgo } from '../../utils/dateUtils';

export default function CollaboratorsManager({
  space,
  isLight = false,
  currentUser,
  onSpaceUpdated,
  onCloseModal,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [collaborators, setCollaborators] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Invite form state
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [cancellingInviteId, setCancellingInviteId] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
  const spaceOwnerId = (space?.owner?._id || space?.owner)?.toString();
  const isOwner = Boolean(currentUserId && spaceOwnerId && currentUserId === spaceOwnerId);

  // Styling tokens matching DevOneStack design system
  const cardBorder = isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.08)';
  const itemBg = isLight ? '#f9fafb' : '#0e0e14';
  const itemBorder = isLight ? '#f3f4f6' : 'rgba(255, 255, 255, 0.05)';
  const textColor = isLight ? '#111827' : '#f3f4f6';
  const textMuted = isLight ? '#64748b' : '#94a3b8';
  const accent = isLight ? '#4f46e5' : '#6366f1';

  const isCloned = Boolean(space?.clonedFrom);
  const allowCollaborators = !isCloned || space?.clonePermissions?.allowCollaborators !== false;

  const fetchCollaborators = async () => {
    if (!space?._id) return;
    try {
      setLoading(true);
      const res = await collaborationApi.getCollaborators(space._id);
      setCollaborators(res.collaborators || []);
      setPendingInvites(res.pendingInvites || []);
      setOwnerData(res.owner || space.owner || null);
    } catch (err) {
      console.error('Failed to fetch collaborators:', err);
      message.error(err.response?.data?.error || 'Failed to load collaborators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [space?._id]);

  // Total active count including owner
  const activeCount = 1 + (collaborators?.length || 0);
  const isMaxReached = (collaborators?.length || 0) >= 10;

  // Send an invite
  const handleSendInvite = async () => {
    const clean = inviteUsername.trim().replace(/^@/, '');
    if (!clean) {
      message.warning('Please enter an exact username.');
      return;
    }

    if (isMaxReached) {
      message.error('Collaborator limit reached (max 10 collaborators per Space).');
      return;
    }

    try {
      setInviting(true);
      const res = await collaborationApi.inviteCollaborator(space._id, {
        username: clean,
        role: inviteRole,
      });
      message.success(res.message || `Invitation sent to @${clean}`);
      setInviteUsername('');
      await fetchCollaborators();
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      if (onSpaceUpdated) onSpaceUpdated();
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Failed to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  // Change a collaborator's role
  const handleRoleChange = async (userId, newRole) => {
    try {
      setRoleUpdatingId(userId);
      await collaborationApi.updateCollaboratorRole(space._id, userId, { role: newRole });
      message.success(`Collaborator role updated to ${newRole}`);
      await fetchCollaborators();
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      if (onSpaceUpdated) onSpaceUpdated();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to update role.');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  // Remove a collaborator
  const handleRemoveCollaborator = async (userId, username) => {
    try {
      setRemovingId(userId);
      await collaborationApi.removeCollaborator(space._id, userId);
      message.success(`@${username || 'Collaborator'} removed from Space.`);
      await fetchCollaborators();
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      if (onSpaceUpdated) onSpaceUpdated();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to remove collaborator.');
    } finally {
      setRemovingId(null);
    }
  };

  // Cancel pending invite
  const handleCancelInvite = async (inviteId, inviteeUsername) => {
    try {
      setCancellingInviteId(inviteId);
      await collaborationApi.cancelInvite(space._id, inviteId);
      message.success(`Invitation to @${inviteeUsername || 'user'} cancelled.`);
      await fetchCollaborators();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to cancel invitation.');
    } finally {
      setCancellingInviteId(null);
    }
  };

  // Collaborator self-leaves the Space
  const handleLeaveSpace = async () => {
    if (!currentUserId) return;
    try {
      setIsLeaving(true);
      await collaborationApi.leaveSpace(space._id, currentUserId);
      message.success('You have left the Space.');

      // Invalidate relevant queries immediately
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      queryClient.removeQueries({ queryKey: ['space', space._id] });

      if (onCloseModal) onCloseModal();
      navigate(`/u/${encodeURIComponent(currentUser?.username || 'user')}/dashboard?view=spaces`);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to leave Space.');
      setIsLeaving(false);
    }
  };

  // Helper avatar renderer
  const renderAvatar = (u, size = 32) => {
    const avatarUrl = u?.avatarUrl;
    const initial = (u?.displayName || u?.username || '?').charAt(0).toUpperCase();

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={u?.username || 'User'}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `1px solid ${cardBorder}`,
            flexShrink: 0,
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: isLight ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.22)',
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: `${Math.floor(size * 0.42)}px`,
          flexShrink: 0,
          border: `1px solid ${cardBorder}`,
        }}
      >
        {initial}
      </div>
    );
  };

  const effectiveOwner = ownerData || (typeof space?.owner === 'object' ? space.owner : null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* ── Status & Capacity Banner ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '12px 14px',
          borderRadius: '10px',
          background: isLight ? '#f8fafc' : '#0c0c12',
          border: `1px solid ${cardBorder}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiTeamLine size={18} style={{ color: accent }} />
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: textColor }}>
              Space Collaborators
            </div>
            <div style={{ fontSize: '12px', color: textMuted }}>
              {isOwner
                ? 'Manage members and assign Viewer or Editor access permissions.'
                : 'Members and access permissions for this workspace.'}
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '16px',
            background: isMaxReached
              ? 'rgba(239, 68, 68, 0.1)'
              : isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)',
            color: isMaxReached ? '#ef4444' : accent,
            border: `1px solid ${isMaxReached ? 'rgba(239, 68, 68, 0.2)' : 'transparent'}`,
          }}
        >
          {collaborators.length}/10 Collaborators
        </span>
      </div>

      {/* Warning if cloning disallowed collaborators */}
      {!allowCollaborators && (
        <Alert
          type="warning"
          showIcon
          message="Collaboration Disabled"
          description="The original creator of this cloned Space disabled collaborator invitations."
          style={{ borderRadius: '10px' }}
        />
      )}

      {/* ── Invite Form (Owner Only) ── */}
      {isOwner && allowCollaborators && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '16px',
            borderRadius: '12px',
            background: itemBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: textColor }}>
            Invite New Collaborator
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Input
              placeholder="Enter exact username (e.g. alex)"
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              onPressEnter={handleSendInvite}
              disabled={inviting || isMaxReached}
              prefix={<span style={{ color: textMuted }}>@</span>}
              style={{
                flex: 1,
                minWidth: '180px',
                borderRadius: '8px',
                height: '38px',
              }}
            />

            <Select
              value={inviteRole}
              onChange={setInviteRole}
              disabled={inviting || isMaxReached}
              style={{ width: '130px', height: '38px' }}
              options={[
                { value: 'editor', label: 'Editor (Can Edit)' },
                { value: 'viewer', label: 'Viewer (Read-Only)' },
              ]}
            />

            <Button
              type="primary"
              onClick={handleSendInvite}
              loading={inviting}
              disabled={isMaxReached || !inviteUsername.trim()}
              icon={<RiUserAddLine />}
              style={{
                borderRadius: '8px',
                height: '38px',
                background: accent,
                borderColor: accent,
                fontWeight: 600,
                padding: '0 16px',
              }}
            >
              Send Invite
            </Button>
          </div>

          <div style={{ fontSize: '11px', color: textMuted }}>
            The invitee will receive an invitation in their Inbox and must accept it to join.
          </div>
        </div>
      )}

      {/* ── Members List ── */}
      {loading ? (
        <div style={{ padding: '36px 0', textAlign: 'center' }}>
          <Spin size="small" />
          <div style={{ fontSize: '12px', color: textMuted, marginTop: '8px' }}>
            Loading members...
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Active Members ({activeCount})
          </div>

          {/* 1. Space Owner Entry */}
          {effectiveOwner && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                background: itemBg,
                border: `1px solid ${itemBorder}`,
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                {renderAvatar(effectiveOwner, 34)}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: textColor }}>
                      {effectiveOwner.displayName || effectiveOwner.username || 'Space Owner'}
                    </span>
                    {effectiveOwner._id?.toString() === currentUserId && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.08)',
                          color: textMuted,
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: textMuted }}>
                    @{effectiveOwner.username}
                  </div>
                </div>
              </div>

              {/* Owner Badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '14px',
                  background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.18)',
                  color: accent,
                  border: `1px solid ${isLight ? 'rgba(79, 70, 229, 0.2)' : 'rgba(99, 102, 241, 0.3)'}`,
                  flexShrink: 0,
                }}
              >
                <RiShieldUserLine size={13} />
                Owner
              </span>
            </div>
          )}

          {/* 2. Active Collaborators */}
          {collaborators.length === 0 ? (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                borderRadius: '10px',
                background: isLight ? '#fcfcfc' : '#08080c',
                border: `1px dashed ${cardBorder}`,
                color: textMuted,
                fontSize: '12.5px',
              }}
            >
              No additional collaborators have joined this Space yet.
            </div>
          ) : (
            collaborators.map((c) => {
              const u = c.user || {};
              const isCurrentUser = (u._id || u.id)?.toString() === currentUserId;
              const isItemUpdating = roleUpdatingId === (u._id || u.id);
              const isItemRemoving = removingId === (u._id || u.id);

              return (
                <div
                  key={u._id || u.id || Math.random()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: itemBg,
                    border: `1px solid ${itemBorder}`,
                    gap: '12px',
                    opacity: isItemRemoving ? 0.5 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    {renderAvatar(u, 32)}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.displayName || u.username}
                        </span>
                        {isCurrentUser && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.08)',
                              color: textMuted,
                            }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: textMuted }}>
                        @{u.username}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Role */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {isOwner ? (
                      <Select
                        value={c.role || 'viewer'}
                        onChange={(newRole) => handleRoleChange(u._id || u.id, newRole)}
                        disabled={isItemUpdating || isItemRemoving}
                        size="small"
                        style={{ width: '105px' }}
                        options={[
                          { value: 'editor', label: 'Editor' },
                          { value: 'viewer', label: 'Viewer' },
                        ]}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: c.role === 'editor'
                            ? (isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)')
                            : (isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)'),
                          color: c.role === 'editor' ? accent : textMuted,
                          border: `1px solid ${cardBorder}`,
                          textTransform: 'capitalize',
                        }}
                      >
                        {c.role || 'viewer'}
                      </span>
                    )}

                    {/* Owner can remove collaborator */}
                    {isOwner && (
                      <Popconfirm
                        title="Remove Collaborator?"
                        description={`Are you sure you want to remove @${u.username}? They will immediately lose access.`}
                        onConfirm={() => handleRemoveCollaborator(u._id || u.id, u.username)}
                        okText="Remove"
                        okButtonProps={{ danger: true }}
                        placement="left"
                      >
                        <Tooltip title="Remove Collaborator">
                          <Button
                            type="text"
                            danger
                            size="small"
                            loading={isItemRemoving}
                            icon={<RiDeleteBinLine size={15} />}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '6px',
                            }}
                          />
                        </Tooltip>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* 3. Pending Invitations (Owner Only) */}
          {isOwner && pendingInvites.length > 0 && (
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Pending Invitations ({pendingInvites.length})
              </div>

              {pendingInvites.map((inv) => {
                const invitee = inv.invitee || {};
                const isCancelling = cancellingInviteId === inv._id;

                return (
                  <div
                    key={inv._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: isLight ? '#fefce8' : '#141410',
                      border: `1px solid ${isLight ? '#fef08a' : 'rgba(234, 179, 8, 0.2)'}`,
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      {renderAvatar(invitee, 30)}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>
                          @{invitee.username || 'user'}
                          {invitee.displayName && (
                            <span style={{ fontSize: '12px', color: textMuted, marginLeft: '6px' }}>
                              ({invitee.displayName})
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <RiTimeLine size={12} />
                          <span>Sent {timeAgo(inv.createdAt)} • Invited as <strong>{inv.role}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '10px',
                          background: 'rgba(234, 179, 8, 0.15)',
                          color: '#eab308',
                        }}
                      >
                        Pending
                      </span>

                      <Popconfirm
                        title="Cancel Invitation?"
                        description={`Cancel the pending invitation for @${invitee.username}?`}
                        onConfirm={() => handleCancelInvite(inv._id, invitee.username)}
                        okText="Cancel Invite"
                        okButtonProps={{ danger: true }}
                        placement="left"
                      >
                        <Button
                          size="small"
                          danger
                          loading={isCancelling}
                          style={{
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            height: '26px',
                          }}
                        >
                          Revoke
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Leave Space Action (Collaborator Only) */}
          {!isOwner && currentUserId && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '12px',
                background: isLight ? 'rgba(239, 68, 68, 0.04)' : 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                <RiLogoutBoxRLine size={16} />
                <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Leave this Space</span>
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: textMuted, lineHeight: 1.5 }}>
                You will immediately surrender collaborator access to <strong>{space?.name}</strong>. Notes, documents, and content you created will remain preserved in the Space.
              </p>

              <Popconfirm
                title="Leave this Space?"
                description="Are you sure you want to leave? You will need an invitation from the owner to rejoin."
                onConfirm={handleLeaveSpace}
                okText="Yes, Leave Space"
                okButtonProps={{ danger: true, loading: isLeaving }}
              >
                <Button
                  danger
                  type="primary"
                  loading={isLeaving}
                  icon={<RiLogoutBoxRLine />}
                  style={{
                    alignSelf: 'flex-start',
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '34px',
                    fontSize: '12.5px',
                  }}
                >
                  Leave Space
                </Button>
              </Popconfirm>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
