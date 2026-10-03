import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input, Select, Button, Popconfirm, message, Tooltip, Tag } from 'antd';
import {
  RiAddLine, RiCodeSSlashLine, RiFileCopyLine, RiCheckLine,
  RiEditLine, RiSaveLine, RiEyeLine, RiDeleteBinLine,
  RiFolderLine, RiFolderTransferLine, RiMenuUnfoldLine,
  RiCloseLine
} from 'react-icons/ri';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ModuleSidebar from './ModuleSidebar';
import MoveItemModal from './MoveItemModal';
import PinButton from '../common/PinButton';
import api from '../../api/axios';
import snippetsIllustration from '../../assets/editor/snippets.svg';

const { TextArea } = Input;

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'React JSX' },
  { value: 'tsx', label: 'React TSX' },
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
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'other', label: 'Other' }
];

export default function SnippetsSection({
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
  const [localFolderId, setLocalFolderId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form edit states
  const [formTitle, setFormTitle] = useState('');
  const [formLanguage, setFormLanguage] = useState('javascript');
  const [formCode, setFormCode] = useState('');
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

  // Fetch snippets using unified items endpoint
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['items', space._id, 'snippet'],
    queryFn: async () => {
      const response = await api.get(`/api/spaces/${space._id}/items?type=snippet`);
      return response.data.items || [];
    }
  });

  const snippets = itemsData || [];

  // Deep-linking highlight handler
  useEffect(() => {
    if (highlightId && snippets.length > 0) {
      const found = snippets.find(s => s._id === highlightId);
      if (found) {
        setSelectedId(found._id);
        setIsEditing(false);
      }
    }
  }, [highlightId, snippets]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return snippets.find(s => s._id === selectedId) || null;
  }, [selectedId, snippets]);

  // Sync form state when active selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setFormTitle(selectedItem.title || '');
      setFormLanguage(selectedItem.language || 'javascript');
      setFormCode(selectedItem.content || '');
      setFormCaption(selectedItem.caption || '');
      setFormTags(Array.isArray(selectedItem.tags) ? selectedItem.tags.join(', ') : (selectedItem.tags || ''));
    }
  }, [selectedItem]);

  // Create snippet mutation (direct creation in folder/root, no popup modal)
  const createSnippetMutation = useMutation({
    mutationFn: async ({ title, folderId, language, code, caption }) => {
      const res = await api.post(`/api/spaces/${space._id}/items`, {
        type: 'snippet',
        title,
        folderId: folderId || null,
        language: language || 'javascript',
        content: code || '// Start writing your code here...',
        caption: caption || '',
      });
      return res.data.item;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'snippet'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(newItem._id);
      setIsEditing(true);
      message.success(`Created "${newItem.title}"`);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't create snippet.");
    }
  });

  // Update snippet mutation
  const updateSnippetMutation = useMutation({
    mutationFn: async ({ itemId, payload }) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${itemId}`, payload);
      return res.data.item;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'snippet'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      setIsEditing(false);
      message.success('Snippet saved successfully');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't save snippet.");
    }
  });

  // Delete snippet mutation
  const deleteSnippetMutation = useMutation({
    mutationFn: async (itemId) => {
      await api.delete(`/api/spaces/${space._id}/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'snippet'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(null);
      setIsEditing(false);
      message.success('Snippet deleted');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't delete snippet.");
    }
  });

  // Pin snippet mutation
  const pinMutation = useMutation({
    mutationFn: async (itemId) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${itemId}/pin`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'snippet'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'pinned'] });
    }
  });

  // Handle direct creation of new snippet
  const handleCreateNewSnippet = useCallback((targetFolderId) => {
    const validFolderId = (targetFolderId !== undefined && targetFolderId !== 'undefined')
      ? (targetFolderId && targetFolderId !== 'root' && targetFolderId !== 'null' ? targetFolderId : null)
      : (selectedFolderId && selectedFolderId !== 'root' && selectedFolderId !== 'null' ? selectedFolderId : null);

    const nextNumber = snippets.length + 1;
    const defaultTitle = `Snippet ${nextNumber}`;

    createSnippetMutation.mutate({
      title: defaultTitle,
      folderId: validFolderId,
      language: 'javascript',
      code: '// Start writing your code here...\n\nfunction example() {\n  console.log("Hello from DevOneStack!");\n}',
      caption: '',
    });
  }, [snippets.length, selectedFolderId, createSnippetMutation]);

  // Handle save form
  const handleSaveSnippet = () => {
    if (!selectedId) return;
    if (!formTitle.trim()) {
      message.warning('Please enter a snippet title');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    updateSnippetMutation.mutate({
      itemId: selectedId,
      payload: {
        title: formTitle.trim(),
        language: formLanguage,
        content: formCode,
        caption: formCaption.trim(),
        tags: tagsArray,
      }
    });
  };

  // Copy code handler
  const handleCopyCode = (textToCopy) => {
    const codeStr = textToCopy !== undefined ? textToCopy : (formCode || selectedItem?.content || '');
    if (!codeStr) return;
    navigator.clipboard.writeText(codeStr);
    setCopied(true);
    message.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Theme design tokens
  const cardBorder = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
  const mainBg = isLight ? '#ffffff' : '#0d0d12';
  const headerBg = isLight ? '#fafafa' : '#0f0f16';
  const textColor = isLight ? '#111827' : '#f3f4f6';
  const textMuted = '#64748b';
  const accent = isLight ? '#4f46e5' : '#6366f1';
  const codeBg = isLight ? '#f8f9fa' : '#14141d';

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
        title="Snippets"
        icon={RiCodeSSlashLine}
        addButtonLabel="New Snippet"
        itemType="snippet"
        items={snippets}
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
        selectedItemId={selectedId}
        onSelectItem={(item) => {
          setSelectedId(item._id);
          setIsEditing(false);
        }}
        onAddItem={(folderId) => handleCreateNewSnippet(folderId)}
        isLight={isLight}
        isSidebarCollapsed={isSidebarCollapsed}
        onCloseSidebar={() => setIsSidebarCollapsed(true)}
      />

      {/* ── INLINE SNIPPET VIEWER & EDITOR MAIN PANE ── */}
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
            {/* ── Active Snippet Header Bar ── */}
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
              {/* Left: Sidebar Restore + Breadcrumb / Folder Location */}
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
              </div>

              {/* Right: Actions (Copy, Edit / Save, Pin, Delete) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* 1-Click Copy Code Button */}
                <Button
                  size="small"
                  icon={copied ? <RiCheckLine style={{ color: '#10b981' }} /> : <RiFileCopyLine />}
                  onClick={() => handleCopyCode(isEditing ? formCode : selectedItem.content)}
                  style={{
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderColor: copied ? '#10b981' : (isLight ? '#e5e7eb' : 'rgba(255,255,255,0.12)'),
                    color: copied ? '#10b981' : textColor,
                    background: copied ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                  }}
                >
                  {copied ? 'Copied' : 'Copy Code'}
                </Button>

                {/* Edit / Save Toggle */}
                {isEditing ? (
                  <Button
                    type="primary"
                    size="small"
                    icon={<RiSaveLine />}
                    loading={updateSnippetMutation.isPending}
                    onClick={handleSaveSnippet}
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
                    style={{
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
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
                  title="Delete Snippet"
                  description="Are you sure you want to delete this snippet?"
                  okText="Delete"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={() => deleteSnippetMutation.mutate(selectedItem._id)}
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

            {/* ── Scrollable Body: Editor or Viewer ── */}
            <div
              data-lenis-prevent
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 28px',
                scrollbarWidth: 'thin',
                scrollbarColor: isLight ? '#d1d5db transparent' : 'rgba(255,255,255,0.15) transparent',
              }}
            >
              {isEditing ? (
                /* ── EDIT MODE ── */
                <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Title & Language Row */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                        SNIPPET TITLE
                      </label>
                      <Input
                        placeholder="e.g. Debounce hook implementation"
                        value={formTitle}
                        onChange={e => setFormTitle(e.target.value)}
                        style={{
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          padding: '7px 12px',
                        }}
                      />
                    </div>

                    <div style={{ width: '180px' }}>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                        LANGUAGE
                      </label>
                      <Select
                        value={formLanguage}
                        onChange={setFormLanguage}
                        options={LANGUAGES}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  {/* Caption / Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      CAPTION / SUMMARY (OPTIONAL)
                    </label>
                    <Input
                      placeholder="Brief note or context on when to use this snippet..."
                      value={formCaption}
                      onChange={e => setFormCaption(e.target.value)}
                      style={{ borderRadius: '8px', padding: '7px 12px' }}
                    />
                  </div>

                  {/* Code Editor Area */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '11.5px', fontWeight: 600, color: textMuted }}>
                        CODE SNIPPET
                      </label>
                      <span style={{ fontSize: '11px', color: textMuted }}>
                        Language: {LANGUAGES.find(l => l.value === formLanguage)?.label || formLanguage}
                      </span>
                    </div>
                    <TextArea
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                      placeholder="// Type or paste your code snippet here..."
                      rows={14}
                      style={{
                        fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
                        fontSize: '13px',
                        lineHeight: 1.5,
                        borderRadius: '8px',
                        background: codeBg,
                        color: textColor,
                        border: `1px solid ${cardBorder}`,
                        padding: '12px 14px',
                      }}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      TAGS (COMMA SEPARATED)
                    </label>
                    <Input
                      placeholder="react, hooks, debounce, utility"
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      style={{ borderRadius: '8px', padding: '7px 12px' }}
                    />
                  </div>

                  {/* Save & Cancel Row */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <Button
                      type="primary"
                      icon={<RiSaveLine />}
                      loading={updateSnippetMutation.isPending}
                      onClick={handleSaveSnippet}
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
                    <Button
                      onClick={() => setIsEditing(false)}
                      style={{ borderRadius: '6px' }}
                    >
                      Done Editing
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Title & Meta Bar */}
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
                        {selectedItem.title}
                      </h1>
                      <Tag color="indigo" style={{ margin: 0, borderRadius: '4px', textTransform: 'uppercase', fontSize: '10.5px', fontWeight: 600 }}>
                        {LANGUAGES.find(l => l.value === selectedItem.language)?.label || selectedItem.language || 'Code'}
                      </Tag>
                    </div>

                    {selectedItem.caption && (
                      <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: textMuted, lineHeight: 1.5 }}>
                        {selectedItem.caption}
                      </p>
                    )}
                  </div>

                  {/* Code Container with Syntax Highlighting & Header Controls */}
                  <div
                    style={{
                      borderRadius: '10px',
                      border: `1px solid ${cardBorder}`,
                      background: codeBg,
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {/* Code Topbar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        borderBottom: `1px solid ${cardBorder}`,
                        background: isLight ? '#f1f3f5' : '#171722',
                      }}
                    >
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: textMuted }}>
                        {LANGUAGES.find(l => l.value === selectedItem.language)?.label || selectedItem.language || 'Snippet'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(selectedItem.content)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copied ? '#10b981' : textMuted,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '11.5px',
                          fontWeight: 500,
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                        onMouseEnter={e => {
                          if (!copied) e.currentTarget.style.color = textColor;
                        }}
                        onMouseLeave={e => {
                          if (!copied) e.currentTarget.style.color = textMuted;
                        }}
                      >
                        {copied ? <RiCheckLine size={13} /> : <RiFileCopyLine size={13} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Formatted Code */}
                    <div style={{ padding: '0', overflowX: 'auto' }}>
                      <SyntaxHighlighter
                        language={selectedItem.language || 'javascript'}
                        style={isLight ? coy : vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: '16px',
                          background: 'transparent',
                          fontSize: '13px',
                          lineHeight: 1.5,
                        }}
                      >
                        {selectedItem.content || '// No code written'}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  {/* Tags display */}
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
          /* ── EMPTY STATE (Illustration & Call to Action) ── */
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
              src={snippetsIllustration}
              alt="Snippets"
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
              No snippet selected
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
              Select a snippet from the folder tree on the left, or create a new snippet directly in {currentFolderPath}.
            </p>
            <Button
              type="primary"
              icon={<RiAddLine />}
              onClick={() => handleCreateNewSnippet(selectedFolderId)}
              style={{
                background: accent,
                borderColor: accent,
                borderRadius: '6px',
                fontWeight: 600,
                padding: '6px 18px',
              }}
            >
              Create Snippet
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
