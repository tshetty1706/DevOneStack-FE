import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input, Select, Button, Popconfirm, Tag, message, Tooltip } from 'antd';
import {
  RiAddLine, RiPushpinLine, RiDeleteBinLine,
  RiFileCopyLine, RiCheckLine, RiRobot2Line,
  RiFolderLine, RiFolderTransferLine, RiMenuUnfoldLine,
  RiEditLine, RiSaveLine, RiCloseLine
} from 'react-icons/ri';
import api from '../../api/axios';
import ModuleSidebar from './ModuleSidebar';
import MoveItemModal from './MoveItemModal';
import PinButton from '../common/PinButton';
import promptsIllustration from '../../assets/editor/prompts.svg';

const { TextArea } = Input;

const MODELS = [
  { value: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'Claude 3.5 Haiku',  label: 'Claude 3.5 Haiku' },
  { value: 'Claude 3 Opus',     label: 'Claude 3 Opus' },
  { value: 'GPT-4o',            label: 'GPT-4o' },
  { value: 'GPT-4o mini',       label: 'GPT-4o mini' },
  { value: 'o1',                label: 'OpenAI o1' },
  { value: 'o1-mini',           label: 'OpenAI o1-mini' },
  { value: 'GPT-4 Turbo',       label: 'GPT-4 Turbo' },
  { value: 'Gemini 2.0 Flash',  label: 'Gemini 2.0 Flash' },
  { value: 'Gemini 1.5 Pro',    label: 'Gemini 1.5 Pro' },
  { value: 'Gemini 1.5 Flash',  label: 'Gemini 1.5 Flash' },
  { value: 'DeepSeek R1',       label: 'DeepSeek R1' },
  { value: 'DeepSeek V3',       label: 'DeepSeek V3' },
  { value: 'Llama 3.3 70B',     label: 'Llama 3.3 (70B)' },
  { value: 'Llama 3.1',         label: 'Llama 3.1' },
  { value: 'Mistral Large',     label: 'Mistral Large' },
  { value: 'Qwen 2.5',          label: 'Qwen 2.5' },
  { value: 'Custom',            label: 'Custom Model' },
];

