import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Popconfirm, Skeleton, message, Tooltip } from 'antd';
import {
  RiAddLine, RiSearchLine, RiLightbulbLine, RiBugLine,
  RiErrorWarningLine, RiCheckboxCircleLine, RiQuestionLine,
  RiSparklingLine, RiPushpinLine, RiPushpinFill, RiDeleteBinLine,
  RiEditLine, RiFileCopyLine, RiCheckLine, RiCloseLine, RiFolderLine,
  RiFolderTransferLine, RiMenuFoldLine, RiMenuUnfoldLine
} from 'react-icons/ri';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QuickAddLearningModal } from './QuickAddModals';
import SharedFolderTree from './SharedFolderTree';
import MoveItemModal from './MoveItemModal';
import api from '../../api/axios';

const TYPE_CONFIG = {
  learning: { label: 'Learning', icon: RiLightbulbLine, color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.15)' },
  fix: { label: 'Fix', icon: RiBugLine, color: '#f87171', bg: 'rgba(248, 113, 113, 0.08)', border: 'rgba(248, 113, 113, 0.15)' },
  gotcha: { label: 'Gotcha', icon: RiErrorWarningLine, color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.15)' },
  'best-practice': { label: 'Best Practice', icon: RiCheckboxCircleLine, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.15)' },
  question: { label: 'Question', icon: RiQuestionLine, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.15)' },
  idea: { label: 'Idea', icon: RiSparklingLine, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)', border: 'rgba(168, 85, 247, 0.15)' },
};

