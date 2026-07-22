import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, message, Tooltip } from 'antd';
import { RiAddLine, RiDiscordLine, RiRedditLine, RiSlackLine, RiTwitterLine, RiYoutubeLine, RiMailLine, RiGithubLine, RiLink, RiDeleteBinLine, RiSearchLine, RiTeamLine, RiPushpinLine, RiPushpin2Fill, RiHistoryLine, RiExternalLinkLine, RiGlobalLine } from 'react-icons/ri';
import api from '../../api/axios';
import { QuickAddCommunityModal } from './QuickAddModals';

const PLATFORMS = [
  { value: 'discord', label: 'Discord Server' },
  { value: 'reddit', label: 'Reddit Sub' },
  { value: 'slack', label: 'Slack Workspace' },
  { value: 'twitter', label: 'Twitter / X Community' },
  { value: 'newsletter', label: 'Newsletter / Blog' },
  { value: 'youtube', label: 'YouTube Channel' },
  { value: 'github', label: 'GitHub Discussions' },
  { value: 'other', label: 'Other / Website' }
];

export default function CommunitiesSection({ space, isLight, highlightId }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const PinButton = ({ isPinned, onToggle }) => (
    <Tooltip title={isPinned ? 'Unpin' : 'Pin'} placement="top">
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: isPinned ? 'var(--accent-color)' : 'var(--text-secondary)',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s',
          zIndex: 20
        }}
      >
        {isPinned ? <RiPushpin2Fill size={14} /> : <RiPushpinLine size={14} />}
      </button>
    </Tooltip>
  );

  // Form states
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('discord');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [memberCount, setMemberCount] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch communities
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities', space._id, debouncedQuery],
    queryFn: async () => {
      const endpoint = debouncedQuery
        ? `/api/spaces/${space._id}/communities/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/spaces/${space._id}/communities`;
      const response = await api.get(endpoint);
      return response.data.communities;
    }
  });

  useEffect(() => {
    if (highlightId && communities && communities.length > 0) {
      const target = communities.find(c => c._id === highlightId);
      if (target) {
        openEditModal(target);
      }
    }
  }, [highlightId, communities]);

  // Toggle Pin
  const togglePin = useMutation({
    mutationFn: async (id) => {
      return api.patch(`/api/spaces/${space._id}/communities/${id}/pin`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['communities', space._id]);
      const prev = queryClient.getQueryData(['communities', space._id, debouncedQuery]);
      if (prev) {
        queryClient.setQueryData(['communities', space._id, debouncedQuery], old =>
          old.map(item => item._id === id ? { ...item, isPinned: !item.isPinned } : item)
        );
      }
      return { prev };
    },
    onError: (_, __, context) => {
      if (context && context.prev) {
        queryClient.setQueryData(['communities', space._id, debouncedQuery], context.prev);
      }
      message.error('Failed to update pin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communities', space._id]);
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return api.post(`/api/spaces/${space._id}/communities`, payload);
    },
    onSuccess: () => {
      message.success('Community link added!');
      queryClient.invalidateQueries(['communities', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to add community');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return api.patch(`/api/spaces/${space._id}/communities/${id}`, payload);
    },
    onSuccess: () => {
      message.success('Community updated!');
      queryClient.invalidateQueries(['communities', space._id]);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to update community');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/communities/${id}`);
    },
    onSuccess: () => {
      message.success('Community connection deleted');
      queryClient.invalidateQueries(['communities', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
    }
  });

  const openAddModal = () => {
    setEditingCommunity(null);
    setName('');
    setUrl('');
    setPlatform('discord');
    setCaption('');
    setTags([]);
    setMemberCount('');
    setModalOpen(true);
  };

  const openEditModal = (comm) => {
    setEditingCommunity(comm);
    setName(comm.name);
    setUrl(comm.url);
    setPlatform(comm.platform);
    setCaption(comm.caption || '');
    setTags(comm.tags || []);
    setMemberCount(comm.memberCount || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCommunity(null);
  };

  const detectPlatform = (inputUrl) => {
    if (!inputUrl) return;
    let detected = 'other';
    if (/discord\.(gg|com)/.test(inputUrl)) detected = 'discord';
    else if (/reddit\.com/.test(inputUrl)) detected = 'reddit';
    else if (/(twitter|x)\.com/.test(inputUrl)) detected = 'twitter';
    else if (/youtube\.com/.test(inputUrl)) detected = 'youtube';
    else if (/github\.com/.test(inputUrl)) detected = 'github';
    else if (/slack\.com/.test(inputUrl)) detected = 'slack';
    setPlatform(detected);
  };

  const handleSubmit = () => {
    if (!name || !url) {
      message.error('Name and URL are required');
      return;
    }
    const payload = { name, url, platform, caption, tags, memberCount };
    if (editingCommunity) {
      updateMutation.mutate({ id: editingCommunity._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getPlatformConfig = (plat) => {
    switch (plat) {
      case 'discord': {
        const color = isLight ? '#4338ca' : '#818cf8';
        return {
          icon: <RiDiscordLine size={24} style={{ color }} />,
          badgeIcon: <RiDiscordLine size={12} style={{ color }} />,
          bg: isLight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.14)',
          border: isLight ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.3)',
          color,
        };
      }
      case 'youtube': {
        const color = isLight ? '#dc2626' : '#f87171';
        return {
          icon: <RiYoutubeLine size={24} style={{ color }} />,
          badgeIcon: <RiYoutubeLine size={12} style={{ color }} />,
          bg: isLight ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.14)',
          border: isLight ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.3)',
          color,
        };
      }
      case 'reddit': {
        const color = isLight ? '#ea580c' : '#fb923c';
        return {
          icon: <RiRedditLine size={24} style={{ color }} />,
          badgeIcon: <RiRedditLine size={12} style={{ color }} />,
          bg: isLight ? 'rgba(249, 115, 22, 0.08)' : 'rgba(249, 115, 22, 0.14)',
          border: isLight ? 'rgba(249, 115, 22, 0.22)' : 'rgba(249, 115, 22, 0.3)',
          color,
        };
      }
      case 'slack': {
        const color = isLight ? '#db2777' : '#f472b6';
        return {
          icon: <RiSlackLine size={24} style={{ color }} />,
          badgeIcon: <RiSlackLine size={12} style={{ color }} />,
          bg: isLight ? 'rgba(236, 72, 153, 0.08)' : 'rgba(236, 72, 153, 0.14)',
          border: isLight ? 'rgba(236, 72, 153, 0.22)' : 'rgba(236, 72, 153, 0.3)',
          color,
        };
      }
      case 'twitter': {
        const color = isLight ? '#0284c7' : '#38bdf8';
        return {
          icon: <RiTwitterLine size={24} style={{ color }} />,
          badgeIcon: <RiTwitterLine size={12} style={{ color }} />,
          bg: isLight ? 'rgba(14, 165, 233, 0.08)' : 'rgba(14, 165, 233, 0.14)',
          border: isLight ? 'rgba(14, 165, 233, 0.22)' : 'rgba(14, 165, 233, 0.3)',
          color,
        };
      }
      case 'newsletter': {
        const color = isLight ? '#059669' : '#34d399';
        return {
          icon: <RiMailLine size={24} style={{ color }} />,
          badgeIcon: <RiMailLine size={12} style={{ color }} />,
          bg: isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.14)',
          border: isLight ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.3)',
          color,
        };
      }
      case 'github': {
        const color = isLight ? '#9333ea' : '#c084fc';
        return {
          icon: <RiGithubLine size={24} style={{ color }} />,
          badgeIcon: <RiGithubLine size={12} style={{ color }} />,
          bg: isLight ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.14)',
          border: isLight ? 'rgba(168, 85, 247, 0.22)' : 'rgba(168, 85, 247, 0.3)',
          color,
        };
      }
      default: {
        const color = isLight ? '#0891b2' : '#22d3ee';
        return {
          icon: <RiLink size={24} style={{ color }} />,
          badgeIcon: <RiLink size={12} style={{ color }} />,
          bg: isLight ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.14)',
          border: isLight ? 'rgba(6, 182, 212, 0.22)' : 'rgba(6, 182, 212, 0.3)',
          color,
        };
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <RiSearchLine style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', zIndex: 10 }} />
          <input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px',
              border: `1px solid ${isLight ? '#e5e5e5' : '#2a2a2a'}`,
              background: isLight ? '#ffffff' : '#1a1a1a',
              color: isLight ? '#111111' : '#ffffff',
              outline: 'none', fontSize: '13px'
            }}
          />
        </div>
        <Button
          type="primary"
          icon={<RiAddLine />}
          onClick={openAddModal}
          style={{ background: isLight ? '#4f46e5' : '#6366f1', borderColor: isLight ? '#4f46e5' : '#6366f1', borderRadius: '8px' }}
        >
          Link Community
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : communities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          No communities linked. Link Discord servers or subreddits!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {communities.map((comm) => {
            const cfg = getPlatformConfig(comm.platform);
            return (
              <div
                key={comm._id}
                style={{
                  background: isLight ? '#ffffff' : '#14141c',
                  border: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = isLight ? '#d1d5db' : 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.background = isLight ? '#f9fafb' : '#1a1a24';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = isLight ? '#ffffff' : '#14141c';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header Row: Badge & Pin */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    padding: '3px 9px', borderRadius: '5px',
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.color, display: 'flex', alignItems: 'center', gap: '5px'
                  }}>
                    {cfg.badgeIcon}
                    <span>{(comm.platform || 'COMMUNITY').toUpperCase()}</span>
                  </span>
                  <PinButton isPinned={comm.isPinned} onToggle={() => togglePin.mutate(comm._id)} />
                </div>

                {/* Main Content info */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '10px',
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: isLight ? '#111111' : '#ffffff', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <a href={comm.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {comm.name}
                      </a>
                    </h4>
                    {comm.caption ? (
                      <p style={{
                        fontSize: '12px', color: isLight ? '#666666' : '#88888b', margin: '0 0 8px', lineHeight: 1.4,
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                      }}>
                        {comm.caption}
                      </p>
                    ) : (
                      <div style={{ height: '4px' }} />
                    )}

                    {comm.tags && comm.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {comm.tags.map(t => (
                          <Tag key={t} style={{
                            fontSize: '10px', borderRadius: '4px', margin: 0,
                            background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                            color: isLight ? '#4b5563' : '#a1a1aa',
                            border: `1px solid ${isLight ? '#e5e7eb' : '#242428'}`
                          }}>
                            {t}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider Line */}
                <div style={{ height: '1px', background: isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)', margin: '2px 0' }} />

                {/* Metadata Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '2px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <RiHistoryLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {new Date(comm.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Added</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <RiTeamLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {comm.memberCount || 'Community'}
                      </span>
                      <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Members</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <RiGlobalLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {comm.platform || 'Link'}
                      </span>
                      <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Type</span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                  <a
                    href={comm.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      background: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${isLight ? '#d1d5db' : 'rgba(255,255,255,0.1)'}`,
                      color: isLight ? '#111111' : '#ffffff', textDecoration: 'none', padding: '5px 12px',
                      borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600
                    }}
                  >
                    <RiExternalLinkLine size={14} />
                    <span>Join / Open</span>
                  </a>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={() => openEditModal(comm)}
                      style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : cfg.color, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      Edit
                    </button>
                    <Popconfirm title="Remove community link?" onConfirm={() => deleteMutation.mutate(comm._id)} okText="Delete" cancelText="Cancel">
                      <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        Delete
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              </div>
            );
          }
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <QuickAddCommunityModal
        open={modalOpen}
        onClose={closeModal}
        space={space}
        editingCommunity={editingCommunity}
      />

    </div>
  );
}
