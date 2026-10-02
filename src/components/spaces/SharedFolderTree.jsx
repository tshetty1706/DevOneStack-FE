import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiFolderLine,
  RiFolderOpenLine,
  RiFolderAddLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiSearchLine,
  RiMore2Fill,
  RiStickyNoteLine,
  RiLightbulbLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiRobot2Line,
  RiGitRepositoryLine,
  RiImageLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAppsLine,
  RiCheckLine,
  RiCloseLine,
  RiFolderTransferLine,
  RiAddLine,
  RiEyeLine,
  RiTeamLine
} from 'react-icons/ri';
import { Modal, Input, message, Tooltip, Dropdown } from 'antd';
import api from '../../api/axios';
import MoveItemModal from './MoveItemModal';
import {
  QuickAddNoteModal,
  QuickAddSnippetModal,
  QuickAddDocModal,
  QuickAddLearningModal,
  QuickAddPromptModal,
  QuickAddRepoModal,
  QuickAddCommunityModal
} from './QuickAddModals';

const ITEM_TYPE_META = {
  note:      { label: 'Note',      icon: RiStickyNoteLine, color: '#10b981', section: 'notes' },
  learning:  { label: 'Learning',  icon: RiLightbulbLine,  color: '#eab308', section: 'learnings' },
  snippet:   { label: 'Snippet',   icon: RiCodeSSlashLine, color: '#818cf8', section: 'snippets' },
  doc:       { label: 'Doc',       icon: RiFileTextLine,   color: '#60a5fa', section: 'docs' },
  prompt:    { label: 'Prompt',    icon: RiRobot2Line,     color: '#f472b6', section: 'prompts' },
  repo:      { label: 'Repo',      icon: RiGitRepositoryLine, color: '#fb923c', section: 'repos' },
  image:     { label: 'Image',     icon: RiImageLine,      color: '#ec4899', section: 'docs' },
  community: { label: 'Community', icon: RiTeamLine,       color: '#38bdf8', section: 'communities' },
};

/**
 * Build hierarchical folder tree structure
 */
function buildTree(folders, parentId = null, depth = 1) {
  return folders
    .filter(f => {
      const pId = f.parentId ? (typeof f.parentId === 'object' ? f.parentId._id : f.parentId) : null;
      return pId === parentId;
    })
    .map(f => ({
      ...f,
      depth,
      children: depth < 4 ? buildTree(folders, f._id, depth + 1) : [],
    }));
}

/**
 * Reusable VS Code-Style Shared Folder & Item Explorer
 * Shared across Explorer, Notes, Docs, Snippets, Learnings, Prompts, Repos, Images.
 */
