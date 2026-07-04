import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, message, Tooltip } from 'antd';
import { RiAddLine, RiPushpinLine, RiPushpin2Fill, RiDeleteBinLine, RiSearchLine, RiFileCopyLine, RiCheckLine, RiCodeLine } from 'react-icons/ri';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api/axios';

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
  const [viewSnippetCode, setViewSnippetCode] = useState('');
  const [loadingViewCode, setLoadingViewCode] = useState(false);

  const handleOpenViewModal = async (snip) => {
    setViewSnippet(snip);
    setLoadingViewCode(true);
    try {
      const { data } = await api.get(`/api/spaces/${space._id}/snippets/${snip._id}/content`);
      setViewSnippetCode(data.code || '');
    } catch {
      message.error('Failed to retrieve code content');
      setViewSnippet(null);
    } finally {
      setLoadingViewCode(false);
    }
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
        openEditModal(target);
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
    try {
      const { data } = await api.get(`/api/spaces/${space._id}/snippets/${snippetId}/content`);
      await navigator.clipboard.writeText(data.code);
      setCopiedId(snippetId);
      setTimeout(() => setCopiedId(null), 1500);
      message.success('Code copied to clipboard!');
      // Register used snippet (fire and forget)
      api.post(`/api/spaces/${space._id}/snippets/${snippetId}/use`);
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {snippets.map((snip) => (
            <div
              key={snip._id}
              style={{
                background: isLight ? '#f9f9fc' : '#161616',
                border: `1px solid ${isLight ? '#ebebeb' : '#242424'}`,
                borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', minHeight: '200px', position: 'relative'
              }}
            >
              {/* Pin indicator */}
              <div style={{ position: 'absolute', right: '12px', top: '12px', zIndex: 20 }}>
                <PinButton
                  isPinned={snip.isPinned}
                  onToggle={() => togglePin.mutate(snip._id)}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Tag color="purple" style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600 }}>
                    {snip.language}
                  </Tag>
                  <span style={{ fontSize: '11px', color: '#666' }}>{snip.lineCount} lines</span>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 600, color: isLight ? '#111' : '#fff', margin: '0 0 4px' }}>
                  {snip.name}
                </h4>

                {snip.caption && (
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 12px', lineHeight: 1.4 }}>
                    {snip.caption}
                  </p>
                )}

                {/* Previews syntax highlit */}
                <div style={{
                  borderRadius: '6px', overflow: 'hidden', fontSize: '11px',
                  border: `1px solid ${isLight ? '#f0f0f0' : '#222'}`, marginBottom: '12px'
                }}>
                  <SyntaxHighlighter
                    language={snip.language}
                    style={isLight ? coy : vscDarkPlus}
                    customStyle={{ margin: 0, padding: '8px' }}
                  >
                    {snip.preview || ''}
                  </SyntaxHighlighter>
                </div>
              </div>

              <div>
                {snip.tags && snip.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {snip.tags.map(t => (
                      <Tag
                        key={t}
                        style={{
                          fontSize: '10px',
                          borderRadius: '4px',
                          margin: 0,
                          background: isLight ? '#f3f4f6' : '#242428',
                          color: isLight ? '#4b5563' : '#a1a1aa',
                          border: `1px solid ${isLight ? '#e5e7eb' : '#3f3f46'}`,
                        }}
                      >
                        {t}
                      </Tag>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleCopy(snip._id)}
                      style={{
                        background: isLight ? '#e5e7eb' : '#222', border: `1px solid ${isLight ? '#ccc' : '#444'}`,
                        color: isLight ? '#111' : '#fff', cursor: 'pointer', padding: '4px 10px',
                        borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
                      }}
                    >
                      {copiedId === snip._id ? <RiCheckLine size={13} style={{ color: '#22c55e' }} /> : <RiFileCopyLine size={13} />}
                      Copy
                    </button>
                    {snip.usedCount > 0 && <span>Used {snip.usedCount} times</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenViewModal(snip)}
                      style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#6366f1', cursor: 'pointer', marginRight: '8px' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(snip)}
                      style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#6366f1', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <Popconfirm
                      title="Delete this snippet?"
                      onConfirm={() => deleteMutation.mutate(snip._id)}
                      okText="Delete"
                      cancelText="Cancel"
                    >
                      <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        title={editingSnippet ? 'Edit Code Snippet' : 'Save New Boilerplate/Snippet'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingSnippet ? 'Update Snippet' : 'Save Snippet'}
        cancelText="Cancel"
        width={600}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>SNIPPET NAME</label>
            <Input placeholder="e.g. Express Server Middleware Setup" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CAPTION / DESCRIPTION</label>
            <Input placeholder="Brief explanation of when to use this snippet..." value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>LANGUAGE</label>
              <Select
                options={LANGUAGES}
                style={{ width: '100%' }}
                value={language}
                onChange={(val) => setLanguage(val)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>TAGS</label>
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Tags..."
                value={tags}
                onChange={(val) => setTags(val)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CODE BLOCK</label>
            <Input.TextArea
              placeholder="// Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={12}
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                background: isLight ? '#f9f9f9' : '#141414',
                color: isLight ? '#000' : '#fff',
                borderColor: isLight ? '#d9d9d9' : '#333'
              }}
            />
            <span style={{ fontSize: '11px', color: '#666', marginTop: '4px', display: 'block' }}>
              Tip: Press Tab to insert 2 spaces indent.
            </span>
          </div>
        </div>
      </Modal>

      {/* Code Viewer Modal */}
      <Modal
        title={`Snippet Code: ${viewSnippet?.name}`}
        open={!!viewSnippet}
        onCancel={() => { setViewSnippet(null); setViewSnippetCode(''); }}
        footer={[
          <Button key="close" onClick={() => { setViewSnippet(null); setViewSnippetCode(''); }}>
            Close
          </Button>
        ]}
        width={720}
      >
        <div style={{ borderRadius: '8px', overflow: 'hidden', fontSize: '12px', marginTop: '16px' }}>
          <SyntaxHighlighter
            language={viewSnippet?.language || 'javascript'}
            style={isLight ? coy : vscDarkPlus}
            customStyle={{ margin: 0, padding: '12px' }}
          >
            {loadingViewCode ? 'Loading code content...' : viewSnippetCode || 'No code preview available'}
          </SyntaxHighlighter>
        </div>
      </Modal>
    </div>
  );
}
