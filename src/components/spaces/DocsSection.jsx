import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input, Select, Button, Upload, Popconfirm, Tag, message, Tooltip, Radio } from 'antd';
import {
  RiAddLine, RiGlobalLine, RiFilePdfLine, RiImageLine,
  RiDeleteBinLine, RiUploadCloudLine, RiDownloadLine,
  RiExternalLinkLine, RiEyeLine, RiHistoryLine, RiTeamLine,
  RiFolderLine, RiFolderTransferLine, RiFileTextLine,
  RiMenuUnfoldLine, RiEditLine, RiSaveLine, RiCloseLine,
  RiCheckLine, RiCompass3Line
} from 'react-icons/ri';
import api from '../../api/axios';
import ModuleSidebar from './ModuleSidebar';
import MoveItemModal from './MoveItemModal';
import PinButton from '../common/PinButton';
import docsIllustration from '../../assets/editor/docs.svg';
import { resolveFileUrl, isPdfFile, isImageFile, isUrlResource, formatBytes } from '../../utils/fileResolver';

const { Dragger } = Upload;
const { TextArea } = Input;

export default function DocsSection({
  space,
  isLight,
  highlightId,
  selectedFolderId: propFolderId,
  onSelectFolder: propOnSelectFolder,
  onNavigateSection,
}) {
  const queryClient = useQueryClient();

  // Navigation & selection states
  const [selectedId, setSelectedId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [localFolderId, setLocalFolderId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);

  // Upload / Add Mode state: 'file' | 'url'
  const [addMode, setAddMode] = useState('file');

  // Upload / Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formTags, setFormTags] = useState('');

  // Edit existing doc state
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editTags, setEditTags] = useState('');

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

  // Fetch docs list from unified items endpoint
  const { data: rawDocs = [], isLoading } = useQuery({
    queryKey: ['items', space._id, 'doc'],
    queryFn: async () => {
      const response = await api.get(`/api/spaces/${space._id}/items?type=doc`);
      return response.data.items || [];
    }
  });

  const docs = rawDocs || [];

  // Deep-linking highlight handler
  useEffect(() => {
    if (highlightId && docs.length > 0) {
      const target = docs.find(d => d._id === highlightId);
      if (target) {
        setSelectedId(target._id);
        setIsUploading(false);
        setIsEditing(false);
      }
    }
  }, [highlightId, docs]);

  // Selected doc object
  const selectedDoc = useMemo(() => {
    return docs.find(d => d._id === selectedId) || null;
  }, [selectedId, docs]);

  // Sync edit form state when selectedDoc changes
  useEffect(() => {
    if (selectedDoc) {
      setEditTitle(selectedDoc.title || '');
      setEditCaption(selectedDoc.caption || '');
      setEditTags(Array.isArray(selectedDoc.tags) ? selectedDoc.tags.join(', ') : (selectedDoc.tags || ''));
    }
  }, [selectedDoc]);

  // Pin mutation
  const togglePinMutation = useMutation({
    mutationFn: async (id) => {
      return api.patch(`/api/spaces/${space._id}/items/${id}/pin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'doc'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'pinned'] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/items/${id}`);
    },
    onSuccess: () => {
      message.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'doc'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedId(null);
      setIsEditing(false);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to delete document');
    }
  });

  // Update doc mutation
  const updateDocMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${id}`, payload);
      return res.data.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'doc'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      setIsEditing(false);
      message.success('Document updated successfully');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to update document');
    }
  });

  // Upload file mutation
  const uploadDocMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post(`/api/spaces/${space._id}/items/upload`, formData);
      return res.data.item;
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'doc'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setIsUploading(false);
      setUploadFile(null);
      setFormTitle('');
      setFormCaption('');
      setFormTags('');
      setSelectedId(newDoc._id);
      message.success(`Uploaded "${newDoc.title}"`);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Upload failed');
    }
  });

  // Add URL mutation
  const addUrlMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/api/spaces/${space._id}/items`, {
        ...payload,
        type: 'doc',
        docType: 'url',
      });
      return res.data.item;
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'doc'] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id, 'all'] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setIsUploading(false);
      setFormUrl('');
      setFormTitle('');
      setFormCaption('');
      setFormTags('');
      setSelectedId(newDoc._id);
      message.success(`Saved link "${newDoc.title}"`);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to save URL');
    }
  });

  // Handle start adding/uploading doc
  const handleStartUpload = (targetFolderId) => {
    if (targetFolderId !== undefined && targetFolderId !== 'undefined') {
      handleSelectFolder(targetFolderId && targetFolderId !== 'root' && targetFolderId !== 'null' ? targetFolderId : null);
    }
    setSelectedId(null);
    setIsEditing(false);
    setIsUploading(true);
    setUploadFile(null);
    setFormTitle('');
    setFormUrl('');
    setFormCaption('');
    setFormTags('');
  };

  // Submit Upload Form
  const handleSubmitUpload = () => {
    const validFolderId = (selectedFolderId && selectedFolderId !== 'root' && selectedFolderId !== 'null' && selectedFolderId !== 'undefined')
      ? selectedFolderId
      : null;

    if (addMode === 'file') {
      if (!uploadFile) {
        message.warning('Please select a PDF or image file to upload');
        return;
      }

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('type', 'doc');
      formData.append('title', formTitle.trim() || uploadFile.name);
      formData.append('caption', formCaption.trim());
      formData.append('tags', formTags);
      if (validFolderId) {
        formData.append('folderId', validFolderId);
      }

      uploadDocMutation.mutate(formData);
    } else {
      if (!formUrl.trim()) {
        message.warning('Please enter a valid URL');
        return;
      }
      if (!formTitle.trim()) {
        message.warning('Please enter a document title');
        return;
      }

      let parsedUrl = formUrl.trim();
      if (!/^https?:\/\//i.test(parsedUrl)) {
        parsedUrl = `https://${parsedUrl}`;
      }

      addUrlMutation.mutate({
        title: formTitle.trim(),
        url: parsedUrl,
        caption: formCaption.trim(),
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        folderId: validFolderId,
      });
    }
  };

  // Submit Edit Form
  const handleSaveEdit = () => {
    if (!selectedDoc) return;
    if (!editTitle.trim()) {
      message.warning('Title cannot be empty');
      return;
    }

    updateDocMutation.mutate({
      id: selectedDoc._id,
      payload: {
        title: editTitle.trim(),
        caption: editCaption.trim(),
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      }
    });
  };

  // Document Type & URL helpers using Universal File Resolver
  const isPdfDoc = (d) => isPdfFile(d);
  const isImageDoc = (d) => isImageFile(d);
  const isUrlDoc = (d) => isUrlResource(d);

  const getDocDisplayType = (d) => {
    if (isPdfFile(d)) return 'pdf';
    if (isImageFile(d)) return 'image';
    if (isUrlResource(d)) return 'link';
    return d?.docType || d?.type || 'doc';
  };

  const getDocSourceUrl = (d) => resolveFileUrl(d, space._id);

  // Open Document File / URL
  const handleOpenDocFile = (doc) => {
    if (isUrlDoc(doc) && doc.url) {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const targetUrl = getDocSourceUrl(doc);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Download Document File
  const handleDownloadDoc = (doc) => {
    if (isUrlDoc(doc) && doc.url) {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const targetUrl = getDocSourceUrl(doc);
    const link = document.createElement('a');
    link.href = targetUrl;
    link.target = '_blank';
    link.download = doc.title || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Visual Theme Tokens
  const cardBorder = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
  const mainBg = isLight ? '#ffffff' : '#0d0d12';
  const headerBg = isLight ? '#fafafa' : '#0f0f16';
  const previewBg = isLight ? '#f9fafb' : '#14141d';
  const textColor = isLight ? '#111827' : '#f3f4f6';
  const textMuted = '#64748b';
  const accent = isLight ? '#4f46e5' : '#6366f1';

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

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
        title="Docs"
        icon={RiFileTextLine}
        addButtonLabel="Upload / Add"
        itemType="doc"
        items={docs}
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
        selectedItemId={selectedId}
        onSelectItem={(item) => {
          setSelectedId(item._id);
          setIsUploading(false);
          setIsEditing(false);
        }}
        onAddItem={(folderId) => handleStartUpload(folderId)}
        isLight={isLight}
        isSidebarCollapsed={isSidebarCollapsed}
        onCloseSidebar={() => setIsSidebarCollapsed(true)}
      />

      {/* ── MAIN CONTENT PANE (INLINE VIEWER & UPLOADER NEXT TO SIDEBAR) ── */}
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
        {isUploading ? (
          /* ════════════════════════════════════════════════════════════════
             ── INLINE UPLOAD & ADD PANE ──
             ════════════════════════════════════════════════════════════════ */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: `1px solid ${cardBorder}`,
                background: headerBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RiUploadCloudLine size={18} style={{ color: accent }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
                  Add Document to {currentFolderPath}
                </span>
              </div>

              <Button
                size="small"
                icon={<RiCloseLine />}
                onClick={() => setIsUploading(false)}
                style={{ borderRadius: '6px' }}
              >
                Cancel
              </Button>
            </div>

            {/* Upload Form Body */}
            <div
              data-lenis-prevent
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 32px',
                scrollbarWidth: 'thin',
              }}
            >
              <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Mode Selector: File vs Link */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setAddMode('file')}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${addMode === 'file' ? accent : cardBorder}`,
                      background: addMode === 'file' ? (isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.12)') : 'transparent',
                      color: addMode === 'file' ? accent : textColor,
                      fontWeight: 600,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <RiUploadCloudLine size={16} />
                    <span>Upload File (PDF / Image)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddMode('url')}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${addMode === 'url' ? accent : cardBorder}`,
                      background: addMode === 'url' ? (isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.12)') : 'transparent',
                      color: addMode === 'url' ? accent : textColor,
                      fontWeight: 600,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <RiGlobalLine size={16} />
                    <span>Save Web Link / URL</span>
                  </button>
                </div>

                {/* File Upload Mode */}
                {addMode === 'file' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      SELECT FILE (PDF, PNG, JPG, WEBP, SVG)
                    </label>
                    <Dragger
                      name="file"
                      multiple={false}
                      beforeUpload={(file) => {
                        setUploadFile(file);
                        if (!formTitle) {
                          const baseName = file.name.replace(/\.[^/.]+$/, '');
                          setFormTitle(baseName);
                        }
                        return false;
                      }}
                      onRemove={() => setUploadFile(null)}
                      fileList={uploadFile ? [uploadFile] : []}
                      style={{
                        padding: '24px',
                        background: previewBg,
                        borderColor: isLight ? '#d1d5db' : '#2d2d38',
                        borderRadius: '10px',
                      }}
                    >
                      <p className="ant-upload-drag-icon" style={{ margin: '0 0 10px' }}>
                        <RiUploadCloudLine size={36} style={{ color: accent }} />
                      </p>
                      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: textColor }}>
                        Click or drag PDF/Image file to this area
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: textMuted }}>
                        Supports PDF, PNG, JPG, SVG, WebP up to 50MB
                      </p>
                    </Dragger>
                  </div>
                ) : (
                  /* URL Link Mode */
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      URL / WEB LINK
                    </label>
                    <Input
                      placeholder="https://example.com/docs/guide"
                      value={formUrl}
                      onChange={e => setFormUrl(e.target.value)}
                      prefix={<RiGlobalLine style={{ color: textMuted }} />}
                      style={{ borderRadius: '8px', padding: '8px 12px' }}
                    />
                  </div>
                )}

                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                    DOCUMENT TITLE
                  </label>
                  <Input
                    placeholder="e.g. Architecture Overview 2026"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    style={{ borderRadius: '8px', padding: '8px 12px', fontWeight: 600 }}
                  />
                </div>

                {/* Caption */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                    CAPTION / NOTES (OPTIONAL)
                  </label>
                  <TextArea
                    placeholder="Add brief description or notes for this document..."
                    value={formCaption}
                    onChange={e => setFormCaption(e.target.value)}
                    rows={3}
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                    TAGS (COMMA SEPARATED)
                  </label>
                  <Input
                    placeholder="spec, design, reference, draft"
                    value={formTags}
                    onChange={e => setFormTags(e.target.value)}
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                  />
                </div>

                {/* Submit button */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <Button
                    type="primary"
                    icon={<RiCheckLine />}
                    loading={uploadDocMutation.isPending || addUrlMutation.isPending}
                    onClick={handleSubmitUpload}
                    style={{
                      background: accent,
                      borderColor: accent,
                      borderRadius: '6px',
                      fontWeight: 600,
                      padding: '6px 22px',
                    }}
                  >
                    {addMode === 'file' ? 'Upload Document' : 'Save Web Link'}
                  </Button>
                  <Button
                    onClick={() => setIsUploading(false)}
                    style={{ borderRadius: '6px' }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : selectedDoc ? (
          /* ════════════════════════════════════════════════════════════════
             ── INLINE DOCUMENT VIEWER & EDITOR PANE ──
             ════════════════════════════════════════════════════════════════ */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Active Document Header */}
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
              {/* Left: Sidebar restore & Folder Path */}
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
                  <span>{selectedDoc.folderPath || currentFolderPath || 'Space Root'}</span>
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
                  color={isPdfDoc(selectedDoc) ? 'red' : isImageDoc(selectedDoc) ? 'green' : 'blue'}
                  style={{ margin: 0, borderRadius: '4px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}
                >
                  {getDocDisplayType(selectedDoc)}
                </Tag>
              </div>

              {/* Right: Actions (Open External, Download, Edit, Pin, Delete) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {isUrlDoc(selectedDoc) ? (
                  <Button
                    size="small"
                    icon={<RiExternalLinkLine />}
                    onClick={() => handleOpenDocFile(selectedDoc)}
                    style={{ borderRadius: '6px', fontSize: '12px' }}
                  >
                    Open Link
                  </Button>
                ) : (
                  <>
                    <Button
                      size="small"
                      icon={<RiExternalLinkLine />}
                      onClick={() => handleOpenDocFile(selectedDoc)}
                      style={{ borderRadius: '6px', fontSize: '12px' }}
                    >
                      Full View
                    </Button>
                    <Button
                      size="small"
                      icon={<RiDownloadLine />}
                      onClick={() => handleDownloadDoc(selectedDoc)}
                      style={{ borderRadius: '6px', fontSize: '12px' }}
                    >
                      Download
                    </Button>
                  </>
                )}

                {/* Edit / Save Button */}
                {isEditing ? (
                  <Button
                    type="primary"
                    size="small"
                    icon={<RiSaveLine />}
                    loading={updateDocMutation.isPending}
                    onClick={handleSaveEdit}
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
                  isPinned={selectedDoc.isPinned}
                  onToggle={() => togglePinMutation.mutate(selectedDoc._id)}
                  isLight={isLight}
                />

                {/* Delete Popconfirm */}
                <Popconfirm
                  title="Delete Document"
                  description="Are you sure you want to delete this document?"
                  okText="Delete"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={() => deleteMutation.mutate(selectedDoc._id)}
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

            {/* Document Content Body */}
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
                <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      DOCUMENT TITLE
                    </label>
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      style={{ borderRadius: '8px', fontSize: '15px', fontWeight: 600, padding: '7px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      CAPTION / NOTES
                    </label>
                    <TextArea
                      value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      rows={4}
                      style={{ borderRadius: '8px', padding: '8px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>
                      TAGS (COMMA SEPARATED)
                    </label>
                    <Input
                      value={editTags}
                      onChange={e => setEditTags(e.target.value)}
                      style={{ borderRadius: '8px', padding: '7px 12px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <Button
                      type="primary"
                      icon={<RiSaveLine />}
                      loading={updateDocMutation.isPending}
                      onClick={handleSaveEdit}
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
                  {/* Title & Metadata Top section */}
                  <div>
                    <h1
                      style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: textColor,
                        margin: '0 0 6px',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {selectedDoc.title}
                    </h1>

                    {selectedDoc.caption && (
                      <p style={{ margin: '6px 0 10px', fontSize: '13.5px', color: textMuted, lineHeight: 1.5 }}>
                        {selectedDoc.caption}
                      </p>
                    )}

                    {/* Metadata chips */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: textMuted }}>
                        <RiHistoryLine size={13} />
                        <span>{new Date(selectedDoc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      {selectedDoc.fileSize > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: textMuted }}>
                          <span>Size: {formatFileSize(selectedDoc.fileSize)}</span>
                        </div>
                      )}

                      {Array.isArray(selectedDoc.tags) && selectedDoc.tags.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {selectedDoc.tags.map((t, idx) => (
                            <Tag key={idx} style={{ borderRadius: '4px', fontSize: '10.5px', margin: 0 }}>
                              #{t}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Viewer Frame / Preview Box */}
                  <div
                    style={{
                      borderRadius: '10px',
                      border: `1px solid ${cardBorder}`,
                      background: previewBg,
                      overflow: 'hidden',
                      minHeight: '400px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {isPdfDoc(selectedDoc) ? (
                      /* PDF Inline Viewer */
                      <div style={{ width: '100%', height: '650px', position: 'relative' }}>
                        <iframe
                          src={`${getDocSourceUrl(selectedDoc)}#toolbar=1`}
                          title={selectedDoc.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '10px',
                          }}
                        />
                      </div>
                    ) : isImageDoc(selectedDoc) ? (
                      /* Image Inline Preview */
                      <div
                        style={{
                          padding: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '400px',
                        }}
                      >
                        <img
                          src={getDocSourceUrl(selectedDoc)}
                          alt={selectedDoc.title}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '600px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                    ) : (
                      /* URL Preview Card */
                      <div
                        style={{
                          padding: '40px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          gap: '14px',
                        }}
                      >
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: accent,
                          }}
                        >
                          <RiGlobalLine size={28} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: textColor }}>
                          External Web Resource
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
                          {selectedDoc.url}
                        </p>
                        <Button
                          type="primary"
                          icon={<RiExternalLinkLine />}
                          onClick={() => window.open(selectedDoc.url, '_blank', 'noopener,noreferrer')}
                          style={{
                            marginTop: '8px',
                            background: accent,
                            borderColor: accent,
                            borderRadius: '6px',
                            fontWeight: 600,
                          }}
                        >
                          Open in Browser
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             ── EMPTY STATE (Illustration & Call to Action) ──
             ════════════════════════════════════════════════════════════════ */
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
              src={docsIllustration}
              alt="Documents"
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
              No document selected
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
              Select a document from the sidebar on the left, or upload a PDF, image, or link directly into {currentFolderPath}.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                type="primary"
                icon={<RiUploadCloudLine />}
                onClick={() => handleStartUpload(selectedFolderId)}
                style={{
                  background: accent,
                  borderColor: accent,
                  borderRadius: '6px',
                  fontWeight: 600,
                  padding: '6px 18px',
                }}
              >
                Upload Document
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ── Move Item Modal ── */}
      {selectedDoc && (
        <MoveItemModal
          isOpen={moveModalOpen}
          onClose={() => setMoveModalOpen(false)}
          spaceId={space._id}
          item={selectedDoc}
          isLight={isLight}
        />
      )}
    </div>
  );
}