export default function LearningsSection({
  space,
  isLight,
  highlightId,
  selectedFolderId: propFolderId,
  onSelectFolder: propOnSelectFolder,
  onNavigateSection,
}) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [localFolderId, setLocalFolderId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const selectedFolderId = propFolderId !== undefined ? propFolderId : localFolderId;
  const handleSelectFolder = (fId) => {
    if (propOnSelectFolder) propOnSelectFolder(fId);
    else setLocalFolderId(fId);
  };
  
  // Modal forms state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLearning, setEditingLearning] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch folders for breadcrumbs
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

  // Delete mutation
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

  const openCreateModal = () => {
    setEditingLearning(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingLearning(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLearning(null);
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
  const themeTextColor = isLight ? '#111827' : '#ffffff';
  const themeTextMuted = '#64748b';
  const themeAccent = isLight ? '#4f46e5' : '#6366f1';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      flex: 1,
      overflow: 'hidden',
      height: '100%',
      width: '100%',
      minHeight: 0,
      background: isLight ? '#ffffff' : '#0b0b0e'
    }}>

      {/* LEFT COLUMN: Sidebar Explorer */}
      {!isSidebarCollapsed && (
        <aside style={{
          width: '280px',
          minWidth: '240px',
          maxWidth: '320px',
          borderRight: `1px solid ${themeBorder}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          flexShrink: 0,
          background: isLight ? '#fafafa' : '#0a0a0f',
          overflow: 'hidden'
        }}>
          {/* Header & CTA */}
          <div style={{
            height: '48px',
            minHeight: '48px',
            maxHeight: '48px',
            padding: '0 14px',
            borderBottom: `1px solid ${themeBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RiLightbulbLine size={17} style={{ color: themeAccent }} />
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: themeTextColor, fontFamily: 'var(--font-display)' }}>
                Learnings
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Button
                type="primary"
                size="small"
                icon={<RiAddLine />}
                onClick={openCreateModal}
                style={{
                  background: themeAccent,
                  borderColor: themeAccent,
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                Log Learning
              </Button>

              <Tooltip title="Collapse sidebar">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: themeTextMuted,
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = themeTextColor}
                  onMouseLeave={e => e.currentTarget.style.color = themeTextMuted}
                >
                  <RiMenuFoldLine size={16} />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Current Location Breadcrumb in Sidebar */}
          <div style={{
            padding: '6px 14px',
            borderBottom: `1px solid ${themeBorder}`,
            fontSize: '11px',
            color: themeTextMuted,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            <RiFolderLine size={13} style={{ color: themeAccent, flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: themeTextColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentFolderPath}
            </span>
          </div>

          {/* Shared Folder Tree (Single Source of Truth) */}
          <div data-lenis-prevent style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 4px' }}>
            <SharedFolderTree
              spaceId={space._id}
              selectedFolderId={selectedFolderId}
              onSelectFolder={handleSelectFolder}
              onSelectItem={(item) => {
                if (item.type === 'learning') {
                  setSelectedId(item._id);
                } else if (onNavigateSection) {
                  onNavigateSection(item.type === 'note' ? 'notes' : item.type + 's', item._id, item.folderId);
                }
              }}
              selectedItemId={selectedId}
              filterItemType="learning"
              isLight={isLight}
              showHeader={true}
              showSearch={true}
            />
          </div>

        </aside>
      )}

      {/* RIGHT COLUMN: Viewport Details */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', background: isLight ? '#ffffff' : '#0b0b0e' }}>
        {selectedItem ? (
          <>
            {/* Sticky detail header bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 20px',
              borderBottom: `1px solid ${themeBorder}`,
              background: isLight ? '#fafafa' : '#101017',
              flexShrink: 0,
              gap: '10px',
            }}>
              {/* Expand button if collapsed + Action Controls */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isSidebarCollapsed && (
                  <Tooltip title="Expand sidebar">
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: themeTextMuted,
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        marginRight: '4px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = themeTextColor}
                      onMouseLeave={e => e.currentTarget.style.color = themeTextMuted}
                    >
                      <RiMenuUnfoldLine size={16} />
                    </button>
                  </Tooltip>
                )}

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

                <Button
                  size="small"
                  icon={<RiFolderTransferLine />}
                  onClick={() => setMoveModalOpen(true)}
                  style={{ background: 'transparent', border: `1px solid ${themeBorder}`, color: isLight ? '#111' : '#fff', fontSize: '12px' }}
                >
                  Move
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

                {/* Folder Path */}
                <div
                  onClick={() => {
                    if (onNavigateSection) {
                      onNavigateSection('explorer', selectedItem._id, selectedItem.folderId);
                    }
                  }}
                  style={{
                    fontSize: '12px',
                    color: themeAccent,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
                  title="View in Explorer"
                >
                  <RiFolderLine size={13} />
                  <span>{selectedItem.folderPath || 'Space Root'}</span>
                </div>

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

                {/* Timestamps */}
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', position: 'relative' }}>
            {isSidebarCollapsed && (
              <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                <Tooltip title="Expand sidebar">
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(false)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${themeBorder}`,
                      color: themeTextMuted,
                      cursor: 'pointer',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = themeTextColor}
                    onMouseLeave={e => e.currentTarget.style.color = themeTextMuted}
                  >
                    <RiMenuUnfoldLine size={16} />
                    <span>Show Sidebar</span>
                  </button>
                </Tooltip>
              </div>
            )}

            <RiLightbulbLine size={48} style={{ opacity: 0.15 }} />
            <p style={{ marginTop: 12, fontSize: '14px', color: themeTextColor, fontWeight: 600 }}>No learning selected</p>
            <p style={{ fontSize: '12px', marginTop: 2, color: themeTextMuted }}>Current folder: {currentFolderPath}</p>
            <Button
              type="primary"
              icon={<RiAddLine />}
              onClick={openCreateModal}
              style={{
                marginTop: 16,
                background: themeAccent,
                borderColor: themeAccent,
                fontWeight: 600
              }}
            >
              Log Learning
            </Button>
          </div>
        )}
      </main>

      {/* CREATE / EDIT DIALOG MODAL */}
      <QuickAddLearningModal
        open={modalOpen}
        onClose={closeModal}
        space={space}
        defaultFolderId={selectedFolderId}
        editingLearning={editingLearning}
        onSuccess={(learning) => {
          if (learning?._id) setSelectedId(learning._id);
        }}
      />

      {/* MOVE ITEM MODAL */}
      <MoveItemModal
        open={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        space={space}
        item={selectedItem}
        onSuccess={() => {
          queryClient.invalidateQueries(['learnings', space._id]);
          queryClient.invalidateQueries(['items', space._id]);
        }}
      />
    </div>
  );
}
