import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, message, Select, Spin, Empty, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { communityApi } from '../api/communityApi';
import { spacesApi } from '../api/spacesApi';
import { inboxApi } from '../api/inboxApi';
import CommunityPostCard from '../components/community/CommunityPostCard';
import InboxModal from '../components/inbox/InboxModal';
import UserMiniProfileModal from '../components/community/UserMiniProfileModal';
import Logo from '../components/layout/Logo';
import {
  RiSearchLine,
  RiNotification3Line,
  RiCompassLine,
  RiUserFollowLine,
  RiImageLine,
  RiLinkM,
  RiSendPlaneFill,
  RiFolderLine,
  RiStarFill,
  RiEyeLine,
  RiDatabase2Line,
  RiCodeSSlashLine,
  RiServerLine,
  RiTerminalBoxLine,
  RiStackLine,
  RiAddLine,
  RiCloseLine,
  RiEditLine,
} from 'react-icons/ri';

const POPULAR_TOPICS = [
  'All',
  'Web Development',
  'DevOps',
  'System Design',
  'Mobile Development',
  'Data Science',
  'AI/ML',
  'Cloud',
  'Cybersecurity',
  'Programming',
];

const TRENDING_ICONS = [RiDatabase2Line, RiStackLine, RiTerminalBoxLine, RiCodeSSlashLine, RiServerLine];
const TRENDING_ICON_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];
const TRENDING_ICON_BGS = [
  'rgba(59, 130, 246, 0.15)',
  'rgba(16, 185, 129, 0.15)',
  'rgba(139, 92, 246, 0.15)',
  'rgba(236, 72, 153, 0.15)',
  'rgba(245, 158, 11, 0.15)',
];

function formatMetric(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}

