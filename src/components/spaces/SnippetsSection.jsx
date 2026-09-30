import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, message, Tooltip } from 'antd';
import {
  RiAddLine, RiPushpinLine, RiPushpin2Fill, RiSearchLine,
  RiFileCopyLine, RiCheckLine, RiCodeLine, RiCodeSSlashLine,
  RiHistoryLine, RiFolderLine, RiFolderTransferLine
} from 'react-icons/ri';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api/axios';
import SnippetViewModal from './modals/SnippetViewModal';
import { QuickAddSnippetModal } from './QuickAddModals';
import SharedFolderTree from './SharedFolderTree';
import MoveItemModal from './MoveItemModal';
import PinButton from '../common/PinButton';
import { useDebounce } from '../../hooks/useDebounce';

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

export default function SnippetsSection({
  space,
  isLight,
  highlightId,
  selectedFolderId: propFolderId,
  onSelectFolder: propOnSelectFolder,
  onNavigateSection,
}) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const [localFolderId, setLocalFolderId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);

  const selectedFolderId = propFolderId !== undefined ? propFolderId : localFolderId;
  const handleSelectFolder = (fId) => {
    if (propOnSelectFolder) propOnSelectFolder(fId);
    else setLocalFolderId(fId);
  };

  const [viewSnippet, setViewSnippet] = useState(null);

  const handleOpenViewModal = (snip) => {
    setViewSnippet(snip);
  };

  // Form states
  const [name, setName] = useState('');
  const [caption, setCaption] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch snippets
  const { data: rawSnippets = [], isLoading } = useQuery({
    queryKey: ['snippets', space._id, debouncedQuery],
    queryFn: async () => {
      const endpoint = debouncedQuery
        ? `/api/spaces/${space._id}/snippets/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/spaces/${space._id}/snippets`;
      const response = await api.get(endpoint);
      return response.data.snippets || [];
    }
  });

  const snippets = useMemo(() => {
    if (!selectedFolderId) return rawSnippets;
    return rawSnippets.filter(s => {
      const fId = s.folderId ? (typeof s.folderId === 'object' ? s.folderId._id : s.folderId) : null;
      return fId === selectedFolderId;
    });
  }, [rawSnippets, selectedFolderId]);

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
      await api.patch(`/api/spaces/${space._id}/snippets/${id}`, payload);
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

  const handleCopy = async (snippetId) => {
    if (!snippetId) return;
    try {
      const { data } = await api.get(`/api/spaces/${space._id}/snippets/${snippetId}/content`);
      await navigator.clipboard.writeText(data.code);
      setCopiedId(snippetId);
      setTimeout(() => setCopiedId(null), 1500);
      message.success('Code copied to clipboard!');

      queryClient.setQueriesData({ queryKey: ['snippets', space._id] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(item => {
          const isTarget = item && item._id && String(item._id) === String(snippetId);
          return isTarget ? { ...item, usedCount: (item.usedCount || 0) + 1 } : item;
        });
      });

      await api.post(`/api/spaces/${space._id}/snippets/${snippetId}/use`);
    } catch {
      message.error('Failed to copy code');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '550px', height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
      {/* LEFT COLUMN: Folder Sidebar */}
      <div style={{
        width: '260px',
        borderRight: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)'}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        background: isLight ? '#fafafa' : '#0a0a0f',
        padding: '8px 4px',
      }}>
        <SharedFolderTree
          spaceId={space._id}
          selectedFolderId={selectedFolderId}
          onSelectFolder={handleSelectFolder}
          onSelectItem={(item) => {
            if (item.type === 'snippet') {
              handleOpenViewModal(item);
            } else if (onNavigateSection) {
              onNavigateSection(item.type === 'note' ? 'notes' : item.type + 's', item._id, item.folderId);
            }
          }}
          selectedItemId={viewSnippet?._id || highlightId}
          filterItemType="snippet"
          isLight={isLight}
          showHeader={true}
          showSearch={true}
        />
      </div>

      {/* RIGHT COLUMN: Snippets content */}
      <div data-lenis-prevent style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '20px' }}>
        {/* Header controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
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

            {selectedFolderId && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.14)',
                border: `1px solid ${isLight ? 'rgba(79,70,229,0.2)' : 'rgba(99,102,241,0.25)'}`,
                fontSize: '11px',
                color: isLight ? '#4f46e5' : '#818cf8',
              }}>
                <RiFolderLine size={13} />
                <span>Folder filter</span>
                <button
                  onClick={() => handleSelectFolder(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, padding: 0 }}
                  title="Clear folder filter"
                >
                  ✕
                </button>
              </div>
            )}
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

                  {snip.folderPath && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateSection) {
                          onNavigateSection('explorer', snip._id, snip.folderId);
                        }
                      }}
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--accent-color)',
                        cursor: 'pointer',
                        margin: '0 0 6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'underline',
                        fontWeight: 500,
                      }}
                      title="View in Explorer"
                    >
                      <RiFolderLine size={12} />
                      <span>{snip.folderPath}</span>
                    </div>
                  )}

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
                    borderRadius: '8px',
                    border: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)'}`,
                    overflow: 'hidden',
                    maxHeight: '120px',
                    position: 'relative'
                  }}>
                    <SyntaxHighlighter
                      language={snip.language || 'javascript'}
                      style={isLight ? coy : vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '10px 12px',
                        fontSize: '11.5px',
                        background: isLight ? '#f9fafb' : '#0e0e14',
                        fontFamily: 'Consolas, Monaco, monospace'
                      }}
                    >
                      {snip.codeSnippet || '// No preview available'}
                    </SyntaxHighlighter>
                  </div>
                </div>

                {/* Tags row */}
                {snip.tags && snip.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {snip.tags.map(t => (
                      <Tag key={t} style={{ fontSize: '10px', borderRadius: '4px', margin: 0 }}>
                        #{t}
                      </Tag>
                    ))}
                  </div>
                )}

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
                    <button
                      onClick={() => { setItemToMove(snip); setMoveModalOpen(true); }}
                      style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#818cf8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      Move
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
      </div>

      {/* Add / Edit Modal */}
      <QuickAddSnippetModal
        open={modalOpen}
        onClose={closeModal}
        space={space}
        defaultFolderId={selectedFolderId}
        editingSnippet={editingSnippet}
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

      {/* Move Item Modal */}
      <MoveItemModal
        open={moveModalOpen}
        onClose={() => { setMoveModalOpen(false); setItemToMove(null); }}
        space={space}
        item={itemToMove}
        onSuccess={() => {
          queryClient.invalidateQueries(['snippets', space._id]);
          queryClient.invalidateQueries(['items', space._id]);
        }}
      />
    </div>
  );
}
