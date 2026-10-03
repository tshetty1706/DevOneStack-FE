import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input, Select, Button, Popconfirm, Tag, message, Tooltip } from 'antd';
import {
  RiTeamLine, RiAddLine, RiEditLine, RiSaveLine, RiDeleteBinLine,
  RiFolderLine, RiFolderTransferLine, RiMenuUnfoldLine, RiExternalLinkLine,
  RiLink, RiFileCopyLine, RiCheckLine,
  RiDiscordLine, RiRedditLine, RiSlackLine, RiTwitterLine, RiYoutubeLine,
  RiGithubLine, RiTelegramLine, RiWhatsappLine, RiMailLine, RiGlobalLine,
  RiGroupLine, RiTimeLine
} from 'react-icons/ri';
import api from '../../api/axios';
import ModuleSidebar from './ModuleSidebar';
import MoveItemModal from './MoveItemModal';
import PinButton from '../common/PinButton';
import communityIllustration from '../../assets/editor/community.svg';

const { TextArea } = Input;

const PLATFORM_CONFIG = {
  discord: {
    label: 'Discord Server',
    icon: RiDiscordLine,
    color: '#5865F2',
    bg: 'rgba(88, 101, 242, 0.12)',
  },
  reddit: {
    label: 'Reddit Community',
    icon: RiRedditLine,
    color: '#FF4500',
    bg: 'rgba(255, 69, 0, 0.12)',
  },
  slack: {
    label: 'Slack Workspace',
    icon: RiSlackLine,
    color: '#E01E5A',
    bg: 'rgba(224, 30, 90, 0.12)',
  },
  twitter: {
    label: 'Twitter / X Community',
    icon: RiTwitterLine,
    color: '#1DA1F2',
    bg: 'rgba(29, 161, 242, 0.12)',
  },
  github: {
    label: 'GitHub Discussions',
    icon: RiGithubLine,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
  },
  youtube: {
    label: 'YouTube Channel',
    icon: RiYoutubeLine,
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
  },
  telegram: {
    label: 'Telegram Group',
    icon: RiTelegramLine,
    color: '#0088CC',
    bg: 'rgba(0, 136, 204, 0.12)',
  },
  whatsapp: {
    label: 'WhatsApp Group',
    icon: RiWhatsappLine,
    color: '#25D366',
    bg: 'rgba(37, 211, 102, 0.12)',
  },
  newsletter: {
    label: 'Newsletter / Blog',
    icon: RiMailLine,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  other: {
    label: 'Other / Website',
    icon: RiGlobalLine,
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.12)',
  },
};

const PLATFORM_OPTIONS = Object.entries(PLATFORM_CONFIG).map(([key, config]) => ({
  value: key,
  label: config.label,
}));

