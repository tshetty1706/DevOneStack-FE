import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiFolderLine, RiFolderOpenLine, RiAddLine, RiSearchLine,
  RiFileTextLine, RiStickyNoteLine, RiCodeSSlashLine,
  RiLightbulbLine, RiRobot2Line, RiGitRepositoryLine,
  RiMore2Fill, RiArrowRightSLine, RiArrowDownSLine,
  RiHome4Line, RiFullscreenLine, RiFullscreenExitLine,
  RiCloseLine, RiEditLine, RiDeleteBinLine, RiArrowGoBackLine,
  RiShareForwardLine, RiFileCopyLine, RiCheckLine, RiPriceTag3Line,
  RiInformationLine, RiFolderTransferLine
} from 'react-icons/ri';
import { Modal, Input, Select, message, Tooltip, Popconfirm, Tag } from 'antd';
import api from '../../api/axios';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { QuickAddNoteModal, QuickAddDocModal, QuickAddSnippetModal, QuickAddLearningModal, QuickAddPromptModal, QuickAddRepoModal } from './QuickAddModals';
import { resolveFileUrl, isPdfFile, isImageFile } from '../../utils/fileResolver';

const TYPE_META = {
  note: { label: 'Note', icon: RiStickyNoteLine, color: '#10b981', section: 'notes', bg: 'rgba(16,185,129,0.1)' },
  doc: { label: 'Doc', icon: RiFileTextLine, color: '#60a5fa', section: 'docs', bg: 'rgba(59,130,246,0.1)' },
  snippet: { label: 'Snippet', icon: RiCodeSSlashLine, color: '#818cf8', section: 'snippets', bg: 'rgba(99,102,241,0.1)' },
  learning: { label: 'Learning', icon: RiLightbulbLine, color: '#eab308', section: 'learnings', bg: 'rgba(234,179,8,0.1)' },
  prompt: { label: 'Prompt', icon: RiRobot2Line, color: '#f472b6', section: 'prompts', bg: 'rgba(236,72,153,0.1)' },
  repo: { label: 'Repo', icon: RiGitRepositoryLine, color: '#fb923c', section: 'repos', bg: 'rgba(249,115,22,0.1)' },
};