export default function SharedFolderTree({
  spaceId,
  selectedFolderId,
  onSelectFolder,
  onSelectItem,
  onAddItem, // Optional custom item add handler (type, folderId)
  selectedItemId = null,
  filterItemType = null, // e.g. 'note', 'learning', or null for all
  isLight = false,
  showSearch = true,
  searchQuery = '',
  showHeader = true,
  maxHeight = '100%',
  style = {},
}) {
  const queryClient = useQueryClient();

  // Search & Expansion state
  const [folderSearch, setFolderSearch] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState({});

  // Inline rename state
  const [editingId, setEditingId] = useState(null); // 'folder-123' or 'item-456'
  const [editName, setEditName] = useState('');
  const editInputRef = useRef(null);

  // Drag and drop state
  const [dragOverId, setDragOverId] = useState(null); // folder ID or 'root'
  const [draggingObject, setDraggingObject] = useState(null); // { type: 'item'|'folder', id, name/title }

  // Create folder modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');

  // Move modal state (for both items and folders)
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);
  const [folderToMove, setFolderToMove] = useState(null);

  // Quick Add Modal state (triggered from folder right-click)
  const [quickAddType, setQuickAddType] = useState(null); // 'note', 'snippet', 'doc', 'learning', 'prompt', 'repo'
  const [quickAddFolderId, setQuickAddFolderId] = useState(null);

  // Focus inline edit input
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Fetch Folders
  const { data: folderData, isLoading: foldersLoading } = useQuery({
    queryKey: ['folders', spaceId],
    queryFn: async () => {
      const res = await api.get(`/api/spaces/${spaceId}/folders`);
      return res.data.folders || [];
    },
    enabled: !!spaceId,
  });

  const folders = folderData || [];

  // Fetch Items for tree display
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['items', spaceId, filterItemType || 'all'],
    queryFn: async () => {
      const endpoint = filterItemType
        ? `/api/spaces/${spaceId}/items?type=${filterItemType}`
        : `/api/spaces/${spaceId}/items`;
      const res = await api.get(endpoint);
      return res.data.items || [];
    },
    enabled: !!spaceId,
  });

  const allItems = itemsData || [];

  // Map items by folderId
  const itemsByFolder = useMemo(() => {
    const map = new Map();
    allItems.forEach(item => {
      let fId = 'root';
      if (item.folderId) {
        if (typeof item.folderId === 'object' && item.folderId._id) {
          fId = item.folderId._id.toString();
        } else {
          fId = item.folderId.toString();
        }
      }
      if (!map.has(fId)) map.set(fId, []);
      map.get(fId).push(item);
    });
    return map;
  }, [allItems]);

  // Compute folder hierarchy tree
  const folderTree = useMemo(() => {
    return buildTree(folders, null, 1);
  }, [folders]);

  // Toggle collapsed folder
  const toggleCollapse = (folderId, e) => {
    e?.stopPropagation();
    setCollapsedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Helper to get subtree counts for deletion confirmation
  const getSubtreeCounts = useCallback((folderId) => {
    const folderIds = new Set([folderId.toString()]);
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
    const subfoldersCount = Math.max(0, folderIds.size - 1);
    const countItems = allItems.filter(item => {
      const fId = item.folderId ? (typeof item.folderId === 'object' ? item.folderId._id : item.folderId)?.toString() : null;
      return fId && folderIds.has(fId);
    }).length;
    return { subfoldersCount, countItems };
  }, [folders, allItems]);

  // ── MUTATIONS ──

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentId }) => {
      const res = await api.post(`/api/spaces/${spaceId}/folders`, {
        name: name.trim(),
        parentId: parentId || null,
      });
      return res.data.folder;
    },
    onSuccess: (newFolder) => {
      message.success(`Folder "${newFolder.name}" created`);
      queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
      setCreateModalOpen(false);
      setNewFolderName('');
      if (createParentId) {
        setCollapsedFolders(prev => ({ ...prev, [createParentId]: false }));
      }
      onSelectFolder?.(newFolder._id, newFolder);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't create folder.");
    },
  });

  // Rename folder mutation
  const renameFolderMutation = useMutation({
    mutationFn: async ({ folderId, name }) => {
      const res = await api.patch(`/api/spaces/${spaceId}/folders/${folderId}`, {
        name: name.trim(),
      });
      return res.data.folder;
    },
    onSuccess: (updated) => {
      message.success(`Folder renamed to "${updated.name}"`);
      queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
      setEditingId(null);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't rename folder.");
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId) => {
      await api.delete(`/api/spaces/${spaceId}/folders/${folderId}`);
    },
    onSuccess: () => {
      message.success('Folder and contents deleted');
      queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['items', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['space', spaceId] });
      if (selectedFolderId) {
        onSelectFolder?.(null, null);
      }
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't delete folder.");
    },
  });

  // Rename item mutation
  const renameItemMutation = useMutation({
    mutationFn: async ({ itemId, title }) => {
      const res = await api.patch(`/api/spaces/${spaceId}/items/${itemId}`, {
        title: title.trim(),
      });
      return res.data.item;
    },
    onSuccess: (updated) => {
      message.success(`Item renamed to "${updated.title}"`);
      queryClient.invalidateQueries({ queryKey: ['items', spaceId] });
      if (updated.type) {
        queryClient.invalidateQueries({ queryKey: [updated.type + 's', spaceId] });
      }
      setEditingId(null);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't rename item.");
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (item) => {
      await api.delete(`/api/spaces/${spaceId}/items/${item._id}`);
      return item;
    },
    onSuccess: (item) => {
      message.success('Item deleted');
      queryClient.invalidateQueries({ queryKey: ['items', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
      if (item.type) {
        queryClient.invalidateQueries({ queryKey: [item.type + 's', spaceId] });
      }
      queryClient.invalidateQueries({ queryKey: ['space', spaceId] });
    },
    onError: (err) => {
      message.error(err.response?.data?.error || "Couldn't delete item.");
    },
  });

  // Move item / folder drag-and-drop mutation
  const handleDropOnFolder = async (targetFolderId) => {
    if (!draggingObject) return;
    const destId = targetFolderId === 'root' ? null : targetFolderId;

    if (draggingObject.type === 'item') {
      // Don't move if already in this folder
      const currentFId = draggingObject.folderId || null;
      if (currentFId === destId) {
        setDragOverId(null);
        setDraggingObject(null);
        return;
      }
      try {
        await api.patch(`/api/spaces/${spaceId}/items/${draggingObject.id}`, { folderId: destId });
        message.success(`Moved "${draggingObject.title}"`);
        queryClient.invalidateQueries({ queryKey: ['items', spaceId] });
        queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
        if (draggingObject.itemType) {
          queryClient.invalidateQueries({ queryKey: [draggingObject.itemType + 's', spaceId] });
        }
      } catch (err) {
        message.error(err.response?.data?.error || "Couldn't move item.");
      }
    } else if (draggingObject.type === 'folder') {
      // Don't move into itself
      if (draggingObject.id === destId) {
        setDragOverId(null);
        setDraggingObject(null);
        return;
      }
      try {
        await api.patch(`/api/spaces/${spaceId}/folders/${draggingObject.id}`, { parentId: destId });
        message.success(`Moved folder "${draggingObject.name}"`);
        queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
      } catch (err) {
        message.error(err.response?.data?.error || "Couldn't move folder.");
      }
    }

    setDragOverId(null);
    setDraggingObject(null);
  };

  // Open Create Folder Dialog with depth check
  const handleOpenCreateFolder = (targetParentId = null) => {
    const parentFolder = targetParentId
      ? folders.find(f => f._id === targetParentId)
      : (selectedFolderId ? folders.find(f => f._id === selectedFolderId) : null);

    const parentDepth = parentFolder?.depth || (parentFolder?.pathArray ? parentFolder.pathArray.length : (parentFolder ? 1 : 0));

    if (parentDepth >= 4) {
      message.warning('Folders can only be nested up to 4 levels.');
      return;
    }

    setCreateParentId(parentFolder?._id || null);
    setNewFolderName('');
    setCreateModalOpen(true);
  };

  // Trigger New Item creation in folder
  const handleTriggerNewItem = (type, targetFolderId) => {
    const validFolderId = (targetFolderId && targetFolderId !== 'root' && targetFolderId !== 'null' && targetFolderId !== 'undefined') ? targetFolderId : null;
    const finalType = type || filterItemType || 'note';
    if (onAddItem) {
      onAddItem(validFolderId, finalType);
    } else {
      setQuickAddFolderId(validFolderId);
      setQuickAddType(finalType);
    }
  };

  // Inline Rename submit
  const handleInlineRenameSubmit = () => {
    if (!editingId || !editName.trim()) {
      setEditingId(null);
      return;
    }
    const [kind, id] = editingId.split(':');
    if (kind === 'folder') {
      renameFolderMutation.mutate({ folderId: id, name: editName });
    } else if (kind === 'item') {
      renameItemMutation.mutate({ itemId: id, title: editName });
    }
  };

  // Color tokens
  const textColor = isLight ? '#1f2937' : '#f3f4f6';
  const textMuted = isLight ? '#6b7280' : '#9ca3af';
  const hoverBg = isLight ? '#f3f4f6' : 'rgba(255, 255, 255, 0.05)';
  const selectedBg = isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.16)';
  const selectedColor = isLight ? '#4338ca' : '#a5b4fc';
  const accentColor = isLight ? '#4f46e5' : '#818cf8';
  const dragHighlightBg = isLight ? 'rgba(79, 70, 229, 0.18)' : 'rgba(99, 102, 241, 0.3)';

  // ── RENDER TREE NODE ──
  const renderTreeNode = (node) => {
    const isSelected = selectedFolderId === node._id;
    const isCollapsed = collapsedFolders[node._id];
    const isDragTarget = dragOverId === node._id;
    const isEditing = editingId === `folder:${node._id}`;
    const folderItems = itemsByFolder.get(node._id) || [];
    const totalCount = (node.itemCount !== undefined ? node.itemCount : folderItems.length);
    const indentPadding = (node.depth - 1) * 14 + 6;

    // Filter folder by search if any
    const query = (searchQuery || folderSearch || '').toLowerCase().trim();
    if (query && !node.name.toLowerCase().includes(query)) {
      const childMatches = node.children.some(c => c.name.toLowerCase().includes(query));
      const itemMatches = folderItems.some(i => i.title.toLowerCase().includes(query));
      if (!childMatches && !itemMatches) return null;
    }

    // Context Menu Items
    const contextMenuItems = [
      {
        key: 'new-item',
        label: filterItemType ? `New ${ITEM_TYPE_META[filterItemType]?.label || 'Item'}` : 'New Item',
        icon: <RiAddLine size={14} />,
        onClick: () => handleTriggerNewItem(filterItemType || 'note', node._id),
      },
      {
        key: 'add-subfolder',
        label: 'New Folder',
        icon: <RiFolderAddLine size={14} />,
        disabled: node.depth >= 4,
        onClick: () => handleOpenCreateFolder(node._id),
      },
      {
        type: 'divider',
      },
      {
        key: 'rename',
        label: 'Rename',
        icon: <RiEditLine size={14} />,
        onClick: () => {
          setEditingId(`folder:${node._id}`);
          setEditName(node.name);
        },
      },
      {
        key: 'move',
        label: 'Move to...',
        icon: <RiFolderTransferLine size={14} />,
        onClick: () => {
          setFolderToMove(node);
          setItemToMove(null);
          setMoveModalOpen(true);
        },
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <RiDeleteBinLine size={14} />,
        danger: true,
        onClick: () => {
          const { subfoldersCount, countItems } = getSubtreeCounts(node._id);
          Modal.confirm({
            title: `Delete "${node.name}"?`,
            content: (
              <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 8px', color: '#ef4444', fontWeight: 600 }}>
                  Delete this folder and everything inside it?
                </p>
                {(subfoldersCount > 0 || countItems > 0) && (
                  <ul style={{ margin: 0, paddingLeft: '18px', color: isLight ? '#374151' : '#d1d5db' }}>
                    {subfoldersCount > 0 && <li>{subfoldersCount} subfolder{subfoldersCount > 1 ? 's' : ''}</li>}
                    {countItems > 0 && <li>{countItems} item{countItems > 1 ? 's' : ''}</li>}
                  </ul>
                )}
              </div>
            ),
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => deleteFolderMutation.mutate(node._id),
          });
        },
      },
    ];

    return (
      <Dropdown
        key={node._id}
        menu={{ items: contextMenuItems }}
        trigger={['contextMenu']}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Folder Row */}
          <div
            draggable={!isEditing}
            onDragStart={(e) => {
              e.stopPropagation();
              setDraggingObject({ type: 'folder', id: node._id, name: node.name });
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragOverId !== node._id) setDragOverId(node._id);
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              if (dragOverId === node._id) setDragOverId(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDropOnFolder(node._id);
            }}
            onClick={() => onSelectFolder?.(node._id, node)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '5px 8px',
              paddingLeft: `${indentPadding}px`,
              borderRadius: '6px',
              background: isDragTarget ? dragHighlightBg : (isSelected ? selectedBg : 'transparent'),
              color: isSelected ? selectedColor : textColor,
              cursor: 'pointer',
              fontSize: '12.5px',
              fontWeight: isSelected ? 600 : 500,
              transition: 'all 0.12s ease',
              userSelect: 'none',
              margin: '1px 0',
              border: isDragTarget ? `1px dashed ${accentColor}` : '1px solid transparent',
            }}
            onMouseEnter={e => {
              if (!isSelected && !isDragTarget) e.currentTarget.style.background = hoverBg;
            }}
            onMouseLeave={e => {
              if (!isSelected && !isDragTarget) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, flex: 1 }}>
              {/* Expand / Collapse Toggle Arrow */}
              <div
                onClick={(e) => toggleCollapse(node._id, e)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isSelected ? selectedColor : textMuted,
                  flexShrink: 0,
                }}
              >
                {isCollapsed ? <RiArrowRightSLine size={14} /> : <RiArrowDownSLine size={14} />}
              </div>

              {/* Folder Icon */}
              {isCollapsed ? (
                <RiFolderLine size={15} style={{ color: isSelected ? selectedColor : accentColor, flexShrink: 0 }} />
              ) : (
                <RiFolderOpenLine size={15} style={{ color: isSelected ? selectedColor : accentColor, flexShrink: 0 }} />
              )}

              {/* Inline Rename or Text */}
              {isEditing ? (
                <input
                  ref={editInputRef}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleInlineRenameSubmit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={handleInlineRenameSubmit}
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: isLight ? '#ffffff' : '#111116',
                    border: `1px solid ${accentColor}`,
                    color: textColor,
                    borderRadius: '4px',
                    padding: '1px 4px',
                    fontSize: '12px',
                    outline: 'none',
                    width: '100%',
                    maxWidth: '140px',
                  }}
                />
              ) : (
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                  }}
                  title={node.name}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(`folder:${node._id}`);
                    setEditName(node.name);
                  }}
                >
                  {node.name}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              {/* More Actions Dropdown Trigger */}
              <Dropdown menu={{ items: contextMenuItems }} trigger={['click']} placement="bottomRight">
                <button
                  type="button"
                  onClick={e => e.stopPropagation()}
                  aria-label="Folder actions"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '2px',
                    borderRadius: '4px',
                    color: isSelected ? selectedColor : textMuted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: isSelected ? 1 : 0.6,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = isSelected ? 1 : 0.6}
                >
                  <RiMore2Fill size={13} />
                </button>
              </Dropdown>
            </div>
          </div>

          {/* Children (Subfolders & Items) when Expanded */}
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Subfolders */}
              {node.children.map(childNode => renderTreeNode(childNode))}

              {/* Items inside this folder */}
              {folderItems.map(item => {
                const meta = ITEM_TYPE_META[item.type] || ITEM_TYPE_META.note;
                const ItemIcon = meta.icon;
                const isItemActive = selectedItemId === item._id;
                const isItemEditing = editingId === `item:${item._id}`;
                const itemPadding = indentPadding + 22;

                // Search query match
                if (query && !item.title.toLowerCase().includes(query)) return null;

                const itemContextMenu = [
                  {
                    key: 'open',
                    label: 'Open',
                    icon: <RiEyeLine size={14} />,
                    onClick: () => onSelectItem?.(item),
                  },
                  {
                    key: 'rename',
                    label: 'Rename',
                    icon: <RiEditLine size={14} />,
                    onClick: () => {
                      setEditingId(`item:${item._id}`);
                      setEditName(item.title);
                    },
                  },
                  {
                    key: 'move',
                    label: 'Move to...',
                    icon: <RiFolderTransferLine size={14} />,
                    onClick: () => {
                      setItemToMove(item);
                      setFolderToMove(null);
                      setMoveModalOpen(true);
                    },
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'delete',
                    label: 'Delete',
                    icon: <RiDeleteBinLine size={14} />,
                    danger: true,
                    onClick: () => {
                      Modal.confirm({
                        title: `Delete "${item.title}"?`,
                        content: 'Delete this item?',
                        okText: 'Delete',
                        okType: 'danger',
                        cancelText: 'Cancel',
                        onOk: () => deleteItemMutation.mutate(item),
                      });
                    },
                  },
                ];

                return (
                  <Dropdown key={item._id} menu={{ items: itemContextMenu }} trigger={['contextMenu']}>
                    <div
                      draggable={!isItemEditing}
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDraggingObject({
                          type: 'item',
                          id: item._id,
                          title: item.title,
                          itemType: item.type,
                          folderId: item.folderId,
                        });
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem?.(item);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        paddingLeft: `${itemPadding}px`,
                        borderRadius: '6px',
                        background: isItemActive ? (isLight ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.18)') : 'transparent',
                        color: isItemActive ? selectedColor : textMuted,
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: isItemActive ? 600 : 400,
                        margin: '1px 0',
                        transition: 'all 0.12s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isItemActive) e.currentTarget.style.background = hoverBg;
                      }}
                      onMouseLeave={e => {
                        if (!isItemActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                        <ItemIcon size={13} style={{ color: meta.color, flexShrink: 0 }} />
                        {isItemEditing ? (
                          <input
                            ref={editInputRef}
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleInlineRenameSubmit();
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            onBlur={handleInlineRenameSubmit}
                            onClick={e => e.stopPropagation()}
                            style={{
                              background: isLight ? '#ffffff' : '#111116',
                              border: `1px solid ${accentColor}`,
                              color: textColor,
                              borderRadius: '4px',
                              padding: '1px 4px',
                              fontSize: '11.5px',
                              outline: 'none',
                              width: '100%',
                              maxWidth: '140px',
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={item.title}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingId(`item:${item._id}`);
                              setEditName(item.title);
                            }}
                          >
                            {item.title}
                          </span>
                        )}
                      </div>

                      <Dropdown menu={{ items: itemContextMenu }} trigger={['click']} placement="bottomRight">
                        <button
                          type="button"
                          onClick={e => e.stopPropagation()}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '1px',
                            borderRadius: '3px',
                            color: isItemActive ? selectedColor : textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: isItemActive ? 1 : 0.5,
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = isItemActive ? 1 : 0.5}
                        >
                          <RiMore2Fill size={12} />
                        </button>
                      </Dropdown>
                    </div>
                  </Dropdown>
                );
              })}
            </div>
          )}
        </div>
      </Dropdown>
    );
  };

  const totalAllItemsCount = allItems.length;

  // Space Root Context Menu
  const rootContextMenu = [
    {
      key: 'new-root-item',
      label: filterItemType ? `New ${ITEM_TYPE_META[filterItemType]?.label || 'Item'} at Root` : 'New Item at Root',
      icon: <RiAddLine size={14} />,
      onClick: () => handleTriggerNewItem(filterItemType || 'note', null),
    },
    {
      key: 'new-root-folder',
      label: 'New Root Folder',
      icon: <RiFolderAddLine size={14} />,
      onClick: () => handleOpenCreateFolder(null),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxHeight,
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      {/* ── Section Header ── */}
      {showHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: textMuted,
            }}
          >
            Explorer
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Tooltip title="New Item" placement="bottom">
              <button
                type="button"
                onClick={() => handleTriggerNewItem(filterItemType || 'note', selectedFolderId || null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: textMuted,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = accentColor;
                  e.currentTarget.style.background = hoverBg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = textMuted;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <RiAddLine size={15} />
              </button>
            </Tooltip>

            <Tooltip title="New Folder" placement="bottom">
              <button
                type="button"
                onClick={() => handleOpenCreateFolder(selectedFolderId || null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: textMuted,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = accentColor;
                  e.currentTarget.style.background = hoverBg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = textMuted;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <RiFolderAddLine size={15} />
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* ── Search Input ── */}
      {showSearch && (
        <div style={{ padding: '0 8px 8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: isLight ? '#f3f4f6' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.08)'}`,
            }}
          >
            <RiSearchLine size={13} style={{ color: textMuted }} />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={folderSearch}
              onChange={e => setFolderSearch(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '11px',
                color: textColor,
              }}
            />
            {folderSearch && (
              <RiCloseLine
                size={13}
                style={{ color: textMuted, cursor: 'pointer' }}
                onClick={() => setFolderSearch('')}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Scrollable Tree Container ── */}
      <div
        data-lenis-prevent
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          flex: 1,
          padding: '0 6px',
          scrollbarWidth: 'thin',
          scrollbarColor: isLight ? '#d1d5db transparent' : 'rgba(255,255,255,0.15) transparent',
        }}
      >
        {/* Space Root Row (Root / Unfiltered) */}
        <Dropdown menu={{ items: rootContextMenu }} trigger={['contextMenu']}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragOverId !== 'root') setDragOverId('root');
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              if (dragOverId === 'root') setDragOverId(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDropOnFolder('root');
            }}
            onClick={() => onSelectFolder?.(null, null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: '6px',
              background: dragOverId === 'root' ? dragHighlightBg : (selectedFolderId === null ? selectedBg : 'transparent'),
              color: selectedFolderId === null ? selectedColor : textColor,
              cursor: 'pointer',
              fontSize: '12.5px',
              fontWeight: selectedFolderId === null ? 600 : 500,
              margin: '2px 0 4px',
              transition: 'all 0.12s ease',
              userSelect: 'none',
              border: dragOverId === 'root' ? `1px dashed ${accentColor}` : '1px solid transparent',
            }}
            onMouseEnter={e => {
              if (selectedFolderId !== null && dragOverId !== 'root') e.currentTarget.style.background = hoverBg;
            }}
            onMouseLeave={e => {
              if (selectedFolderId !== null && dragOverId !== 'root') e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <RiAppsLine
                size={15}
                style={{ color: selectedFolderId === null ? selectedColor : accentColor }}
              />
              <span>Space Root</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Dropdown menu={{ items: rootContextMenu }} trigger={['click']} placement="bottomRight">
                <button
                  type="button"
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '2px',
                    borderRadius: '4px',
                    color: textMuted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.6,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                >
                  <RiMore2Fill size={13} />
                </button>
              </Dropdown>
            </div>
          </div>
        </Dropdown>

        {/* Folder Hierarchy Tree */}
        {folderTree.map(rootNode => renderTreeNode(rootNode))}

        {/* Root-level Items (items directly at Space Root) */}
        {(itemsByFolder.get('root') || []).map(item => {
          const meta = ITEM_TYPE_META[item.type] || ITEM_TYPE_META.note;
          const ItemIcon = meta.icon;
          const isItemActive = selectedItemId === item._id;
          const isItemEditing = editingId === `item:${item._id}`;
          const itemPadding = 20;

          // Filter by search if any
          const query = (searchQuery || folderSearch || '').toLowerCase().trim();
          if (query && !item.title.toLowerCase().includes(query)) return null;

          const rootItemContextMenu = [
            {
              key: 'open',
              label: 'Open',
              icon: <RiEyeLine size={14} />,
              onClick: () => onSelectItem?.(item),
            },
            {
              key: 'rename',
              label: 'Rename',
              icon: <RiEditLine size={14} />,
              onClick: () => {
                setEditingId(`item:${item._id}`);
                setEditName(item.title);
              },
            },
            {
              key: 'move',
              label: 'Move to...',
              icon: <RiFolderTransferLine size={14} />,
              onClick: () => {
                setItemToMove(item);
                setFolderToMove(null);
                setMoveModalOpen(true);
              },
            },
            {
              type: 'divider',
            },
            {
              key: 'delete',
              label: 'Delete',
              icon: <RiDeleteBinLine size={14} />,
              danger: true,
              onClick: () => {
                Modal.confirm({
                  title: `Delete "${item.title}"?`,
                  content: 'Delete this item?',
                  okText: 'Delete',
                  okType: 'danger',
                  cancelText: 'Cancel',
                  onOk: () => deleteItemMutation.mutate(item),
                });
              },
            },
          ];

          return (
            <Dropdown key={item._id} menu={{ items: rootItemContextMenu }} trigger={['contextMenu']}>
              <div
                draggable={!isItemEditing}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDraggingObject({
                    type: 'item',
                    id: item._id,
                    title: item.title,
                    itemType: item.type,
                    folderId: null,
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem?.(item);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  paddingLeft: `${itemPadding}px`,
                  borderRadius: '6px',
                  background: isItemActive ? (isLight ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.18)') : 'transparent',
                  color: isItemActive ? selectedColor : textMuted,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: isItemActive ? 600 : 400,
                  margin: '1px 0',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={e => {
                  if (!isItemActive) e.currentTarget.style.background = hoverBg;
                }}
                onMouseLeave={e => {
                  if (!isItemActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                  <ItemIcon size={13} style={{ color: meta.color, flexShrink: 0 }} />
                  {isItemEditing ? (
                    <input
                      ref={editInputRef}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleInlineRenameSubmit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={handleInlineRenameSubmit}
                      onClick={e => e.stopPropagation()}
                      style={{
                        background: isLight ? '#ffffff' : '#111116',
                        border: `1px solid ${accentColor}`,
                        color: textColor,
                        borderRadius: '4px',
                        padding: '1px 4px',
                        fontSize: '11.5px',
                        outline: 'none',
                        width: '100%',
                        maxWidth: '140px',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.title}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingId(`item:${item._id}`);
                        setEditName(item.title);
                      }}
                    >
                      {item.title}
                    </span>
                  )}
                </div>

                <Dropdown menu={{ items: rootItemContextMenu }} trigger={['click']} placement="bottomRight">
                  <button
                    type="button"
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '1px',
                      borderRadius: '3px',
                      color: isItemActive ? selectedColor : textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isItemActive ? 1 : 0.5,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = isItemActive ? 1 : 0.5}
                  >
                    <RiMore2Fill size={12} />
                  </button>
                </Dropdown>
              </div>
            </Dropdown>
          );
        })}

        {folders.length === 0 && (itemsByFolder.get('root') || []).length === 0 && !foldersLoading && (
          <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: '12px', color: textMuted }}>
            No folders or files yet.
          </div>
        )}
      </div>

      {/* ── Create Folder Modal ── */}
      <Modal
        title="Create New Folder"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => {
          if (!newFolderName.trim()) {
            message.error('Please enter a folder name');
            return;
          }
          createFolderMutation.mutate({
            name: newFolderName,
            parentId: createParentId,
          });
        }}
        okText="Create"
        cancelText="Cancel"
        confirmLoading={createFolderMutation.isPending}
        width={400}
        style={{ top: 60 }}
        styles={{ mask: { backdropFilter: 'blur(4px)' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
          {createParentId && (
            <div>
              <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Parent Location
              </label>
              <code style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.06)' }}>
                {folders.find(f => f._id === createParentId)?.path || folders.find(f => f._id === createParentId)?.name || 'Space Root'}
              </code>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Folder Name
            </label>
            <Input
              placeholder="e.g. Hooks, Components, Auth..."
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onPressEnter={() => {
                if (!newFolderName.trim()) return;
                createFolderMutation.mutate({
                  name: newFolderName,
                  parentId: createParentId,
                });
              }}
              autoFocus
            />
          </div>

          <p style={{ margin: 0, fontSize: '11px', color: textMuted }}>
            Folders can only go 4 levels deep.
          </p>
        </div>
      </Modal>

      {/* ── Move Modal (for Item or Folder) ── */}
      <MoveItemModal
        open={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false);
          setItemToMove(null);
          setFolderToMove(null);
        }}
        spaceId={spaceId}
        item={itemToMove}
        folder={folderToMove}
        isLight={isLight}
      />

      {/* ── Quick Add Modals (triggered from folder right-click) ── */}
      <QuickAddNoteModal
        open={quickAddType === 'note'}
        onClose={() => { setQuickAddType(null); setQuickAddFolderId(null); }}
        space={{ _id: spaceId }}
        defaultFolderId={quickAddFolderId}
      />

      <QuickAddSnippetModal
        open={quickAddType === 'snippet'}
        onClose={() => { setQuickAddType(null); setQuickAddFolderId(null); }}
        space={{ _id: spaceId }}
        defaultFolderId={quickAddFolderId}
      />

      <QuickAddDocModal
        open={quickAddType === 'doc'}
        onClose={() => { setQuickAddType(null); setQuickAddFolderId(null); }}
        space={{ _id: spaceId }}
        defaultFolderId={quickAddFolderId}
      />

      <QuickAddLearningModal
        open={quickAddType === 'learning'}
        onClose={() => { setQuickAddType(null); setQuickAddFolderId(null); }}
        space={{ _id: spaceId }}
        defaultFolderId={quickAddFolderId}
      />

      <QuickAddPromptModal
        open={quickAddType === 'prompt'}
        onClose={() => { setQuickAddType(null); setQuickAddFolderId(null); }}
        space={{ _id: spaceId }}
        defaultFolderId={quickAddFolderId}
      />

      <QuickAddRepoModal
        open={quickAddType === 'repo'}
        onClose={() => { setQuickAddType(null); setQuickAddFolderId(null); }}
        space={{ _id: spaceId }}
        defaultFolderId={quickAddFolderId}
      />

      <QuickAddCommunityModal
        open={quickAddType === 'community'}
        onClose={() => { setQuickAddType(null); setQuickAddFolderId(null); }}
        space={{ _id: spaceId }}
        defaultFolderId={quickAddFolderId}
      />

    </div>
  );
}
