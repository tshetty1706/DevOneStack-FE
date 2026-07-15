import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, message, Tooltip } from 'antd';
import { RiAddLine, RiPushpinLine, RiPushpin2Fill, RiDeleteBinLine, RiSearchLine, RiSaveLine, RiCloseLine, RiStickyNoteLine } from 'react-icons/ri';
import MDEditor from '@uiw/react-md-editor';
import api from '../../api/axios';

export default function NotesSection({ space, isLight, openNoteId }) {
  const queryClient = useQueryClient();
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  useEffect(() => {
    if (openNoteId) {
      setSelectedNoteId(openNoteId);
    }
  }, [openNoteId]);

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
        }}
      >
        {isPinned ? <RiPushpin2Fill size={14} /> : <RiPushpinLine size={14} />}
      </button>
    </Tooltip>
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Editor states
  const [editorTitle, setEditorTitle] = useState('');
  const [editorBody, setEditorBody] = useState('');
  const [editorTags, setEditorTags] = useState([]);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const saveTimeoutRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch list of notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', space._id, debouncedQuery],
    queryFn: async () => {
      const endpoint = debouncedQuery
        ? `/api/spaces/${space._id}/notes/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/spaces/${space._id}/notes`;
      const response = await api.get(endpoint);
      return response.data.notes;
    }
  });

  // Fetch selected note content
  const { data: contentData } = useQuery({
    queryKey: ['noteContent', selectedNoteId],
    queryFn: async () => {
      if (!selectedNoteId) return { body: '' };
      const response = await api.get(`/api/spaces/${space._id}/notes/${selectedNoteId}/content`);
      return response.data;
    },
    enabled: !!selectedNoteId
  });

  // Auto load content into editor when selectedNote changes
  useEffect(() => {
    if (selectedNoteId) {
      const activeNote = notes.find(n => n._id === selectedNoteId);
      if (activeNote) {
        setEditorTitle(activeNote.title);
        setEditorTags(activeNote.tags || []);
        if (contentData) {
          setEditorBody(contentData.body || '');
        }
      }
    } else {
      setEditorTitle('');
      setEditorBody('');
      setEditorTags([]);
    }
  }, [selectedNoteId, contentData, notes]);

  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    if (openNoteId) {
      setSelectedNoteId(openNoteId);
      hasAutoSelectedRef.current = true;
    }
  }, [openNoteId]);

  useEffect(() => {
    if (!hasAutoSelectedRef.current && !selectedNoteId && notes && notes.length > 0) {
      setSelectedNoteId(notes[0]._id);
      hasAutoSelectedRef.current = true;
    }
  }, [notes, selectedNoteId]);

  // Create Note mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/api/spaces/${space._id}/notes`, {
        title: 'Untitled Note',
        body: '',
        tags: []
      });
    },
    onSuccess: (res) => {
      message.success('New note created');
      queryClient.invalidateQueries(['notes', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      setSelectedNoteId(res.data.note._id);
    }
  });

  // Auto save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ body }) => {
      return api.patch(`/api/spaces/${space._id}/notes/${selectedNoteId}/content`, { body });
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries(['notes', space._id]);
    },
    onError: () => {
      setSaveStatus('error');
    }
  });

  // Save metadata mutation
  const saveMetaMutation = useMutation({
    mutationFn: async ({ title, tags }) => {
      return api.patch(`/api/spaces/${space._id}/notes/${selectedNoteId}`, { title, tags });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', space._id]);
    }
  });

  // Handle body changes and trigger debounced auto-save
  const handleBodyChange = (val) => {
    setEditorBody(val || '');
    setSaveStatus('saving');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveMutation.mutate({ body: val || '' });
    }, 1500);
  };

  // Handle title/tags change and trigger immediate save
  const handleMetaChange = (newTitle, newTags) => {
    setEditorTitle(newTitle);
    setEditorTags(newTags);
    saveMetaMutation.mutate({ title: newTitle, tags: newTags });
  };

  // Toggle Pin
  const togglePin = useMutation({
    mutationFn: async (id) => {
      return api.patch(`/api/spaces/${space._id}/notes/${id}/pin`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['notes', space._id]);
      const prev = queryClient.getQueryData(['notes', space._id, debouncedQuery]);
      if (prev) {
        queryClient.setQueryData(['notes', space._id, debouncedQuery], old =>
          old.map(item => item._id === id ? { ...item, isPinned: !item.isPinned } : item)
        );
      }
      return { prev };
    },
    onError: (_, __, context) => {
      if (context && context.prev) {
        queryClient.setQueryData(['notes', space._id, debouncedQuery], context.prev);
      }
      message.error('Failed to update pin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', space._id]);
    }
  });

  // Delete note
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/notes/${id}`);
    },
    onSuccess: () => {
      message.success('Note deleted');
      queryClient.invalidateQueries(['notes', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      if (selectedNoteId) setSelectedNoteId(null);
    }
  });

  return (
    <div style={{ display: 'flex', minHeight: '420px', height: 'calc(100vh - 180px)', overflow: 'hidden' }}>
      
      {/* LEFT PANEL: Explorer */}
      <div style={{
        width: '280px', flexShrink: 0, borderRight: `1px solid ${isLight ? '#ebebeb' : '#282828'}`,
        display: 'flex', flexDirection: 'column', background: isLight ? '#fcfcfd' : '#141414'
      }}>
        {/* Search & Add bar */}
        <div style={{ padding: '12px', display: 'flex', gap: '8px', borderBottom: `1px solid ${isLight ? '#ebebeb' : '#282828'}` }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <RiSearchLine style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#666', zIndex: 10 }} />
            <input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '6px 6px 6px 26px', borderRadius: '6px',
                border: `1px solid ${isLight ? '#e5e5e5' : '#2a2a2a'}`,
                background: isLight ? '#ffffff' : '#1e1e1e',
                color: isLight ? '#111' : '#fff',
                fontSize: '12px', outline: 'none'
              }}
            />
          </div>
          <Button
            type="primary"
            icon={<RiAddLine />}
            onClick={() => createMutation.mutate()}
            style={{ height: '30px', padding: '0 8px', background: isLight ? '#4f46e5' : '#6366f1', borderColor: isLight ? '#4f46e5' : '#6366f1' }}
          />
        </div>

        {/* Note Rows list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} style={{ padding: '12px' }} />
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: '#666', fontSize: '12px' }}>
              No notes found. Create your first Concept note!
            </div>
          ) : (
            notes.sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(note => {
              const isActive = note._id === selectedNoteId;
              return (
                <div
                  key={note._id}
                  onClick={() => setSelectedNoteId(note._id)}
                  style={{
                    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                    background: isActive ? (isLight ? 'rgba(79,70,229,0.06)' : 'rgba(99,102,241,0.08)') : 'transparent',
                    borderLeft: isActive ? `2px solid ${isLight ? '#4f46e5' : '#6366f1'}` : '2px solid transparent',
                    display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = isLight ? '#f5f5f7' : '#1c1c1e' }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500, color: isLight ? '#111' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                      {note.title || 'Untitled Note'}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <PinButton
                        isPinned={note.isPinned}
                        onToggle={() => togglePin.mutate(note._id)}
                      />
                      <Popconfirm
                        title="Delete note?"
                        onConfirm={() => deleteMutation.mutate(note._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', padding: 0 }}>
                          <RiDeleteBinLine size={13} />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#777', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.preview || 'No description...'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#555', alignSelf: 'flex-end' }}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: isLight ? '#fff' : '#111', padding: '16px' }}>
        {selectedNoteId ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }} className="note-editor-wrapper">
            {/* Header: Title + AutoSave indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <input
                value={editorTitle}
                onChange={(e) => handleMetaChange(e.target.value, editorTags)}
                placeholder="Note Title"
                style={{
                  flex: 1, fontSize: '18px', fontWeight: 700, color: isLight ? '#111' : '#fff',
                  border: 'none', background: 'transparent', outline: 'none',
                  borderBottom: `1px solid ${isLight ? '#ebebeb' : '#282828'}`,
                  paddingBottom: '6px'
                }}
              />
              <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RiSaveLine size={14} style={{ color: saveStatus === 'saving' ? '#eab308' : (saveStatus === 'error' ? '#ef4444' : '#22c55e') }} />
                  <span style={{ color: saveStatus === 'saving' ? '#eab308' : (saveStatus === 'error' ? '#ef4444' : '#22c55e'), fontWeight: 600 }}>
                    {saveStatus === 'saving' ? 'Saving...' : (saveStatus === 'error' ? 'Save Error' : 'Saved')}
                  </span>
                </div>
                
                <Tooltip title="Close note">
                  <button
                    onClick={() => setSelectedNoteId(null)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 6,
                      border: '1px solid var(--border)', background: 'none',
                      cursor: 'pointer', color: '#666',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = isLight ? '#111' : '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#666'}
                  >
                    <RiCloseLine size={16} />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Tags line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>TAGS:</span>
              <Select
                mode="tags"
                bordered={false}
                placeholder="Add tags..."
                style={{ flex: 1, fontSize: '12px' }}
                value={editorTags}
                onChange={(tags) => handleMetaChange(editorTitle, tags)}
              />
            </div>

            {/* Full Markdown Editor */}
            <div style={{ flex: 1, overflow: 'hidden' }} data-color-mode={isLight ? 'light' : 'dark'}>
              <MDEditor
                value={editorBody}
                onChange={handleBodyChange}
                preview="live"
                height="100%"
                style={{ height: '100%', borderRadius: '8px', border: `1px solid ${isLight ? '#ebebeb' : '#282828'}` }}
              />
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)' }}>
            <RiStickyNoteLine size={48} style={{ opacity: 0.2 }} />
            <p style={{ marginTop: 12, fontSize: 14 }}>Select a note to open it</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>or create a new one</p>
            <Button
              type="dashed"
              icon={<RiAddLine />}
              onClick={() => createMutation.mutate()}
              style={{ marginTop: 16, color: isLight ? '#4f46e5' : '#6366f1', borderColor: isLight ? '#4f46e5' : '#6366f1' }}
            >
              New Concept Note
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
