import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, Switch, message, Tooltip } from 'antd';
import {
  RiAddLine, RiGithubLine, RiGitlabLine, RiLink, RiDeleteBinLine,
  RiSearchLine, RiPushpinLine, RiPushpin2Fill, RiHistoryLine,
  RiGitRepositoryLine, RiTeamLine, RiExternalLinkLine, RiFolderLine,
  RiFolderTransferLine
} from 'react-icons/ri';
import { SiBitbucket } from 'react-icons/si';
import api from '../../api/axios';
import { QuickAddRepoModal } from './QuickAddModals';
import SharedFolderTree from './SharedFolderTree';
import MoveItemModal from './MoveItemModal';
import PinButton from '../common/PinButton';
import { useDebounce } from '../../hooks/useDebounce';

const PLATFORMS = [
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'bitbucket', label: 'BitBucket' },
  { value: 'other', label: 'Other' }
];

export default function ReposSection({
  space,
  isLight,
  highlightId,
  selectedFolderId: propFolderId,
  onSelectFolder: propOnSelectFolder,
  onNavigateSection,
}) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const [localFolderId, setLocalFolderId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);

  const selectedFolderId = propFolderId !== undefined ? propFolderId : localFolderId;
  const handleSelectFolder = (fId) => {
    if (propOnSelectFolder) propOnSelectFolder(fId);
    else setLocalFolderId(fId);
  };

  // Form states
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState('github');
  const [tags, setTags] = useState([]);
  const [isOwn, setIsOwn] = useState(false);

  // Fetch repos
  const { data: rawRepos = [], isLoading } = useQuery({
    queryKey: ['repos', space._id, debouncedQuery],
    queryFn: async () => {
      const endpoint = debouncedQuery
        ? `/api/spaces/${space._id}/repos/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/spaces/${space._id}/repos`;
      const response = await api.get(endpoint);
      return response.data.repos || [];
    }
  });

  const repos = useMemo(() => {
    if (!selectedFolderId) return rawRepos;
    return rawRepos.filter(r => {
      const fId = r.folderId ? (typeof r.folderId === 'object' ? r.folderId._id : r.folderId) : null;
      return fId === selectedFolderId;
    });
  }, [rawRepos, selectedFolderId]);

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
    setIsOwn(!!repo.isOwn);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRepo(null);
  };

  const getPlatformIcon = (plt, size = 16) => {
    switch (plt) {
      case 'github': return <RiGithubLine size={size} />;
      case 'gitlab': return <RiGitlabLine size={size} />;
      case 'bitbucket': return <SiBitbucket size={size} />;
      default: return <RiLink size={size} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '550px', height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
      {/* LEFT COLUMN: Folder Sidebar */}
      <div style={{
        width: '260px',
        borderRight: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)'}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        background: isLight ? '#fafafa' : '#0a0a0f',
        padding: '8px 4px',
      }}>
        <SharedFolderTree
          spaceId={space._id}
          selectedFolderId={selectedFolderId}
          onSelectFolder={handleSelectFolder}
          onSelectItem={(item) => {
            if (item.type === 'repo') {
              openEditModal(item);
            } else if (onNavigateSection) {
              onNavigateSection(item.type === 'note' ? 'notes' : item.type + 's', item._id, item.folderId);
            }
          }}
          selectedItemId={highlightId}
          filterItemType="repo"
          isLight={isLight}
          showHeader={true}
          showSearch={true}
        />
      </div>

      {/* RIGHT COLUMN: Repos content */}
      <div data-lenis-prevent style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: 'clamp(12px, 3vw, 20px)' }}>
        {/* Header controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 'min(100%, 220px)' }}>
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

            {selectedFolderId && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.14)',
                border: `1px solid ${isLight ? 'rgba(79,70,229,0.2)' : 'rgba(99,102,241,0.25)'}`,
                fontSize: '11px',
                color: isLight ? '#4f46e5' : '#818cf8',
              }}>
                <RiFolderLine size={13} />
                <span>Folder filter</span>
                <button
                  onClick={() => handleSelectFolder(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, padding: 0 }}
                  title="Clear folder filter"
                >
                  ✕
                </button>
              </div>
            )}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
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

                    {repo.folderPath && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateSection) {
                            onNavigateSection('explorer', repo._id, repo.folderId);
                          }
                        }}
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--accent-color)',
                          cursor: 'pointer',
                          margin: '0 0 6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'underline',
                          fontWeight: 500,
                        }}
                        title="View in Explorer"
                      >
                        <RiFolderLine size={12} />
                        <span>{repo.folderPath}</span>
                      </div>
                    )}

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
                    <button
                      onClick={() => { setItemToMove(repo); setMoveModalOpen(true); }}
                      style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#fb923c', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      Move
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
      </div>

      {/* Add / Edit Modal */}
      <QuickAddRepoModal
        open={modalOpen}
        onClose={closeModal}
        space={space}
        defaultFolderId={selectedFolderId}
        editingRepo={editingRepo}
      />

      {/* Move Item Modal */}
      <MoveItemModal
        open={moveModalOpen}
        onClose={() => { setMoveModalOpen(false); setItemToMove(null); }}
        space={space}
        item={itemToMove}
        onSuccess={() => {
          queryClient.invalidateQueries(['repos', space._id]);
          queryClient.invalidateQueries(['items', space._id]);
        }}
      />
    </div>
  );
}
