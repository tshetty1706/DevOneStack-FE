import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, message, Tooltip } from 'antd';
import { RiAddLine, RiPushpinLine, RiPushpin2Fill, RiSearchLine, RiFileCopyLine, RiCheckLine, RiCodeLine, RiCodeSSlashLine, RiHistoryLine } from 'react-icons/ri';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api/axios';
import SnippetViewModal from './modals/SnippetViewModal';
import { QuickAddSnippetModal } from './QuickAddModals';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'React JSX' },
  { value: 'tsx', label: 'React TSX' },
  { value: 'python', label: 'Python' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'json', label: 'JSON' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'other', label: 'Other' }
];

export default function SnippetsSection({ space, isLight, highlightId }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');


  const [viewSnippet, setViewSnippet] = useState(null);

  const handleOpenViewModal = (snip) => {
    setViewSnippet(snip);
  };

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
          zIndex: 20
        }}
      >
        {isPinned ? <RiPushpin2Fill size={14} /> : <RiPushpinLine size={14} />}
      </button>
    </Tooltip>
  );

  // Form states
  const [name, setName] = useState('');
  const [caption, setCaption] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch snippets
  const { data: snippets = [], isLoading } = useQuery({
    queryKey: ['snippets', space._id, debouncedQuery],
    queryFn: async () => {
      const endpoint = debouncedQuery
        ? `/api/spaces/${space._id}/snippets/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/spaces/${space._id}/snippets`;
      const response = await api.get(endpoint);
      return response.data.snippets;
    }
  });

  useEffect(() => {
    if (highlightId && snippets && snippets.length > 0) {
      const target = snippets.find(s => s._id === highlightId);
      if (target) {
        handleOpenViewModal(target);
      }
    }
  }, [highlightId, snippets]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return api.post(`/api/spaces/${space._id}/snippets`, payload);
    },
    onSuccess: () => {
      message.success('Snippet created!');
      queryClient.invalidateQueries(['snippets', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to save snippet');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      // First update snippet metadata
      await api.patch(`/api/spaces/${space._id}/snippets/${id}`, payload);
      // If code was updated, update snippet content
      if (payload.code !== undefined) {
        await api.patch(`/api/spaces/${space._id}/snippets/${id}/content`, { code: payload.code });
      }
    },
    onSuccess: () => {
      message.success('Snippet updated!');
      queryClient.invalidateQueries(['snippets', space._id]);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to update snippet');
    }
  });

  // Toggle Pin
  const togglePin = useMutation({
    mutationFn: async (id) => {
      return api.patch(`/api/spaces/${space._id}/snippets/${id}/pin`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['snippets', space._id]);
      const prev = queryClient.getQueryData(['snippets', space._id, debouncedQuery]);
      if (prev) {
        queryClient.setQueryData(['snippets', space._id, debouncedQuery], old =>
          old.map(item => item._id === id ? { ...item, isPinned: !item.isPinned } : item)
        );
      }
      return { prev };
    },
    onError: (_, __, context) => {
      if (context && context.prev) {
        queryClient.setQueryData(['snippets', space._id, debouncedQuery], context.prev);
      }
      message.error('Failed to update pin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['snippets', space._id]);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/snippets/${id}`);
    },
    onSuccess: () => {
      message.success('Snippet deleted');
      queryClient.invalidateQueries(['snippets', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
    }
  });

  const openAddModal = () => {
    setEditingSnippet(null);
    setName('');
    setCaption('');
    setLanguage('javascript');
    setCode('');
    setTags([]);
    setModalOpen(true);
  };

  const openEditModal = async (snippet) => {
    setEditingSnippet(snippet);
    setName(snippet.name);
    setCaption(snippet.caption || '');
    setLanguage(snippet.language);
    setTags(snippet.tags || []);
    try {
      // Fetch full code content
      const { data } = await api.get(`/api/spaces/${space._id}/snippets/${snippet._id}/content`);
      setCode(data.code || '');
    } catch {
      setCode('');
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSnippet(null);
  };

  const handleSubmit = () => {
    if (!name || !code) {
      message.error('Name and Code are required');
      return;
    }
    const payload = { name, caption, language, code, tags };
    if (editingSnippet) {
      updateMutation.mutate({ id: editingSnippet._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCopy = async (snippetId) => {
    if (!snippetId) return;
    try {
      const { data } = await api.get(`/api/spaces/${space._id}/snippets/${snippetId}/content`);
      await navigator.clipboard.writeText(data.code);
      setCopiedId(snippetId);
      setTimeout(() => setCopiedId(null), 1500);
      message.success('Code copied to clipboard!');

      // Optimistically update ONLY the specific snippet's usedCount in React Query cache
      queryClient.setQueriesData({ queryKey: ['snippets', space._id] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(item => {
          const isTarget = item && item._id && String(item._id) === String(snippetId);
          return isTarget ? { ...item, usedCount: (item.usedCount || 0) + 1 } : item;
        });
      });

      // Send use tracking request to server
      await api.post(`/api/spaces/${space._id}/snippets/${snippetId}/use`);
    } catch {
      message.error('Failed to copy code');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newVal);
      // Reset cursor position
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <RiSearchLine style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', zIndex: 10 }} />
          <input
            placeholder="Search snippets..."
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
        <Button
          type="primary"
          icon={<RiAddLine />}
          onClick={openAddModal}
          style={{ background: isLight ? '#4f46e5' : '#6366f1', borderColor: isLight ? '#4f46e5' : '#6366f1', borderRadius: '8px' }}
        >
          Add Snippet
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : snippets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          No snippets found. Save your first boilerplate code block!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
          {snippets.map((snip) => (
            <div
              key={snip._id}
              style={{
                background: isLight ? '#ffffff' : '#14141c',
                border: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative',
                transition: 'all 0.2s ease',
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
                <span style={{
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  padding: '2px 8px', borderRadius: '4px',
                  background: isLight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.12)',
                  border: `1px solid ${isLight ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.25)'}`,
                  color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <RiCodeSSlashLine size={12} />
                  <span>{(snip.language || 'CODE').toUpperCase()}</span>
                </span>
                <PinButton isPinned={snip.isPinned} onToggle={() => togglePin.mutate(snip._id)} />
              </div>

              {/* Main Content info */}
              <div style={{ cursor: 'pointer' }} onClick={() => handleOpenViewModal(snip)}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: isLight ? '#111111' : '#ffffff', margin: '0 0 4px' }}>
                  {snip.name}
                </h4>
                {snip.caption ? (
                  <p style={{
                    fontSize: '12px', color: isLight ? '#666666' : '#88888b', margin: '0 0 10px', lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>
                    {snip.caption}
                  </p>
                ) : (
                  <div style={{ height: '4px' }} />
                )}

                {/* Syntax highlighted preview block */}
                <div style={{
                  borderRadius: '8px', overflow: 'hidden', fontSize: '11px',
                  border: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)'}`, marginBottom: '10px'
                }}>
                  <SyntaxHighlighter language={snip.language} style={isLight ? coy : vscDarkPlus} customStyle={{ margin: 0, padding: '10px' }}>
                    {snip.preview || ''}
                  </SyntaxHighlighter>
                </div>

                {snip.tags && snip.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {snip.tags.map(t => (
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

              {/* Divider Line */}
              <div style={{ height: '1px', background: isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)', margin: '2px 0' }} />

              {/* Metadata Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '2px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <RiHistoryLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {new Date(snip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Added</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <RiCodeLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff' }}>{snip.lineCount || 0} Lines</span>
                    <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Length</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <RiFileCopyLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff' }}>{snip.usedCount || 0} Times</span>
                    <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Used</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(snip._id); }}
                  style={{
                    background: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isLight ? '#d1d5db' : 'rgba(255,255,255,0.1)'}`,
                    color: isLight ? '#111111' : '#ffffff', cursor: 'pointer', padding: '5px 12px',
                    borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600
                  }}
                >
                  {copiedId === snip._id ? <RiCheckLine size={14} style={{ color: '#22c55e' }} /> : <RiFileCopyLine size={14} />}
                  <span>{copiedId === snip._id ? 'Copied' : 'Copy'}</span>
                </button>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleOpenViewModal(snip)}
                    style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#818cf8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(snip)}
                    style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#818cf8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <Popconfirm title="Delete this snippet?" onConfirm={() => deleteMutation.mutate(snip._id)} okText="Delete" cancelText="Cancel">
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

      {/* Add / Edit Modal */}
      <QuickAddSnippetModal
        open={modalOpen}
        onClose={closeModal}
        space={space}
        editingSnippet={editingSnippet}
        onSuccess={(snip) => {
          if (snip?._id) setSelectedSnippetId(snip._id);
        }}
      />

      {/* Code Viewer Modal */}
      <SnippetViewModal
        open={!!viewSnippet}
        snippet={viewSnippet}
        spaceId={space._id}
        onClose={() => {
          setViewSnippet(null);
          const params = new URLSearchParams(window.location.search);
          if (params.has('id')) {
            params.delete('id');
            const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState(null, '', newRelativePathQuery);
          }
        }}
        onEdit={(s) => openEditModal(s)}
      />
    </div>
  );
}
