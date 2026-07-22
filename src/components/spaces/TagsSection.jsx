import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Button, Popconfirm, Skeleton, Select, Tooltip, message } from 'antd';
import {
  RiPriceTag3Line, RiEditLine, RiDeleteBinLine, RiArrowRightUpLine,
  RiSearchLine, RiArrowLeftLine, RiLightbulbLine, RiCodeSSlashLine,
  RiFileTextLine, RiGitRepositoryLine, RiRobot2Line, RiTeamLine,
  RiHashtag, RiLockLine, RiRocketLine, RiArrowLeftSLine, RiArrowRightSLine,
  RiMore2Fill, RiCloseLine
} from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import SnippetViewModal from './modals/SnippetViewModal';

const TAG_CARD_COLORS = [
  { iconBg: 'rgba(99, 102, 241, 0.15)', iconColor: '#818cf8', border: 'rgba(99, 102, 241, 0.3)', accent: '#6366f1' },
  { iconBg: 'rgba(59, 130, 246, 0.15)', iconColor: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)', accent: '#3b82f6' },
  { iconBg: 'rgba(16, 185, 129, 0.15)', iconColor: '#34d399', border: 'rgba(16, 185, 129, 0.3)', accent: '#10b981' },
  { iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', accent: '#f59e0b' },
  { iconBg: 'rgba(236, 72, 153, 0.15)', iconColor: '#f472b6', border: 'rgba(236, 72, 153, 0.3)', accent: '#ec4899' },
  { iconBg: 'rgba(139, 92, 246, 0.15)', iconColor: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)', accent: '#8b5cf6' },
  { iconBg: 'rgba(6, 182, 212, 0.15)', iconColor: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)', accent: '#06b6d4' },
  { iconBg: 'rgba(249, 115, 22, 0.15)', iconColor: '#fb923c', border: 'rgba(249, 115, 22, 0.3)', accent: '#f97316' },
];

const getTagColor = (index) => TAG_CARD_COLORS[index % TAG_CARD_COLORS.length];

const getTagIcon = (tagName) => {
  const lower = (tagName || '').toLowerCase();
  if (lower.includes('auth') || lower.includes('security') || lower.includes('login') || lower.includes('pass')) {
    return RiLockLine;
  }
  if (lower.includes('perf') || lower.includes('speed') || lower.includes('fast') || lower.includes('opt')) {
    return RiRocketLine;
  }
  if (lower.includes('hook') || lower.includes('react') || lower.includes('component') || lower.includes('code')) {
    return RiCodeSSlashLine;
  }
  return RiHashtag;
};

const formatDateAgo = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffInDays <= 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  const months = Math.floor(diffInDays / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
};

export default function TagsSection({ space, isLight }) {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [tagToRename, setTagToRename] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [viewSnippet, setViewSnippet] = useState(null);

  const carouselRef = useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const handleDocOpen = async (doc) => {
    if (doc.type === 'url') {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (doc.type === 'pdf') {
      api.get(`/api/spaces/${space._id}/docs/${doc._id}/file`, { responseType: 'blob' })
        .then(response => {
          const blob = response.data;
          const blobUrl = URL.createObjectURL(blob);
          const tab = window.open(blobUrl, '_blank');
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
          if (!tab) {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.target = '_blank';
            a.click();
          }
        })
        .catch(() => message.error('Could not open PDF. Try again.'));
      return;
    }

    setSearchParams({ section: 'docs', id: doc._id });
  };

  // Fetch unique tags in space
  const { data: tagData, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', space._id],
    queryFn: async () => {
      const { data } = await api.get(`/api/spaces/${space._id}/tags`);
      return data.tags || [];
    }
  });

  const tags = tagData || [];

  // Automatically select top tag if none is selected
  useEffect(() => {
    if (!selectedTag && tags.length > 0) {
      setSelectedTag(tags[0].tag);
    }
  }, [tags]);

  // Filter tags based on search query and type filter
  const filteredTags = tags.filter(t => {
    const matchesSearch = !searchQuery.trim() || t.tag.toLowerCase().includes(searchQuery.toLowerCase().trim());
    if (!matchesSearch) return false;
    if (typeFilter === 'all') return true;
    const bd = t.breakdown || {};
    return (bd[typeFilter] || 0) > 0 || (t.sources && t.sources.includes(typeFilter));
  });

  // Fetch tag content matching selected tag
  const { data: tagContent, isLoading: contentLoading } = useQuery({
    queryKey: ['tagContent', space._id, selectedTag],
    queryFn: async () => {
      if (!selectedTag) return null;
      const { data } = await api.get(`/api/spaces/${space._id}/tags/${encodeURIComponent(selectedTag)}/content`);
      return data;
    },
    enabled: !!selectedTag
  });

  // Rename tag mutation (preserving exact process)
  const renameMutation = useMutation({
    mutationFn: async ({ oldTag, newTag }) => {
      return api.patch(`/api/spaces/${space._id}/tags/rename`, { oldTag, newTag });
    },
    onSuccess: () => {
      message.success('Tag renamed successfully');
      queryClient.invalidateQueries(['tags', space._id]);
      if (selectedTag === tagToRename) {
        setSelectedTag(newTagName.trim().toLowerCase());
      }
      setRenameModalOpen(false);
      setNewTagName('');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to rename tag');
    }
  });

  // Delete tag mutation (preserving exact process)
  const deleteMutation = useMutation({
    mutationFn: async (tag) => {
      return api.delete(`/api/spaces/${space._id}/tags/${encodeURIComponent(tag)}`);
    },
    onSuccess: (data, deletedTag) => {
      message.success('Tag deleted from all resources');
      queryClient.invalidateQueries(['tags', space._id]);
      if (selectedTag === deletedTag) {
        const remaining = tags.filter(t => t.tag !== deletedTag);
        setSelectedTag(remaining.length > 0 ? remaining[0].tag : null);
      }
    }
  });

  const handleRenameSubmit = () => {
    if (!newTagName.trim()) {
      message.error('New tag name is required');
      return;
    }
    renameMutation.mutate({ oldTag: tagToRename, newTag: newTagName });
  };

  return (
    <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: isLight ? '#111827' : '#ffffff', letterSpacing: '-0.02em' }}>
            Tags
          </h1>
          <p style={{ fontSize: '13px', color: isLight ? '#6b7280' : '#9ca3af', margin: '4px 0 0' }}>
            Organize and discover everything in your {space?.name || 'React'} workspace
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Input
            prefix={<RiSearchLine style={{ color: isLight ? '#9ca3af' : '#6b7280' }} />}
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{
              width: '220px',
              borderRadius: '8px',
              background: isLight ? '#ffffff' : '#141721',
              borderColor: isLight ? '#e5e7eb' : '#262a38',
              color: isLight ? '#111827' : '#ffffff'
            }}
          />
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: '130px' }}
            options={[
              { value: 'all', label: 'All types' },
              { value: 'learnings', label: 'Learnings' },
              { value: 'snippets', label: 'Snippets' },
              { value: 'docs', label: 'Docs' },
              { value: 'repos', label: 'Repos' },
              { value: 'prompts', label: 'Prompts' },
              { value: 'communities', label: 'Communities' },
            ]}
          />
        </div>
      </div>

      {/* Main Split Layout: Left Column (Popular Tags Cards), Right Column (Selected Tag Panel) */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left Column: Popular Tags Cards */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: isLight ? '#6b7280' : '#8a90a2', margin: 0, fontWeight: 700 }}>
              Popular Tags
            </h4>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={scrollLeft}
                style={{
                  background: isLight ? '#ffffff' : '#141721',
                  border: `1px solid ${isLight ? '#e5e7eb' : '#262a38'}`,
                  color: isLight ? '#374151' : '#9ca3af',
                  borderRadius: '50%', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <RiArrowLeftSLine size={18} />
              </button>
              <button
                onClick={scrollRight}
                style={{
                  background: isLight ? '#ffffff' : '#141721',
                  border: `1px solid ${isLight ? '#e5e7eb' : '#262a38'}`,
                  color: isLight ? '#374151' : '#9ca3af',
                  borderRadius: '50%', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <RiArrowRightSLine size={18} />
              </button>
            </div>
          </div>

          {tagsLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : filteredTags.length === 0 ? (
            <div style={{
              padding: '40px', textAlign: 'center', background: isLight ? '#ffffff' : '#141721',
              border: `1px solid ${isLight ? '#e5e7eb' : '#232734'}`, borderRadius: '16px', color: isLight ? '#6b7280' : '#8a90a2'
            }}>
              No tags found. Tags appear automatically as you add tags to docs, notes, snippets, repos, prompts, and communities.
            </div>
          ) : (
            <div
              ref={carouselRef}
              style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '12px',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none'
              }}
            >
              {filteredTags.map((t, idx) => {
                const isActive = selectedTag === t.tag;
                const color = getTagColor(idx);
                const TagIcon = getTagIcon(t.tag);
                const bd = t.breakdown || {};
                const learningsCount = bd.learnings || 0;
                const snippetsCount = bd.snippets || 0;
                const docsCount = bd.docs || 0;
                const reposCount = bd.repos || 0;
                const promptsCount = bd.prompts || 0;
                const communitiesCount = bd.communities || 0;

                return (
                  <div
                    key={t.tag}
                    onClick={() => {
                      setSelectedTag(t.tag);
                      setResourceFilter('all');
                    }}
                    style={{
                      minWidth: '240px',
                      width: '240px',
                      flexShrink: 0,
                      background: isActive
                        ? (isLight ? 'rgba(79, 70, 229, 0.05)' : '#171a28')
                        : (isLight ? '#ffffff' : '#13151f'),
                      border: `1.5px solid ${
                        isActive
                          ? color.accent
                          : (isLight ? '#e5e7eb' : '#212534')
                      }`,
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive
                        ? `0 6px 24px ${color.border}`
                        : '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Header row of card (with overflow protection) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: color.iconBg, color: color.iconColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <TagIcon size={20} />
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '12px',
                        background: isLight ? '#f3f4f6' : '#1e2232',
                        border: `1px solid ${isActive ? color.accent : (isLight ? '#e5e7eb' : '#2b3044')}`,
                        maxWidth: '170px',
                        overflow: 'hidden'
                      }}>
                        <span
                          title={`#${t.tag}`}
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: isLight ? '#111827' : '#ffffff',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flexShrink: 1
                          }}
                        >
                          #{t.tag}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: color.accent,
                          color: '#fff',
                          flexShrink: 0
                        }}>
                          {t.count}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {learningsCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isLight ? '#4b5563' : '#9ca3af' }}>
                          <RiLightbulbLine style={{ color: '#eab308' }} size={15} />
                          <span>{learningsCount} {learningsCount === 1 ? 'Learning' : 'Learnings'}</span>
                        </div>
                      )}
                      {snippetsCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isLight ? '#4b5563' : '#9ca3af' }}>
                          <RiCodeSSlashLine style={{ color: '#818cf8' }} size={15} />
                          <span>{snippetsCount} {snippetsCount === 1 ? 'Snippet' : 'Snippets'}</span>
                        </div>
                      )}
                      {docsCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isLight ? '#4b5563' : '#9ca3af' }}>
                          <RiFileTextLine style={{ color: '#60a5fa' }} size={15} />
                          <span>{docsCount} {docsCount === 1 ? 'Doc' : 'Docs'}</span>
                        </div>
                      )}
                      {reposCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isLight ? '#4b5563' : '#9ca3af' }}>
                          <RiGitRepositoryLine style={{ color: '#fb923c' }} size={15} />
                          <span>{reposCount} {reposCount === 1 ? 'Repository' : 'Repositories'}</span>
                        </div>
                      )}
                      {promptsCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isLight ? '#4b5563' : '#9ca3af' }}>
                          <RiRobot2Line style={{ color: '#f472b6' }} size={15} />
                          <span>{promptsCount} {promptsCount === 1 ? 'Prompt' : 'Prompts'}</span>
                        </div>
                      )}
                      {communitiesCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isLight ? '#4b5563' : '#9ca3af' }}>
                          <RiTeamLine style={{ color: '#22d3ee' }} size={15} />
                          <span>{communitiesCount} {communitiesCount === 1 ? 'Community' : 'Communities'}</span>
                        </div>
                      )}
                      {learningsCount === 0 && snippetsCount === 0 && docsCount === 0 && reposCount === 0 && promptsCount === 0 && communitiesCount === 0 && (
                        <div style={{ fontSize: '12px', color: isLight ? '#6b7280' : '#9ca3af' }}>
                          {t.count} items tagged
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Tag Detail Panel */}
        {selectedTag ? (
          <div style={{
            width: '380px',
            flexShrink: 0,
            background: isLight ? '#ffffff' : '#13151f',
            border: `1px solid ${isLight ? '#e5e7eb' : '#212534'}`,
            borderRadius: '16px',
            padding: '20px',
            boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
          }}>

            {/* Selected Tag Panel Header (with Back link, Edit, Delete, Close buttons) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: `1px solid ${isLight ? '#f3f4f6' : '#1e2234'}` }}>
              <button
                onClick={() => setSelectedTag(null)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: isLight ? '#6b7280' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', fontWeight: 600, padding: 0
                }}
              >
                <RiArrowLeftLine size={14} /> Back to all tags
              </button>

              {/* Action Buttons Group: Edit, Delete, Close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                
                {/* Edit Button */}
                <Tooltip title="Rename Tag">
                  <button
                    onClick={() => {
                      setTagToRename(selectedTag);
                      setNewTagName(selectedTag);
                      setRenameModalOpen(true);
                    }}
                    style={{
                      background: isLight ? '#f3f4f6' : '#1e2232',
                      border: `1px solid ${isLight ? '#e5e7eb' : '#2b3044'}`,
                      color: isLight ? '#374151' : '#d1d5db',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <RiEditLine size={14} /> Edit
                  </button>
                </Tooltip>

                {/* Delete Button */}
                <Popconfirm
                  title="Remove tag from all resources?"
                  onConfirm={() => deleteMutation.mutate(selectedTag)}
                  okText="Delete"
                  cancelText="Cancel"
                >
                  <Tooltip title="Delete Tag">
                    <button style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#ef4444',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}>
                      <RiDeleteBinLine size={14} /> Delete
                    </button>
                  </Tooltip>
                </Popconfirm>

                {/* Close Button */}
                <Tooltip title="Close Panel">
                  <button
                    onClick={() => setSelectedTag(null)}
                    style={{
                      background: isLight ? '#f3f4f6' : '#1e2232',
                      border: `1px solid ${isLight ? '#e5e7eb' : '#2b3044'}`,
                      color: isLight ? '#6b7280' : '#9ca3af',
                      borderRadius: '8px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <RiCloseLine size={18} />
                  </button>
                </Tooltip>

              </div>
            </div>

            {/* Tag Name Title (with overflow ellipsis) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h2
                title={`#${selectedTag}`}
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: 0,
                  color: isLight ? '#111827' : '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '330px'
                }}
              >
                #{selectedTag}
              </h2>
            </div>

            <p style={{ fontSize: '12px', color: isLight ? '#6b7280' : '#8a90a2', margin: '0 0 16px' }}>
              {tagContent?.total || 0} items across your {space?.name || 'React'} workspace
            </p>

            {/* Type Filter Pills Row */}
            {tagContent && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <button
                  onClick={() => setResourceFilter('all')}
                  style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: resourceFilter === 'all' ? '#4f46e5' : (isLight ? '#f3f4f6' : '#1e2232'),
                    color: resourceFilter === 'all' ? '#fff' : (isLight ? '#4b5563' : '#9ca3af')
                  }}
                >
                  All {tagContent.total || 0}
                </button>

                {tagContent.learnings?.length > 0 && (
                  <button
                    onClick={() => setResourceFilter('learnings')}
                    style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: resourceFilter === 'learnings' ? '#4f46e5' : (isLight ? '#f3f4f6' : '#1e2232'),
                      color: resourceFilter === 'learnings' ? '#fff' : (isLight ? '#4b5563' : '#9ca3af')
                    }}
                  >
                    Learnings {tagContent.learnings.length}
                  </button>
                )}

                {tagContent.snippets?.length > 0 && (
                  <button
                    onClick={() => setResourceFilter('snippets')}
                    style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: resourceFilter === 'snippets' ? '#4f46e5' : (isLight ? '#f3f4f6' : '#1e2232'),
                      color: resourceFilter === 'snippets' ? '#fff' : (isLight ? '#4b5563' : '#9ca3af')
                    }}
                  >
                    Snippets {tagContent.snippets.length}
                  </button>
                )}

                {tagContent.docs?.length > 0 && (
                  <button
                    onClick={() => setResourceFilter('docs')}
                    style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: resourceFilter === 'docs' ? '#4f46e5' : (isLight ? '#f3f4f6' : '#1e2232'),
                      color: resourceFilter === 'docs' ? '#fff' : (isLight ? '#4b5563' : '#9ca3af')
                    }}
                  >
                    Docs {tagContent.docs.length}
                  </button>
                )}

                {tagContent.repos?.length > 0 && (
                  <button
                    onClick={() => setResourceFilter('repos')}
                    style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: resourceFilter === 'repos' ? '#4f46e5' : (isLight ? '#f3f4f6' : '#1e2232'),
                      color: resourceFilter === 'repos' ? '#fff' : (isLight ? '#4b5563' : '#9ca3af')
                    }}
                  >
                    Repos {tagContent.repos.length}
                  </button>
                )}

                {tagContent.prompts?.length > 0 && (
                  <button
                    onClick={() => setResourceFilter('prompts')}
                    style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: resourceFilter === 'prompts' ? '#4f46e5' : (isLight ? '#f3f4f6' : '#1e2232'),
                      color: resourceFilter === 'prompts' ? '#fff' : (isLight ? '#4b5563' : '#9ca3af')
                    }}
                  >
                    Prompts {tagContent.prompts.length}
                  </button>
                )}

                {tagContent.communities?.length > 0 && (
                  <button
                    onClick={() => setResourceFilter('communities')}
                    style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: resourceFilter === 'communities' ? '#4f46e5' : (isLight ? '#f3f4f6' : '#1e2232'),
                      color: resourceFilter === 'communities' ? '#fff' : (isLight ? '#4b5563' : '#9ca3af')
                    }}
                  >
                    Communities {tagContent.communities.length}
                  </button>
                )}
              </div>
            )}

            {/* Categorized Tagged Items List */}
            {contentLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : tagContent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
                
                {/* Learnings Section */}
                {(resourceFilter === 'all' || resourceFilter === 'learnings') && tagContent.learnings?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isLight ? '#6b7280' : '#8a90a2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Learnings {tagContent.learnings.length}
                      </span>
                      <button
                        onClick={() => setSearchParams({ section: 'learnings' })}
                        style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View all &rarr;
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tagContent.learnings.map(l => (
                        <div
                          key={l._id}
                          onClick={() => setSearchParams({ section: 'learnings', id: l._id })}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', background: isLight ? '#f9fafb' : '#161924',
                            border: `1px solid ${isLight ? '#e5e7eb' : '#232736'}`, borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(234,179,8,0.15)',
                              color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <RiLightbulbLine size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#111827' : '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {l.title}
                              </p>
                              <span style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#8a90a2' }}>
                                Last updated {formatDateAgo(l.createdAt)}
                              </span>
                            </div>
                          </div>
                          <RiMore2Fill size={16} style={{ color: isLight ? '#9ca3af' : '#6b7280', flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Snippets Section */}
                {(resourceFilter === 'all' || resourceFilter === 'snippets') && tagContent.snippets?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isLight ? '#6b7280' : '#8a90a2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Snippets {tagContent.snippets.length}
                      </span>
                      <button
                        onClick={() => setSearchParams({ section: 'snippets' })}
                        style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View all &rarr;
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tagContent.snippets.map(s => (
                        <div
                          key={s._id}
                          onClick={() => setViewSnippet({ ...s, fromTags: true })}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', background: isLight ? '#f9fafb' : '#161924',
                            border: `1px solid ${isLight ? '#e5e7eb' : '#232736'}`, borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)',
                              color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <RiCodeSSlashLine size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#111827' : '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.name}
                              </p>
                              <span style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#8a90a2' }}>
                                {s.language || 'Code'} snippet
                              </span>
                            </div>
                          </div>
                          <RiMore2Fill size={16} style={{ color: isLight ? '#9ca3af' : '#6b7280', flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Docs Section */}
                {(resourceFilter === 'all' || resourceFilter === 'docs') && tagContent.docs?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isLight ? '#6b7280' : '#8a90a2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Docs {tagContent.docs.length}
                      </span>
                      <button
                        onClick={() => setSearchParams({ section: 'docs' })}
                        style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View all &rarr;
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tagContent.docs.map(d => (
                        <div
                          key={d._id}
                          onClick={() => handleDocOpen(d)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', background: isLight ? '#f9fafb' : '#161924',
                            border: `1px solid ${isLight ? '#e5e7eb' : '#232736'}`, borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)',
                              color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <RiFileTextLine size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#111827' : '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {d.title}
                              </p>
                              <span style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#8a90a2' }}>
                                Uploaded {formatDateAgo(d.createdAt)}
                              </span>
                            </div>
                          </div>
                          <RiArrowRightUpLine size={16} style={{ color: isLight ? '#9ca3af' : '#6b7280', flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repos Section */}
                {(resourceFilter === 'all' || resourceFilter === 'repos') && tagContent.repos?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isLight ? '#6b7280' : '#8a90a2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Repositories {tagContent.repos.length}
                      </span>
                      <button
                        onClick={() => setSearchParams({ section: 'repos' })}
                        style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View all &rarr;
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tagContent.repos.map(r => (
                        <div
                          key={r._id}
                          onClick={() => window.open(r.url, '_blank', 'noopener,noreferrer')}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', background: isLight ? '#f9fafb' : '#161924',
                            border: `1px solid ${isLight ? '#e5e7eb' : '#232736'}`, borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(249,115,22,0.15)',
                              color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <RiGitRepositoryLine size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#111827' : '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.name}
                              </p>
                              <span style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#8a90a2', textTransform: 'uppercase' }}>
                                {r.platform || 'Repo'}
                              </span>
                            </div>
                          </div>
                          <RiArrowRightUpLine size={16} style={{ color: isLight ? '#9ca3af' : '#6b7280', flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompts Section */}
                {(resourceFilter === 'all' || resourceFilter === 'prompts') && tagContent.prompts?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isLight ? '#6b7280' : '#8a90a2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Prompts {tagContent.prompts.length}
                      </span>
                      <button
                        onClick={() => setSearchParams({ section: 'prompts' })}
                        style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View all &rarr;
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tagContent.prompts.map(p => (
                        <div
                          key={p._id}
                          onClick={() => setSearchParams({ section: 'prompts', id: p._id })}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', background: isLight ? '#f9fafb' : '#161924',
                            border: `1px solid ${isLight ? '#e5e7eb' : '#232736'}`, borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(236,72,153,0.15)',
                              color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <RiRobot2Line size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#111827' : '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.title}
                              </p>
                              <span style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#8a90a2' }}>
                                {p.model || 'AI Prompt'}
                              </span>
                            </div>
                          </div>
                          <RiMore2Fill size={16} style={{ color: isLight ? '#9ca3af' : '#6b7280', flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Communities Section */}
                {(resourceFilter === 'all' || resourceFilter === 'communities') && tagContent.communities?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isLight ? '#6b7280' : '#8a90a2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Communities {tagContent.communities.length}
                      </span>
                      <button
                        onClick={() => setSearchParams({ section: 'communities' })}
                        style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View all &rarr;
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tagContent.communities.map(c => (
                        <div
                          key={c._id}
                          onClick={() => window.open(c.url, '_blank', 'noopener,noreferrer')}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', background: isLight ? '#f9fafb' : '#161924',
                            border: `1px solid ${isLight ? '#e5e7eb' : '#232736'}`, borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6,182,212,0.15)',
                              color: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <RiTeamLine size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#111827' : '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.name}
                              </p>
                              <span style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#8a90a2', textTransform: 'uppercase' }}>
                                {c.platform || 'Community'}
                              </span>
                            </div>
                          </div>
                          <RiArrowRightUpLine size={16} style={{ color: isLight ? '#9ca3af' : '#6b7280', flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : null}

          </div>
        ) : null}

      </div>

      {/* Rename Tag Modal (Exact process preserved) */}
      <Modal
        title="Rename Tag"
        open={renameModalOpen}
        onCancel={() => setRenameModalOpen(false)}
        onOk={handleRenameSubmit}
        okText="Rename Tag"
        cancelText="Cancel"
        style={{ top: 40 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            padding: '20px 24px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent',
          },
          mask: { backdropFilter: 'blur(4px)' },
        }}
        getContainer={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CURRENT TAG NAME</label>
            <Input value={tagToRename} readOnly disabled />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>NEW TAG NAME</label>
            <Input placeholder="Enter new tag name..." value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* Code Snippet Modal */}
      <SnippetViewModal
        open={!!viewSnippet}
        snippet={viewSnippet}
        spaceId={space._id}
        onClose={() => setViewSnippet(null)}
      />
    </div>
  );
}