export default function CommunitiesSection({
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

  // Copy feedback
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formPlatform, setFormPlatform] = useState('discord');
  const [formCaption, setFormCaption] = useState('');
  const [formMemberCount, setFormMemberCount] = useState('');
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
    },
  });

  const folders = folderData || [];

  const currentFolderPath = useMemo(() => {
    if (!selectedFolderId) return 'Space Root';
    const folder = folders.find(f => f._id === selectedFolderId);
    return folder?.path || folder?.name || 'Space Root';
  }, [folders, selectedFolderId]);

  // Fetch communities using unified items endpoint
  const { data: rawCommunities = [], isLoading } = useQuery({
    queryKey: ['items', space._id, 'community'],
    queryFn: async () => {
      const response = await api.get(`/api/spaces/${space._id}/items?type=community`);
      return response.data.items || [];
    },
  });

  const communities = rawCommunities || [];

  // Deep-linking highlight handler
  useEffect(() => {
    if (highlightId && communities.length > 0) {
      const target = communities.find(c => c._id === highlightId);
      if (target) {
        setSelectedId(target._id);
        setIsEditing(false);
      }
    }
  }, [highlightId, communities]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return communities.find(c => c._id === selectedId) || null;
  }, [selectedId, communities]);

  // Sync form state when active selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setFormTitle(selectedItem.title || selectedItem.name || '');
      setFormUrl(selectedItem.url || '');
      setFormPlatform(selectedItem.platform || detectPlatform(selectedItem.url || ''));
      setFormCaption(selectedItem.caption || '');
      setFormMemberCount(selectedItem.memberCount || '');
      setFormTags(Array.isArray(selectedItem.tags) ? selectedItem.tags.join(', ') : (selectedItem.tags || ''));
    }
  }, [selectedItem]);

  // Auto-detect platform from URL
  function detectPlatform(url = '') {
    const lower = url.toLowerCase();
    if (lower.includes('discord.gg') || lower.includes('discord.com')) return 'discord';
    if (lower.includes('reddit.com')) return 'reddit';
    if (lower.includes('slack.com')) return 'slack';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('github.com')) return 'github';
    if (lower.includes('t.me') || lower.includes('telegram.me')) return 'telegram';
    if (lower.includes('whatsapp.com') || lower.includes('chat.whatsapp.com')) return 'whatsapp';
    if (lower.includes('substack.com') || lower.includes('medium.com')) return 'newsletter';
    return 'other';
  }

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: async ({ title, folderId, url, platform, caption, memberCount }) => {
      const res = await api.post(`/api/spaces/${space._id}/items`, {
        type: 'community',
        title,
        folderId: folderId || null,
        url: url || 'https://discord.gg/',
        platform: platform || 'discord',
        caption: caption || '',
        memberCount: memberCount || '',
      });
      return res.data.item;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'community'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(newItem._id);
      setIsEditing(true);
      message.success(`Created "${newItem.title}"`);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't create community.");
    },
  });

  // Update community mutation
  const updateCommunityMutation = useMutation({
    mutationFn: async ({ itemId, payload }) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${itemId}`, payload);
      return res.data.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'community'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      setIsEditing(false);
      message.success('Community details saved');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't save community.");
    },
  });

  // Delete community mutation
  const deleteCommunityMutation = useMutation({
    mutationFn: async (itemId) => {
      await api.delete(`/api/spaces/${space._id}/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'community'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(null);
      setIsEditing(false);
      message.success('Community link deleted');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't delete community.");
    },
  });

  // Pin community mutation
  const pinMutation = useMutation({
    mutationFn: async (itemId) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${itemId}/pin`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'community'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'pinned'] });
    },
  });

  // Direct community creation handler
  const handleCreateNewCommunity = useCallback((targetFolderId) => {
    const validFolderId = (targetFolderId !== undefined && targetFolderId !== 'undefined')
      ? (targetFolderId && targetFolderId !== 'root' && targetFolderId !== 'null' ? targetFolderId : null)
      : (selectedFolderId && selectedFolderId !== 'root' && selectedFolderId !== 'null' ? selectedFolderId : null);

    const nextNumber = communities.length + 1;
    const defaultTitle = `Community ${nextNumber}`;

    createCommunityMutation.mutate({
      title: defaultTitle,
      folderId: validFolderId,
      url: 'https://discord.gg/',
      platform: 'discord',
      caption: '',
      memberCount: '',
    });
  }, [communities.length, selectedFolderId, createCommunityMutation]);

  // Handle save community form
  const handleSaveCommunity = () => {
    if (!selectedId) return;
    if (!formTitle.trim()) {
      message.warning('Please enter a community title/name');
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

    updateCommunityMutation.mutate({
      itemId: selectedId,
      payload: {
        title: formTitle.trim(),
        url: parsedUrl,
        platform: formPlatform,
        caption: formCaption.trim(),
        memberCount: formMemberCount.trim(),
        tags: tagsArray,
      },
    });
  };

  // Copy helper
  const handleCopyUrl = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    message.success('Community URL copied to clipboard');
  };

  // Platform metadata
  const currentPlatformKey = selectedItem ? (selectedItem.platform || detectPlatform(selectedItem.url || '')) : 'other';
  const platformMeta = PLATFORM_CONFIG[currentPlatformKey] || PLATFORM_CONFIG.other;
  const PlatformIcon = platformMeta.icon;

  // Theme design tokens
  const cardBorder = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
  const mainBg = isLight ? '#ffffff' : '#0d0d12';
  const headerBg = isLight ? '#fafafa' : '#0f0f16';
  const textColor = isLight ? '#111827' : '#f3f4f6';
  const textMuted = '#64748b';
  const accent = isLight ? '#0284c7' : '#38bdf8';
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
        title="Communities"
        icon={RiTeamLine}
        addButtonLabel="New Community"
        itemType="community"
        items={communities}
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
        selectedItemId={selectedId}
        onSelectItem={(item) => {
          setSelectedId(item._id);
          setIsEditing(false);
        }}
        onAddItem={(folderId) => handleCreateNewCommunity(folderId)}
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

                <Tag
                  style={{
                    margin: 0,
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: platformMeta.color,
                    background: platformMeta.bg,
                    borderColor: 'transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <PlatformIcon size={13} />
                  <span>{platformMeta.label}</span>
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
                    Open Community
                  </Button>
                )}

                {/* Edit / Save Toggle */}
                {isEditing ? (
                  <Button
                    type="primary"
                    size="small"
                    icon={<RiSaveLine />}
                    loading={updateCommunityMutation.isPending}
                    onClick={handleSaveCommunity}
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
                  title="Delete Community Link"
                  description="Are you sure you want to delete this community resource?"
                  okText="Delete"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={() => deleteCommunityMutation.mutate(selectedItem._id)}
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
                      COMMUNITY NAME / TITLE
                    </label>
                    <Input
                      placeholder="e.g. Next.js Developers Discord or Supabase Community"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      style={{ borderRadius: '8px', fontSize: '14px', fontWeight: 600, padding: '7px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      COMMUNITY LINK / INVITE URL
                    </label>
                    <Input
                      placeholder="https://discord.gg/your-invite or https://reddit.com/r/reactjs"
                      value={formUrl}
                      onChange={e => {
                        const val = e.target.value;
                        setFormUrl(val);
                        const detected = detectPlatform(val);
                        if (detected !== 'other') {
                          setFormPlatform(detected);
                        }
                      }}
                      prefix={<RiLink style={{ color: textMuted }} />}
                      style={{ borderRadius: '8px', padding: '7px 12px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                        PLATFORM TYPE
                      </label>
                      <Select
                        options={PLATFORM_OPTIONS}
                        value={formPlatform}
                        onChange={setFormPlatform}
                        style={{ width: '100%', height: '38px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                        EST. MEMBER COUNT / STATUS (OPTIONAL)
                      </label>
                      <Input
                        placeholder="e.g. 50k members, Active daily, or VIP"
                        value={formMemberCount}
                        onChange={e => setFormMemberCount(e.target.value)}
                        prefix={<RiGroupLine style={{ color: textMuted }} />}
                        style={{ borderRadius: '8px', padding: '7px 12px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      ABOUT COMMUNITY & NOTES (OPTIONAL)
                    </label>
                    <TextArea
                      placeholder="Summary of what this community discusses, rules, useful channels, or why you joined..."
                      value={formCaption}
                      onChange={e => setFormCaption(e.target.value)}
                      rows={4}
                      style={{ borderRadius: '8px', padding: '8px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      TAGS (COMMA SEPARATED)
                    </label>
                    <Input
                      placeholder="react, typescript, devops, careers"
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
                      loading={updateCommunityMutation.isPending}
                      onClick={handleSaveCommunity}
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
                <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Hero Card */}
                  <div
                    style={{
                      borderRadius: '14px',
                      border: `1px solid ${cardBorder}`,
                      background: boxBg,
                      padding: '24px 28px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '14px',
                            background: platformMeta.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: platformMeta.color,
                            flexShrink: 0,
                          }}
                        >
                          <PlatformIcon size={30} />
                        </div>
                        <div>
                          <h1
                            style={{
                              fontSize: '22px',
                              fontWeight: 700,
                              color: textColor,
                              margin: 0,
                              fontFamily: 'var(--font-display)',
                              lineHeight: 1.3,
                            }}
                          >
                            {selectedItem.title || selectedItem.name}
                          </h1>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <Tag
                              style={{
                                margin: 0,
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: platformMeta.color,
                                background: platformMeta.bg,
                                borderColor: 'transparent',
                              }}
                            >
                              {platformMeta.label}
                            </Tag>

                            {selectedItem.memberCount && (
                              <Tag
                                icon={<RiGroupLine style={{ verticalAlign: 'middle', marginRight: '3px' }} />}
                                style={{ margin: 0, borderRadius: '6px', fontSize: '11px' }}
                              >
                                {selectedItem.memberCount}
                              </Tag>
                            )}

                            <span style={{ fontSize: '11.5px', color: textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <RiTimeLine size={12} />
                              {new Date(selectedItem.updatedAt || selectedItem.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedItem.url && (
                        <Button
                          type="primary"
                          icon={<RiExternalLinkLine />}
                          onClick={() => window.open(selectedItem.url, '_blank', 'noopener,noreferrer')}
                          style={{
                            background: platformMeta.color,
                            borderColor: platformMeta.color,
                            borderRadius: '8px',
                            fontWeight: 600,
                            padding: '6px 16px',
                            height: 'auto',
                          }}
                        >
                          Join Community
                        </Button>
                      )}
                    </div>

                    {/* Direct URL Box */}
                    {selectedItem.url && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isLight ? '#ffffff' : '#0a0a10',
                          border: `1px solid ${cardBorder}`,
                          borderRadius: '8px',
                          padding: '8px 14px',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <RiLink size={15} style={{ color: textMuted, flexShrink: 0 }} />
                          <span
                            style={{
                              fontSize: '13px',
                              fontFamily: 'monospace',
                              color: accent,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {selectedItem.url}
                          </span>
                        </div>

                        <Tooltip title={copiedUrl ? 'Copied!' : 'Copy URL'}>
                          <Button
                            size="small"
                            type="text"
                            icon={copiedUrl ? <RiCheckLine style={{ color: '#10b981' }} /> : <RiFileCopyLine />}
                            onClick={() => handleCopyUrl(selectedItem.url)}
                            style={{ borderRadius: '6px' }}
                          >
                            {copiedUrl ? 'Copied' : 'Copy'}
                          </Button>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  {/* ── ABOUT & GUIDELINES ── */}
                  {selectedItem.caption && (
                    <div
                      style={{
                        borderRadius: '12px',
                        border: `1px solid ${cardBorder}`,
                        background: boxBg,
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: textColor }}>
                        About & Notes
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '13.5px',
                          color: textMuted,
                          lineHeight: 1.65,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {selectedItem.caption}
                      </p>
                    </div>
                  )}

                  {/* ── TAGS ── */}
                  {Array.isArray(selectedItem.tags) && selectedItem.tags.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: textMuted, fontWeight: 500 }}>Tags:</span>
                      {selectedItem.tags.map((tag, idx) => (
                        <Tag key={idx} style={{ borderRadius: '6px', fontSize: '11.5px', padding: '2px 8px' }}>
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
              src={communityIllustration}
              alt="Communities"
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
              No community selected
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: textMuted,
                maxWidth: '380px',
                lineHeight: 1.5,
                margin: '0 0 18px',
              }}
            >
              Select a community from the folder tree on the left, or bookmark a new community link directly in {currentFolderPath}.
            </p>
            <Button
              type="primary"
              icon={<RiAddLine />}
              onClick={() => handleCreateNewCommunity(selectedFolderId)}
              style={{
                background: accent,
                borderColor: accent,
                borderRadius: '6px',
                fontWeight: 600,
                padding: '6px 18px',
              }}
            >
              Add Community
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
