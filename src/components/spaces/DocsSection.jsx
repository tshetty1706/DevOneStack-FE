import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Upload, Popconfirm, Skeleton, Image, Tag, message, Tooltip } from 'antd';
import { 
  RiAddLine, RiGlobalLine, RiFilePdfLine, RiImageLine, RiPushpinLine, 
  RiPushpin2Fill, RiDeleteBinLine, RiSearchLine, RiUploadCloudLine,
  RiDownloadLine, RiExternalLinkLine, RiFileCopyLine, RiEyeLine, 
  RiHistoryLine, RiTeamLine 
} from 'react-icons/ri';
import api from '../../api/axios';
import { QuickAddDocModal } from './QuickAddModals';

const { Dragger } = Upload;

export default function DocsSection({ space, isLight, highlightId }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('url'); // 'url', 'pdf', 'image'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'pdf', 'image', 'url'

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

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
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch docs
  const { data, isLoading } = useQuery({
    queryKey: ['docs', space._id, debouncedQuery],
    queryFn: async () => {
      const endpoint = debouncedQuery
        ? `/api/spaces/${space._id}/docs/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/spaces/${space._id}/docs`;
      const response = await api.get(endpoint);
      return debouncedQuery ? response.data.docs : response.data.docs;
    }
  });

  const docs = data || [];

  const filteredDocs = docs.filter(doc => {
    if (typeFilter === 'all') return true;
    return doc.type === typeFilter;
  });

  useEffect(() => {
    if (highlightId && docs && docs.length > 0) {
      const target = docs.find(d => d._id === highlightId);
      if (target) {
        handleDocClick(target);
      }
    }
  }, [highlightId, docs]);

  // Create mutations
  const addUrlMutation = useMutation({
    mutationFn: async (payload) => {
      return api.post(`/api/spaces/${space._id}/docs/url`, payload);
    },
    onSuccess: () => {
      message.success('Document link added!');
      queryClient.invalidateQueries(['docs', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      resetForm();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to add document');
    }
  });

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setCaption('');
    setTags([]);
    setFile(null);
    setModalOpen(false);
    setLoading(false);
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      message.error('Please select a file to upload');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('caption', caption);
    formData.append('tags', JSON.stringify(tags));

    try {
      await api.post(`/api/spaces/${space._id}/docs/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('File uploaded successfully to Cloudinary!');
      queryClient.invalidateQueries(['docs', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      resetForm();
    } catch (err) {
      message.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'url') {
      if (!title || !url) {
        message.error('Title and URL are required');
        return;
      }
      addUrlMutation.mutate({ title, url, caption, tags });
    } else {
      handleUploadSubmit();
    }
  };

  const handleDocClick = async (doc) => {
    if (doc.type === 'url') {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (doc.type === 'pdf') {
      api.get(`/api/spaces/${space._id}/docs/${doc._id}/file`, { responseType: 'blob' })
        .then(response => {
          const blob = response.data;
          const blobUrl = URL.createObjectURL(blob);
          const tab = window.open(blobUrl, '_blank');
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
          if (!tab) {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.target = '_blank';
            a.click();
          }
        })
        .catch(() => message.error('Could not open PDF. Try again.'));
      return;
    }

    if (doc.type === 'image') {
      try {
        const { data } = await api.get(`/api/spaces/${space._id}/docs/${doc._id}/file`);
        setPreviewUrl(data.url);
        setPreviewVisible(true);
      } catch (err) {
        message.error('Failed to load image');
      }
    }
  };

  const togglePin = useMutation({
    mutationFn: async (id) => {
      return api.patch(`/api/spaces/${space._id}/docs/${id}/pin`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['docs', space._id]);
      const prev = queryClient.getQueryData(['docs', space._id, debouncedQuery]);
      if (prev) {
        queryClient.setQueryData(['docs', space._id, debouncedQuery], old =>
          old.map(item => item._id === id ? { ...item, isPinned: !item.isPinned } : item)
        );
      }
      return { prev };
    },
    onError: (_, __, context) => {
      if (context && context.prev) {
        queryClient.setQueryData(['docs', space._id, debouncedQuery], context.prev);
      }
      message.error('Failed to update pin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['docs', space._id]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/docs/${id}`);
    },
    onSuccess: () => {
      message.success('Document deleted');
      queryClient.invalidateQueries(['docs', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
    }
  });

  return (
    <div style={{ padding: '20px' }}>
      {/* Header Controls with Filter Pills */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '320px' }}>
            <RiSearchLine style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', zIndex: 10 }} />
            <input
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px',
                border: `1px solid ${isLight ? '#e5e5e5' : '#2a2a2a'}`,
                background: isLight ? '#ffffff' : '#16161a',
                color: isLight ? '#111111' : '#ffffff',
                outline: 'none', fontSize: '13px',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          {/* Document Type Filter Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '8px',
            padding: '2px',
            gap: '2px',
            boxShadow: isLight ? 'none' : 'inset 0 1px 2px rgba(0,0,0,0.2)'
          }}>
            {[
              { id: 'all', label: 'All', icon: null },
              { id: 'pdf', label: 'PDF', icon: RiFilePdfLine, color: '#f87171' },
              { id: 'image', label: 'Image', icon: RiImageLine, color: '#34d399' },
              { id: 'url', label: 'URL', icon: RiGlobalLine, color: '#60a5fa' }
            ].map(pill => {
              const active = typeFilter === pill.id;
              const Icon = pill.icon;
              return (
                <button
                  key={pill.id}
                  onClick={() => setTypeFilter(pill.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: active
                      ? (isLight ? '#ffffff' : 'rgba(99,102,241,0.15)')
                      : 'transparent',
                    color: active
                      ? (isLight ? '#4f46e5' : '#818cf8')
                      : (isLight ? '#666666' : '#999999'),
                    fontWeight: active ? 600 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: active && isLight ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {Icon && <Icon size={13} style={{ color: active ? (isLight ? '#4f46e5' : '#818cf8') : pill.color }} />}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="primary"
          icon={<RiAddLine />}
          onClick={() => setModalOpen(true)}
          style={{
            background: isLight ? '#4f46e5' : '#6366f1',
            borderColor: isLight ? '#4f46e5' : '#6366f1',
            borderRadius: '8px',
            height: '34px',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          Add Doc
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          No documents found. Start by linking a URL or uploading a PDF/Image!
        </div>
      ) : filteredDocs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          No documents found matching the "{typeFilter.toUpperCase()}" filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {filteredDocs.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((doc) => {
            const isPdf = doc.type === 'pdf';
            const isImage = doc.type === 'image';
            const isUrl = doc.type === 'url';

            // Determine accents and icons
            let accentColor = '#60a5fa'; // URL default
            let bgAccent = isLight ? 'rgba(96, 165, 250, 0.08)' : 'rgba(96, 165, 250, 0.06)';
            let borderAccent = isLight ? 'rgba(96, 165, 250, 0.2)' : 'rgba(96, 165, 250, 0.15)';
            let TypeIcon = RiGlobalLine;
            let typeLabel = 'URL';

            if (isPdf) {
              accentColor = '#f87171';
              bgAccent = isLight ? 'rgba(248, 113, 113, 0.08)' : 'rgba(248, 113, 113, 0.06)';
              borderAccent = isLight ? 'rgba(248, 113, 113, 0.2)' : 'rgba(248, 113, 113, 0.15)';
              TypeIcon = RiFilePdfLine;
              typeLabel = 'PDF';
            } else if (isImage) {
              accentColor = '#34d399';
              bgAccent = isLight ? 'rgba(52, 211, 153, 0.08)' : 'rgba(52, 211, 153, 0.06)';
              borderAccent = isLight ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.15)';
              TypeIcon = RiImageLine;
              typeLabel = 'IMAGE';
            }

            const formattedSize = doc.fileSize ? (doc.fileSize > 1024 * 1024 
              ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB` 
              : `${Math.round(doc.fileSize / 1024)} KB`) : '0 KB';

            const docOwnerName = doc.owner === space.owner ? 'You' : 'Member';

            return (
              <div
                key={doc._id}
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
                {/* Header Row: Badge & Action options */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: bgAccent,
                    border: `1px solid ${borderAccent}`,
                    color: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <TypeIcon size={12} />
                    <span>{typeLabel}</span>
                  </span>
                  
                  {/* Pin and options */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <PinButton
                      isPinned={doc.isPinned}
                      onToggle={() => togglePin.mutate(doc._id)}
                    />
                  </div>
                </div>

                {/* Main Content Info Row */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  {/* Left big icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: bgAccent,
                    border: `1px solid ${borderAccent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accentColor,
                    flexShrink: 0
                  }}>
                    <TypeIcon size={24} />
                  </div>
                  
                  {/* Right side info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 
                      onClick={() => handleDocClick(doc)}
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isLight ? '#111111' : '#ffffff',
                        margin: '0 0 4px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = accentColor}
                      onMouseLeave={e => e.currentTarget.style.color = isLight ? '#111111' : '#ffffff'}
                    >
                      {doc.title}
                    </h4>
                    
                    {doc.caption ? (
                      <p style={{
                        fontSize: '12px',
                        color: isLight ? '#666666' : '#88888b',
                        margin: '0 0 8px',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {doc.caption}
                      </p>
                    ) : (
                      <div style={{ height: '4px' }} />
                    )}

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {doc.tags.map(t => (
                          <Tag
                            key={t}
                            style={{
                              fontSize: '10px',
                              borderRadius: '4px',
                              margin: 0,
                              background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                              color: isLight ? '#4b5563' : '#a1a1aa',
                              border: `1px solid ${isLight ? '#e5e7eb' : '#242428'}`,
                            }}
                          >
                            {t}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider Line */}
                <div style={{ height: '1px', background: isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)', margin: '2px 0' }} />

                {/* Metadata Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '2px 0' }}>
                  {/* Added date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <RiHistoryLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Added</span>
                    </div>
                  </div>

                  {/* Size or Link */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    {isUrl ? (
                      <RiGlobalLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                    ) : (
                      <RiFilePdfLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span 
                        title={isUrl ? doc.url : formattedSize}
                        style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {isUrl ? (doc.url ? doc.url.replace(/^https?:\/\/(www\.)?/, '') : 'Link') : formattedSize}
                      </span>
                      <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>
                        {isUrl ? 'Link' : 'Size'}
                      </span>
                    </div>
                  </div>

                  {/* Owner */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <RiTeamLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {docOwnerName}
                      </span>
                      <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Owner</span>
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div style={{ height: '1px', background: isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)', margin: '2px 0' }} />

                {/* Actions Row */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {isUrl ? (
                    <button
                      onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                      style={{
                        flex: 1,
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        borderRadius: '6px',
                        border: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'}`,
                        background: 'transparent',
                        color: isLight ? '#111111' : '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'background 0.15s, color 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = bgAccent; e.currentTarget.style.color = accentColor; e.currentTarget.style.borderColor = borderAccent; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isLight ? '#111111' : '#ffffff'; e.currentTarget.style.borderColor = isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'; }}
                    >
                      <RiExternalLinkLine size={14} /> Open Link
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDocClick(doc)}
                      style={{
                        flex: 1,
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        borderRadius: '6px',
                        border: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'}`,
                        background: 'transparent',
                        color: isLight ? '#111111' : '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'background 0.15s, color 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = bgAccent; e.currentTarget.style.color = accentColor; e.currentTarget.style.borderColor = borderAccent; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isLight ? '#111111' : '#ffffff'; e.currentTarget.style.borderColor = isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'; }}
                    >
                      <RiEyeLine size={14} /> Preview
                    </button>
                  )}

                  {/* Delete Button */}
                  <Popconfirm
                    title="Delete document reference?"
                    onConfirm={() => deleteMutation.mutate(doc._id)}
                    okText="Delete"
                    cancelText="Cancel"
                  >
                    <button
                      style={{
                        height: '32px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        background: 'transparent',
                        color: '#f87171',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'background 0.15s, color 0.15s, border-color 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)'; }}
                    >
                      <RiDeleteBinLine size={14} /> Delete
                    </button>
                  </Popconfirm>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Doc Modal */}
      <QuickAddDocModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        space={space}
      />
      {/* Hidden Image component for previewing doc images */}
      <Image
        src={previewUrl || null}
        style={{ display: 'none' }}
        preview={{
          open: previewVisible,
          onOpenChange: (open) => {
            setPreviewVisible(open);
            if (!open) setPreviewUrl('');
          }
        }}
      />
    </div>
  );
}
