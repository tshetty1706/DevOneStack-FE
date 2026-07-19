import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, message, Tooltip } from 'antd';
import {
  RiAddLine, RiSearchLine, RiLightbulbLine, RiBugLine,
  RiErrorWarningLine, RiCheckboxCircleLine, RiQuestionLine,
  RiSparklingLine, RiPushpinLine, RiPushpinFill, RiDeleteBinLine,
  RiEditLine, RiFileCopyLine, RiCheckLine, RiCloseLine
} from 'react-icons/ri';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api/axios';

const TYPE_CONFIG = {
  learning: { label: 'Learning', icon: RiLightbulbLine, color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.15)' },
  fix: { label: 'Fix', icon: RiBugLine, color: '#f87171', bg: 'rgba(248, 113, 113, 0.08)', border: 'rgba(248, 113, 113, 0.15)' },
  gotcha: { label: 'Gotcha', icon: RiErrorWarningLine, color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.15)' },
  'best-practice': { label: 'Best Practice', icon: RiCheckboxCircleLine, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.15)' },
  question: { label: 'Question', icon: RiQuestionLine, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.15)' },
  idea: { label: 'Idea', icon: RiSparklingLine, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)', border: 'rgba(168, 85, 247, 0.15)' },
};

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

export default function LearningsSection({ space, isLight, highlightId }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Modal forms state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLearning, setEditingLearning] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('learning');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [hasCode, setHasCode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeContent, setCodeContent] = useState('');

  const [copied, setCopied] = useState(false);

  // Fetch learnings
  const { data: learnings = [], isLoading } = useQuery({
    queryKey: ['learnings', space._id],
    queryFn: async () => {
      const response = await api.get(`/api/spaces/${space._id}/learnings`);
      return response.data.learnings || [];
    }
  });

  // Deep-linking highlight handler
  useEffect(() => {
    if (highlightId && learnings.length > 0) {
      const found = learnings.find(l => l._id === highlightId);
      if (found) {
        setSelectedId(found._id);
      }
    }
  }, [highlightId, learnings]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return learnings.find(l => l._id === selectedId) || null;
  }, [selectedId, learnings]);

  // Client-side filtering & search
  const filteredItems = useMemo(() => {
    return learnings.filter(item => {
      const matchesType = filterType === 'all' || item.type === filterType;
      
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesType;

      const titleMatches = item.title.toLowerCase().includes(query);
      const contentMatches = item.content.toLowerCase().includes(query);
      const tagMatches = item.tags?.some(t => t.toLowerCase().includes(query));

      return matchesType && (titleMatches || contentMatches || tagMatches);
    });
  }, [learnings, filterType, searchQuery]);

  // Split into pinned and unpinned lists
  const pinnedLearnings = useMemo(() => filteredItems.filter(l => l.isPinned), [filteredItems]);
  const normalLearnings = useMemo(() => filteredItems.filter(l => !l.isPinned), [filteredItems]);

  // CRUD Mutations
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return api.post(`/api/spaces/${space._id}/learnings`, payload);
    },
    onSuccess: (res) => {
      message.success('Learning logged!');
      queryClient.invalidateQueries(['learnings', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      setSelectedId(res.data.learning._id);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to save');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return api.patch(`/api/spaces/${space._id}/learnings/${id}`, payload);
    },
    onSuccess: () => {
      message.success('Learning updated!');
      queryClient.invalidateQueries(['learnings', space._id]);
      closeModal();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to update');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/learnings/${id}`);
    },
    onSuccess: () => {
      message.success('Learning deleted');
      queryClient.invalidateQueries(['learnings', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      setSelectedId(null);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to delete');
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id }) => {
      return api.patch(`/api/spaces/${space._id}/learnings/${id}/pin`);
    },
    onSuccess: (res) => {
      const pinned = res.data?.isPinned;
      message.success(pinned ? 'Pinned to top' : 'Unpinned');
      queryClient.invalidateQueries(['learnings', space._id]);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to update pin');
    }
  });

  // Modal open helpers
  const openCreateModal = () => {
    setEditingLearning(null);
    setTitle('');
    setType('learning');
    setContent('');
    setTags([]);
    setHasCode(false);
    setCodeLanguage('javascript');
    setCodeContent('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingLearning(item);
    setTitle(item.title);
    setType(item.type);
    setContent(item.content);
    setTags(item.tags || []);
    setHasCode(!!item.codeExample?.code);
    setCodeLanguage(item.codeExample?.language || 'javascript');
    setCodeContent(item.codeExample?.code || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLearning(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      message.error('Title and explanation content are required');
      return;
    }

    const payload = {
      title,
      type,
      content,
      tags,
      codeExample: hasCode ? { language: codeLanguage, code: codeContent } : { language: '', code: '' }
    };

    if (editingLearning) {
      updateMutation.mutate({ id: editingLearning._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    message.success('Code copied to clipboard!');
  };

  // Color mappings
  const themeCardBg = isLight ? '#ffffff' : '#14141c';
  const themeBorder = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
  const themeInputBg = isLight ? '#ffffff' : '#0e0e12';
  const themeInputBorder = isLight ? '#d9d9d9' : '#2a2a30';

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      height: 'calc(100vh - 200px)',
      minHeight: '550px'
    }}>
      
      {/* Dynamic styling overrides for select fields */}
      <style>{`
        .learning-tags-select .ant-select-selector {
          background: ${themeInputBg} !important;
          border-color: ${themeInputBorder} !important;
          color: ${isLight ? '#111' : '#fff'} !important;
        }
        .learning-type-select .ant-select-selector {
          background: ${themeInputBg} !important;
          border-color: ${themeInputBorder} !important;
          color: ${isLight ? '#111' : '#fff'} !important;
        }
      `}</style>

      {/* LEFT COLUMN: Sidebar Explorer */}
      <div style={{
        width: '320px',
        borderRight: `1px solid ${themeBorder}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        background: isLight ? '#fafafa' : '#0a0a0f'
      }}>
        
        {/* Title Block */}
        <div style={{ padding: '16px 20px 8px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: isLight ? '#111' : '#fff' }}>
            {space.name} Journey
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888' }}>
            Structured knowledge and developer logs
          </p>
        </div>

        {/* Search bar */}
        <div style={{ padding: '10px 16px', position: 'relative' }}>
          <RiSearchLine style={{ position: 'absolute', left: '26px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input
            placeholder="Search learnings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: `1px solid ${themeInputBorder}`,
              background: themeInputBg,
              color: isLight ? '#111' : '#fff',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'var(--font-body)'
            }}
          />
        </div>

        {/* Filter controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          padding: '4px 16px 12px'
        }}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${filterType === 'all' ? (isLight ? '#111' : '#fff') : themeInputBorder}`,
              background: filterType === 'all' ? (isLight ? '#111' : '#fff') : 'transparent',
              color: filterType === 'all' ? (isLight ? '#fff' : '#111') : '#888',
              whiteSpace: 'nowrap'
            }}
          >
            All
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${filterType === key ? config.color : themeInputBorder}`,
                background: filterType === key ? config.bg : 'transparent',
                color: filterType === key ? config.color : '#888',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <config.icon size={12} />
              {config.label}
            </button>
          ))}
        </div>

        {/* Create Button */}
        <div style={{ padding: '0 16px 14px' }}>
          <Button
            type="dashed"
            icon={<RiAddLine />}
            onClick={openCreateModal}
            style={{
              width: '100%',
              borderColor: isLight ? '#4f46e5' : '#6366f1',
              color: isLight ? '#4f46e5' : '#6366f1',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            Log New Learning
          </Button>
        </div>

        {/* Learnings list */}
        <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px' }}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', fontSize: '12px', padding: '40px 0' }}>
              No learnings matching filters.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* PINNED SECTION */}
              {pinnedLearnings.length > 0 && (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Pinned
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pinnedLearnings.map(item => {
                      const isActive = item._id === selectedId;
                      const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.learning;
                      return (
                        <div
                          key={item._id}
                          onClick={() => setSelectedId(item._id)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background: isActive ? (isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)') : themeCardBg,
                            border: `1px solid ${isActive ? (isLight ? '#4f46e5' : '#6366f1') : themeBorder}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'border-color 0.15s, background 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                              <config.icon size={13} style={{ color: config.color, flexShrink: 0 }} />
                              <span style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#111' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.title}
                              </span>
                            </div>
                            <RiPushpinFill size={12} style={{ color: '#eab308', flexShrink: 0 }} />
                          </div>
                          <span style={{ fontSize: '11px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.content}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ALL SECTION */}
              <div>
                {pinnedLearnings.length > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginTop: '14px', marginBottom: '6px' }}>
                    All Learnings
                  </span>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {normalLearnings.map(item => {
                    const isActive = item._id === selectedId;
                    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.learning;
                    return (
                      <div
                        key={item._id}
                        onClick={() => setSelectedId(item._id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: isActive ? (isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)') : themeCardBg,
                          border: `1px solid ${isActive ? (isLight ? '#4f46e5' : '#6366f1') : themeBorder}`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'border-color 0.15s, background 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <config.icon size={13} style={{ color: config.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#111' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.content}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: Viewport Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: isLight ? '#ffffff' : '#0b0b0e' }}>
        {selectedItem ? (
          <>
            {/* Sticky close bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 20px',
              borderBottom: `1px solid ${themeBorder}`,
              background: isLight ? '#fafafa' : '#101017',
              flexShrink: 0
            }}>
              {/* Top Edit, Pin, Delete Controls */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Tooltip title={selectedItem.isPinned ? 'Unpin from Top' : 'Pin to Top'}>
                  <Button
                    shape="circle"
                    size="small"
                    icon={selectedItem.isPinned ? <RiPushpinFill style={{ color: '#eab308' }} /> : <RiPushpinLine />}
                    onClick={() => togglePinMutation.mutate({ id: selectedItem._id })}
                    style={{ background: 'transparent', border: `1px solid ${themeBorder}`, color: isLight ? '#111' : '#fff' }}
                  />
                </Tooltip>
                
                <Button
                  size="small"
                  icon={<RiEditLine />}
                  onClick={() => openEditModal(selectedItem)}
                  style={{ background: 'transparent', border: `1px solid ${themeBorder}`, color: isLight ? '#111' : '#fff', fontSize: '12px' }}
                >
                  Edit
                </Button>

                <Popconfirm
                  title="Delete this learning record?"
                  onConfirm={() => deleteMutation.mutate(selectedItem._id)}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    size="small"
                    danger
                    icon={<RiDeleteBinLine />}
                    style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '12px' }}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </div>

              <button
                onClick={() => setSelectedId(null)}
                title="Close"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${themeBorder}`,
                  background: 'transparent',
                  color: '#888',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'background 0.15s, color 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = isLight ? '#111' : '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}
              >
                <RiCloseLine size={14} />
                Close
              </button>
            </div>

          <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
            
            {/* Structured detail block */}
            <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Type Badge Header */}
              <div>
                {(() => {
                  const config = TYPE_CONFIG[selectedItem.type] || TYPE_CONFIG.learning;
                  return (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: config.color,
                      background: config.bg,
                      border: `1px solid ${config.border}`
                    }}>
                      <config.icon size={13} />
                      {config.label}
                    </span>
                  );
                })()}
              </div>

              {/* Title */}
              <h1 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 800,
                color: isLight ? '#111' : '#fff',
                lineHeight: 1.25,
                letterSpacing: '-0.02em'
              }}>
                {selectedItem.title}
              </h1>

              {/* Tags */}
              {selectedItem.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedItem.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '11px',
                      color: isLight ? '#4f46e5' : '#818cf8',
                      background: isLight ? 'rgba(79,70,229,0.05)' : 'rgba(99,102,241,0.06)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 500,
                      border: `1px solid ${isLight ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.1)'}`
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <hr style={{ border: 'none', borderBottom: `1px solid ${themeBorder}`, margin: 0 }} />

              {/* Explanation Content */}
              <div>
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                  What I Learned
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: isLight ? '#374151' : '#d1d5db',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedItem.content}
                </p>
              </div>

              {/* Code Example (Optional) */}
              {selectedItem.codeExample?.code && (
                <div>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                    Code Example
                  </h4>
                  
                  {/* Highlighter container card */}
                  <div style={{
                    borderRadius: '8px',
                    border: `1px solid ${themeBorder}`,
                    background: isLight ? '#f9fafb' : '#14141c',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Header Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 14px',
                      borderBottom: `1px solid ${themeBorder}`,
                      background: isLight ? '#f3f4f6' : '#1b1b24'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>
                        {selectedItem.codeExample.language || 'Code'}
                      </span>
                      <button
                        onClick={() => handleCopyCode(selectedItem.codeExample.code)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#888',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {copied ? <RiCheckLine size={13} style={{ color: '#10b981' }} /> : <RiFileCopyLine size={13} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Code highlight viewport */}
                    <div style={{ fontSize: '13px', margin: 0, overflowX: 'auto', scrollbarWidth: 'thin' }}>
                      <SyntaxHighlighter
                        language={selectedItem.codeExample.language || 'javascript'}
                        style={isLight ? coy : vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: '12px 14px',
                          background: 'transparent',
                          fontFamily: 'Consolas, Monaco, monospace'
                        }}
                      >
                        {selectedItem.codeExample.code}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                </div>
              )}

              <hr style={{ border: 'none', borderBottom: `1px solid ${themeBorder}`, margin: 0 }} />

              {/* Created / Updated Timestamps & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#666' }}>
                    Created: {new Date(selectedItem.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                  {selectedItem.updatedAt !== selectedItem.createdAt && (
                    <span style={{ fontSize: '11px', color: '#666' }}>
                      Updated: {new Date(selectedItem.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  )}
                </div>
              </div>

            </div>

          </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <RiLightbulbLine size={48} style={{ opacity: 0.15 }} />
            <p style={{ marginTop: 12, fontSize: '14px' }}>Select a learning card to view detail logs</p>
            <p style={{ fontSize: '12px', marginTop: 2, opacity: 0.7 }}>or create a structured log entry</p>
            <Button
              type="primary"
              icon={<RiAddLine />}
              onClick={openCreateModal}
              style={{
                marginTop: 16,
                background: isLight ? '#4f46e5' : '#6366f1',
                borderColor: isLight ? '#4f46e5' : '#6366f1',
                fontWeight: 600
              }}
            >
              New structured log
            </Button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT DIALOG MODAL */}
      <Modal
        title={editingLearning ? 'Edit Developer Learning' : 'Log New Developer Knowledge'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingLearning ? 'Update Entry' : 'Log Entry'}
        cancelText="Cancel"
        width={580}
        style={{ top: 40 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            padding: '20px 24px',
            scrollbarWidth: 'thin'
          },
          mask: { backdropFilter: 'blur(4px)' }
        }}
        getContainer={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
          
          {/* Row 1: Type Selection */}
          <div className="learning-type-select">
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: 600 }}>PURPOSE / TYPE</label>
            <Select
              value={type}
              onChange={(val) => setType(val)}
              style={{ width: '100%' }}
              dropdownStyle={{ background: themeCardBg }}
              options={Object.entries(TYPE_CONFIG).map(([key, config]) => ({
                value: key,
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <config.icon size={13} style={{ color: config.color }} />
                    <span style={{ fontSize: '13px' }}>{config.label}</span>
                  </div>
                )
              }))}
            />
          </div>

          {/* Row 2: Title */}
          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: 600 }}>TITLE</label>
            <Input
              placeholder="e.g. Why useEffect cleanup matters"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ background: themeInputBg, borderColor: themeInputBorder, color: isLight ? '#111' : '#fff' }}
            />
          </div>

          {/* Row 3: What did you learn */}
          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: 600 }}>WHAT DID YOU LEARN?</label>
            <Input.TextArea
              placeholder="Explanation of the concept, fix details, gotcha warning, or best practices you discovered..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              style={{
                background: themeInputBg,
                borderColor: themeInputBorder,
                color: isLight ? '#111' : '#fff',
                fontSize: '13px',
                lineHeight: 1.5
              }}
            />
          </div>

          {/* Row 4: Tags Select */}
          <div className="learning-tags-select">
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: 600 }}>TAGS</label>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Add tag keywords..."
              value={tags}
              onChange={(val) => setTags(val)}
            />
          </div>

          {/* Optional Code Example Toggler */}
          <div style={{ borderTop: `1px solid ${themeBorder}`, paddingTop: '12px', marginTop: '6px' }}>
            <Button
              type={hasCode ? 'primary' : 'default'}
              danger={hasCode}
              onClick={() => setHasCode(!hasCode)}
              size="small"
              style={{ fontSize: '11px', fontWeight: 600 }}
            >
              {hasCode ? 'Remove Code Example' : '+ Add Code Example'}
            </Button>
          </div>

          {/* Optional Code Example Inputs */}
          {hasCode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: isLight ? '#f9fafb' : '#111116', padding: '12px', borderRadius: '8px', border: `1px solid ${themeBorder}` }}>
              <div className="learning-type-select">
                <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: 600 }}>CODE LANGUAGE</label>
                <Select
                  options={LANGUAGES}
                  style={{ width: '150px' }}
                  value={codeLanguage}
                  onChange={(val) => setCodeLanguage(val)}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: 600 }}>CODE BLOCK</label>
                <Input.TextArea
                  placeholder="// Illustrate with a code example..."
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  rows={8}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    background: themeInputBg,
                    borderColor: themeInputBorder,
                    color: isLight ? '#000' : '#fff'
                  }}
                />
              </div>
            </div>
          )}

        </div>
      </Modal>

    </div>
  );
}
