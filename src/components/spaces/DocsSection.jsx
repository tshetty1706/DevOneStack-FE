import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Upload, Popconfirm, Skeleton, Image, Tag, message, Tooltip } from 'antd';
import { 
  RiAddLine, RiGlobalLine, RiFilePdfLine, RiImageLine, RiPushpinLine, 
  RiPushpin2Fill, RiDeleteBinLine, RiSearchLine, RiUploadCloudLine,
  RiDownloadLine, RiExternalLinkLine, RiFileCopyLine, RiEyeLine, 
  RiHistoryLine, RiTeamLine, RiFolderLine, RiFolderTransferLine, RiFileTextLine,
  RiMenuFoldLine, RiMenuUnfoldLine
} from 'react-icons/ri';
import api from '../../api/axios';
import { QuickAddDocModal } from './QuickAddModals';
import SharedFolderTree from './SharedFolderTree';
import MoveItemModal from './MoveItemModal';
import PinButton from '../common/PinButton';
import { useDebounce } from '../../hooks/useDebounce';

const { Dragger } = Upload;

export default function DocsSection({
  space,
  isLight,
  highlightId,
  selectedFolderId: propFolderId,
  onSelectFolder: propOnSelectFolder,
  onNavigateSection,
}) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'pdf', 'image', 'url'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [localFolderId, setLocalFolderId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);

  const selectedFolderId = propFolderId !== undefined ? propFolderId : localFolderId;
  const handleSelectFolder = (fId) => {
    if (propOnSelectFolder) propOnSelectFolder(fId);
    else setLocalFolderId(fId);
  };

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Fetch folders for breadcrumb
  const { data: folderData } = useQuery({
    queryKey: ['folders', space._id],
    queryFn: async () => {
      const res = await api.get(`/api/spaces/${space._id}/folders`);
      return res.data.folders || [];
    }
  });

  const folders = folderData || [];

  const currentFolderPath = useMemo(() => {
    if (!selectedFolderId) return 'Space Root';
    const folder = folders.find(f => f._id === selectedFolderId);
    return folder?.path || folder?.name || 'Space Root';
  }, [folders, selectedFolderId]);

  // Fetch docs
  const { data = [], isLoading } = useQuery({
    queryKey: ['docs', space._id, debouncedQuery],
    queryFn: async () => {
      const endpoint = debouncedQuery
        ? `/api/spaces/${space._id}/docs/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/spaces/${space._id}/docs`;
      const response = await api.get(endpoint);
      return response.data.docs || [];
    }
  });

  const docs = useMemo(() => {
    if (!selectedFolderId) return data;
    return data.filter(doc => {
      const fId = doc.folderId ? (typeof doc.folderId === 'object' ? doc.folderId._id : doc.folderId) : null;
      return fId === selectedFolderId;
    });
  }, [data, selectedFolderId]);

  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      if (typeFilter === 'all') return true;
      return doc.type === typeFilter;
    });
  }, [docs, typeFilter]);

  useEffect(() => {
    if (highlightId && docs && docs.length > 0) {
      const target = docs.find(d => d._id === highlightId);
      if (target) {
        handleDocClick(target);
      }
    }
  }, [highlightId, docs]);

  // Toggle Pin
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/api/spaces/${space._id}/docs/${id}`);
    },
    onSuccess: () => {
      message.success('Document deleted');
      queryClient.invalidateQueries(['docs', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to delete document');
    }
  });

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
          if (!tab) {
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = doc.title || 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        })
        .catch(() => {
          if (doc.url) {
            window.open(doc.url, '_blank', 'noopener,noreferrer');
          } else {
            message.error('Failed to open PDF document');
          }
        });
      return;
    }

    if (doc.type === 'image') {
      if (doc.url) {
        setPreviewUrl(doc.url);
        setPreviewVisible(true);
      } else {
        api.get(`/api/spaces/${space._id}/docs/${doc._id}/file`, { responseType: 'blob' })
          .then(response => {
            const blobUrl = URL.createObjectURL(response.data);
            setPreviewUrl(blobUrl);
            setPreviewVisible(true);
          })
          .catch(() => {
            message.error('Failed to load image preview');
          });
      }
      return;
    }
  };

  const FILTER_PILLS = [
    { key: 'all', label: 'All Docs', icon: null },
    { key: 'url', label: 'Links', icon: RiGlobalLine, color: '#60a5fa' },
    { key: 'pdf', label: 'PDFs', icon: RiFilePdfLine, color: '#f87171' },
    { key: 'image', label: 'Images', icon: RiImageLine, color: '#34d399' },
  ];

  const cardBorder = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
  const sidebarBg = isLight ? '#fafafa' : '#0a0a0f';
  const editorBg = isLight ? '#ffffff' : '#0b0b0e';
  const textColor = isLight ? '#111827' : '#ffffff';
  const textMuted = '#64748b';
  const accent = isLight ? '#4f46e5' : '#6366f1';

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', minHeight: 0, flex: 1, background: editorBg, overflow: 'hidden' }}>
      {/* LEFT COLUMN: Docs Sidebar */}
      {!isSidebarCollapsed && (
        <aside style={{
          width: '260px',
          minWidth: '240px',
          maxWidth: '300px',
          borderRight: `1px solid ${cardBorder}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          flexShrink: 0,
          background: sidebarBg,
          overflow: 'hidden',
        }}>
          {/* Sidebar Header */}
          <div style={{
            height: '48px',
            minHeight: '48px',
            maxHeight: '48px',
            padding: '0 14px',
            borderBottom: `1px solid ${cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RiFileTextLine size={17} style={{ color: accent }} />
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: textColor, fontFamily: 'var(--font-display)' }}>
                Docs
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Button
                type="primary"
                size="small"
                icon={<RiAddLine />}
                onClick={() => setModalOpen(true)}
                style={{
                  background: accent,
                  borderColor: accent,
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                Add Doc
              </Button>

              <Tooltip title="Collapse sidebar">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: textMuted,
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = textColor}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <RiMenuFoldLine size={16} />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Current Location Breadcrumb in Sidebar */}
          <div style={{
            padding: '6px 14px',
            borderBottom: `1px solid ${cardBorder}`,
            fontSize: '11px',
            color: textMuted,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            <RiFolderLine size={13} style={{ color: accent, flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentFolderPath}
            </span>
          </div>

          {/* Search bar */}
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${cardBorder}`, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <RiSearchLine size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
              <input
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Filter Pills */}
          <div style={{ display: 'flex', padding: '6px 12px', gap: '4px', borderBottom: `1px solid ${cardBorder}`, flexShrink: 0, overflowX: 'auto' }}>
            {FILTER_PILLS.map(pill => {
              const active = typeFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setTypeFilter(pill.key)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '5px',
                    border: 'none',
                    background: active ? (isLight ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.2)') : 'transparent',
                    color: active ? accent : textMuted,
                    fontWeight: active ? 700 : 500,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Shared Folder Tree */}
          <div data-lenis-prevent style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 2px' }}>
            <SharedFolderTree
              spaceId={space._id}
              selectedFolderId={selectedFolderId}
              onSelectFolder={handleSelectFolder}
              onSelectItem={(item) => {
                if (item.type === 'doc') {
                  handleDocClick(item);
                } else if (onNavigateSection) {
                  onNavigateSection(item.type === 'note' ? 'notes' : item.type + 's', item._id, item.folderId);
                }
              }}
              selectedItemId={highlightId}
              filterItemType="doc"
              isLight={isLight}
              showHeader={true}
              showSearch={false}
            />
          </div>
        </aside>
      )}

      {/* RIGHT COLUMN: Docs content */}
      <main data-lenis-prevent style={{ flex: 1, minWidth: 0, minHeight: 0, height: '100%', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {/* Top summary row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {isSidebarCollapsed && (
              <Tooltip title="Expand sidebar">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(false)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${cardBorder}`,
                    color: textMuted,
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = textColor}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <RiMenuUnfoldLine size={16} />
                  <span>Show Sidebar</span>
                </button>
              </Tooltip>
            )}

            <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>
              {filteredDocs.length} Document{filteredDocs.length === 1 ? '' : 's'}
            </span>
            {selectedFolderId && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.14)',
                border: `1px solid ${isLight ? 'rgba(79,70,229,0.2)' : 'rgba(99,102,241,0.25)'}`,
                fontSize: '11px',
                color: isLight ? '#4f46e5' : '#818cf8',
              }}>
                <RiFolderLine size={13} />
                <span>{currentFolderPath}</span>
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
            onClick={() => setModalOpen(true)}
            style={{
              background: accent,
              borderColor: accent,
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12.5px'
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {filteredDocs.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((doc) => {
              const isPdf = doc.type === 'pdf';
              const isImage = doc.type === 'image';
              const isUrl = doc.type === 'url';

              let accentColor = '#60a5fa';
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
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <PinButton
                        isPinned={doc.isPinned}
                        onToggle={() => togglePin.mutate(doc._id)}
                      />
                    </div>
                  </div>

                  {/* Main Content Info Row */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: bgAccent,
                      border: `1px solid ${borderAccent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleDocClick(doc)}
                    >
                      <TypeIcon size={24} style={{ color: accentColor }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 
                        onClick={() => handleDocClick(doc)}
                        title={doc.title}
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: isLight ? '#111111' : '#ffffff',
                          margin: '0 0 4px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {doc.title}
                      </h4>

                      {doc.folderPath && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateSection) {
                              onNavigateSection('explorer', doc._id, doc.folderId);
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
                          <span>{doc.folderPath}</span>
                        </div>
                      )}

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
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {doc.caption}
                        </p>
                      ) : (
                        <div style={{ height: '4px' }} />
                      )}

                      {/* Tags */}
                      {doc.tags && doc.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <RiHistoryLine size={15} style={{ color: isLight ? '#666666' : '#88888b', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#111111' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '9px', color: isLight ? '#88888b' : '#66666b' }}>Added</span>
                      </div>
                    </div>

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

                    <button
                      onClick={() => { setItemToMove(doc); setMoveModalOpen(true); }}
                      style={{
                        height: '32px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        borderRadius: '6px',
                        border: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'}`,
                        background: 'transparent',
                        color: isLight ? '#4f46e5' : '#818cf8',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'background 0.15s'
                      }}
                    >
                      <RiFolderTransferLine size={14} /> Move
                    </button>

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
      </main>

      {/* Add Doc Modal */}
      <QuickAddDocModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        space={space}
        defaultFolderId={selectedFolderId}
      />

      {/* Move Item Modal */}
      <MoveItemModal
        open={moveModalOpen}
        onClose={() => { setMoveModalOpen(false); setItemToMove(null); }}
        space={space}
        item={itemToMove}
        onSuccess={() => {
          queryClient.invalidateQueries(['docs', space._id]);
          queryClient.invalidateQueries(['items', space._id]);
        }}
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
