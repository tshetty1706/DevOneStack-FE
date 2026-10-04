import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input, Select, Button, Popconfirm, message, Tooltip } from 'antd';
import {
  RiAddLine, RiLightbulbLine, RiBugLine,
  RiErrorWarningLine, RiCheckboxCircleLine, RiQuestionLine,
  RiSparklingLine, RiPushpinLine, RiPushpinFill, RiDeleteBinLine,
  RiEditLine, RiFileCopyLine, RiCheckLine, RiCloseLine, RiFolderLine,
  RiFolderTransferLine, RiMenuUnfoldLine, RiSaveLine, RiEyeLine,
  RiCodeSSlashLine
} from 'react-icons/ri';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ModuleSidebar from './ModuleSidebar';
import MoveItemModal from './MoveItemModal';
import api from '../../api/axios';
import learningIllustration from '../../assets/editor/learning.svg';
import useItemEngagement from '../../hooks/useItemEngagement';

const { TextArea } = Input;

const TYPE_CONFIG = {
  learning: { label: 'Learning', icon: RiLightbulbLine, color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.15)' },
  fix: { label: 'Fix', icon: RiBugLine, color: '#f87171', bg: 'rgba(248, 113, 113, 0.08)', border: 'rgba(248, 113, 113, 0.15)' },
  gotcha: { label: 'Gotcha', icon: RiErrorWarningLine, color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.15)' },
  'best-practice': { label: 'Best Practice', icon: RiCheckboxCircleLine, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.15)' },
  question: { label: 'Question', icon: RiQuestionLine, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.15)' },
  idea: { label: 'Idea', icon: RiSparklingLine, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)', border: 'rgba(168, 85, 247, 0.15)' },
};

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'markdown', label: 'Markdown' },
];

