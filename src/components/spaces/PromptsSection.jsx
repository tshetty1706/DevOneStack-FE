import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, message, Tooltip } from 'antd';
import { RiAddLine, RiPushpinLine, RiPushpin2Fill, RiDeleteBinLine, RiSearchLine, RiFileCopyLine, RiCheckLine, RiRobotLine } from 'react-icons/ri';
import api from '../../api/axios';

const MODELS = [
  { value: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'GPT-4o', label: 'GPT-4o' },
  { value: 'Gemini 1.5 Pro', label: 'Gemini 1.5 Pro' },
  { value: 'Llama 3.1', label: 'Llama 3.1' },
  { value: 'Custom', label: 'Custom Model' }
];

export default function PromptsSection({ space, isLight, highlightId }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [viewPrompt, setViewPrompt] = useState(null);

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
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [caption, setCaption] = useState('');
  const [model, setModel] = useState('Claude 3.5 Sonnet');
  const [customModel, setCustomModel] = useState('');
  const [tags, setTags] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch prompts
  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['prompts', space._id, debouncedQuery],
    queryFn: async () => {
      const endpoint = debouncedQuery
        ? `/api/spaces/${space._id}/prompts/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/spaces/${space._id}/prompts`;
      const response = await api.get(endpoint);
      return response.data.prompts;
    }
  });

  useEffect(() => {
    if (highlightId && prompts && prompts.length > 0) {
      const target = prompts.find(p => p._id === highlightId);
      if (target) {
        openEditModal(target);
      }
    }
  }, [highlightId, prompts]);

  // Toggle Pin
  const togglePin = useMutation({
    mutationFn: async (id) => {
      return api.patch(`/api/spaces/${space._id}/prompts/${id}/pin`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['prompts', space._id]);
      const prev = queryClient.getQueryData(['prompts', space._id, debouncedQuery]);
      if (prev) {
        queryClient.setQueryData(['prompts', space._id, debouncedQuery], old =>
          old.map(item => item._id === id ? { ...item, isPinned: !item.isPinned } : item)
        );
      }
      return { prev };
    },
    onError: (_, __, context) => {
      if (context && context.prev) {
        queryClient.setQueryData(['prompts', space._id, debouncedQuery], context.prev);
      }
      message.error('Failed to update pin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['prompts', space._id]);
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return api.post(`/api/spaces/${space._id}/prompts`, payload);
    },
    onSuccess: () => {
      message.success('AI Prompt saved!');
      queryClient.invalidateQueries(['prompts', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to save prompt');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return api.patch(`/api/spaces/${space._id}/prompts/${id}`, payload);
    },
    onSuccess: () => {
      message.success('Prompt updated!');
      queryClient.invalidateQueries(['prompts', space._id]);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to update prompt');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/prompts/${id}`);
    },
    onSuccess: () => {
      message.success('Prompt deleted');
      queryClient.invalidateQueries(['prompts', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
    }
  });

  const openAddModal = () => {
    setEditingPrompt(null);
    setTitle('');
    setBody('');
    setCaption('');
    setModel('Claude 3.5 Sonnet');
    setCustomModel('');
    setTags([]);
    setModalOpen(true);
  };

  const openEditModal = (prompt) => {
    setEditingPrompt(prompt);
    setTitle(prompt.title);
    setBody(prompt.body);
    setCaption(prompt.caption || '');
    setTags(prompt.tags || []);

    const isCommon = MODELS.some(m => m.value === prompt.model);
    if (isCommon) {
      setModel(prompt.model);
      setCustomModel('');
    } else {
      setModel('Custom');
      setCustomModel(prompt.model || '');
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPrompt(null);
  };

  const handleSubmit = () => {
    if (!title || !body) {
      message.error('Title and Prompt Body are required');
      return;
    }
    const finalModel = model === 'Custom' ? customModel : model;
    const payload = { title, body, caption, model: finalModel, tags };
    if (editingPrompt) {
      updateMutation.mutate({ id: editingPrompt._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCopy = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopiedId(prompt._id);
      setTimeout(() => setCopiedId(null), 1500);
      message.success('Prompt copied to clipboard!');
      // Register used prompt
      api.post(`/api/spaces/${space._id}/prompts/${prompt._id}/use`);
    } catch {
      message.error('Failed to copy prompt');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <RiSearchLine style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', zIndex: 10 }} />
          <input
            placeholder="Search prompts..."
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
          Add Prompt
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : prompts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          No saved prompts. Keep your best AI prompts here!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {prompts.map((prompt) => (
            <div
              key={prompt._id}
              style={{
                background: isLight ? '#f9f9fc' : '#161616',
                border: `1px solid ${isLight ? '#ebebeb' : '#242424'}`,
                borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', minHeight: '180px', position: 'relative'
              }}
            >
              {/* Pin indicator */}
              <div style={{ position: 'absolute', right: '12px', top: '12px', zIndex: 20 }}>
                <PinButton
                  isPinned={prompt.isPinned}
                  onToggle={() => togglePin.mutate(prompt._id)}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Tag color="cyan" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RiRobotLine size={11} /> {prompt.model || 'AI Model'}
                  </Tag>
                  {prompt.usedCount > 0 && <span style={{ fontSize: '11px', color: '#666' }}>Copied {prompt.usedCount} times</span>}
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 600, color: isLight ? '#111' : '#fff', margin: '0 0 6px' }}>
                  {prompt.title}
                </h4>

                {prompt.caption && (
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px', lineHeight: 1.4 }}>
                    {prompt.caption}
                  </p>
                )}

                {/* Prompt block preview */}
                <div style={{
                  background: isLight ? '#f3f4f6' : '#222', borderRadius: '8px', padding: '10px',
                  fontFamily: 'monospace', fontSize: '11px', color: isLight ? '#333' : '#bbb',
                  lineHeight: 1.4, fontStyle: 'italic', marginBottom: '12px', border: `1px solid ${isLight ? '#ebebeb' : '#2a2a2a'}`,
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                }}>
                  {prompt.body}
                </div>
              </div>

              <div>
                {prompt.tags && prompt.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {prompt.tags.map(t => (
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
                  <button
                    onClick={() => handleCopy(prompt)}
                    style={{
                      background: isLight ? '#e5e7eb' : '#222', border: `1px solid ${isLight ? '#ccc' : '#444'}`,
                      color: isLight ? '#111' : '#fff', cursor: 'pointer', padding: '4px 12px',
                      borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
                    }}
                  >
                    {copiedId === prompt._id ? <RiCheckLine size={13} style={{ color: '#22c55e' }} /> : <RiFileCopyLine size={13} />}
                    Copy Prompt
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setViewPrompt(prompt)}
                      style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#6366f1', cursor: 'pointer', marginRight: '8px' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(prompt)}
                      style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#6366f1', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <Popconfirm
                      title="Delete this prompt?"
                      onConfirm={() => deleteMutation.mutate(prompt._id)}
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
        title={editingPrompt ? 'Edit AI Prompt' : 'Save AI Prompt'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingPrompt ? 'Update Prompt' : 'Save Prompt'}
        cancelText="Cancel"
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>PROMPT TITLE</label>
            <Input placeholder="e.g. Code Review Assistant" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CAPTION / DESCRIPTION</label>
            <Input placeholder="What is this prompt best used for..." value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>TARGET AI MODEL</label>
              <Select
                options={MODELS}
                style={{ width: '100%' }}
                value={model}
                onChange={(val) => setModel(val)}
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

          {model === 'Custom' && (
            <div>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CUSTOM MODEL NAME</label>
              <Input placeholder="e.g. Claude 3 Opus" value={customModel} onChange={(e) => setCustomModel(e.target.value)} />
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '11px', color: '#888' }}>PROMPT BODY</label>
              <span style={{ fontSize: '10px', color: body.length > 4500 ? '#ef4444' : '#666' }}>
                {body.length} / 5000 chars
              </span>
            </div>
            <Input.TextArea
              placeholder="Paste the full prompt instructions here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={5000}
              rows={8}
            />
          </div>
        </div>
      </Modal>

      {/* Prompt Viewer Modal */}
      <Modal
        title={`View AI Prompt: ${viewPrompt?.title}`}
        open={!!viewPrompt}
        onCancel={() => setViewPrompt(null)}
        footer={[
          <Button key="close" onClick={() => setViewPrompt(null)}>
            Close
          </Button>
        ]}
        width={650}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Model</span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#111' : '#fff', marginTop: '4px' }}>
              {viewPrompt?.model || 'AI Model'}
            </div>
          </div>
          {viewPrompt?.caption && (
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Description</span>
              <p style={{ fontSize: '13px', color: isLight ? '#333' : '#ccc', margin: '4px 0 0', lineHeight: 1.5 }}>
                {viewPrompt.caption}
              </p>
            </div>
          )}
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Prompt Body</span>
            <div style={{
              background: isLight ? '#f3f4f6' : '#18181b',
              border: `1px solid ${isLight ? '#e5e7eb' : '#27272a'}`,
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: isLight ? '#111' : '#e4e4e7',
              whiteSpace: 'pre-wrap',
              maxHeight: '350px',
              overflowY: 'auto',
              marginTop: '4px',
              lineHeight: 1.5
            }}>
              {viewPrompt?.body}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