export default function PromptsSection({
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
  const [copied, setCopied] = useState(false);

  const [localFolderId, setLocalFolderId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formModel, setFormModel] = useState('Claude 3.5 Sonnet');
  const [formCustomModel, setFormCustomModel] = useState('');
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

  // Fetch prompts using unified items endpoint
  const { data: rawPrompts = [], isLoading } = useQuery({
    queryKey: ['items', space._id, 'prompt'],
    queryFn: async () => {
      const response = await api.get(`/api/spaces/${space._id}/items?type=prompt`);
      return response.data.items || [];
    }
  });

  const prompts = rawPrompts || [];

  // Deep-linking highlight handler
  useEffect(() => {
    if (highlightId && prompts.length > 0) {
      const target = prompts.find(p => p._id === highlightId);
      if (target) {
        setSelectedId(target._id);
        setIsEditing(false);
      }
    }
  }, [highlightId, prompts]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return prompts.find(p => p._id === selectedId) || null;
  }, [selectedId, prompts]);

  // Sync form state when active selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setFormTitle(selectedItem.title || '');
      setFormBody(selectedItem.content || selectedItem.body || '');
      setFormCaption(selectedItem.caption || '');
      if (MODELS.some(m => m.value === selectedItem.model)) {
        setFormModel(selectedItem.model || 'Claude 3.5 Sonnet');
        setFormCustomModel('');
      } else if (selectedItem.model) {
        setFormModel('Custom');
        setFormCustomModel(selectedItem.model);
      } else {
        setFormModel('Claude 3.5 Sonnet');
        setFormCustomModel('');
      }
      setFormTags(Array.isArray(selectedItem.tags) ? selectedItem.tags.join(', ') : (selectedItem.tags || ''));
    }
  }, [selectedItem]);

  // Create prompt mutation
  const createPromptMutation = useMutation({
    mutationFn: async ({ title, folderId, body, model, caption }) => {
      const res = await api.post(`/api/spaces/${space._id}/items`, {
        type: 'prompt',
        title,
        folderId: folderId || null,
        content: body || 'You are an expert developer...',
        model: model || 'Claude 3.5 Sonnet',
        caption: caption || '',
      });
      return res.data.item;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'prompt'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(newItem._id);
      setIsEditing(true);
      message.success(`Created "${newItem.title}"`);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't create prompt.");
    }
  });

  // Update prompt mutation
  const updatePromptMutation = useMutation({
    mutationFn: async ({ itemId, payload }) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${itemId}`, payload);
      return res.data.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'prompt'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      setIsEditing(false);
      message.success('Prompt saved successfully');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't save prompt.");
    }
  });

  // Delete prompt mutation
  const deletePromptMutation = useMutation({
    mutationFn: async (itemId) => {
      await api.delete(`/api/spaces/${space._id}/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'prompt'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(null);
      setIsEditing(false);
      message.success('Prompt deleted');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't delete prompt.");
    }
  });

  // Pin prompt mutation
  const pinMutation = useMutation({
    mutationFn: async (itemId) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${itemId}/pin`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'prompt'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'pinned'] });
    }
  });

  // Direct prompt creation handler
  const handleCreateNewPrompt = useCallback((targetFolderId) => {
    const validFolderId = (targetFolderId !== undefined && targetFolderId !== 'undefined')
      ? (targetFolderId && targetFolderId !== 'root' && targetFolderId !== 'null' ? targetFolderId : null)
      : (selectedFolderId && selectedFolderId !== 'root' && selectedFolderId !== 'null' ? selectedFolderId : null);

    const nextNumber = prompts.length + 1;
    const defaultTitle = `Prompt ${nextNumber}`;

    createPromptMutation.mutate({
      title: defaultTitle,
      folderId: validFolderId,
      body: 'You are an expert AI assistant specialized in full-stack web development...',
      model: 'Claude 3.5 Sonnet',
      caption: '',
    });
  }, [prompts.length, selectedFolderId, createPromptMutation]);

  // Handle save prompt form
  const handleSavePrompt = () => {
    if (!selectedId) return;
    if (!formTitle.trim()) {
      message.warning('Please enter a prompt title');
      return;
    }

    const finalModel = formModel === 'Custom' ? (formCustomModel.trim() || 'Custom Model') : formModel;
    const tagsArray = formTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    updatePromptMutation.mutate({
      itemId: selectedId,
      payload: {
        title: formTitle.trim(),
        content: formBody,
        caption: formCaption.trim(),
        model: finalModel,
        tags: tagsArray,
      }
    });
  };

  // Copy prompt handler
  const handleCopyPrompt = (textToCopy) => {
    const promptText = textToCopy !== undefined ? textToCopy : (formBody || selectedItem?.content || selectedItem?.body || '');
    if (!promptText) return;
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    message.success('Prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
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
        title="Prompts"
        icon={RiRobot2Line}
        addButtonLabel="New Prompt"
        itemType="prompt"
        items={prompts}
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
        selectedItemId={selectedId}
        onSelectItem={(item) => {
          setSelectedId(item._id);
          setIsEditing(false);
        }}
        onAddItem={(folderId) => handleCreateNewPrompt(folderId)}
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

                {selectedItem.model && (
                  <Tag color="purple" style={{ margin: 0, borderRadius: '4px', fontSize: '10.5px', fontWeight: 600 }}>
                    {selectedItem.model}
                  </Tag>
                )}
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* 1-Click Copy */}
                <Button
                  size="small"
                  icon={copied ? <RiCheckLine style={{ color: '#10b981' }} /> : <RiFileCopyLine />}
                  onClick={() => handleCopyPrompt(isEditing ? formBody : (selectedItem.content || selectedItem.body))}
                  style={{
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderColor: copied ? '#10b981' : (isLight ? '#e5e7eb' : 'rgba(255,255,255,0.12)'),
                    color: copied ? '#10b981' : textColor,
                    background: copied ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                  }}
                >
                  {copied ? 'Copied' : 'Copy Prompt'}
                </Button>

                {/* Edit / Save Toggle */}
                {isEditing ? (
                  <Button
                    type="primary"
                    size="small"
                    icon={<RiSaveLine />}
                    loading={updatePromptMutation.isPending}
                    onClick={handleSavePrompt}
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
                  title="Delete Prompt"
                  description="Are you sure you want to delete this prompt?"
                  okText="Delete"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={() => deletePromptMutation.mutate(selectedItem._id)}
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
                <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Title & Model Row */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                        PROMPT TITLE
                      </label>
                      <Input
                        placeholder="e.g. System architect prompt for microservices"
                        value={formTitle}
                        onChange={e => setFormTitle(e.target.value)}
                        style={{ borderRadius: '8px', fontSize: '14px', fontWeight: 600, padding: '7px 12px' }}
                      />
                    </div>

                    <div style={{ width: '200px' }}>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                        TARGET AI MODEL
                      </label>
                      <Select
                        value={formModel}
                        onChange={setFormModel}
                        options={MODELS}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  {formModel === 'Custom' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                        CUSTOM MODEL NAME
                      </label>
                      <Input
                        placeholder="e.g. Fine-tuned Llama 3 8B"
                        value={formCustomModel}
                        onChange={e => setFormCustomModel(e.target.value)}
                        style={{ borderRadius: '8px', padding: '7px 12px' }}
                      />
                    </div>
                  )}

                  {/* Caption / Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      CAPTION / PURPOSE (OPTIONAL)
                    </label>
                    <Input
                      placeholder="Context on when and how to use this prompt..."
                      value={formCaption}
                      onChange={e => setFormCaption(e.target.value)}
                      style={{ borderRadius: '8px', padding: '7px 12px' }}
                    />
                  </div>

                  {/* Prompt Text / Body */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      PROMPT BODY / INSTRUCTIONS
                    </label>
                    <TextArea
                      value={formBody}
                      onChange={e => setFormBody(e.target.value)}
                      placeholder="Write your prompt or instructions here..."
                      rows={14}
                      style={{
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        fontSize: '13px',
                        lineHeight: 1.5,
                        borderRadius: '8px',
                        background: boxBg,
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
                      placeholder="system, coding, architecture, review"
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
                      loading={updatePromptMutation.isPending}
                      onClick={handleSavePrompt}
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
                <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Title & Caption */}
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
                      {selectedItem.model && (
                        <Tag color="purple" style={{ margin: 0, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {selectedItem.model}
                        </Tag>
                      )}
                    </div>

                    {selectedItem.caption && (
                      <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: textMuted, lineHeight: 1.5 }}>
                        {selectedItem.caption}
                      </p>
                    )}
                  </div>

                  {/* Prompt Container */}
                  <div
                    style={{
                      borderRadius: '10px',
                      border: `1px solid ${cardBorder}`,
                      background: boxBg,
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    }}
                  >
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
                        Prompt Content
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(selectedItem.content || selectedItem.body)}
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

                    <div
                      style={{
                        padding: '16px',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        color: textColor,
                        fontFamily: "'Fira Code', Consolas, monospace",
                      }}
                    >
                      {selectedItem.content || selectedItem.body || 'No prompt content'}
                    </div>
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
              src={promptsIllustration}
              alt="Prompts"
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
              No prompt selected
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
              Select a prompt from the folder tree on the left, or create a new prompt directly in {currentFolderPath}.
            </p>
            <Button
              type="primary"
              icon={<RiAddLine />}
              onClick={() => handleCreateNewPrompt(selectedFolderId)}
              style={{
                background: accent,
                borderColor: accent,
                borderRadius: '6px',
                fontWeight: 600,
                padding: '6px 18px',
              }}
            >
              Create Prompt
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