export default function ExplorerSection({
  space,
  isLight,
  onNavigateSection,
  highlightId,
  highlightFolderId,
  selectedFolderId,
  onSelectFolder,
}) {
  const queryClient = useQueryClient();

  const [currentFolderId, setCurrentFolderId] = useState(highlightFolderId || selectedFolderId || null);

  React.useEffect(() => {
    if (highlightFolderId) {
      setCurrentFolderId(highlightFolderId);
    } else if (selectedFolderId !== undefined) {
      setCurrentFolderId(selectedFolderId);
    }
  }, [highlightFolderId, selectedFolderId]);

  const handleSetCurrentFolder = (fId) => {
    setCurrentFolderId(fId);
    if (onSelectFolder) onSelectFolder(fId);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewerMaximized, setIsViewerMaximized] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyText = (text, label = 'Code') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Folder modals
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState(null);
  const [folderWarning, setFolderWarning] = useState('');

  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renamedFolderName, setRenamedFolderName] = useState('');

  const [moveItemModalOpen, setMoveItemModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);
  const [targetFolderId, setTargetFolderId] = useState(null);

  // Add item dropdown/modal state
  const [addItemType, setAddItemType] = useState(null); // 'note', 'doc', 'snippet', etc.
  const [readmeEditing, setReadmeEditing] = useState(false);
  const [readmeContent, setReadmeContent] = useState(space?.readme || '');

  // Fetch Folders
  const { data: folderData, isLoading: foldersLoading } = useQuery({
    queryKey: ['folders', space._id],
    queryFn: async () => {
      const res = await api.get(`/api/spaces/${space._id}/folders`);
      return res.data.folders || [];
    }
  });

  const folders = folderData || [];

  // Fetch Items
  const { data: itemData, isLoading: itemsLoading } = useQuery({
    queryKey: ['items', space._id],
    queryFn: async () => {
      const res = await api.get(`/api/spaces/${space._id}/items`);
      return res.data.items || [];
    }
  });

  const allItems = itemData || [];

  // Map for fast folder lookup
  const folderMap = useMemo(() => {
    const map = new Map();
    folders.forEach(f => map.set(f._id, f));
    return map;
  }, [folders]);

  // Current folder object
  const currentFolder = currentFolderId ? folderMap.get(currentFolderId) : null;

  // Build breadcrumb trail
  const breadcrumbs = useMemo(() => {
    const trail = [{ id: null, name: space.name }];
    if (!currentFolderId) return trail;

    let curr = folderMap.get(currentFolderId);
    const folderTrail = [];
    const visited = new Set();
    while (curr && !visited.has(curr._id)) {
      visited.add(curr._id);
      folderTrail.unshift({ id: curr._id, name: curr.name });
      curr = curr.parentId ? folderMap.get(curr.parentId) : null;
    }
    return [...trail, ...folderTrail];
  }, [currentFolderId, folderMap, space.name]);

  // Folders to display in current view (alphabetical order)
  const displayedFolders = useMemo(() => {
    return folders.filter(f => {
      if (searchQuery) {
        return f.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return f.parentId === (currentFolderId || null);
    }).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [folders, currentFolderId, searchQuery]);

  // Items to display in current view (alphabetical order)
  const displayedItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedTypeFilter === 'all' || item.type === selectedTypeFilter;

      if (searchQuery || selectedTypeFilter !== 'all') {
        return matchesSearch && matchesType;
      }

      const inCurrentFolder = item.folderId === currentFolderId || (!currentFolderId && !item.folderId);
      return inCurrentFolder && matchesType;
    }).sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
  }, [allItems, currentFolderId, searchQuery, selectedTypeFilter]);

  // Auto-open highlighted item if passed in props
  React.useEffect(() => {
    if (highlightId && allItems.length > 0) {
      const found = allItems.find(i => i._id === highlightId);
      if (found) {
        setSelectedItem(found);
        if (found.folderId) {
          setCurrentFolderId(found.folderId);
        }
      }
    }
  }, [highlightId, allItems]);

  // Folder Mutations
  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentId }) => {
      const res = await api.post(`/api/spaces/${space._id}/folders`, { name, parentId });
      return res.data;
    },
    onSuccess: (data) => {
      message.success(`Folder "${data.folder.name}" created!`);
      if (data.warning) {
        message.warning(data.warning);
      }
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      setCreateFolderModalOpen(false);
      setNewFolderName('');
      setNewFolderParentId(null);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to create folder');
    }
  });

  const renameFolderMutation = useMutation({
    mutationFn: async ({ folderId, name }) => {
      return api.patch(`/api/spaces/${space._id}/folders/${folderId}`, { name });
    },
    onSuccess: () => {
      message.success('Folder renamed successfully');
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      setRenameFolderModalOpen(false);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to rename folder');
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId) => {
      return api.delete(`/api/spaces/${space._id}/folders/${folderId}`);
    },
    onSuccess: () => {
      message.success('Folder deleted');
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      if (currentFolderId === folderToRename?._id) {
        setCurrentFolderId(null);
      }
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to delete folder');
    }
  });

  // Move Item Mutation
  const moveItemMutation = useMutation({
    mutationFn: async ({ itemId, folderId }) => {
      return api.patch(`/api/spaces/${space._id}/items/${itemId}`, { folderId });
    },
    onSuccess: () => {
      message.success('Item moved successfully');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      setMoveItemModalOpen(false);
      setItemToMove(null);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to move item');
    }
  });

  // Delete Item Mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId) => {
      return api.delete(`/api/spaces/${space._id}/items/${itemId}`);
    },
    onSuccess: () => {
      message.success('Item deleted');
      queryClient.invalidateQueries({ queryKey: ['items', space._id] });
      queryClient.invalidateQueries({ queryKey: ['folders', space._id] });
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      if (selectedItem?._id === selectedItem?._id) {
        setSelectedItem(null);
      }
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to delete item');
    }
  });

  // Save Readme Mutation
  const saveReadmeMutation = useMutation({
    mutationFn: async (readme) => {
      return api.patch(`/api/spaces/${space._id}`, { readme });
    },
    onSuccess: () => {
      message.success('README saved!');
      queryClient.invalidateQueries({ queryKey: ['space', space._id] });
      setReadmeEditing(false);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to update README');
    }
  });

  const cardBg = 'var(--card-bg)';
  const cardBorder = 'var(--card-border)';
  const textColor = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const accent = 'var(--accent-color)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

      {/* Explorer Header & Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '12px',
      }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
          <RiFolderOpenLine size={18} style={{ color: accent, flexShrink: 0 }} />
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id || 'root'}>
              {idx > 0 && <RiArrowRightSLine size={14} style={{ color: textMuted, flexShrink: 0 }} />}
              <button
                type="button"
                onClick={() => {
                  setCurrentFolderId(crumb.id);
                  setSearchQuery('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: idx === breadcrumbs.length - 1 ? textColor : textMuted,
                  fontWeight: idx === breadcrumbs.length - 1 ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  padding: '3px 6px',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-display)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = textColor}
                onMouseLeave={e => e.currentTarget.style.color = idx === breadcrumbs.length - 1 ? textColor : textMuted}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Right action buttons: Add Folder & Add Item */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setNewFolderParentId(currentFolderId);
              setCreateFolderModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${cardBorder}`,
              background: isLight ? '#f9fafb' : 'rgba(255,255,255,0.05)',
              color: textColor,
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RiFolderLine size={15} />
            <span>+ New Folder</span>
          </button>

          {/* Add Item Dropdown Trigger */}
          <Select
            placeholder="+ Add Item"
            style={{ width: 130 }}
            value={null}
            onChange={(type) => setAddItemType(type)}
            options={[
              { value: 'note', label: '+ Note' },
              { value: 'doc', label: '+ Doc' },
              { value: 'snippet', label: '+ Snippet' },
              { value: 'learning', label: '+ Learning' },
              { value: 'prompt', label: '+ Prompt' },
              { value: 'repo', label: '+ Repository' },
            ]}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <RiSearchLine size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
          <input
            type="text"
            placeholder="Search items & folders..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 34px',
              borderRadius: '8px',
              border: `1px solid ${cardBorder}`,
              background: cardBg,
              color: textColor,
              fontSize: '12.5px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Type Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {['all', 'note', 'doc', 'snippet', 'learning', 'prompt', 'repo'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTypeFilter(t)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: `1px solid ${selectedTypeFilter === t ? accent : cardBorder}`,
                background: selectedTypeFilter === t ? (isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.15)') : 'transparent',
                color: selectedTypeFilter === t ? accent : textMuted,
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {t === 'all' ? 'All Items' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* File / Folder Explorer Table View */}
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 2fr) 120px 140px 100px 48px',
          padding: '10px 16px',
          borderBottom: `1px solid ${cardBorder}`,
          background: isLight ? '#f9fafb' : 'rgba(255,255,255,0.02)',
          fontSize: '11px',
          fontWeight: 700,
          color: textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <div>Name</div>
          <div>Type</div>
          <div>Folder Path</div>
          <div>Updated</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {/* Directory Listings */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Go Back / Up Directory Row (if inside folder) */}
          {currentFolderId && !searchQuery && (
            <div
              onClick={() => setCurrentFolderId(currentFolder?.parentId || null)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(200px, 2fr) 120px 140px 100px 48px',
                padding: '10px 16px',
                alignItems: 'center',
                borderBottom: `1px solid ${cardBorder}`,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: accent, fontWeight: 600, fontSize: '13px' }}>
                <RiArrowGoBackLine size={15} />
                <span>.. (Up one level)</span>
              </div>
              <div />
              <div />
              <div />
              <div />
            </div>
          )}

          {/* 1. Folders (Listed First in Alphabetical Order) */}
          {displayedFolders.map(folder => (
            <div
              key={folder._id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(200px, 2fr) 120px 140px 100px 48px',
                padding: '11px 16px',
                alignItems: 'center',
                borderBottom: `1px solid ${cardBorder}`,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f9fafb' : 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Folder Name (Clickable to open) */}
              <div
                onClick={() => setCurrentFolderId(folder._id)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: 0 }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)',
                  color: accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <RiFolderLine size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {folder.name}
                  </span>
                  {folder.itemCount !== undefined && (
                    <span style={{ fontSize: '11px', color: textMuted, marginLeft: '6px' }}>
                      ({folder.itemCount} items)
                    </span>
                  )}
                </div>
              </div>

              {/* Type */}
              <div style={{ fontSize: '12px', color: textMuted, fontWeight: 500 }}>
                Folder
              </div>

              {/* Path */}
              <div style={{ fontSize: '11.5px', color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {folder.path || folder.name}
              </div>

              {/* Date */}
              <div style={{ fontSize: '11.5px', color: textMuted }}>
                {new Date(folder.updatedAt).toLocaleDateString()}
              </div>

              {/* 3-dots Folder Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderToRename(folder);
                    setRenamedFolderName(folder.name);
                    setRenameFolderModalOpen(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: textMuted,
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                  title="Folder actions"
                >
                  <RiMore2Fill size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* 2. Items (Listed After Folders in Alphabetical Order) */}
          {displayedItems.map(item => {
            const meta = TYPE_META[item.type] || TYPE_META.doc;
            const ItemIcon = meta.icon;

            return (
              <div
                key={item._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 2fr) 120px 140px 100px 48px',
                  padding: '11px 16px',
                  alignItems: 'center',
                  borderBottom: `1px solid ${cardBorder}`,
                  transition: 'background 0.15s ease',
                  background: selectedItem?._id === item._id ? (isLight ? 'rgba(79,70,229,0.06)' : 'rgba(99,102,241,0.08)') : 'transparent',
                }}
                onMouseEnter={e => {
                  if (selectedItem?._id !== item._id) e.currentTarget.style.background = isLight ? '#f9fafb' : 'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={e => {
                  if (selectedItem?._id !== item._id) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Item Name (Clickable to open full screen viewer) */}
                <div
                  onClick={() => {
                    setSelectedItem(item);
                    setIsViewerMaximized(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: 0 }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: meta.bg,
                    color: meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ItemIcon size={15} />
                  </div>
                  <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                    {item.isPinned && (
                      <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(234,179,8,0.15)', color: '#eab308' }}>
                        Pinned
                      </span>
                    )}
                  </div>
                </div>

                {/* Type Tag */}
                <div>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: meta.bg,
                    color: meta.color,
                  }}>
                    {meta.label}
                  </span>
                </div>

                {/* Folder Path (Clickable) */}
                <div
                  onClick={() => {
                    if (item.folderId) setCurrentFolderId(item.folderId);
                  }}
                  style={{
                    fontSize: '11.5px',
                    color: accent,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textDecoration: 'underline',
                  }}
                  title={item.folderPath || 'Space Root'}
                >
                  {item.folderPath || 'Space Root'}
                </div>

                {/* Date */}
                <div style={{ fontSize: '11.5px', color: textMuted }}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>

                {/* Actions: 3 Dots Menu */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                  <Tooltip title={`Open in ${meta.label}s Module`}>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateSection) {
                          onNavigateSection(meta.section, item._id);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: meta.color,
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                      }}
                    >
                      <RiShareForwardLine size={16} />
                    </button>
                  </Tooltip>

                  <Tooltip title="Move to Folder">
                    <button
                      type="button"
                      onClick={() => {
                        setItemToMove(item);
                        setTargetFolderId(item.folderId || null);
                        setMoveItemModalOpen(true);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: textMuted,
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                      }}
                    >
                      <RiFolderTransferLine size={15} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })}

          {/* Empty State when no folders and no items */}
          {displayedFolders.length === 0 && displayedItems.length === 0 && (
            <div style={{ padding: '36px', textAlign: 'center', color: textMuted, fontSize: '13px' }}>
              <RiFolderOpenLine size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontWeight: 600, color: textColor }}>This folder is empty</p>
              <p style={{ margin: '4px 0 12px', fontSize: '12px' }}>Add a new folder or items to organize your space.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Active Item Full-Screen / Modal Viewer Overlay ── */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isViewerMaximized ? '0' : '24px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedItem(null);
            }
          }}
        >
          <div
            data-lenis-prevent
            style={{
              width: isViewerMaximized ? '100vw' : '960px',
              maxWidth: isViewerMaximized ? '100vw' : '95vw',
              height: isViewerMaximized ? '100vh' : '88vh',
              maxHeight: isViewerMaximized ? '100vh' : '90vh',
              background: isLight ? '#ffffff' : '#0d0d14',
              border: isViewerMaximized ? 'none' : `1px solid ${cardBorder}`,
              borderRadius: isViewerMaximized ? '0' : '16px',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Viewer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 24px',
              borderBottom: `1px solid ${cardBorder}`,
              background: isLight ? '#f9fafb' : '#12121c',
              flexShrink: 0,
              gap: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: TYPE_META[selectedItem.type]?.bg || 'rgba(99,102,241,0.1)',
                  color: TYPE_META[selectedItem.type]?.color || accent,
                  flexShrink: 0,
                  textTransform: 'uppercase',
                }}>
                  {selectedItem.type}
                </span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: textColor, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedItem.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* Redirect to Module Button */}
                <button
                  type="button"
                  onClick={() => {
                    const section = TYPE_META[selectedItem.type]?.section || 'docs';
                    if (onNavigateSection) onNavigateSection(section, selectedItem._id);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${cardBorder}`,
                    background: 'transparent',
                    color: accent,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RiShareForwardLine size={14} />
                  <span>Open in {TYPE_META[selectedItem.type]?.label}s</span>
                </button>

                {/* Maximize / Minimize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsViewerMaximized(!isViewerMaximized)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${cardBorder}`,
                    color: textColor,
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  title={isViewerMaximized ? 'Minimize Window' : 'Full Screen'}
                >
                  {isViewerMaximized ? (
                    <>
                      <RiFullscreenExitLine size={15} />
                      <span>Minimize</span>
                    </>
                  ) : (
                    <>
                      <RiFullscreenLine size={15} />
                      <span>Full Screen</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: textMuted,
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
                >
                  <RiCloseLine size={22} />
                </button>
              </div>
            </div>

            {/* Item Content Preview */}
            <div
              data-lenis-prevent
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: isViewerMaximized ? '32px 48px' : '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {selectedItem.type === 'note' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
                  <MarkdownRenderer content={selectedItem.content || '*No content written yet.*'} isLight={isLight} />
                </div>
              )}

              {selectedItem.type === 'snippet' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isLight ? '#f3f4f6' : '#161622',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${cardBorder}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: accent,
                        background: 'rgba(99,102,241,0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}>
                        {selectedItem.language || 'javascript'}
                      </span>
                      {selectedItem.caption && (
                        <span style={{ fontSize: '12.5px', color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {selectedItem.caption}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedItem.content, 'Snippet')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${copied ? '#10b981' : cardBorder}`,
                        background: copied ? 'rgba(16,185,129,0.15)' : (isLight ? '#ffffff' : '#20202e'),
                        color: copied ? '#10b981' : textColor,
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copied ? (
                        <>
                          <RiCheckLine size={14} style={{ color: '#10b981' }} />
                          <span style={{ color: '#10b981' }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <RiFileCopyLine size={14} />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <MarkdownRenderer content={`\`\`\`${selectedItem.language || 'javascript'}\n${selectedItem.content || ''}\n\`\`\``} isLight={isLight} />
                </div>
              )}

              {selectedItem.type === 'learning' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '14px', color: textColor, margin: 0, lineHeight: 1.6 }}>{selectedItem.content}</p>
                  {selectedItem.codeExample?.code && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedItem.codeExample.code, 'Code Example')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '5px',
                            border: `1px solid ${cardBorder}`,
                            background: 'transparent',
                            color: textColor,
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <RiFileCopyLine size={13} />
                          <span>Copy Code</span>
                        </button>
                      </div>
                      <MarkdownRenderer content={`\`\`\`${selectedItem.codeExample.language || 'javascript'}\n${selectedItem.codeExample.code}\n\`\`\``} isLight={isLight} />
                    </div>
                  )}
                </div>
              )}

              {selectedItem.type === 'prompt' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: isLight ? '#f9fafb' : '#14141e', padding: '18px', borderRadius: '10px', border: `1px solid ${cardBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: textMuted }}>SYSTEM / USER PROMPT ({selectedItem.model || 'AI'}):</p>
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedItem.content, 'Prompt')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '5px',
                          border: `1px solid ${cardBorder}`,
                          background: isLight ? '#ffffff' : '#1e1e2c',
                          color: textColor,
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <RiFileCopyLine size={13} />
                        <span>Copy Prompt</span>
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: textColor, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selectedItem.content}</p>
                  </div>
                </div>
              )}

              {selectedItem.type === 'doc' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                  {isPdfFile(selectedItem) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', minHeight: isViewerMaximized ? 'calc(100vh - 160px)' : '550px' }}>
                      <div style={{ flex: 1, minHeight: isViewerMaximized ? 'calc(100vh - 190px)' : '500px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${cardBorder}` }}>
                        <iframe
                          src={`${resolveFileUrl(selectedItem, space._id)}#toolbar=1`}
                          title={selectedItem.title}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <a
                          href={resolveFileUrl(selectedItem, space._id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: accent, fontSize: '13px', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          Open in full tab
                        </a>
                      </div>
                    </div>
                  ) : selectedItem.url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" style={{ color: accent, fontSize: '14px', textDecoration: 'underline', fontWeight: 600 }}>
                        {selectedItem.url}
                      </a>
                      {selectedItem.caption && <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>{selectedItem.caption}</p>}
                      {selectedItem.content && <MarkdownRenderer content={selectedItem.content} isLight={isLight} />}
                    </div>
                  ) : (
                    <div>
                      {selectedItem.caption && <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 10px' }}>{selectedItem.caption}</p>}
                      {selectedItem.content && <MarkdownRenderer content={selectedItem.content} isLight={isLight} />}
                    </div>
                  )}
                </div>
              )}

              {selectedItem.type === 'repo' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" style={{ color: accent, fontSize: '16px', fontWeight: 600 }}>
                    {selectedItem.url || selectedItem.title}
                  </a>
                  {selectedItem.caption && <p style={{ fontSize: '13.5px', color: textMuted, margin: 0 }}>{selectedItem.caption}</p>}
                </div>
              )}

              {(selectedItem.type === 'image' || isImageFile(selectedItem)) && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                  <img src={resolveFileUrl(selectedItem, space._id)} alt={selectedItem.title} style={{ maxWidth: '100%', maxHeight: isViewerMaximized ? '80vh' : '550px', borderRadius: '10px', objectFit: 'contain' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Space README at Root Level ── */}
      {!currentFolderId && !searchQuery && (
        <div style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RiInformationLine size={18} style={{ color: accent }} />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: textColor }}>
                README.md
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setReadmeEditing(!readmeEditing)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: `1px solid ${cardBorder}`,
                background: 'transparent',
                color: textColor,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RiEditLine size={14} />
              <span>{readmeEditing ? 'Preview' : 'Edit README'}</span>
            </button>
          </div>

          {readmeEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                rows={8}
                value={readmeContent}
                onChange={e => setReadmeContent(e.target.value)}
                placeholder="# Space Overview&#10;&#10;Describe your project, architecture, setup steps..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${cardBorder}`,
                  background: isLight ? '#ffffff' : '#101018',
                  color: textColor,
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setReadmeEditing(false)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveReadmeMutation.mutate(readmeContent)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: accent, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save README
                </button>
              </div>
            </div>
          ) : (
            <div style={{ minHeight: '60px' }}>
              {space.readme ? (
                <MarkdownRenderer content={space.readme} isLight={isLight} />
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: textMuted, fontStyle: 'italic' }}>
                  No README written yet for this Space. Click "Edit README" to add project overview documentation.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Create Folder Modal ── */}
      <Modal
        title="Create New Folder"
        open={createFolderModalOpen}
        onCancel={() => setCreateFolderModalOpen(false)}
        onOk={() => {
          if (!newFolderName.trim()) {
            message.error('Folder name is required');
            return;
          }
          createFolderMutation.mutate({ name: newFolderName, parentId: newFolderParentId });
        }}
        confirmLoading={createFolderMutation.isPending}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '4px' }}>Folder Name</label>
            <Input
              placeholder="e.g. Spring Security, Architecture, API"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '4px' }}>Parent Folder (Optional)</label>
            <Select
              style={{ width: '100%' }}
              placeholder="Space Root"
              value={newFolderParentId}
              onChange={val => setNewFolderParentId(val || null)}
              allowClear
              options={[
                { value: null, label: '📁 Space Root' },
                ...folders.map(f => ({ value: f._id, label: `📁 ${f.path || f.name}` }))
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* ── Rename / Delete Folder Modal ── */}
      <Modal
        title="Manage Folder"
        open={renameFolderModalOpen}
        onCancel={() => setRenameFolderModalOpen(false)}
        footer={[
          <button
            key="delete"
            type="button"
            onClick={() => {
              const { subfoldersCount, countItems } = (() => {
                if (!folderToRename) return { subfoldersCount: 0, countItems: 0 };
                const folderIds = new Set([folderToRename._id.toString()]);
                let added = true;
                while (added) {
                  added = false;
                  folders.forEach(f => {
                    const pId = f.parentId ? (typeof f.parentId === 'object' ? f.parentId._id : f.parentId)?.toString() : null;
                    const fId = f._id.toString();
                    if (pId && folderIds.has(pId) && !folderIds.has(fId)) {
                      folderIds.add(fId);
                      added = true;
                    }
                  });
                }
                const subCount = Math.max(0, folderIds.size - 1);
                const iCount = allItems.filter(item => {
                  const fId = item.folderId ? (typeof item.folderId === 'object' ? item.folderId._id : item.folderId)?.toString() : null;
                  return fId && folderIds.has(fId);
                }).length;
                return { subfoldersCount: subCount, countItems: iCount };
              })();

              Modal.confirm({
                title: `Delete "${folderToRename.name}"?`,
                content: (
                  <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.6 }}>
                    <p style={{ margin: '0 0 8px', color: '#ef4444', fontWeight: 600 }}>
                      This will permanently delete:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: isLight ? '#374151' : '#d1d5db' }}>
                      <li>this folder</li>
                      {subfoldersCount > 0 && <li>{subfoldersCount} subfolder{subfoldersCount > 1 ? 's' : ''}</li>}
                      {countItems > 0 && <li>{countItems} item{countItems > 1 ? 's' : ''}</li>}
                    </ul>
                  </div>
                ),
                okText: 'Delete Folder',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: () => {
                  deleteFolderMutation.mutate(folderToRename._id);
                  setRenameFolderModalOpen(false);
                },
              });
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', float: 'left', fontWeight: 600 }}
          >
            Delete Folder
          </button>,
          <button
            key="cancel"
            type="button"
            onClick={() => setRenameFolderModalOpen(false)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, cursor: 'pointer', marginRight: '8px' }}
          >
            Cancel
          </button>,
          <button
            key="save"
            type="button"
            onClick={() => {
              if (!renamedFolderName.trim()) return message.error('Name cannot be empty');
              renameFolderMutation.mutate({ folderId: folderToRename._id, name: renamedFolderName });
            }}
            style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: accent, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Save Changes
          </button>
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '4px' }}>Folder Name</label>
            <Input
              value={renamedFolderName}
              onChange={e => setRenamedFolderName(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* ── Move Item Modal ── */}
      <Modal
        title="Move Item to Folder"
        open={moveItemModalOpen}
        onCancel={() => setMoveItemModalOpen(false)}
        onOk={() => {
          if (itemToMove) {
            moveItemMutation.mutate({ itemId: itemToMove._id, folderId: targetFolderId });
          }
        }}
        confirmLoading={moveItemMutation.isPending}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: textColor }}>
            Select destination folder for <strong>{itemToMove?.title}</strong>:
          </p>

          <Select
            style={{ width: '100%' }}
            placeholder="Select destination folder"
            value={targetFolderId}
            onChange={val => setTargetFolderId(val || null)}
            options={[
              { value: null, label: '📁 Space Root' },
              ...folders.map(f => ({ value: f._id, label: `📁 ${f.path || f.name}` }))
            ]}
          />
        </div>
      </Modal>

      {/* ── Quick Add Item Modals ── */}
      <QuickAddNoteModal
        open={addItemType === 'note'}
        onClose={() => setAddItemType(null)}
        space={space}
        defaultFolderId={currentFolderId}
      />
      <QuickAddDocModal
        open={addItemType === 'doc'}
        onClose={() => setAddItemType(null)}
        space={space}
        defaultFolderId={currentFolderId}
      />
      <QuickAddSnippetModal
        open={addItemType === 'snippet'}
        onClose={() => setAddItemType(null)}
        space={space}
        defaultFolderId={currentFolderId}
      />
      <QuickAddLearningModal
        open={addItemType === 'learning'}
        onClose={() => setAddItemType(null)}
        space={space}
        defaultFolderId={currentFolderId}
      />
      <QuickAddPromptModal
        open={addItemType === 'prompt'}
        onClose={() => setAddItemType(null)}
        space={space}
        defaultFolderId={currentFolderId}
      />
      <QuickAddRepoModal
        open={addItemType === 'repo'}
        onClose={() => setAddItemType(null)}
        space={space}
        defaultFolderId={currentFolderId}
      />

    </div>
  );
}
