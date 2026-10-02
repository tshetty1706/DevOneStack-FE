import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input, Select, Button, Popconfirm, Tag, message, Tooltip } from 'antd';
import {
  RiAddLine, RiGithubLine, RiGitlabLine, RiLink, RiDeleteBinLine,
  RiFolderLine, RiFolderTransferLine, RiMenuUnfoldLine,
  RiEditLine, RiSaveLine, RiExternalLinkLine, RiGitRepositoryLine
} from 'react-icons/ri';
import { SiBitbucket } from 'react-icons/si';
import api from '../../api/axios';
import ModuleSidebar from './ModuleSidebar';
import MoveItemModal from './MoveItemModal';
import PinButton from '../common/PinButton';
import reposIllustration from '../../assets/editor/repos.svg';

const { TextArea } = Input;

const PLATFORMS = [
  { value: 'github', label: 'GitHub', icon: RiGithubLine },
  { value: 'gitlab', label: 'GitLab', icon: RiGitlabLine },
  { value: 'bitbucket', label: 'BitBucket', icon: SiBitbucket },
  { value: 'other', label: 'Other', icon: RiLink }
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
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [localFolderId, setLocalFolderId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formTags, setFormTags] = useState('');

  const selectedFolderId = propFolderId !== undefined ? propFolderId : localFolderId;
  const handleSelectFolder = (fId) => {
    if (propOnSelectFolder) propOnSelectFolder(fId);
    else setLocalFolderId(fId);
  };

  // Fetch folders for breadcrumbs
  const { data: folderData } = useQuery({
    queryKey: ['folders', space._id],
    queryFn: async () => {
      const res = await api.get(`/api/spaces/${space._id}/folders`);
      return res.data.folders || [];
    }
  });

  const folders = folderData || [];

  const currentFolderPath = useMemo(() => {
    if (!selectedFolderId) return 'Space Root';
    const folder = folders.find(f => f._id === selectedFolderId);
    return folder?.path || folder?.name || 'Space Root';
  }, [folders, selectedFolderId]);

  // Fetch repos using unified items endpoint
  const { data: rawRepos = [], isLoading } = useQuery({
    queryKey: ['items', space._id, 'repo'],
    queryFn: async () => {
      const response = await api.get(`/api/spaces/${space._id}/items?type=repo`);
      return response.data.items || [];
    }
  });

  const repos = rawRepos || [];

  // Deep-linking highlight handler
  useEffect(() => {
    if (highlightId && repos.length > 0) {
      const target = repos.find(r => r._id === highlightId);
      if (target) {
        setSelectedId(target._id);
        setIsEditing(false);
      }
    }
  }, [highlightId, repos]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return repos.find(r => r._id === selectedId) || null;
  }, [selectedId, repos]);

  // Sync form state when active selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setFormTitle(selectedItem.title || selectedItem.name || '');
      setFormUrl(selectedItem.url || '');
      setFormCaption(selectedItem.caption || '');
      setFormTags(Array.isArray(selectedItem.tags) ? selectedItem.tags.join(', ') : (selectedItem.tags || ''));
    }
  }, [selectedItem]);

  // Create repo mutation
  const createRepoMutation = useMutation({
    mutationFn: async ({ title, folderId, url, caption }) => {
      const res = await api.post(`/api/spaces/${space._id}/items`, {
        type: 'repo',
        title,
        folderId: folderId || null,
        url: url || 'https://github.com/example/repo',
        caption: caption || '',
      });
      return res.data.item;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'repo'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(newItem._id);
      setIsEditing(true);
      message.success(`Created "${newItem.title}"`);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't create repository.");
    }
  });

  // Update repo mutation
  const updateRepoMutation = useMutation({
    mutationFn: async ({ itemId, payload }) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${itemId}`, payload);
      return res.data.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'repo'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      setIsEditing(false);
      message.success('Repository saved successfully');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't save repository.");
    }
  });

  // Delete repo mutation
  const deleteRepoMutation = useMutation({
    mutationFn: async (itemId) => {
      await api.delete(`/api/spaces/${space._id}/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'repo'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(null);
      setIsEditing(false);
      message.success('Repository link deleted');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't delete repository.");
    }
  });

  // Pin repo mutation
  const pinMutation = useMutation({
    mutationFn: async (itemId) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${itemId}/pin`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'repo'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'pinned'] });
    }
  });

  // Direct repo creation handler
  const handleCreateNewRepo = useCallback((targetFolderId) => {
    const validFolderId = (targetFolderId !== undefined && targetFolderId !== 'undefined')
      ? (targetFolderId && targetFolderId !== 'root' && targetFolderId !== 'null' ? targetFolderId : null)
      : (selectedFolderId && selectedFolderId !== 'root' && selectedFolderId !== 'null' ? selectedFolderId : null);

    const nextNumber = repos.length + 1;
    const defaultTitle = `Repo ${nextNumber}`;

    createRepoMutation.mutate({
      title: defaultTitle,
      folderId: validFolderId,
      url: 'https://github.com/',
      caption: '',
    });
  }, [repos.length, selectedFolderId, createRepoMutation]);

  // Handle save repo form
  const handleSaveRepo = () => {
    if (!selectedId) return;
    if (!formTitle.trim()) {
      message.warning('Please enter a repository title/name');
      return;
    }

    let parsedUrl = formUrl.trim();
    if (parsedUrl && !/^https?:\/\//i.test(parsedUrl)) {
      parsedUrl = `https://${parsedUrl}`;
    }

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    updateRepoMutation.mutate({
      itemId: selectedId,
      payload: {
        title: formTitle.trim(),
        url: parsedUrl,
        caption: formCaption.trim(),
        tags: tagsArray,
      }
    });
  };

  // Detect platform from URL
  const detectPlatform = (url = '') => {
    const lower = url.toLowerCase();
    if (lower.includes('github.com')) return 'GitHub';
    if (lower.includes('gitlab.com')) return 'GitLab';
    if (lower.includes('bitbucket.org')) return 'BitBucket';
    return 'Git Repository';
  };

  // Theme design tokens
  const cardBorder = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
  const mainBg = isLight ? '#ffffff' : '#0d0d12';
  const headerBg = isLight ? '#fafafa' : '#0f0f16';
  const textColor = isLight ? '#111827' : '#f3f4f6';
  const textMuted = '#64748b';
  const accent = isLight ? '#4f46e5' : '#6366f1';
  const boxBg = isLight ? '#f8f9fa' : '#14141d';

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        background: mainBg,
        position: 'relative',
      }}
    >
      {/* ── SHARED MODULE SIDEBAR ── */}
      <ModuleSidebar
        spaceId={space._id}
        title="Repositories"
        icon={RiGitRepositoryLine}
        addButtonLabel="New Repo"
        itemType="repo"
        items={repos}
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
        selectedItemId={selectedId}
        onSelectItem={(item) => {
          setSelectedId(item._id);
          setIsEditing(false);
        }}
        onAddItem={(folderId) => handleCreateNewRepo(folderId)}
        isLight={isLight}
        isSidebarCollapsed={isSidebarCollapsed}
        onCloseSidebar={() => setIsSidebarCollapsed(true)}
      />

      {/* ── MAIN CONTENT PANE (INLINE VIEWER & EDITOR) ── */}
      <main
        data-lenis-prevent
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minWidth: 0,
          background: mainBg,
          overflow: 'hidden',
        }}
      >
        {selectedItem ? (
          <>
            {/* Header bar */}
            <div
              style={{
                padding: '10px 18px',
                borderBottom: `1px solid ${cardBorder}`,
                background: headerBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              {/* Left: Sidebar Restore + Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                {isSidebarCollapsed && (
                  <Tooltip title="Show sidebar">
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: textMuted,
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <RiMenuUnfoldLine size={16} />
                    </button>
                  </Tooltip>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    color: textMuted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <RiFolderLine size={14} style={{ color: accent, flexShrink: 0 }} />
                  <span>{selectedItem.folderPath || currentFolderPath || 'Space Root'}</span>
                </div>

                <Tooltip title="Move to folder">
                  <button
                    type="button"
                    onClick={() => setMoveModalOpen(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: textMuted,
                      cursor: 'pointer',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = accent)}
                    onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
                  >
                    <RiFolderTransferLine size={13} />
                    <span>Move</span>
                  </button>
                </Tooltip>

                <Tag color="orange" style={{ margin: 0, borderRadius: '4px', fontSize: '10.5px', fontWeight: 600 }}>
                  {detectPlatform(selectedItem.url)}
                </Tag>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {selectedItem.url && (
                  <Button
                    size="small"
                    icon={<RiExternalLinkLine />}
                    onClick={() => window.open(selectedItem.url, '_blank', 'noopener,noreferrer')}
                    style={{ borderRadius: '6px', fontSize: '12px' }}
                  >
                    Open Repo
                  </Button>
                )}

                {/* Edit / Save Toggle */}
                {isEditing ? (
                  <Button
                    type="primary"
                    size="small"
                    icon={<RiSaveLine />}
                    loading={updateRepoMutation.isPending}
                    onClick={handleSaveRepo}
                    style={{
                      background: accent,
                      borderColor: accent,
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    size="small"
                    icon={<RiEditLine />}
                    onClick={() => setIsEditing(true)}
                    style={{ borderRadius: '6px', fontSize: '12px' }}
                  >
                    Edit
                  </Button>
                )}

                {/* Pin Button */}
                <PinButton
                  isPinned={selectedItem.isPinned}
                  onToggle={() => pinMutation.mutate(selectedItem._id)}
                  isLight={isLight}
                />

                {/* Delete Button */}
                <Popconfirm
                  title="Delete Repository Link"
                  description="Are you sure you want to delete this repository link?"
                  okText="Delete"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={() => deleteRepoMutation.mutate(selectedItem._id)}
                >
                  <Button
                    danger
                    type="text"
                    size="small"
                    icon={<RiDeleteBinLine size={15} />}
                    style={{ borderRadius: '6px' }}
                  />
                </Popconfirm>
              </div>
            </div>

            {/* Scrollable Body: Editor or Viewer */}
            <div
              data-lenis-prevent
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 28px',
                scrollbarWidth: 'thin',
              }}
            >
              {isEditing ? (
                /* ── EDIT MODE ── */
                <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      REPOSITORY TITLE / NAME
                    </label>
                    <Input
                      placeholder="e.g. facebook/react or devonestack-backend"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      style={{ borderRadius: '8px', fontSize: '14px', fontWeight: 600, padding: '7px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      REPOSITORY URL
                    </label>
                    <Input
                      placeholder="https://github.com/organization/repository"
                      value={formUrl}
                      onChange={e => setFormUrl(e.target.value)}
                      prefix={<RiLink style={{ color: textMuted }} />}
                      style={{ borderRadius: '8px', padding: '7px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      DESCRIPTION / NOTES (OPTIONAL)
                    </label>
                    <TextArea
                      placeholder="Brief note on what this repo is or why it was bookmarked..."
                      value={formCaption}
                      onChange={e => setFormCaption(e.target.value)}
                      rows={3}
                      style={{ borderRadius: '8px', padding: '7px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      TAGS (COMMA SEPARATED)
                    </label>
                    <Input
                      placeholder="frontend, backend, utility, react"
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      style={{ borderRadius: '8px', padding: '7px 12px' }}
                    />
                  </div>

                  {/* Save button row */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <Button
                      type="primary"
                      icon={<RiSaveLine />}
                      loading={updateRepoMutation.isPending}
                      onClick={handleSaveRepo}
                      style={{
                        background: accent,
                        borderColor: accent,
                        borderRadius: '6px',
                        fontWeight: 600,
                        padding: '6px 18px',
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button onClick={() => setIsEditing(false)} style={{ borderRadius: '6px' }}>
                      Done Editing
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Title & Platform */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <h1
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: textColor,
                          margin: 0,
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {selectedItem.title || selectedItem.name}
                      </h1>
                      <Tag color="orange" style={{ margin: 0, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {detectPlatform(selectedItem.url)}
                      </Tag>
                    </div>

                    {selectedItem.caption && (
                      <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: textMuted, lineHeight: 1.5 }}>
                        {selectedItem.caption}
                      </p>
                    )}
                  </div>

                  {/* Repository Card */}
                  <div
                    style={{
                      borderRadius: '12px',
                      border: `1px solid ${cardBorder}`,
                      background: boxBg,
                      padding: '32px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: '14px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: isLight ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fb923c',
                      }}
                    >
                      <RiGitRepositoryLine size={28} />
                    </div>

                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: textColor }}>
                      {selectedItem.title || selectedItem.name}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        color: accent,
                        maxWidth: '500px',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                      }}
                    >
                      {selectedItem.url || 'No URL specified'}
                    </p>

                    {selectedItem.url && (
                      <Button
                        type="primary"
                        icon={<RiExternalLinkLine />}
                        onClick={() => window.open(selectedItem.url, '_blank', 'noopener,noreferrer')}
                        style={{
                          marginTop: '6px',
                          background: accent,
                          borderColor: accent,
                          borderRadius: '6px',
                          fontWeight: 600,
                        }}
                      >
                        Open on {detectPlatform(selectedItem.url)}
                      </Button>
                    )}
                  </div>

                  {/* Tags */}
                  {Array.isArray(selectedItem.tags) && selectedItem.tags.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span style={{ fontSize: '11.5px', color: textMuted }}>Tags:</span>
                      {selectedItem.tags.map((tag, idx) => (
                        <Tag key={idx} style={{ borderRadius: '4px', fontSize: '11px' }}>
                          #{tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── EMPTY STATE ── */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            {isSidebarCollapsed && (
              <Button
                icon={<RiMenuUnfoldLine />}
                onClick={() => setIsSidebarCollapsed(false)}
                style={{ position: 'absolute', top: '16px', left: '16px', borderRadius: '6px' }}
              >
                Open Sidebar
              </Button>
            )}

            <img
              src={reposIllustration}
              alt="Repositories"
              style={{
                width: '180px',
                height: '180px',
                marginBottom: '18px',
                opacity: isLight ? 0.9 : 0.85,
              }}
            />
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: textColor,
                marginBottom: '8px',
                fontFamily: 'var(--font-display)',
              }}
            >
              No repository selected
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: textMuted,
                maxWidth: '360px',
                lineHeight: 1.5,
                margin: '0 0 18px',
              }}
            >
              Select a repository from the folder tree on the left, or add a new repository link directly in {currentFolderPath}.
            </p>
            <Button
              type="primary"
              icon={<RiAddLine />}
              onClick={() => handleCreateNewRepo(selectedFolderId)}
              style={{
                background: accent,
                borderColor: accent,
                borderRadius: '6px',
                fontWeight: 600,
                padding: '6px 18px',
              }}
            >
              Add Repository
            </Button>
          </div>
        )}
      </main>

      {/* ── Move Item Modal ── */}
      {selectedItem && (
        <MoveItemModal
          isOpen={moveModalOpen}
          onClose={() => setMoveModalOpen(false)}
          spaceId={space._id}
          item={selectedItem}
          isLight={isLight}
        />
      )}
    </div>
  );
}