export default function LearningsSection({
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

  // Server-driven contribution engagement tracker
  useItemEngagement(space?._id, selectedId, Boolean(selectedId && !isEditing));
  const [localFolderId, setLocalFolderId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form edit states
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('learning');
  const [formContent, setFormContent] = useState('');
  const [formLanguage, setFormLanguage] = useState('javascript');
  const [formCode, setFormCode] = useState('');
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

  // Fetch learnings using unified items endpoint
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['items', space._id, 'learning'],
    queryFn: async () => {
      const response = await api.get(`/api/spaces/${space._id}/items?type=learning`);
      return response.data.items || [];
    }
  });

  const learnings = itemsData || [];

  // Deep-linking highlight handler
  useEffect(() => {
    if (highlightId && learnings.length > 0) {
      const found = learnings.find(l => l._id === highlightId);
      if (found) {
        setSelectedId(found._id);
        setIsEditing(false);
      }
    }
  }, [highlightId, learnings]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return learnings.find(l => l._id === selectedId) || null;
  }, [selectedId, learnings]);

  // Sync form state when active selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setFormTitle(selectedItem.title || '');
      setFormType(selectedItem.learningType || selectedItem.type || 'learning');
      setFormContent(selectedItem.content || '');
      setFormLanguage(selectedItem.codeExample?.language || 'javascript');
      setFormCode(selectedItem.codeExample?.code || '');
      setFormTags(Array.isArray(selectedItem.tags) ? selectedItem.tags.join(', ') : (selectedItem.tags || ''));
    }
  }, [selectedItem]);

  // Create learning mutation (direct creation in folder/root, no popup modal)
  const createLearningMutation = useMutation({
    mutationFn: async ({ title, folderId, type, content }) => {
      const res = await api.post(`/api/spaces/${space._id}/items`, {
        type: 'learning',
        title,
        folderId: folderId || null,
        learningType: type || 'learning',
        content: content || 'Start logging what you learned here...',
        codeExample: { language: 'javascript', code: '' },
        tags: []
      });
      return res.data?.item || res.data;
    },
    onSuccess: (newLearning) => {
      message.success('Learning created');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      if (newLearning?._id) {
        setSelectedId(newLearning._id);
        setIsEditing(true);
      }
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to create learning');
    }
  });

  const handleCreateNewLearning = useCallback((folderId) => {
    const existingTitles = new Set(
      learnings.map(l => (l.title || '').trim().toLowerCase())
    );
    let count = 1;
    while (
      existingTitles.has(`learning ${count}`.toLowerCase()) ||
      existingTitles.has(`learning(${count})`.toLowerCase()) ||
      existingTitles.has(`learning (${count})`.toLowerCase())
    ) {
      count++;
    }
    const defaultTitle = `Learning ${count}`;
    const destinationFolderId = (folderId !== undefined && folderId !== 'undefined')
      ? (folderId && folderId !== 'root' && folderId !== 'null' ? folderId : null)
      : (selectedFolderId && selectedFolderId !== 'root' && selectedFolderId !== 'null' ? selectedFolderId : null);

    createLearningMutation.mutate({
      title: defaultTitle,
      folderId: destinationFolderId,
      type: 'learning',
      content: 'Write what you learned, key takeaways, fixes, or gotchas here...'
    });
  }, [learnings, selectedFolderId, createLearningMutation]);

  // Save / Update mutation
  const saveLearningMutation = useMutation({
    mutationFn: async ({ id, title, type, content, language, code, tags }) => {
      const parsedTags = typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : (Array.isArray(tags) ? tags : []);

      const res = await api.patch(`/api/spaces/${space._id}/items/${id}`, {
        title: title.trim() || 'Untitled Learning',
        learningType: type,
        content: content.trim() || '',
        codeExample: code?.trim() ? { language: language || 'javascript', code } : { language: '', code: '' },
        tags: parsedTags
      });
      return res.data?.item || res.data;
    },
    onSuccess: () => {
      message.success('Learning saved');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setIsEditing(false);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to save learning');
    }
  });

  const handleSave = () => {
    if (!selectedId) return;
    if (!formTitle.trim()) {
      message.warning('Please enter a title for the learning');
      return;
    }
    saveLearningMutation.mutate({
      id: selectedId,
      title: formTitle,
      type: formType,
      content: formContent,
      language: formLanguage,
      code: formCode,
      tags: formTags
    });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/items/${id}`);
    },
    onSuccess: () => {
      message.success('Learning deleted');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(null);
      setIsEditing(false);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to delete');
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id }) => {
      return api.patch(`/api/spaces/${space._id}/items/${id}/pin`);
    },
    onSuccess: (res) => {
      const pinned = res.data?.isPinned;
      message.success(pinned ? 'Pinned to top' : 'Unpinned');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'pinned'] });
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to update pin');
    }
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    message.success('Code copied to clipboard!');
  };

  // Theme styles
  const themeCardBg = isLight ? '#ffffff' : '#14141c';
  const themeBorder = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
  const themeTextColor = isLight ? '#111827' : '#ffffff';
  const themeTextMuted = '#64748b';
  const themeAccent = isLight ? '#4f46e5' : '#6366f1';
  const inputBg = isLight ? '#f9fafb' : '#171722';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      flex: 1,
      overflow: 'hidden',
      height: '100%',
      width: '100%',
      minHeight: 0,
      background: isLight ? '#ffffff' : '#0b0b0e'
    }}>

      {/* LEFT COLUMN: Sidebar Explorer */}
      <ModuleSidebar
        spaceId={space._id}
        title="Learnings"
        icon={RiLightbulbLine}
        addButtonLabel="Log Learning"
        itemType="learning"
        items={learnings}
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
        selectedItemId={selectedId}
        onSelectItem={(item) => {
          setSelectedId(item._id);
          setIsEditing(false);
        }}
        onAddItem={(folderId) => handleCreateNewLearning(folderId)}
        isLight={isLight}
        isMobile={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onCloseSidebar={() => setIsSidebarCollapsed(true)}
        hasActiveItem={!!selectedId}
      />

      {/* RIGHT COLUMN: Viewport Details / Editor */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
        overflow: 'hidden',
        background: isLight ? '#ffffff' : '#0b0b0e'
      }}>
        {selectedItem ? (
          <>
            {/* Sticky Header Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 20px',
              borderBottom: `1px solid ${themeBorder}`,
              background: isLight ? '#fafafa' : '#101017',
              flexShrink: 0,
              gap: '10px',
            }}>
              {/* Left Action Controls */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isSidebarCollapsed && (
                  <Tooltip title="Expand sidebar">
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: themeTextMuted,
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        marginRight: '4px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = themeTextColor}
                      onMouseLeave={e => e.currentTarget.style.color = themeTextMuted}
                    >
                      <RiMenuUnfoldLine size={16} />
                    </button>
                  </Tooltip>
                )}

                {isEditing ? (
                  <>
                    <Button
                      type="primary"
                      size="small"
                      icon={<RiSaveLine />}
                      loading={saveLearningMutation.isPending}
                      onClick={handleSave}
                      style={{
                        background: themeAccent,
                        borderColor: themeAccent,
                        fontWeight: 600,
                        fontSize: '12px'
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button
                      size="small"
                      icon={<RiEyeLine />}
                      onClick={() => setIsEditing(false)}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${themeBorder}`,
                        color: isLight ? '#111' : '#fff',
                        fontSize: '12px'
                      }}
                    >
                      View
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="primary"
                      size="small"
                      icon={<RiEditLine />}
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: themeAccent,
                        borderColor: themeAccent,
                        fontWeight: 600,
                        fontSize: '12px'
                      }}
                    >
                      Edit Learning
                    </Button>

                    <Tooltip title={selectedItem.isPinned ? 'Unpin from Top' : 'Pin to Top'}>
                      <Button
                        shape="circle"
                        size="small"
                        icon={selectedItem.isPinned ? <RiPushpinFill style={{ color: '#eab308' }} /> : <RiPushpinLine />}
                        onClick={() => togglePinMutation.mutate({ id: selectedItem._id })}
                        style={{ background: 'transparent', border: `1px solid ${themeBorder}`, color: isLight ? '#111' : '#fff' }}
                      />
                    </Tooltip>

                    <Button
                      size="small"
                      icon={<RiFolderTransferLine />}
                      onClick={() => setMoveModalOpen(true)}
                      style={{ background: 'transparent', border: `1px solid ${themeBorder}`, color: isLight ? '#111' : '#fff', fontSize: '12px' }}
                    >
                      Move
                    </Button>

                    <Popconfirm
                      title="Delete this learning record?"
                      onConfirm={() => deleteMutation.mutate(selectedItem._id)}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        size="small"
                        danger
                        icon={<RiDeleteBinLine />}
                        style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '12px' }}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </>
                )}
              </div>

              {/* Close Viewport Button */}
              <button
                onClick={() => {
                  setSelectedId(null);
                  setIsEditing(false);
                }}
                title="Close"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${themeBorder}`,
                  background: 'transparent',
                  color: '#888',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'background 0.15s, color 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = isLight ? '#111' : '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}
              >
                <RiCloseLine size={14} />
                Close
              </button>
            </div>

            {/* Scrollable Body (Editor or Viewer) */}
            <div data-lenis-prevent style={{
              flex: 1,
              overflowY: 'auto',
              padding: '28px 24px',
              scrollbarWidth: 'thin'
            }}>
              <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                
                {isEditing ? (
                  /* ── INLINE EDIT MODE ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    
                    {/* Category Type & Folder Row */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: themeTextMuted, fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                          Category / Type
                        </label>
                        <Select
                          value={formType}
                          onChange={setFormType}
                          style={{ width: '100%' }}
                          options={Object.entries(TYPE_CONFIG).map(([key, config]) => ({
                            value: key,
                            label: (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: config.color, fontWeight: 600 }}>
                                <config.icon size={14} />
                                {config.label}
                              </span>
                            )
                          }))}
                        />
                      </div>

                      <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: themeTextMuted, fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                          Folder
                        </label>
                        <div
                          onClick={() => setMoveModalOpen(true)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${themeBorder}`,
                            background: inputBg,
                            color: themeTextColor,
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                          title="Click to move folder"
                        >
                          <RiFolderLine size={14} style={{ color: themeAccent }} />
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedItem.folderPath || 'Space Root'}
                          </span>
                          <span style={{ fontSize: '11px', color: themeTextMuted }}>Change</span>
                        </div>
                      </div>
                    </div>

                    {/* Title Input */}
                    <div>
                      <label style={{ fontSize: '11px', textTransform: 'uppercase', color: themeTextMuted, fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Title
                      </label>
                      <Input
                        value={formTitle}
                        onChange={e => setFormTitle(e.target.value)}
                        placeholder="What did you learn or solve?"
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: inputBg,
                          borderColor: themeBorder,
                          color: themeTextColor
                        }}
                      />
                    </div>

                    {/* What I Learned / Content */}
                    <div>
                      <label style={{ fontSize: '11px', textTransform: 'uppercase', color: themeTextMuted, fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        What I Learned / Explanation
                      </label>
                      <TextArea
                        rows={6}
                        value={formContent}
                        onChange={e => setFormContent(e.target.value)}
                        placeholder="Explain the concept, the bug, the solution, or why this matters..."
                        style={{
                          fontSize: '13.5px',
                          lineHeight: 1.6,
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: inputBg,
                          borderColor: themeBorder,
                          color: themeTextColor
                        }}
                      />
                    </div>

                    {/* Optional Code Example Block */}
                    <div style={{
                      borderRadius: '8px',
                      border: `1px solid ${themeBorder}`,
                      background: isLight ? '#f9fafb' : '#14141c',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: themeTextColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <RiCodeSSlashLine size={15} style={{ color: themeAccent }} />
                          Code Example (Optional)
                        </span>
                        <Select
                          size="small"
                          value={formLanguage}
                          onChange={setFormLanguage}
                          style={{ width: '140px' }}
                          options={CODE_LANGUAGES}
                        />
                      </div>

                      <TextArea
                        rows={5}
                        value={formCode}
                        onChange={e => setFormCode(e.target.value)}
                        placeholder="// Paste or write code snippet here..."
                        style={{
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: '12.5px',
                          background: isLight ? '#ffffff' : '#0b0b0e',
                          borderColor: themeBorder,
                          color: themeTextColor
                        }}
                      />
                    </div>

                    {/* Tags Input */}
                    <div>
                      <label style={{ fontSize: '11px', textTransform: 'uppercase', color: themeTextMuted, fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Tags (comma separated)
                      </label>
                      <Input
                        value={formTags}
                        onChange={e => setFormTags(e.target.value)}
                        placeholder="react, hooks, debug, css"
                        style={{
                          borderRadius: '6px',
                          background: inputBg,
                          borderColor: themeBorder,
                          color: themeTextColor
                        }}
                      />
                    </div>

                    {/* Save / Discard Bar */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: `1px solid ${themeBorder}` }}>
                      <Button
                        type="primary"
                        icon={<RiSaveLine />}
                        loading={saveLearningMutation.isPending}
                        onClick={handleSave}
                        style={{
                          background: themeAccent,
                          borderColor: themeAccent,
                          fontWeight: 600,
                          padding: '0 20px'
                        }}
                      >
                        Save Learning
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        style={{
                          background: 'transparent',
                          borderColor: themeBorder,
                          color: themeTextColor
                        }}
                      >
                        Cancel
                      </Button>
                    </div>

                  </div>
                ) : (
                  /* ── READ / VIEW MODE ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    
                    {/* Type Badge Header */}
                    <div>
                      {(() => {
                        const config = TYPE_CONFIG[selectedItem.type] || TYPE_CONFIG.learning;
                        return (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: config.color,
                            background: config.bg,
                            border: `1px solid ${config.border}`
                          }}>
                            <config.icon size={13} />
                            {config.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Title */}
                    <h1 style={{
                      margin: 0,
                      fontSize: '24px',
                      fontWeight: 800,
                      color: isLight ? '#111' : '#fff',
                      lineHeight: 1.25,
                      letterSpacing: '-0.02em'
                    }}>
                      {selectedItem.title}
                    </h1>

                    {/* Folder Path */}
                    <div
                      onClick={() => {
                        if (onNavigateSection) {
                          onNavigateSection('explorer', selectedItem._id, selectedItem.folderId);
                        }
                      }}
                      style={{
                        fontSize: '12px',
                        color: themeAccent,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        textDecoration: 'underline',
                        fontWeight: 600,
                      }}
                      title="View in Explorer"
                    >
                      <RiFolderLine size={13} />
                      <span>{selectedItem.folderPath || 'Space Root'}</span>
                    </div>

                    {/* Tags */}
                    {selectedItem.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {selectedItem.tags.map(tag => (
                          <span key={tag} style={{
                            fontSize: '11px',
                            color: isLight ? '#4f46e5' : '#818cf8',
                            background: isLight ? 'rgba(79,70,229,0.05)' : 'rgba(99,102,241,0.06)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 500,
                            border: `1px solid ${isLight ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.1)'}`
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <hr style={{ border: 'none', borderBottom: `1px solid ${themeBorder}`, margin: 0 }} />

                    {/* Explanation Content */}
                    <div>
                      <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                        What I Learned
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: isLight ? '#374151' : '#d1d5db',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedItem.content}
                      </p>
                    </div>

                    {/* Code Example (Optional) */}
                    {selectedItem.codeExample?.code && (
                      <div>
                        <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                          Code Example
                        </h4>
                        
                        <div style={{
                          borderRadius: '8px',
                          border: `1px solid ${themeBorder}`,
                          background: isLight ? '#f9fafb' : '#14141c',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {/* Header Row */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 14px',
                            borderBottom: `1px solid ${themeBorder}`,
                            background: isLight ? '#f3f4f6' : '#1b1b24'
                          }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>
                              {selectedItem.codeExample.language || 'Code'}
                            </span>
                            <button
                              onClick={() => handleCopyCode(selectedItem.codeExample.code)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#888',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                transition: 'background 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {copied ? <RiCheckLine size={13} style={{ color: '#10b981' }} /> : <RiFileCopyLine size={13} />}
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                          </div>

                          {/* Code highlight viewport */}
                          <div style={{ fontSize: '13px', margin: 0, overflowX: 'auto', scrollbarWidth: 'thin' }}>
                            <SyntaxHighlighter
                              language={selectedItem.codeExample.language || 'javascript'}
                              style={isLight ? coy : vscDarkPlus}
                              customStyle={{
                                margin: 0,
                                padding: '12px 14px',
                                background: 'transparent',
                                fontFamily: 'Consolas, Monaco, monospace'
                              }}
                            >
                              {selectedItem.codeExample.code}
                            </SyntaxHighlighter>
                          </div>
                        </div>

                      </div>
                    )}

                    <hr style={{ border: 'none', borderBottom: `1px solid ${themeBorder}`, margin: 0 }} />

                    {/* Timestamps & Edit Button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#666' }}>
                          Created: {new Date(selectedItem.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                        {selectedItem.updatedAt !== selectedItem.createdAt && (
                          <span style={{ fontSize: '11px', color: '#666' }}>
                            Updated: {new Date(selectedItem.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        )}
                      </div>

                      <Button
                        type="default"
                        size="small"
                        icon={<RiEditLine />}
                        onClick={() => setIsEditing(true)}
                        style={{
                          background: 'transparent',
                          borderColor: themeBorder,
                          color: themeTextColor,
                          fontSize: '12px'
                        }}
                      >
                        Edit Learning
                      </Button>
                    </div>

                  </div>
                )}

              </div>

            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            position: 'relative',
            padding: '20px'
          }}>
            {isSidebarCollapsed && (
              <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                <Tooltip title="Expand sidebar">
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(false)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${themeBorder}`,
                      color: themeTextMuted,
                      cursor: 'pointer',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = themeTextColor}
                    onMouseLeave={e => e.currentTarget.style.color = themeTextMuted}
                  >
                    <RiMenuUnfoldLine size={16} />
                    <span>Show Sidebar</span>
                  </button>
                </Tooltip>
              </div>
            )}

            <img
              src={learningIllustration}
              alt="Learnings"
              style={{
                width: '100%',
                maxWidth: '180px',
                maxHeight: '150px',
                height: 'auto',
                objectFit: 'contain',
                marginBottom: '16px',
                opacity: isLight ? 0.9 : 0.85,
                pointerEvents: 'none',
              }}
            />
            <p style={{ margin: '4px 0 2px', fontSize: '15px', color: themeTextColor, fontWeight: 700 }}>No learning selected</p>
            <p style={{ fontSize: '12px', margin: '0 0 16px', color: themeTextMuted }}>Current folder: {currentFolderPath}</p>
            <Button
              type="primary"
              icon={<RiAddLine />}
              onClick={() => handleCreateNewLearning(selectedFolderId)}
              style={{
                background: themeAccent,
                borderColor: themeAccent,
                fontWeight: 600,
                borderRadius: '8px',
                height: '36px',
                padding: '0 18px'
              }}
            >
              Log Learning
            </Button>
          </div>
        )}
      </main>

      {/* MOVE ITEM MODAL */}
      <MoveItemModal
        open={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        space={space}
        item={selectedItem}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['learnings', space._id] });
          queryClient.invalidateQueries({ queryKey: ['items', space._id] });
        }}
      />
    </div>
  );
}

