import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, Tag, message, Tooltip } from 'antd';
import { RiAddLine, RiPushpinLine, RiPushpin2Fill, RiDeleteBinLine, RiSearchLine, RiFileCopyLine, RiCheckLine, RiRobotLine, RiRobot2Line, RiHistoryLine } from 'react-icons/ri';
import api from '../../api/axios';
import { QuickAddPromptModal } from './QuickAddModals';

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
    
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
      params.delete('id');
      const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState(null, '', newRelativePathQuery);
    }
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
    if (!prompt || !prompt._id) return;
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopiedId(prompt._id);
      setTimeout(() => setCopiedId(null), 1500);
      message.success('Prompt copied to clipboard!');

      // Optimistically update ONLY the specific prompt's usedCount in React Query cache
      queryClient.setQueriesData({ queryKey: ['prompts', space._id] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(item => {
          const isTarget = item && item._id && String(item._id) === String(prompt._id);
          return isTarget ? { ...item, usedCount: (item.usedCount || 0) + 1 } : item;
        });
      });

      // Send use tracking request to server
      await api.post(`/api/spaces/${space._id}/prompts/${prompt._id}/use`);
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
          {prompts.map((prompt) => (
            <div
              key={prompt._id}
              style={{
                background:   isLight ? '#ffffff' : '#14141c',
                border:       `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '12px',
                padding:      '18px 20px',
                display:      'flex',
                flexDirection:'column',
                gap:          '14px',
                position:     'relative',
                transition:   'all 0.2s ease',
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
                  background: isLight ? 'rgba(236, 72, 153, 0.08)' : 'rgba(236, 72, 153, 0.12)',
                  border: `1px solid ${isLight ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.25)'}`,
                  color: '#f472b6', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <RiRobotLine size={12} />
                  <span>{(prompt.model || 'AI MODEL').toUpperCase()}</span>
                </span>
                <PinButton isPinned={prompt.isPinned} onToggle={() => togglePin.mutate(prompt._id)} />
              </div>

              {/* Main Content info */}
              <div style={{ cursor: 'pointer' }} onClick={() => setViewPrompt(prompt)}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: isLight ? '#111111' : '#ffffff', margin: '0 0 4px' }}>
                  {prompt.title}
                </h4>
                {prompt.caption ? (
                  <p style={{
                    fontSize: '12px', color: isLight ? '#666666' : '#88888b', margin: '0 0 8px', lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>
                    {prompt.caption}
                  </p>
                ) : (
                  <div style={{ height: '4px' }} />
                )}

                {/* Prompt block preview */}
                <div style={{
                  background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                  borderRadius: '8px', padding: '10px',
                  fontFamily: 'monospace', fontSize: '11px', color: isLight ? '#4b5563' : '#a1a1aa',
                  lineHeight: 1.4, fontStyle: 'italic', marginBottom: '10px',
                  border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.05)'}`,
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                }}>
                  {prompt.body}
                </div>

                {prompt.tags && prompt.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {prompt.tags.map(t => (
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
                      {new Date(prompt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Added</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <RiRobot2Line size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prompt.model || 'AI Model'}
                    </span>
                    <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Target</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <RiFileCopyLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff' }}>{prompt.usedCount || 0} Times</span>
                    <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Copied</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(prompt); }}
                  style={{
                    background: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isLight ? '#d1d5db' : 'rgba(255,255,255,0.1)'}`,
                    color: isLight ? '#111111' : '#ffffff', cursor: 'pointer', padding: '5px 12px',
                    borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600
                  }}
                >
                  {copiedId === prompt._id ? <RiCheckLine size={14} style={{ color: '#22c55e' }} /> : <RiFileCopyLine size={14} />}
                  <span>{copiedId === prompt._id ? 'Copied' : 'Copy'}</span>
                </button>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => setViewPrompt(prompt)}
                    style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#f472b6', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(prompt)}
                    style={{ background: 'transparent', border: 'none', color: isLight ? '#4f46e5' : '#f472b6', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <Popconfirm title="Delete this prompt?" onConfirm={() => deleteMutation.mutate(prompt._id)} okText="Delete" cancelText="Cancel">
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
      <QuickAddPromptModal
        open={modalOpen}
        onClose={closeModal}
        space={space}
        editingPrompt={editingPrompt}
      />

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
        style={{ top: 40 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            padding: '20px 24px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent',
          },
          mask: { backdropFilter: 'blur(4px)' },
        }}
        getContainer={false}
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