export default function Community() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';
  const composerInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('following'); // 'following' | 'discover'
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Composer Form
  const [newPostText, setNewPostText] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const [showSpaceSelector, setShowSpaceSelector] = useState(false);
  const [attachedImageFile, setAttachedImageFile] = useState(null);
  const [attachedImagePreview, setAttachedImagePreview] = useState('');
  const [myPublicSpaces, setMyPublicSpaces] = useState([]);
  const [submittingPost, setSubmittingPost] = useState(false);

  // Trending Spaces
  const [trendingSpaces, setTrendingSpaces] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Inbox Modal & Unread count
  const [inboxOpen, setInboxOpen] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

  // Profile Preview Modal
  const [previewUser, setPreviewUser] = useState(null);

  useEffect(() => {
    fetchPosts(1, activeTab, true);
    fetchTrendingSpaces();
    if (user) {
      fetchMyPublicSpaces();
      inboxApi.getUnreadCount()
        .then((data) => setUnreadTotal(data.totalUnread || 0))
        .catch(() => {});
    }
  }, [activeTab, user]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error('Image size must not exceed 10MB.');
      return;
    }

    setAttachedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAttachedImagePreview(previewUrl);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setAttachedImageFile(null);
    if (attachedImagePreview) {
      URL.revokeObjectURL(attachedImagePreview);
    }
    setAttachedImagePreview('');
  };

  const fetchMyPublicSpaces = async () => {
    try {
      const res = await spacesApi.getSpaces({ visibility: 'public' });
      const userSpaces = (res.spaces || res || []).filter(
        (s) => s.visibility === 'public' && (s.owner?._id === user?._id || s.owner === user?._id || s.owner === user?.id)
      );
      setMyPublicSpaces(userSpaces);
    } catch (e) {
      console.error('Failed to load owned public spaces', e);
    }
  };

  const fetchTrendingSpaces = async () => {
    try {
      setLoadingTrending(true);
      const res = await communityApi.getDiscoverSpaces({ limit: 5 });
      setTrendingSpaces(res.spaces || []);
    } catch (e) {
      console.error('Failed to load trending spaces', e);
    } finally {
      setLoadingTrending(false);
    }
  };

  const fetchPosts = async (pageNum, tab, reset = false) => {
    try {
      setLoadingPosts(true);
      const res = await communityApi.getFeed({ tab, page: pageNum, limit: 10 });
      const newItems = res.posts || [];
      if (reset) {
        setPosts(newItems);
      } else {
        setPosts((prev) => [...prev, ...newItems]);
      }
      setHasMore(newItems.length === 10);
      setPage(pageNum);
    } catch (err) {
      message.error('Failed to load community feed.');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      message.info('Please log in to share with the community.');
      navigate('/login');
      return;
    }

    const trimmed = newPostText.trim();
    if (!trimmed && !attachedImageFile) {
      message.warning('Please write what is on your mind or attach an image.');
      return;
    }

    if (trimmed.length > 500) {
      message.error('Post text cannot exceed 500 characters.');
      return;
    }

    try {
      setSubmittingPost(true);
      let uploadedImageUrl = '';
      if (attachedImageFile) {
        const uploadRes = await communityApi.uploadImage(attachedImageFile);
        uploadedImageUrl = uploadRes.imageUrl || '';
      }

      const res = await communityApi.createPost({
        text: trimmed || 'Shared an image',
        spaceId: selectedSpaceId || undefined,
        imageUrl: uploadedImageUrl || undefined,
      });
      message.success('Post published to Community!');
      setNewPostText('');
      setSelectedSpaceId(null);
      setShowSpaceSelector(false);
      handleRemoveImage();
      const createdPost = res.post || res;
      setPosts((prev) => [createdPost, ...prev]);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleFocusComposer = () => {
    if (composerInputRef.current) {
      composerInputRef.current.focus();
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  // Filter posts by search query or topic if selected
  const filteredPosts = posts.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = p.text?.toLowerCase().includes(q);
      const matchAuthor = p.author?.username?.toLowerCase().includes(q) || p.author?.displayName?.toLowerCase().includes(q);
      const matchSpace = p.spaceId?.name?.toLowerCase().includes(q) || p.spaceId?.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchText && !matchAuthor && !matchSpace) return false;
    }
    if (selectedTopic !== 'All') {
      const topicLower = selectedTopic.toLowerCase();
      const matchText = p.text?.toLowerCase().includes(topicLower);
      const matchTags = p.spaceId?.tags?.some(t => t.toLowerCase().includes(topicLower));
      if (!matchText && !matchTags) return false;
    }
    return true;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isLight ? '#f8fafc' : '#08080c',
        color: 'var(--text-color)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          height: '64px',
          borderBottom: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)'}`,
          background: isLight ? '#ffffff' : '#08080c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(16px, 3.5vw, 36px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Logo />
        </div>

        {/* Center: Search input with ⌘K */}
        <div style={{ flex: 1, maxWidth: '440px', margin: '0 20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 12px',
              height: '38px',
              borderRadius: '20px',
              background: isLight ? '#f1f5f9' : '#12131a',
              border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
            }}
          >
            <RiSearchLine size={15} color={isLight ? '#94a3b8' : '#64748b'} />
            <input
              type="text"
              placeholder="Search posts, spaces, users, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                color: isLight ? '#0f172a' : '#ffffff',
                fontFamily: 'var(--font-body)',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: isLight ? '#e2e8f0' : '#1c1d26',
                color: isLight ? '#64748b' : '#94a3b8',
                fontWeight: 600,
              }}
            >
              ⌘ K
            </span>
          </div>
        </div>

        {/* Right: Notifications, Avatar, Create Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Tooltip title="Inbox">
            <button
              type="button"
              onClick={() => setInboxOpen(true)}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isLight ? '#475569' : '#94a3b8',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RiNotification3Line size={20} />
              {unreadTotal > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#ef4444',
                  }}
                />
              )}
            </button>
          </Tooltip>

          {/* User Avatar */}
          {user && (
            <div
              onClick={() => setPreviewUser(user.username)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: user.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a78bfa)',
                border: `2px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (user.displayName?.[0] || user.username?.[0] || 'U').toUpperCase()
              )}
            </div>
          )}

          {/* Create Post Button */}
          <button
            type="button"
            onClick={handleFocusComposer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
              transition: 'opacity 0.2s',
            }}
          >
            <RiEditLine size={15} />
            <span>Create</span>
          </button>
        </div>
      </header>

      {/* Main Grid Layout Container */}
      <div
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px 60px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '28px',
          boxSizing: 'border-box',
        }}
        className="community-page-container"
      >
        {/* Left Column: Title, Subtitle, Tabs, Composer, Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {/* Main Title & Subtitle Header */}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: 800,
                color: isLight ? '#0f172a' : '#ffffff',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
              }}
            >
              Community
            </h1>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: '14px',
                color: isLight ? '#64748b' : '#94a3b8',
                lineHeight: 1.5,
              }}
            >
              Share your knowledge, discover amazing developer content, and connect with other builders.
            </p>
          </div>

          {/* Underline Tabs: Following vs Discover */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              borderBottom: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
              paddingBottom: '2px',
            }}
          >
            {[
              { key: 'following', label: 'Following' },
              { key: 'discover', label: 'Discover' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    if (tab.key === 'following' && !user) {
                      message.info('Log in to view posts from people you follow.');
                      navigate('/login');
                      return;
                    }
                    setActiveTab(tab.key);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 4px 12px',
                    fontSize: '14.5px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? (isLight ? '#4f46e5' : '#ffffff') : (isLight ? '#64748b' : '#94a3b8'),
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'color 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        left: 0,
                        right: 0,
                        height: '2.5px',
                        background: isLight ? '#4f46e5' : '#6366f1',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Composer Box ("What's on your mind?") */}
          {user && (
            <div
              style={{
                background: isLight ? '#ffffff' : '#111218',
                border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: user.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a78bfa)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#ffffff',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user.displayName?.[0] || user.username?.[0] || 'U').toUpperCase()
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <Input.TextArea
                    ref={composerInputRef}
                    placeholder="What's on your mind?"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    maxLength={500}
                    rows={2}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      padding: '4px 0',
                      fontSize: '14.5px',
                      color: isLight ? '#0f172a' : '#ffffff',
                      resize: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Attached Image Preview */}
              {attachedImagePreview && (
                <div
                  style={{
                    position: 'relative',
                    width: 'fit-content',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: isLight ? '#f1f5f9' : '#08080c',
                    maxHeight: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={attachedImagePreview}
                    alt="Upload preview"
                    style={{
                      maxHeight: '200px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      borderRadius: '12px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.75)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <RiCloseLine size={16} />
                  </button>
                </div>
              )}

              {/* Space Selector Row if open */}
              {showSpaceSelector && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: isLight ? '#f8fafc' : '#090a0f',
                    border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                  }}
                >
                  <RiFolderLine size={16} color="var(--accent-color)" />
                  <Select
                    placeholder="Select a public Space to attach..."
                    value={selectedSpaceId}
                    onChange={setSelectedSpaceId}
                    allowClear
                    style={{ flex: 1 }}
                    options={myPublicSpaces.map((s) => ({
                      value: s._id,
                      label: `${s.name} (${s.tags?.slice(0, 2).join(', ') || 'Space'})`,
                    }))}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpaceId(null);
                      setShowSpaceSelector(false);
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    <RiCloseLine size={18} />
                  </button>
                </div>
              )}

              {/* Bottom Actions inside Composer Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: `1px solid ${isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)'}`,
                }}
              >
                {/* Media & Link Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Hidden image input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />

                  <Tooltip title="Attach image">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: attachedImageFile ? 'var(--accent-color)' : (isLight ? '#64748b' : '#94a3b8'),
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      <RiImageLine size={18} />
                    </button>
                  </Tooltip>

                  <Tooltip title="Attach Public Space">
                    <button
                      type="button"
                      onClick={() => setShowSpaceSelector(!showSpaceSelector)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: showSpaceSelector || selectedSpaceId ? 'var(--accent-color)' : (isLight ? '#64748b' : '#94a3b8'),
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <RiLinkM size={18} />
                    </button>
                  </Tooltip>
                </div>

                {/* Counter + Post Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: isLight ? '#94a3b8' : '#64748b' }}>
                    {newPostText.length}/500
                  </span>

                  <button
                    type="button"
                    disabled={!newPostText.trim() || submittingPost}
                    onClick={handleCreatePost}
                    style={{
                      padding: '5px 18px',
                      borderRadius: '8px',
                      background: newPostText.trim() ? (isLight ? '#4f46e5' : '#6366f1') : (isLight ? '#cbd5e1' : '#1f202b'),
                      color: newPostText.trim() ? '#ffffff' : (isLight ? '#94a3b8' : '#4b5563'),
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: newPostText.trim() && !submittingPost ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {submittingPost ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts Feed List */}
          {loadingPosts && posts.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <Spin size="large" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div
              style={{
                background: isLight ? '#ffffff' : '#111218',
                border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <Empty
                description={
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {activeTab === 'following'
                      ? 'No posts from people you follow yet. Check out Discover to find creators!'
                      : 'No posts found. Share your ideas or check back later!'}
                  </span>
                }
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredPosts.map((post) => (
                <CommunityPostCard
                  key={post._id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                  onFollowChange={() => fetchPosts(1, activeTab, true)}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div style={{ textAlign: 'center', paddingTop: '12px' }}>
                  <Button
                    loading={loadingPosts}
                    onClick={() => fetchPosts(page + 1, activeTab, false)}
                    style={{
                      borderRadius: '20px',
                      padding: '0 24px',
                      fontWeight: 600,
                    }}
                  >
                    Load More Posts
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Trending Spaces & Popular Topics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Widget 1: Trending Spaces */}
          <div
            style={{
              background: isLight ? '#ffffff' : '#111218',
              border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.07)'}`,
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: isLight ? '#0f172a' : '#ffffff' }}>
                Trending Spaces
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isLight ? '#4f46e5' : '#818cf8',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                View all
              </button>
            </div>

            {loadingTrending ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <Spin size="small" />
              </div>
            ) : trendingSpaces.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                No trending spaces yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trendingSpaces.map((s, idx) => {
                  const IconComponent = TRENDING_ICONS[idx % TRENDING_ICONS.length];
                  const iconCol = TRENDING_ICON_COLORS[idx % TRENDING_ICON_COLORS.length];
                  const iconBg = TRENDING_ICON_BGS[idx % TRENDING_ICON_BGS.length];

                  return (
                    <div
                      key={s._id}
                      onClick={() => navigate(user ? `/u/${encodeURIComponent(user.username || 'user')}/spaces/${s._id}` : '/login')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '6px 4px',
                        borderRadius: '8px',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Icon + Title + Author */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: iconBg,
                            color: iconCol,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent size={18} />
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 600,
                              color: isLight ? '#0f172a' : '#ffffff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {s.name}
                          </div>
                          <div style={{ fontSize: '12px', color: isLight ? '#64748b' : '#94a3b8' }}>
                            @{s.owner?.username || s.ownerUsername || 'creator'}
                          </div>
                        </div>
                      </div>

                      {/* Right Metrics: Stars + Views */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: isLight ? '#64748b' : '#94a3b8', flexShrink: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <RiStarFill size={12} color="#f59e0b" />
                          {formatMetric(s.starsCount || 0)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <RiEyeLine size={13} />
                          {formatMetric(s.viewsCount || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Widget 2: Popular Topics */}
          <div
            style={{
              background: isLight ? '#ffffff' : '#111218',
              border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.07)'}`,
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: isLight ? '#0f172a' : '#ffffff' }}>
                Popular Topics
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTopic('All')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isLight ? '#4f46e5' : '#818cf8',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                View all
              </button>
            </div>

            {/* Topics Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {POPULAR_TOPICS.map((topic) => {
                const isSelected = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: isSelected
                        ? '1px solid var(--accent-color)'
                        : `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                      background: isSelected
                        ? (isLight ? '#4f46e5' : '#6366f1')
                        : (isLight ? '#f1f5f9' : '#1a1b24'),
                      color: isSelected ? '#ffffff' : (isLight ? '#475569' : '#cbd5e1'),
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Global Inbox Modal */}
      <InboxModal visible={inboxOpen} onClose={() => setInboxOpen(false)} onUnreadCountChange={setUnreadTotal} />

      {/* Profile Modal */}
      {previewUser && (
        <UserMiniProfileModal
          username={previewUser}
          visible={!!previewUser}
          onClose={() => setPreviewUser(null)}
        />
      )}
    </div>
  );
}
