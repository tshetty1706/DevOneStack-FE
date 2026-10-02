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
  RiUploadCloudLine
} from 'react-icons/ri';
import { Modal, Input, Select, Button, message, Tooltip, Popconfirm } from 'antd';
import api from '../../api/axios';
import MarkdownRenderer from '../common/MarkdownRenderer';
import SharedFolderTree from './SharedFolderTree';
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

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'recent'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(openNoteId || highlightId || null);

  // Responsive state
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
  const [moveModalOpen, setMoveModalOpen] = useState(false);

  // Destination Folder Modal for "+ New Note"
  const [newNoteModalOpen, setNewNoteModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteFolderId, setNewNoteFolderId] = useState(selectedFolderId || null);

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

  // Group notes by folder
  const groupedNotes = useMemo(() => {
    const map = new Map();

    folders.forEach(f => {
      map.set(f._id, {
        folder: f,
        notes: []
      });
    });

    const rootNotes = [];

    notes.forEach(note => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title?.toLowerCase().includes(q);
        const matchesContent = note.content?.toLowerCase().includes(q);
        const matchesTag = note.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesTag) return;
      }

      if (note.folderId && map.has(note.folderId)) {
        map.get(note.folderId).notes.push(note);
      } else {
        rootNotes.push(note);
      }
    });

    map.forEach(group => {
      group.notes.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
    });

    rootNotes.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));

    return {
      foldersList: Array.from(map.values()).sort((a, b) => a.folder.name.localeCompare(b.folder.name, undefined, { sensitivity: 'base' })),
      rootNotes
    };
  }, [folders, notes, searchQuery]);

  // Recent notes list (sorted by updatedAt)
  const recentNotes = useMemo(() => {
    return [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10);
  }, [notes]);

  // Mutations
  const createNoteMutation = useMutation({
    mutationFn: async ({ title, folderId, content }) => {
      const res = await api.post(`/api/spaces/${space._id}/items`, {
        type: 'note',
        title: title || 'Untitled Note',
        folderId,
        content: content !== undefined ? content : '# ' + (title || 'Untitled Note') + '\n\nStart writing markdown here...'
      });
      return res.data;
    },
    onSuccess: (data) => {
      message.success('Note created!');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setSelectedNoteId(data.item._id);
      setNewNoteModalOpen(false);
      setNewNoteTitle('');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to create note');
    }
  });

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
      {(!isMobile || (!activeNote || mobileSidebarVisible)) && (
        <aside style={{
          width: isMobile ? '100%' : '260px',
          minWidth: isMobile ? '100%' : '240px',
          maxWidth: isMobile ? '100%' : '300px',
          borderRight: isMobile ? 'none' : `1px solid ${cardBorder}`,
          background: sidebarBg,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {/* Header & New Note CTA */}
          <div style={{
            padding: '12px 14px',
            borderBottom: `1px solid ${cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RiStickyNoteLine size={17} style={{ color: accent }} />
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: textColor, fontFamily: 'var(--font-display)' }}>
                Notes
              </span>
            </div>

            <Button
              type="primary"
              size="small"
              icon={<RiAddLine />}
              onClick={() => {
                setNewNoteFolderId(selectedFolderId || folders[0]?._id || null);
                setNewNoteModalOpen(true);
              }}
              style={{
                background: accent,
                borderColor: accent,
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              New Note
            </Button>
          </div>

          {/* Search Input */}
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${cardBorder}`, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <RiSearchLine size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 28px',
                  borderRadius: '6px',
                  border: `1px solid ${isLight ? '#e5e5e5' : '#2a2a2a'}`,
                  background: isLight ? '#ffffff' : '#1a1a1a',
                  color: textColor,
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Tabs: All & Recent */}
          <div style={{ display: 'flex', padding: '6px 12px', gap: '6px', borderBottom: `1px solid ${cardBorder}`, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                flex: 1,
                padding: '4px 0',
                borderRadius: '5px',
                border: 'none',
                background: activeTab === 'all' ? (isLight ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.2)') : 'transparent',
                color: activeTab === 'all' ? accent : textMuted,
                fontWeight: activeTab === 'all' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recent')}
              style={{
                flex: 1,
                padding: '4px 0',
                borderRadius: '5px',
                border: 'none',
                background: activeTab === 'recent' ? (isLight ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.2)') : 'transparent',
                color: activeTab === 'recent' ? accent : textMuted,
                fontWeight: activeTab === 'recent' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Recent
            </button>
          </div>

          {/* Workspaces / Folders Tree */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 2px', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'recent' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: textMuted, padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recently Modified
                </div>
                {recentNotes.length === 0 ? (
                  <div style={{ padding: '12px 8px', fontSize: '12px', color: textMuted, textAlign: 'center' }}>
                    No recent notes
                  </div>
                ) : (
                  recentNotes.map(note => (
                    <button
                      type="button"
                      key={note._id}
                      onClick={() => handleSelectNote(note._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: selectedNoteId === note._id ? (isLight ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.18)') : 'transparent',
                        color: selectedNoteId === note._id ? accent : textColor,
                        fontSize: '12.5px',
                        fontWeight: selectedNoteId === note._id ? 600 : 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      <RiStickyNoteLine size={14} style={{ flexShrink: 0, color: '#10b981' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.title}
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <SharedFolderTree
                spaceId={space._id}
                selectedFolderId={selectedFolderId}
                onSelectFolder={handleSelectFolder}
                onSelectItem={(item) => setSelectedNoteId(item._id)}
                selectedItemId={selectedNoteId}
                filterItemType="note"
                isLight={isLight}
                showHeader={true}
                showSearch={false}
              />
            )}
          </div>
        </aside>
      )}

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
            }}>
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
                  onClick={() => {
                    setNewNoteFolderId(selectedFolderId || folders[0]?._id || null);
                    setNewNoteModalOpen(true);
                  }}
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
                    { icon: RiImageLine, label: 'Image', fn: () => insertMarkdown('![alt](', ')') },
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
                      placeholder="Write markdown here..."
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

      {/* ── New Note Destination Folder Modal ── */}
      <Modal
        title="Create New Note"
        open={newNoteModalOpen}
        onCancel={() => setNewNoteModalOpen(false)}
        onOk={() => {
          createNoteMutation.mutate({
            title: newNoteTitle.trim() || 'Untitled Note',
            folderId: newNoteFolderId
          });
        }}
        confirmLoading={createNoteMutation.isPending}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '4px' }}>Note Title</label>
            <Input
              placeholder="e.g. Authentication Flow, System Design, JWT Patterns"
              value={newNoteTitle}
              onChange={e => setNewNoteTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '4px' }}>Destination Folder</label>
            <Select
              style={{ width: '100%' }}
              placeholder="Select folder"
              value={newNoteFolderId}
              onChange={val => setNewNoteFolderId(val)}
              options={[
                { value: null, label: '📁 Workspace (Root)' },
                ...folders.map(f => ({ value: f._id, label: `📁 ${f.path || f.name}` }))
              ]}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
