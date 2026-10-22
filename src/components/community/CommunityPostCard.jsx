import React, { useState, useEffect } from 'react';
import { Dropdown, message, Input, Button, Modal } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { communityApi } from '../../api/communityApi';
import { reportApi } from '../../api/reportApi';
import PublicSpaceCard from './PublicSpaceCard';
import UserMiniProfileModal from './UserMiniProfileModal';
import {
  RiHeartLine,
  RiHeartFill,
  RiChat1Line,
  RiLinkM,
  RiMoreFill,
  RiEditLine,
  RiDeleteBinLine,
  RiFlagLine,
  RiSendPlaneFill,
  RiUserFollowLine,
  RiUserUnfollowLine,
  RiReplyLine,
} from 'react-icons/ri';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSecs = Math.floor((now - date) / 1000);
  if (diffSecs < 60) return 'just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

function renderFormattedText(text) {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ color: '#6366f1', textDecoration: 'underline', wordBreak: 'break-all' }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function CommunityPostCard({ post, onPostDeleted, onPostUpdated, onFollowChange }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [followingAuthor, setFollowingAuthor] = useState(post.author?.isFollowing || false);
  const [followLoading, setFollowLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  // Single-level reply state
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || post.description || '');
  const [savingEdit, setSavingEdit] = useState(false);
  const [isExpandedText, setIsExpandedText] = useState(false);

  const [profileModalUser, setProfileModalUser] = useState(null);

  const author = post.author || {};
  const isAuthor = user && (user._id === author._id || user.id === author._id || user.username === author.username);

  // Sync state with post props
  useEffect(() => {
    if (post.isLiked !== undefined) setLiked(post.isLiked);
    if (post.likesCount !== undefined) setLikesCount(post.likesCount);
    if (post.commentsCount !== undefined) setCommentsCount(post.commentsCount);
    if (post.author?.isFollowing !== undefined) setFollowingAuthor(post.author.isFollowing);
  }, [post.isLiked, post.likesCount, post.commentsCount, post.author?.isFollowing]);

  const handleToggleLike = async () => {
    if (!user) {
      message.info('Please log in to like posts.');
      return;
    }
    if (likeLoading) return;

    // Optimistic update
    const prevLiked = liked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1;

    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      setLikeLoading(true);
      const res = await communityApi.toggleLikePost(post._id);
      setLiked(res.isLiked);
      setLikesCount(res.likesCount);
      if (onPostUpdated) {
        onPostUpdated({ ...post, isLiked: res.isLiked, likesCount: res.likesCount });
      }
    } catch (err) {
      // Revert on error
      setLiked(prevLiked);
      setLikesCount(prevCount);
      message.error(err.response?.data?.message || 'Failed to update like.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      message.info('Please log in to follow users.');
      return;
    }
    if (!author._id) return;

    try {
      setFollowLoading(true);
      if (followingAuthor) {
        await communityApi.unfollowUser(author._id);
        setFollowingAuthor(false);
        message.success(`Unfollowed @${author.username}`);
      } else {
        await communityApi.followUser(author._id);
        setFollowingAuthor(true);
        message.success(`Following @${author.username}`);
      }
      if (onFollowChange) onFollowChange();
    } catch (err) {
      message.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setFollowLoading(false);
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      setShowComments(true);
      try {
        setCommentsLoading(true);
        const res = await communityApi.getPostComments(post._id);
        setComments(res.comments || []);
      } catch (err) {
        message.error('Could not load comments.');
      } finally {
        setCommentsLoading(false);
      }
    } else {
      setShowComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      message.info('Please log in to comment.');
      return;
    }
    const trimmed = newCommentText.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) {
      message.error('Comment must not exceed 500 characters.');
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await communityApi.createPostComment(post._id, { text: trimmed });
      const newComment = res?.comment || res;
      if (newComment && (newComment._id || newComment.text)) {
        setComments((prev) => [newComment, ...prev.filter(Boolean)]);
        setCommentsCount((prev) => prev + 1);
        setNewCommentText('');
        message.success('Comment posted.');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReply = async (parentCommentId) => {
    if (!user) {
      message.info('Please log in to reply.');
      return;
    }
    const trimmed = replyText.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) {
      message.error('Reply must not exceed 500 characters.');
      return;
    }

    try {
      setSubmittingReply(true);
      const res = await communityApi.createPostComment(post._id, { text: trimmed, parentCommentId });
      const newReply = res?.comment || res;
      if (newReply && (newReply._id || newReply.text)) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === parentCommentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply],
              };
            }
            return c;
          })
        );
        setCommentsCount((prev) => prev + 1);
        setReplyText('');
        setReplyingToCommentId(null);
        message.success('Reply posted.');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteComment = async (commentId, parentCommentId = null) => {
    try {
      await communityApi.deletePostComment(commentId);
      if (parentCommentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === parentCommentId) {
              return {
                ...c,
                replies: (c.replies || []).filter((r) => r._id !== commentId),
              };
            }
            return c;
          })
        );
        setCommentsCount((prev) => Math.max(0, prev - 1));
      } else {
        const deletedComment = comments.find((c) => c._id === commentId);
        const replyCount = (deletedComment?.replies || []).length;
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setCommentsCount((prev) => Math.max(0, prev - 1 - replyCount));
      }
      message.success('Comment deleted.');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    try {
      setSavingEdit(true);
      const res = await communityApi.updatePost(post._id, { text: trimmed });
      setIsEditing(false);
      if (onPostUpdated) onPostUpdated(res.post);
      message.success('Post updated.');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update post.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePost = () => {
    Modal.confirm({
      title: 'Delete Post',
      content: 'Are you sure you want to delete this post? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await communityApi.deletePost(post._id);
          message.success('Post deleted.');
          if (onPostDeleted) onPostDeleted(post._id);
        } catch (err) {
          message.error(err.response?.data?.message || 'Failed to delete post.');
        }
      },
    });
  };

  const handleReportPost = () => {
    Modal.confirm({
      title: 'Report Content',
      content: 'Report this post for violating community guidelines?',
      okText: 'Report',
      onOk: async () => {
        try {
          await reportApi.createReport({ targetType: 'post', targetId: post._id, reason: 'inappropriate' });
          message.success('Report submitted. Thank you for keeping our community safe.');
        } catch (err) {
          message.error('Failed to submit report.');
        }
      },
    });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/community?post=${post._id}`;
    navigator.clipboard.writeText(url);
    message.success('Link copied to clipboard!');
  };

  const menuItems = [];
  if (isAuthor) {
    menuItems.push(
      {
        key: 'edit',
        label: 'Edit post',
        icon: <RiEditLine />,
        onClick: () => setIsEditing(true),
      },
      {
        key: 'delete',
        label: 'Delete post',
        icon: <RiDeleteBinLine />,
        danger: true,
        onClick: handleDeletePost,
      }
    );
  } else {
    menuItems.push({
      key: 'report',
      label: 'Report post',
      icon: <RiFlagLine />,
      danger: true,
      onClick: handleReportPost,
    });
  }

  return (
    <div
      style={{
        background: isLight ? '#ffffff' : '#111218',
        border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.07)'}`,
        borderRadius: '16px',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.07)';
      }}
    >
      {/* Top Header: Author + Follow Button + Menu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => setProfileModalUser(author.username)}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: author.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a78bfa)',
              border: `2px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: '#ffffff',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt={author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (author.displayName?.[0] || author.username?.[0] || 'U').toUpperCase()
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '14.5px', color: isLight ? '#0f172a' : '#ffffff' }}>
                {author.displayName || author.username}
              </span>
              <span style={{ fontSize: '13px', color: isLight ? '#64748b' : '#94a3b8' }}>
                @{author.username}
              </span>
              <span style={{ fontSize: '12px', color: isLight ? '#94a3b8' : '#64748b' }}>•</span>
              <span style={{ fontSize: '12.5px', color: isLight ? '#64748b' : '#94a3b8' }}>
                {formatRelativeTime(post.createdAt)}
              </span>
              {post.isEdited && (
                <span style={{ fontSize: '11px', color: isLight ? '#94a3b8' : '#64748b', fontStyle: 'italic' }}>
                  (edited)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Follow button + Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isAuthor && user && (
            <button
              type="button"
              disabled={followLoading}
              onClick={handleToggleFollow}
              style={{
                padding: '4px 14px',
                borderRadius: '8px',
                background: followingAuthor ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                border: `1px solid ${followingAuthor ? (isLight ? '#cbd5e1' : 'rgba(255,255,255,0.15)') : 'rgba(99, 102, 241, 0.4)'}`,
                color: followingAuthor ? (isLight ? '#64748b' : '#94a3b8') : (isLight ? '#4f46e5' : '#818cf8'),
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: followLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {followingAuthor ? 'Following' : 'Follow'}
            </button>
          )}

          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: isLight ? '#64748b' : '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RiMoreFill size={18} />
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Post Text Body */}
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Input.TextArea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={500}
            autoSize={{ minRows: 3, maxRows: 10 }}
            showCount
            style={{
              background: isLight ? '#f8fafc' : '#0a0b10',
              border: `1px solid ${isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)'}`,
              color: 'var(--text-color)',
              borderRadius: '10px',
              lineHeight: 1.55,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button size="small" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="small" type="primary" loading={savingEdit} onClick={handleSaveEdit}>
              Save
            </Button>
          </div>
        </div>
      ) : (() => {
        const postContent = post.text || post.description || post.content || '';
        const isLongText = postContent.length > 260 || (postContent.match(/\n/g) || []).length > 3;
        const displayContent = (!isLongText || isExpandedText)
          ? postContent
          : postContent.slice(0, 240) + '...';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p
              style={{
                margin: 0,
                fontSize: '14.5px',
                lineHeight: 1.6,
                color: isLight ? '#1e293b' : '#e2e8f0',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {renderFormattedText(displayContent)}
            </p>
            {isLongText && (
              <button
                type="button"
                onClick={() => setIsExpandedText(!isExpandedText)}
                style={{
                  alignSelf: 'flex-start',
                  background: 'transparent',
                  border: 'none',
                  padding: '2px 0',
                  color: isLight ? '#4f46e5' : '#818cf8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isExpandedText ? 'Show less' : 'Read full post'}
              </button>
            )}
          </div>
        );
      })()}

      {/* Attached Post Image */}
      {post.imageUrl && (
        <div
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
            maxHeight: '440px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isLight ? '#f1f5f9' : '#08080c',
            marginTop: '2px',
          }}
        >
          <img
            src={post.imageUrl}
            alt="Post attachment"
            style={{ width: '100%', height: 'auto', maxHeight: '440px', objectFit: 'contain', display: 'block' }}
          />
        </div>
      )}

      {/* Attached Space Card */}
      {(post.space || post.spaceId) && (
        <div style={{ marginTop: '2px' }}>
          <PublicSpaceCard space={post.space || post.spaceId} />
        </div>
      )}

      {/* Interaction Row: Likes, Comments, Share */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          paddingTop: '6px',
        }}
      >
        <button
          type="button"
          onClick={handleToggleLike}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            color: liked ? '#ef4444' : (isLight ? '#64748b' : '#94a3b8'),
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: liked ? 600 : 500,
            padding: 0,
            transition: 'color 0.15s ease',
          }}
        >
          {liked ? <RiHeartFill size={17} color="#ef4444" /> : <RiHeartLine size={17} />}
          <span>{likesCount}</span>
        </button>

        <button
          type="button"
          onClick={loadComments}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            color: isLight ? '#64748b' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '13px',
            padding: 0,
            transition: 'color 0.15s ease',
          }}
        >
          <RiChat1Line size={17} />
          <span>{commentsCount}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            color: isLight ? '#64748b' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '13px',
            padding: 0,
            transition: 'color 0.15s ease',
          }}
        >
          <RiLinkM size={17} />
        </button>
      </div>

      {/* Comments Drawer / Section */}
      {showComments && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingTop: '12px',
            borderTop: `1px solid ${isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          {/* Add comment box */}
          {user ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                placeholder="Write a comment (max 500 chars)..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                maxLength={500}
                onPressEnter={handleAddComment}
                style={{
                  background: isLight ? '#f8fafc' : '#0a0b10',
                  border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                  color: 'var(--text-color)',
                  borderRadius: '10px',
                  padding: '6px 14px',
                }}
              />
              <Button
                type="primary"
                icon={<RiSendPlaneFill />}
                loading={submittingComment}
                onClick={handleAddComment}
                style={{ borderRadius: '8px' }}
              />
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Please log in to leave a comment.
            </p>
          )}

          {/* Comments list */}
          {commentsLoading ? (
            <div style={{ padding: '12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ padding: '8px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              No comments yet. Be the first to start the conversation!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {comments.filter(Boolean).map((comment) => {
                const commentAuthor = (comment && typeof comment.author === 'object' && comment.author) || {};
                const canDelete =
                  user &&
                  (user._id === commentAuthor._id ||
                    user.id === commentAuthor._id ||
                    user._id === author?._id ||
                    user.id === author?._id);

                return (
                  <div
                    key={comment._id || Math.random()}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: isLight ? '#f8fafc' : '#0a0b10',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {(commentAuthor.displayName?.[0] || commentAuthor.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-color)' }}>
                            {commentAuthor.displayName || commentAuthor.username || 'Community Member'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                            title="Delete comment"
                          >
                            <RiDeleteBinLine size={13} />
                          </button>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-color)', lineHeight: 1.45, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                        {renderFormattedText(comment.text)}
                      </p>

                      {/* Reply button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                        {user && (
                          <button
                            type="button"
                            onClick={() => {
                              if (replyingToCommentId === comment._id) {
                                setReplyingToCommentId(null);
                                setReplyText('');
                              } else {
                                setReplyingToCommentId(comment._id);
                                setReplyText('');
                              }
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: isLight ? '#4f46e5' : '#818cf8',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <RiReplyLine size={13} />
                            <span>{replyingToCommentId === comment._id ? 'Cancel' : 'Reply'}</span>
                          </button>
                        )}
                      </div>

                      {/* Active Reply Input */}
                      {replyingToCommentId === comment._id && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <Input
                            size="small"
                            placeholder={`Reply to ${commentAuthor.displayName || commentAuthor.username || 'comment'}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            maxLength={500}
                            onPressEnter={() => handleAddReply(comment._id)}
                            style={{
                              background: isLight ? '#ffffff' : '#14151d',
                              border: `1px solid ${isLight ? '#cbd5e1' : 'rgba(255,255,255,0.12)'}`,
                              color: 'var(--text-color)',
                              borderRadius: '6px',
                              fontSize: '12px',
                            }}
                          />
                          <Button
                            size="small"
                            type="primary"
                            loading={submittingReply}
                            onClick={() => handleAddReply(comment._id)}
                            style={{ borderRadius: '6px', fontSize: '11.5px' }}
                          >
                            Reply
                          </Button>
                        </div>
                      )}

                      {/* 1-level replies thread */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          marginTop: '10px',
                          paddingLeft: '10px',
                          borderLeft: `2px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                        }}>
                          {comment.replies.map((reply) => {
                            const replyAuthor = (reply && typeof reply.author === 'object' && reply.author) || {};
                            const canDeleteReply =
                              user &&
                              (user._id === replyAuthor._id ||
                                user.id === replyAuthor._id ||
                                user._id === author?._id ||
                                user.id === author?._id);

                            return (
                              <div
                                key={reply._id || Math.random()}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  background: isLight ? '#ffffff' : '#14151d',
                                  border: `1px solid ${isLight ? '#edf2f7' : 'rgba(255,255,255,0.04)'}`,
                                }}
                              >
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#fff',
                                    flexShrink: 0,
                                  }}
                                >
                                  {(replyAuthor.displayName?.[0] || replyAuthor.username?.[0] || 'U').toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontWeight: 600, fontSize: '11.5px', color: 'var(--text-color)' }}>
                                        {replyAuthor.displayName || replyAuthor.username || 'Community Member'}
                                      </span>
                                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                                        {formatRelativeTime(reply.createdAt)}
                                      </span>
                                    </div>
                                    {canDeleteReply && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(reply._id, comment._id)}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          color: 'var(--text-secondary)',
                                          cursor: 'pointer',
                                          padding: '2px',
                                        }}
                                        title="Delete reply"
                                      >
                                        <RiDeleteBinLine size={12} />
                                      </button>
                                    )}
                                  </div>
                                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: 'var(--text-color)', lineHeight: 1.45, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                    {renderFormattedText(reply.text)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mini Profile Modal */}
      {profileModalUser && (
        <UserMiniProfileModal
          username={profileModalUser}
          visible={!!profileModalUser}
          onClose={() => setProfileModalUser(null)}
        />
      )}
    </div>
  );
}
