import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiStickyNoteLine, RiSearchLine, RiAddLine, RiFolderLine,
  RiBold, RiItalic, RiStrikethrough, RiH1, RiH2, RiH3,
  RiCodeSSlashLine, RiCodeBoxLine, RiDoubleQuotesL,
  RiListOrdered, RiListUnordered, RiLink, RiImageLine,
  RiTableLine, RiSeparator, RiCheckLine,
  RiLoader4Line, RiDeleteBinLine, RiPushpinLine, RiPushpinFill,
  RiFullscreenLine, RiFullscreenExitLine, RiArrowLeftLine,
  RiUploadCloudLine, RiMenuFoldLine, RiMenuUnfoldLine
} from 'react-icons/ri';
import { Button, message, Tooltip, Popconfirm } from 'antd';
import api from '../../api/axios';
import MarkdownRenderer from '../common/MarkdownRenderer';
import ModuleSidebar from './ModuleSidebar';
import notesIllustration from '../../assets/editor/notes.svg';

export default function NotesSection({
  space,
  isLight,
  openNoteId,
  highlightId,
  selectedFolderId: propFolderId,
  onSelectFolder: propOnSelectFolder,
  onNavigateSection,
}) {
  const queryClient = useQueryClient();

  const [selectedNoteId, setSelectedNoteId] = useState(openNoteId || highlightId || null);

  // Responsive & Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarVisible(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Editor states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const [viewMode, setViewMode] = useState('write'); // 'write', 'preview', 'split'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localFolderId, setLocalFolderId] = useState(null);
  const selectedFolderId = propFolderId !== undefined ? propFolderId : localFolderId;
  const handleSelectFolder = (fId) => {
    if (propOnSelectFolder) propOnSelectFolder(fId);
    else setLocalFolderId(fId);
  };

  // Textarea ref for toolbar insertions & file input ref
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const autosaveTimerRef = useRef(null);

  // Fetch folders
  const { data: folderData } = useQuery({
    queryKey: ['folders', space._id],
    queryFn: async () => {
      const res = await api.get(`/api/spaces/${space._id}/folders`);
      return res.data.folders || [];
    }
  });

  const folders = folderData || [];

  // Fetch items (type='note')
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['items', space._id, 'note'],
    queryFn: async () => {
      const res = await api.get(`/api/spaces/${space._id}/items?type=note`);
      return res.data.items || [];
    }
  });

  const notes = itemsData || [];

  // Active note object
  const activeNote = useMemo(() => {
    return notes.find(n => n._id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // When activeNote changes, populate editor
  useEffect(() => {
    if (activeNote) {
      setNoteTitle(activeNote.title || '');
      setNoteContent(activeNote.content || '');
      setSaveStatus('saved');
    } else if (notes.length > 0 && !selectedNoteId && (openNoteId || highlightId)) {
      const target = notes.find(n => n._id === (openNoteId || highlightId));
      if (target) setSelectedNoteId(target._id);
    }
  }, [activeNote, openNoteId, highlightId, notes, selectedNoteId]);

  // Mutations
  const createNoteMutation = useMutation({
    mutationFn: async ({ title, folderId, content }) => {
      const res = await api.post(`/api/spaces/${space._id}/items`, {
        type: 'note',
        title: title || 'Untitled Note',
        folderId: folderId || null,
        content: content !== undefined ? content : '# ' + (title || 'Untitled Note') + '\n\nStart writing markdown here...'
      });
      return res.data;
    },
    onSuccess: (data) => {
      message.success('Note created');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      if (data?.item?._id) {
        setSelectedNoteId(data.item._id);
        setNoteTitle(data.item.title || '');
        setNoteContent(data.item.content || '');
        setSaveStatus('saved');
      }
      if (isMobile) {
        setMobileSidebarVisible(false);
      }
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to create note');
    }
  });

  const handleCreateNewNote = useCallback((folderId) => {
    const existingTitles = new Set(
      notes.map(n => (n.title || '').trim().toLowerCase())
    );
    let count = 1;
    while (
      existingTitles.has(`note ${count}`.toLowerCase()) ||
      existingTitles.has(`note(${count})`.toLowerCase()) ||
      existingTitles.has(`note (${count})`.toLowerCase())
    ) {
      count++;
    }
    const defaultTitle = `Note ${count}`;
    const destinationFolderId = (folderId !== undefined && folderId !== 'undefined')
      ? (folderId && folderId !== 'root' && folderId !== 'null' ? folderId : null)
      : (selectedFolderId && selectedFolderId !== 'root' && selectedFolderId !== 'null' ? selectedFolderId : null);

    createNoteMutation.mutate({
      title: defaultTitle,
      folderId: destinationFolderId,
      content: `# ${defaultTitle}\n\nStart writing markdown here...`
    });
  }, [notes, selectedFolderId, createNoteMutation]);

  const saveNoteMutation = useMutation({
    mutationFn: async ({ noteId, title, content }) => {
      const res = await api.patch(`/api/spaces/${space._id}/items/${noteId}`, {
        title,
        content
      });
      return res.data;
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
    },
    onError: () => {
      setSaveStatus('unsaved');
      message.error('Failed to save note');
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId) => {
      return api.delete(`/api/spaces/${space._id}/items/${noteId}`);
    },
    onSuccess: () => {
      message.success('Note deleted');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedNoteId(null);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to delete note');
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async (noteId) => {
      return api.patch(`/api/spaces/${space._id}/items/${noteId}/pin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'pinned'] });
    }
  });

  // Debounced Autosave
  const triggerAutosave = useCallback((newTitle, newContent) => {
    if (!selectedNoteId) return;
    setSaveStatus('unsaved');
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      setSaveStatus('saving');
      saveNoteMutation.mutate({
        noteId: selectedNoteId,
        title: newTitle || 'Untitled Note',
        content: newContent
      });
    }, 800);
  }, [selectedNoteId, saveNoteMutation]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setNoteTitle(val);
    triggerAutosave(val, noteContent);
  };

  const handleContentChange = (e) => {
    const val = e.target.value;
    setNoteContent(val);
    triggerAutosave(noteTitle, val);
  };

  // Handle Markdown file upload / Open from device
  const handleMarkdownUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const isMd = /\.(md|markdown|txt)$/i.test(fileName);
    if (!isMd) {
      message.error('Please select a valid Markdown (.md) or text file');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const title = fileName.replace(/\.(md|markdown|txt)$/i, '') || 'Imported Note';
        createNoteMutation.mutate({
          title,
          folderId: selectedFolderId || folders[0]?._id || null,
          content: typeof content === 'string' ? content : '',
        });
      } catch (err) {
        message.error('Failed to read Markdown file');
      }
    };
    reader.onerror = () => {
      message.error('Error reading selected file');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Image input ref for note inline images
  const imageInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Upload an image and insert markdown link at cursor
  const handleInsertImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file (PNG, JPG, WebP, GIF)');
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      formData.append('title', file.name || 'image');
      if (selectedFolderId && selectedFolderId !== 'root' && selectedFolderId !== 'null') {
        formData.append('folderId', selectedFolderId);
      }

      const res = await api.post(`/api/spaces/${space._id}/items/upload`, formData);
      const uploadedItem = res.data?.item || res.data?.doc;
      const imageUrl = uploadedItem?.cloudinaryUrl || uploadedItem?.url;

      if (imageUrl) {
        const altText = (uploadedItem.title || 'image').replace(/[\[\]]/g, '');
        insertMarkdown(`![${altText}](${imageUrl})\n`, '');
        message.success('Image uploaded and inserted');
        queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      }
    } catch (err) {
      console.error('Note image upload error:', err);
      message.error(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          handleInsertImageFile(blob);
          break;
        }
      }
    }
  };

  // Markdown Toolbar helper to insert text at cursor
  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = noteContent.substring(start, end);
    const replacement = before + (selected || 'text') + after;

    const updated = noteContent.substring(0, start) + replacement + noteContent.substring(end);
    setNoteContent(updated);
    triggerAutosave(noteTitle, updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected.length || 4));
    }, 10);
  };

  // Standard DevOneStack theme tokens matching LearningsSection & SnippetsSection
  const cardBorder = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
  const sidebarBg = isLight ? '#fafafa' : '#0a0a0f';
  const editorBg = isLight ? '#ffffff' : '#0b0b0e';
  const headerBg = isLight ? '#fafafa' : '#101017';
  const textColor = isLight ? '#111827' : '#ffffff';
  const textMuted = '#64748b';
  const accent = isLight ? '#4f46e5' : '#6366f1';

  const handleSelectNote = (id) => {
    setSelectedNoteId(id);
    if (isMobile) {
      setMobileSidebarVisible(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: isFullscreen ? '100vh' : '100%',
      width: '100%',
      minHeight: 0,
      flex: 1,
      position: isFullscreen ? 'fixed' : 'relative',
      inset: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 1200 : 'auto',
      background: editorBg,
      overflow: 'hidden',
    }}>

      {/* ── LEFT COLUMN: Notes Sidebar ── */}
      <ModuleSidebar
        spaceId={space._id}
        title="Notes"
        icon={RiStickyNoteLine}
        addButtonLabel="New Note"
        itemType="note"
        items={notes}
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
        selectedItemId={selectedNoteId}
        onSelectItem={(item) => handleSelectNote(item._id)}
        onAddItem={(folderId) => handleCreateNewNote(folderId)}
        isLight={isLight}
        isMobile={isMobile}
        isSidebarCollapsed={isSidebarCollapsed}
        onCloseSidebar={() => setIsSidebarCollapsed(true)}
        mobileSidebarVisible={mobileSidebarVisible}
        hasActiveItem={!!activeNote}
      />

      {/* ── RIGHT COLUMN: MAIN EDITOR / EMPTY STATE AREA ── */}
      {(!isMobile || (activeNote && !mobileSidebarVisible)) && (
        <main style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: editorBg,
          overflow: 'hidden',
        }}>

          {!activeNote ? (
            /* ── Clean Empty State with Notes SVG Illustration ── */
            <div style={{
              flex: 1,
              minHeight: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 20px',
              textAlign: 'center',
              userSelect: 'none',
              position: 'relative',
            }}>
              {isSidebarCollapsed && !isMobile && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                  <Tooltip title="Open sidebar">
                    <Button
                      size="small"
                      icon={<RiMenuUnfoldLine size={14} />}
                      onClick={() => setIsSidebarCollapsed(false)}
                      style={{
                        background: isLight ? '#ffffff' : '#1a1a1f',
                        borderColor: cardBorder,
                        color: textColor,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      Open Sidebar
                    </Button>
                  </Tooltip>
                </div>
              )}

              {/* Centered Notes Illustration (No decorative box, responsive sizing) */}
              <img
                src={notesIllustration}
                alt="Notes Workspace"
                style={{
                  width: '100%',
                  maxWidth: '180px',
                  maxHeight: '150px',
                  height: 'auto',
                  objectFit: 'contain',
                  marginBottom: '18px',
                  opacity: isLight ? 0.9 : 0.8,
                  pointerEvents: 'none',
                }}
              />

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: textMuted,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '6px',
                display: 'block'
              }}>
                NO NOTE OPEN
              </span>

              <h2 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: textColor,
                margin: '0 0 6px',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
              }}>
                Your notes workspace is ready
              </h2>

              <p style={{
                fontSize: '13px',
                color: textMuted,
                margin: '0 0 20px',
                maxWidth: '380px',
                lineHeight: 1.5,
              }}>
                Start writing a note or choose one from the sidebar.
              </p>

              {/* Action Buttons: [+ New Note] and [Upload Markdown] */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                maxWidth: '100%',
              }}>
                <Button
                  type="primary"
                  icon={<RiAddLine />}
                  onClick={() => handleCreateNewNote(selectedFolderId || null)}
                  style={{
                    background: accent,
                    borderColor: accent,
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '36px',
                    padding: '0 16px',
                  }}
                >
                  New Note
                </Button>

                <Button
                  icon={<RiUploadCloudLine />}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.04)',
                    borderColor: cardBorder,
                    color: textColor,
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '36px',
                    padding: '0 16px',
                  }}
                >
                  Upload Markdown
                </Button>

                {/* Hidden file input for Markdown Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMarkdownUpload}
                  accept=".md,.markdown,.txt,text/markdown,text/plain"
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          ) : (
            /* ── Active Note Editor View ── */
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

              {/* Editor Top Bar: Folder Path & Save Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 16px',
                borderBottom: `1px solid ${cardBorder}`,
                background: headerBg,
                gap: '12px',
                flexShrink: 0,
              }}>
                {/* Clickable Folder Path / Mobile Back */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  {isSidebarCollapsed && !isMobile && (
                    <Tooltip title="Open sidebar">
                      <button
                        type="button"
                        onClick={() => setIsSidebarCollapsed(false)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: 'none',
                          color: textMuted,
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: '6px',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = accent}
                        onMouseLeave={e => e.currentTarget.style.color = textMuted}
                      >
                        <RiMenuUnfoldLine size={16} />
                      </button>
                    </Tooltip>
                  )}
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setMobileSidebarVisible(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: accent,
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        flexShrink: 0,
                      }}
                    >
                      <RiArrowLeftLine size={16} />
                      <span>Notes</span>
                    </button>
                  )}

                  <div
                    onClick={() => {
                      if (onNavigateSection) {
                        onNavigateSection('explorer', activeNote._id, activeNote.folderId);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12.5px',
                      color: accent,
                      cursor: 'pointer',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                    title="Click to view in Explorer"
                  >
                    <RiFolderLine size={14} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeNote.folderPath || 'Workspace'}
                    </span>
                    <span style={{ color: textMuted }}>/</span>
                    <span style={{ color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {noteTitle || 'Untitled'}
                    </span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {/* Save Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: textMuted }}>
                    {saveStatus === 'saving' && (
                      <>
                        <RiLoader4Line size={13} className="animate-spin" style={{ color: accent }} />
                        <span>Saving...</span>
                      </>
                    )}
                    {saveStatus === 'saved' && (
                      <>
                        <RiCheckLine size={14} style={{ color: '#10b981' }} />
                        <span style={{ color: '#10b981', fontWeight: 600 }}>Saved</span>
                      </>
                    )}
                    {saveStatus === 'unsaved' && (
                      <>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                        <span>Unsaved</span>
                      </>
                    )}
                  </div>

                  {/* View Mode Toggle: Write / Split / Preview */}
                  <div style={{ display: 'flex', background: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('write')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: viewMode === 'write' ? (isLight ? '#fff' : '#1e1e2d') : 'transparent',
                        color: viewMode === 'write' ? textColor : textMuted,
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('split')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: viewMode === 'split' ? (isLight ? '#fff' : '#1e1e2d') : 'transparent',
                        color: viewMode === 'split' ? textColor : textMuted,
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Split
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: viewMode === 'preview' ? (isLight ? '#fff' : '#1e1e2d') : 'transparent',
                        color: viewMode === 'preview' ? textColor : textMuted,
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Preview
                    </button>
                  </div>

                  {/* Fullscreen Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    style={{ background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <RiFullscreenExitLine size={16} /> : <RiFullscreenLine size={16} />}
                  </button>

                  {/* Pin Button */}
                  <button
                    type="button"
                    onClick={() => togglePinMutation.mutate(activeNote._id)}
                    style={{ background: 'transparent', border: 'none', color: activeNote.isPinned ? '#eab308' : textMuted, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    title="Pin Note"
                  >
                    {activeNote.isPinned ? <RiPushpinFill size={16} /> : <RiPushpinLine size={16} />}
                  </button>

                  {/* Delete Note */}
                  <Popconfirm
                    title="Delete this note?"
                    onConfirm={() => deleteNoteMutation.mutate(activeNote._id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <button
                      type="button"
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                      title="Delete Note"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </Popconfirm>
                </div>
              </div>

              {/* Markdown Toolbar */}
              {viewMode !== 'preview' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '2px',
                  padding: '5px 14px',
                  borderBottom: `1px solid ${cardBorder}`,
                  background: isLight ? '#ffffff' : '#0e0e12',
                  flexShrink: 0,
                }}>
                  {[
                    { icon: RiH1, label: 'Heading 1', fn: () => insertMarkdown('# ', '\n') },
                    { icon: RiH2, label: 'Heading 2', fn: () => insertMarkdown('## ', '\n') },
                    { icon: RiH3, label: 'Heading 3', fn: () => insertMarkdown('### ', '\n') },
                    { divider: true },
                    { icon: RiBold, label: 'Bold', fn: () => insertMarkdown('**', '**') },
                    { icon: RiItalic, label: 'Italic', fn: () => insertMarkdown('*', '*') },
                    { icon: RiStrikethrough, label: 'Strikethrough', fn: () => insertMarkdown('~~', '~~') },
                    { divider: true },
                    { icon: RiCodeSSlashLine, label: 'Inline Code', fn: () => insertMarkdown('`', '`') },
                    { icon: RiCodeBoxLine, label: 'Code Block', fn: () => insertMarkdown('```javascript\n', '\n```') },
                    { icon: RiDoubleQuotesL, label: 'Blockquote', fn: () => insertMarkdown('> ', '\n') },
                    { divider: true },
                    { icon: RiListUnordered, label: 'Bullet List', fn: () => insertMarkdown('- ', '\n') },
                    { icon: RiListOrdered, label: 'Numbered List', fn: () => insertMarkdown('1. ', '\n') },
                    { icon: RiTableLine, label: 'Table', fn: () => insertMarkdown('| Col 1 | Col 2 |\n|---|---|\n| val 1 | val 2 |\n') },
                    { icon: RiSeparator, label: 'Divider', fn: () => insertMarkdown('\n---\n') },
                    { divider: true },
                    { icon: RiLink, label: 'Link', fn: () => insertMarkdown('[', '](https://)') },
                    { icon: RiImageLine, label: 'Insert Image (Upload or Paste)', fn: () => imageInputRef.current?.click() },
                  ].map((tool, idx) => {
                    if (tool.divider) {
                      return <span key={idx} style={{ height: '14px', width: '1px', background: cardBorder, margin: '0 4px' }} />;
                    }
                    const ToolIcon = tool.icon;
                    return (
                      <Tooltip key={idx} title={tool.label}>
                        <button
                          type="button"
                          onClick={tool.fn}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: textMuted,
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = isLight ? '#f3f4f6' : 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.color = textColor;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = textMuted;
                          }}
                        >
                          <ToolIcon size={15} />
                        </button>
                      </Tooltip>
                    );
                  })}
                  {/* Hidden image input for inline Markdown Image Insert */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleInsertImageFile(f);
                      e.target.value = '';
                    }}
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    style={{ display: 'none' }}
                  />
                  {isUploadingImage && (
                    <span style={{ fontSize: '11px', color: accent, display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                      <RiLoader4Line size={12} className="animate-spin" /> Uploading image...
                    </span>
                  )}
                </div>
              )}

              {/* Note Title Input */}
              <div style={{ padding: '10px 18px 6px', borderBottom: `1px solid ${cardBorder}`, flexShrink: 0 }}>
                <input
                  type="text"
                  placeholder="Note title..."
                  value={noteTitle}
                  onChange={handleTitleChange}
                  style={{
                    width: '100%',
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: textColor,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    paddingBottom: '2px',
                  }}
                />
              </div>

              {/* Editor Workspace Content Area */}
              <div style={{ flex: 1, minHeight: 0, height: '100%', display: 'flex', overflow: 'hidden' }}>
                {/* Textarea (Write Mode / Split Mode) */}
                {(viewMode === 'write' || viewMode === 'split') && (
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: viewMode === 'split' ? `1px solid ${cardBorder}` : 'none',
                  }}>
                    <textarea
                      ref={textareaRef}
                      value={noteContent}
                      onChange={handleContentChange}
                      onPaste={handlePaste}
                      placeholder="Write markdown here... (you can paste images directly)"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        height: '100%',
                        width: '100%',
                        padding: '16px 18px',
                        background: 'transparent',
                        color: textColor,
                        fontSize: '13.5px',
                        fontFamily: 'var(--font-mono, monospace)',
                        lineHeight: 1.6,
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                      }}
                    />
                  </div>
                )}

                {/* Markdown Preview (Preview Mode / Split Mode) */}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                    padding: '16px 18px',
                    overflowY: 'auto',
                    background: isLight ? '#fafafa' : '#0e0e12',
                    boxSizing: 'border-box',
                  }}>
                    <MarkdownRenderer content={noteContent || '*No content written yet.*'} isLight={isLight} />
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      )}

    </div>
  );
}
