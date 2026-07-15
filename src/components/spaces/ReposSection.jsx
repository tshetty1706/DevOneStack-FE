import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, Switch, message, Tooltip } from 'antd';
import { RiAddLine, RiGithubLine, RiGitlabLine, RiLink, RiDeleteBinLine, RiSearchLine, RiPushpinLine, RiPushpin2Fill } from 'react-icons/ri';
import { SiBitbucket } from 'react-icons/si';
import api from '../../api/axios';

const PLATFORMS = [
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'bitbucket', label: 'BitBucket' },
  { value: 'other', label: 'Other' }
];

export default function ReposSection({ space, isLight, highlightId }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState(null);
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
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState('github');
  const [tags, setTags] = useState([]);
  const [isOwn, setIsOwn] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch repos
  const { data: repos = [], isLoading } = useQuery({
    queryKey: ['repos', space._id, debouncedQuery],
    queryFn: async () => {
      const endpoint = debouncedQuery
        ? `/api/spaces/${space._id}/repos/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/spaces/${space._id}/repos`;
      const response = await api.get(endpoint);
      return response.data.repos;
    }
  });

  useEffect(() => {
    if (highlightId && repos && repos.length > 0) {
      const target = repos.find(r => r._id === highlightId);
      if (target) {
        openEditModal(target);
      }
    }
  }, [highlightId, repos]);

  // Toggle Pin
  const togglePin = useMutation({
    mutationFn: async (id) => {
      return api.patch(`/api/spaces/${space._id}/repos/${id}/pin`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['repos', space._id]);
      const prev = queryClient.getQueryData(['repos', space._id, debouncedQuery]);
      if (prev) {
        queryClient.setQueryData(['repos', space._id, debouncedQuery], old =>
          old.map(item => item._id === id ? { ...item, isPinned: !item.isPinned } : item)
        );
      }
      return { prev };
    },
    onError: (_, __, context) => {
      if (context && context.prev) {
        queryClient.setQueryData(['repos', space._id, debouncedQuery], context.prev);
      }
      message.error('Failed to update pin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['repos', space._id]);
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return api.post(`/api/spaces/${space._id}/repos`, payload);
    },
    onSuccess: () => {
      message.success('Repository linked!');
      queryClient.invalidateQueries(['repos', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to link repository');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return api.patch(`/api/spaces/${space._id}/repos/${id}`, payload);
    },
    onSuccess: () => {
      message.success('Repository updated!');
      queryClient.invalidateQueries(['repos', space._id]);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to update repository');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/repos/${id}`);
    },
    onSuccess: () => {
      message.success('Repository link deleted');
      queryClient.invalidateQueries(['repos', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
    }
  });

  const openAddModal = () => {
    setEditingRepo(null);
    setName('');
    setUrl('');
    setCaption('');
    setPlatform('github');
    setTags([]);
    setIsOwn(false);
    setModalOpen(true);
  };

  const openEditModal = (repo) => {
    setEditingRepo(repo);
    setName(repo.name);
    setUrl(repo.url);
    setCaption(repo.caption || '');
    setPlatform(repo.platform);
    setTags(repo.tags || []);
    setIsOwn(repo.isOwn || false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRepo(null);
  };

  const detectPlatformAndName = (inputUrl) => {
    if (!inputUrl) return;
    let detectedPlatform = 'other';
    if (inputUrl.includes('github.com')) detectedPlatform = 'github';
    else if (inputUrl.includes('gitlab.com')) detectedPlatform = 'gitlab';
    else if (inputUrl.includes('bitbucket.org')) detectedPlatform = 'bitbucket';

    setPlatform(detectedPlatform);

    // Auto-extract name if name is not set yet
    if (!name) {
      try {
        const parsedUrl = new URL(inputUrl);
        const paths = parsedUrl.pathname.split('/').filter(Boolean);
        if (paths.length >= 2) {
          setName(paths[1]); // repo name
        } else if (paths.length === 1) {
          setName(paths[0]); // username or single path name
        }
      } catch (e) {
        // Ignored
      }
    }
  };

  const handleSubmit = () => {
    if (!name || !url) {
      message.error('Name and URL are required');
      return;
    }
    const payload = { name, url, caption, platform, tags, isOwn };
    if (editingRepo) {
      updateMutation.mutate({ id: editingRepo._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getPlatformIcon = (plat) => {
    switch (plat) {
      case 'github': return <RiGithubLine size={20} style={{ color: '#888' }} />;
      case 'gitlab': return <RiGitlabLine size={20} style={{ color: '#fc6d26' }} />;
      case 'bitbucket': return <SiBitbucket size={18} style={{ color: '#0052cc' }} />;
      default: return <RiLink size={20} style={{ color: '#888' }} />;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <RiSearchLine style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', zIndex: 10 }} />
          <input
            placeholder="Search repos..."
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
          Link Repo
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : repos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          No repositories linked. Add your GitHub or GitLab projects!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {repos.map((repo) => (
            <div
              key={repo._id}
              style={{
                background:   'var(--card)',
                border:       '1px solid var(--border)',
                borderRadius: 10,
                padding:      '12px 16px',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'space-between',
                gap:          '16px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <div style={{ flexShrink: 0 }}>
                  {getPlatformIcon(repo.platform)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '14px', fontWeight: 600, color: isLight ? '#4f46e5' : '#6366f1', textDecoration: 'none' }}
                    >
                      {repo.name}
                    </a>
                    {repo.isOwn && (
                      <Tag color="success" style={{ fontSize: '9px', lineHeight: 1.5, borderRadius: '4px' }}>
                        Own Repo
                      </Tag>
                    )}
                  </div>
                  {repo.caption && (
                    <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {repo.caption}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                {repo.tags && repo.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {repo.tags.map(t => (
                      <Tag
                        key={t}
                        style={{
                          fontSize: '10px',
                          borderRadius: '4px',
                          margin: 0,
                          background: isLight ? '#f3f4f6' : '#242428',
                          color: isLight ? '#4b5563' : '#a1a1aa',
                          border: `1px solid ${isLight ? '#e5e7eb' : '#3f3f46'}`,
                        }}
                      >
                        {t}
                      </Tag>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <PinButton
                    isPinned={repo.isPinned}
                    onToggle={() => togglePin.mutate(repo._id)}
                  />
                  <button
                    onClick={() => openEditModal(repo)}
                    style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#6366f1', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Edit
                  </button>
                  <Popconfirm
                    title="Remove repository link?"
                    onConfirm={() => deleteMutation.mutate(repo._id)}
                    okText="Delete"
                    cancelText="Cancel"
                  >
                    <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px' }}>
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
        title={editingRepo ? 'Edit Repository Connection' : 'Link New Repository'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingRepo ? 'Update Repository' : 'Link Repository'}
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
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>REPOSITORY URL</label>
            <Input
              placeholder="e.g. https://github.com/facebook/react"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => detectPlatformAndName(url)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DISPLAY NAME</label>
            <Input placeholder="e.g. react" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CAPTION / DESCRIPTION</label>
            <Input placeholder="Short project summary..." value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>PLATFORM</label>
              <Select
                options={PLATFORMS}
                style={{ width: '100%' }}
                value={platform}
                onChange={(val) => setPlatform(val)}
              />
            </div>
            <div style={{ flex: 1 }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <Switch checked={isOwn} onChange={(val) => setIsOwn(val)} />
            <span style={{ fontSize: '13px', color: isLight ? '#111' : '#fff' }}>I am the owner/maintainer of this project</span>
          </div>
        </div>
      </Modal>

    </div>
  );
}
