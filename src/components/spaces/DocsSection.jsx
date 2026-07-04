import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Upload, Popconfirm, Skeleton, Image, Tag, message, Tooltip } from 'antd';
import { RiAddLine, RiGlobalLine, RiFilePdfLine, RiImageLine, RiPushpinLine, RiPushpin2Fill, RiDeleteBinLine, RiSearchLine, RiUploadCloudLine } from 'react-icons/ri';
import api from '../../api/axios';

const { Dragger } = Upload;

export default function DocsSection({ space, isLight, highlightId }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('url'); // 'url', 'pdf', 'image'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

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

    try {
      const { data } = await api.get(`/api/spaces/${space._id}/docs/${doc._id}/signed-url`);
      if (doc.type === 'pdf') {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else if (doc.type === 'image') {
        setPreviewUrl(data.url);
        setPreviewVisible(true);
      }
    } catch (err) {
      message.error('Failed to retrieve file URL');
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
      {/* Header Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <RiSearchLine style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', zIndex: 10 }} />
          <input
            placeholder="Search docs..."
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
          onClick={() => setModalOpen(true)}
          style={{ background: isLight ? '#4f46e5' : '#6366f1', borderColor: isLight ? '#4f46e5' : '#6366f1', borderRadius: '8px' }}
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
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {docs.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((doc) => (
            <div
              key={doc._id}
              style={{
                background: isLight ? '#f9f9fc' : '#181818',
                border: `1px solid ${isLight ? '#ebebeb' : '#282828'}`,
                borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', minHeight: '140px', position: 'relative',
                transition: 'transform 0.15s ease',
              }}
            >
              {/* Pin indicator */}
              <div style={{ position: 'absolute', right: '12px', top: '12px', zIndex: 20 }}>
                <PinButton
                  isPinned={doc.isPinned}
                  onToggle={() => togglePin.mutate(doc._id)}
                />
              </div>

              <div onClick={() => handleDocClick(doc)} style={{ cursor: 'pointer', paddingRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {doc.type === 'url' && <RiGlobalLine size={16} style={{ color: '#60a5fa' }} />}
                  {doc.type === 'pdf' && <RiFilePdfLine size={16} style={{ color: '#f87171' }} />}
                  {doc.type === 'image' && <RiImageLine size={16} style={{ color: '#34d399' }} />}
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#888', letterSpacing: '0.05em' }}>
                    {doc.type}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', margin: '0 0 6px' }}>
                  {doc.title}
                </h4>
                {doc.caption && (
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {doc.caption}
                  </p>
                )}
              </div>

              <div>
                {doc.tags && doc.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {doc.tags.map(t => (
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
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  <Popconfirm
                    title="Delete document reference?"
                    onConfirm={() => deleteMutation.mutate(doc._id)}
                    okText="Delete"
                    cancelText="Cancel"
                  >
                    <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RiDeleteBinLine size={13} /> Delete
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doc Modal */}
      <Modal
        title="Add New Reference Document"
        open={modalOpen}
        onCancel={resetForm}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText="Add Document"
        cancelText="Cancel"
        style={{ borderRadius: '12px' }}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' } }}
      >
        <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${isLight ? '#e5e5e5' : '#2a2a2a'}`, paddingBottom: '12px', marginBottom: '16px' }}>
          {[
            { id: 'url', label: 'External URL' },
            { id: 'pdf', label: 'PDF Document' },
            { id: 'image', label: 'Image/Diagram' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setFile(null); }}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: 'none',
                background: activeTab === tab.id ? (isLight ? '#e5e7eb' : '#2a2a2a') : 'transparent',
                color: activeTab === tab.id ? (isLight ? '#111' : '#fff') : '#888',
                fontWeight: 600, fontSize: '12px', cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeTab === 'url' ? (
            <>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DOCUMENT TITLE</label>
                <Input placeholder="e.g. React Official Getting Started Guide" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>EXTERNAL URL</label>
                <Input placeholder="https://react.dev/learn" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>UPLOAD FILE</label>
                <Dragger
                  accept={activeTab === 'pdf' ? '.pdf' : 'image/*'}
                  beforeUpload={(file) => {
                    if (file.size > 10 * 1024 * 1024) {
                      message.error('File size must be less than 10MB');
                      return Upload.LIST_IGNORE;
                    }
                    setFile(file);
                    return false; // Stop automatic upload
                  }}
                  maxCount={1}
                  onRemove={() => setFile(null)}
                >
                  <div style={{ padding: '16px 0' }}>
                    <RiUploadCloudLine size={32} style={{ color: '#888', marginBottom: '8px' }} />
                    <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>Click or drag file here to upload</p>
                    <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0' }}>PDF or Images up to 10MB</p>
                  </div>
                </Dragger>
                {file && <span style={{ fontSize: '12px', color: '#22c55e', display: 'block', marginTop: '6px' }}>Selected: {file.name}</span>}
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DOCUMENT TITLE</label>
                <Input placeholder="e.g. Architecture Diagram (Optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CAPTION / DESCRIPTION</label>
            <Input.TextArea placeholder="Brief description of the resource..." value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} rows={3} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>TAGS</label>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Type tags and hit enter"
              value={tags}
              onChange={(value) => setTags(value)}
            />
          </div>
        </div>
      </Modal>
      {/* Hidden Image component for previewing doc images */}
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewVisible,
          src: previewUrl,
          onVisibleChange: (visible) => {
            setPreviewVisible(visible);
            if (!visible) setPreviewUrl('');
          }
        }}
      />
    </div>
  );
}
