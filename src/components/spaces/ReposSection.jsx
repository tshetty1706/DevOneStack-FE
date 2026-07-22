import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, Switch, message, Tooltip } from 'antd';
import { RiAddLine, RiGithubLine, RiGitlabLine, RiLink, RiDeleteBinLine, RiSearchLine, RiPushpinLine, RiPushpin2Fill, RiHistoryLine, RiGitRepositoryLine, RiTeamLine, RiExternalLinkLine } from 'react-icons/ri';
import { SiBitbucket } from 'react-icons/si';
import api from '../../api/axios';
import { QuickAddRepoModal } from './QuickAddModals';

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

  const getPlatformIcon = (plat, size = 16) => {
    switch (plat) {
      case 'github': return <RiGithubLine size={size} />;
      case 'gitlab': return <RiGitlabLine size={size} style={{ color: '#fc6d26' }} />;
      case 'bitbucket': return <SiBitbucket size={size - 2} style={{ color: '#0052cc' }} />;
      default: return <RiLink size={size} />;
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {repos.map((repo) => (
            <div
              key={repo._id}
              style={{
                background:   isLight ? '#ffffff' : '#14141c',
                border:       `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '12px',
                padding:      '18px 20px',
                display:      'flex',
                flexDirection:'column',
                gap:          '14px',
                position:     'relative',
                transition:   'all 0.2s ease',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    padding: '2px 8px', borderRadius: '4px',
                    background: isLight ? 'rgba(249, 115, 22, 0.08)' : 'rgba(249, 115, 22, 0.12)',
                    border: `1px solid ${isLight ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.25)'}`,
                    color: '#fb923c', display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    {getPlatformIcon(repo.platform, 12)}
                    <span>{(repo.platform || 'REPO').toUpperCase()}</span>
                  </span>
                  {repo.isOwn && (
                    <span style={{
                      fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                      padding: '2px 6px', borderRadius: '4px',
                      background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.25)', color: '#22c55e'
                    }}>
                      OWN REPO
                    </span>
                  )}
                </div>
                <PinButton isPinned={repo.isPinned} onToggle={() => togglePin.mutate(repo._id)} />
              </div>

              {/* Main Content info */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '10px',
                  background: isLight ? 'rgba(249, 115, 22, 0.08)' : 'rgba(249, 115, 22, 0.12)',
                  border: `1px solid ${isLight ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fb923c', flexShrink: 0
                }}>
                  {getPlatformIcon(repo.platform, 24)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: isLight ? '#111111' : '#ffffff', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {repo.name}
                    </a>
                  </h4>
                  {repo.caption ? (
                    <p style={{
                      fontSize: '12px', color: isLight ? '#666666' : '#88888b', margin: '0 0 8px', lineHeight: 1.4,
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>
                      {repo.caption}
                    </p>
                  ) : (
                    <div style={{ height: '4px' }} />
                  )}

                  {repo.tags && repo.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {repo.tags.map(t => (
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
                      {new Date(repo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Added</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <RiGitRepositoryLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {repo.platform || 'Git'}
                    </span>
                    <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Platform</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <RiTeamLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff' }}>
                      {repo.isOwn ? 'Owner' : 'Member'}
                    </span>
                    <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Access</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <a
                  href={repo.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    background: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isLight ? '#d1d5db' : 'rgba(255,255,255,0.1)'}`,
                    color: isLight ? '#111111' : '#ffffff', textDecoration: 'none', padding: '5px 12px',
                    borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600
                  }}
                >
                  <RiExternalLinkLine size={14} />
                  <span>Open Repo</span>
                </a>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => openEditModal(repo)}
                    style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#fb923c', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <Popconfirm title="Remove repository link?" onConfirm={() => deleteMutation.mutate(repo._id)} okText="Delete" cancelText="Cancel">
                    <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
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
      <QuickAddRepoModal
        open={modalOpen}
        onClose={closeModal}
        space={space}
        editingRepo={editingRepo}
      />

    </div>
  );
}
