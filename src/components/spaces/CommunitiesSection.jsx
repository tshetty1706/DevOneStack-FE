import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, message, Tooltip } from 'antd';
import { RiAddLine, RiDiscordLine, RiRedditLine, RiSlackLine, RiTwitterLine, RiYoutubeLine, RiMailLine, RiGithubLine, RiLink, RiDeleteBinLine, RiSearchLine, RiTeamLine, RiPushpinLine, RiPushpin2Fill } from 'react-icons/ri';
import api from '../../api/axios';

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

  const getPlatformIcon = (plat) => {
    switch (plat) {
      case 'discord': return <RiDiscordLine size={18} style={{ color: '#5865F2' }} />;
      case 'reddit': return <RiRedditLine size={18} style={{ color: '#FF4500' }} />;
      case 'slack': return <RiSlackLine size={18} style={{ color: '#4A154B' }} />;
      case 'twitter': return <RiTwitterLine size={18} style={{ color: '#1DA1F2' }} />;
      case 'youtube': return <RiYoutubeLine size={18} style={{ color: '#FF0000' }} />;
      case 'newsletter': return <RiMailLine size={18} style={{ color: '#10b981' }} />;
      case 'github': return <RiGithubLine size={18} style={{ color: '#888' }} />;
      default: return <RiLink size={18} style={{ color: '#888' }} />;
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
          Add Community
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : communities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          No communities linked. Link Discord servers or subreddits!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {communities.map((comm) => (
            <div
              key={comm._id}
              style={{
                background:   'var(--card)',
                border:       '1px solid var(--border)',
                borderRadius: 10,
                padding:      '14px 16px',
                display:      'flex',
                flexDirection:'column',
                justifyContent:'space-between',
                minHeight:    '150px',
                position:     'relative',
                transition:   'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.background  = 'var(--card-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background  = 'var(--card)';
              }}
            >
              {/* Pin indicator */}
              <div style={{ position: 'absolute', right: '12px', top: '12px', zIndex: 20 }}>
                <PinButton
                  isPinned={comm.isPinned}
                  onToggle={() => togglePin.mutate(comm._id)}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', paddingRight: '28px' }}>
                  {getPlatformIcon(comm.platform)}
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#888' }}>
                    {comm.platform}
                  </span>
                  {comm.memberCount && (
                    <Tag color="blue" style={{ fontSize: '9px', lineHeight: 1.5, borderRadius: '4px', marginLeft: 'auto' }}>
                      <RiTeamLine size={10} style={{ marginRight: '2px' }} /> {comm.memberCount} Members
                    </Tag>
                  )}
                </div>

                <a
                  href={comm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '15px', fontWeight: 600, color: isLight ? '#111' : '#fff',
                    textDecoration: 'none', display: 'block', marginBottom: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = isLight ? '#4f46e5' : '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = isLight ? '#111' : '#fff'}
                >
                  {comm.name}
                </a>

                {comm.caption && (
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 12px', lineHeight: 1.4 }}>
                    {comm.caption}
                  </p>
                )}
              </div>

              <div>
                {comm.tags && comm.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {comm.tags.map(t => (
                      <Tag key={t} color={isLight ? 'blue' : 'blue'} style={{ fontSize: '10px' }}>{t}</Tag>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', fontSize: '11px' }}>
                  <button
                    onClick={() => openEditModal(comm)}
                    style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#6366f1', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <Popconfirm
                    title="Remove community link?"
                    onConfirm={() => deleteMutation.mutate(comm._id)}
                    okText="Delete"
                    cancelText="Cancel"
                  >
                    <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        title={editingCommunity ? 'Edit Community Resource' : 'Link New Community Resource'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingCommunity ? 'Update Connection' : 'Add Community'}
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
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>COMMUNITY LINK URL</label>
            <Input
              placeholder="e.g. https://discord.gg/react"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => detectPlatform(url)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>COMMUNITY NAME</label>
            <Input placeholder="e.g. React Developers Discord" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CAPTION / DESCRIPTION</label>
            <Input placeholder="What is this community useful for..." value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>PLATFORM type</label>
              <Select
                options={PLATFORMS}
                style={{ width: '100%' }}
                value={platform}
                onChange={(val) => setPlatform(val)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>ESTIMATED MEMBER COUNT</label>
              <Input placeholder="e.g. 45K or 2.1M" value={memberCount} onChange={(e) => setMemberCount(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>TAGS</label>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Tags..."
              value={tags}
              onChange={(val) => setTags(val)}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
