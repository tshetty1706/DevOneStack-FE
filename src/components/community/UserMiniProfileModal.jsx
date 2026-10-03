import React, { useState, useEffect } from 'react';
import { Modal, Spin, message, Button } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { communityApi } from '../../api/communityApi';
import PublicSpaceCard from './PublicSpaceCard';
import { RiUserFollowLine, RiUserUnfollowLine, RiFolder5Line, RiMapPinLine, RiGlobalLine, RiGithubLine } from 'react-icons/ri';

export default function UserMiniProfileModal({ username, visible, onClose, onFollowChange }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [followingState, setFollowingState] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (visible && username) {
      fetchProfile();
    } else {
      setProfileData(null);
    }
  }, [visible, username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await communityApi.getPublicProfile(username);
      setProfileData(res.user);
      setFollowingState(res.user?.isFollowing || false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not load user profile.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      message.info('Please log in to follow users.');
      return;
    }
    if (!profileData) return;

    try {
      setActionLoading(true);
      if (followingState) {
        await communityApi.unfollowUser(profileData._id);
        setFollowingState(false);
        setProfileData((prev) => ({ ...prev, followersCount: Math.max(0, (prev.followersCount || 1) - 1) }));
        message.success(`Unfollowed @${profileData.username}`);
      } else {
        await communityApi.followUser(profileData._id);
        setFollowingState(true);
        setProfileData((prev) => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }));
        message.success(`Following @${profileData.username}`);
      }
      if (onFollowChange) onFollowChange();
    } catch (err) {
      message.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const isSelf = user && profileData && (user._id === profileData._id || user.id === profileData._id || user.username === profileData.username);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      destroyOnClose
      styles={{
        content: {
          background: isLight ? '#ffffff' : '#111116',
          border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '16px',
          padding: '24px',
        },
        header: {
          background: 'transparent',
        },
      }}
    >
      {loading || !profileData ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Row: Avatar + Names + Follow Action */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: profileData.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a78bfa)',
                  border: `2px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#ffffff',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt={profileData.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (profileData.displayName?.[0] || profileData.username?.[0] || 'U').toUpperCase()
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-color)' }}>
                  {profileData.displayName || profileData.username}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>@{profileData.username}</span>
              </div>
            </div>

            {!isSelf && user && (
              <Button
                type={followingState ? 'default' : 'primary'}
                loading={actionLoading}
                onClick={handleToggleFollow}
                icon={followingState ? <RiUserUnfollowLine /> : <RiUserFollowLine />}
                style={{
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                {followingState ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>

          {/* Bio */}
          {profileData.bio && (
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: 'var(--text-color)' }}>
              {profileData.bio}
            </p>
          )}

          {/* Stats Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: isLight ? '#f9fafb' : '#08080c',
              border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <div>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-color)', display: 'block' }}>
                {profileData.followersCount || 0}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Followers</span>
            </div>
            <div style={{ width: '1px', height: '24px', background: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)' }} />
            <div>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-color)', display: 'block' }}>
                {profileData.followingCount || 0}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Following</span>
            </div>
            <div style={{ width: '1px', height: '24px', background: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)' }} />
            <div>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-color)', display: 'block' }}>
                {profileData.publicSpaces?.length || 0}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Public Spaces</span>
            </div>
          </div>

          {/* Public Spaces section */}
          {profileData.publicSpaces && profileData.publicSpaces.length > 0 && (
            <div>
              <h4 style={{ margin: '8px 0 10px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Public Spaces
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {profileData.publicSpaces.map((s) => (
                  <PublicSpaceCard key={s._id} space={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
