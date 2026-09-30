import React, { useState, useMemo, useEffect } from 'react';
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
  RiEditLine,
  RiDeleteBinLine,
  RiAppsLine,
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri';
import { Modal, Input, message, Tooltip, Popconfirm, Dropdown } from 'antd';
import api from '../../api/axios';

const ITEM_TYPE_META = {
  note:     { label: 'Note',     icon: RiStickyNoteLine, color: '#10b981', section: 'notes' },
  learning: { label: 'Learning', icon: RiLightbulbLine, color: '#eab308', section: 'learnings' },
  snippet:  { label: 'Snippet',  icon: RiCodeSSlashLine, color: '#818cf8', section: 'snippets' },
  doc:      { label: 'Doc',      icon: RiFileTextLine,   color: '#60a5fa', section: 'docs' },
  prompt:   { label: 'Prompt',   icon: RiRobot2Line,     color: '#f472b6', section: 'prompts' },
  repo:     { label: 'Repo',     icon: RiGitRepositoryLine, color: '#fb923c', section: 'repos' },
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
 * Reusable Shared Folder Tree component used across all Space modules.
 */
export default function SharedFolderTree({
  spaceId,
  selectedFolderId,
  onSelectFolder,
  onSelectItem,
  selectedItemId = null,
  filterItemType = null, // e.g. 'note', 'learning', or null for all
  isLight = false,
  showSearch = true,
  showHeader = true,
  maxHeight = '100%',
  style = {},
}) {
  const queryClient = useQueryClient();

  // Search & Expansion state
  const [folderSearch, setFolderSearch] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState({});

  // Create folder modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');

  // Rename folder modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [renameFolderName, setRenameFolderName] = useState('');

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
      const fId = item.folderId ? (typeof item.folderId === 'object' ? item.folderId._id : item.folderId) : 'root';
      if (!map.has(fId)) map.set(fId, []);
      map.get(fId).push(item);
    });
    return map;
  }, [allItems]);

  // Compute folder hierarchy tree
  const folderTree = useMemo(() => {
    return buildTree(folders, null, 1);
  }, [folders]);

  // Toggle collapsed
  const toggleCollapse = (folderId, e) => {
    e?.stopPropagation();
    setCollapsedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

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
      message.success(`Folder "${newFolder.name}" created!`);
      queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
      setCreateModalOpen(false);
      setNewFolderName('');
      // Auto expand parent and select new folder
      if (createParentId) {
        setCollapsedFolders(prev => ({ ...prev, [createParentId]: false }));
      }
      onSelectFolder?.(newFolder._id, newFolder);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to create folder');
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
      setRenameModalOpen(false);
      setRenamingFolder(null);
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to rename folder');
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId) => {
      await api.delete(`/api/spaces/${spaceId}/folders/${folderId}`);
    },
    onSuccess: () => {
      message.success('Folder deleted');
      queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['items', spaceId] });
      if (selectedFolderId) {
        onSelectFolder?.(null, null);
      }
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to delete folder');
    },
  });

  // Open Create Folder Dialog with depth check
  const handleOpenCreateFolder = (targetParentId = null) => {
    // Determine parent folder to check depth
    const parentFolder = targetParentId
      ? folders.find(f => f._id === targetParentId)
      : (selectedFolderId ? folders.find(f => f._id === selectedFolderId) : null);

    const parentDepth = parentFolder?.depth || (parentFolder?.pathArray ? parentFolder.pathArray.length : (parentFolder ? 1 : 0));

    if (parentDepth >= 4) {
      message.warning('Maximum folder depth is 4 levels. Suggest using tags or search instead.');
      return;
    }

    setCreateParentId(parentFolder?._id || null);
    setNewFolderName('');
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!newFolderName.trim()) {
      message.error('Folder name is required');
      return;
    }
    createFolderMutation.mutate({
      name: newFolderName,
      parentId: createParentId,
    });
  };

  // Color tokens
  const textColor = isLight ? '#1f2937' : '#f3f4f6';
  const textMuted = isLight ? '#6b7280' : '#9ca3af';
  const hoverBg = isLight ? '#f3f4f6' : 'rgba(255, 255, 255, 0.05)';
  const activeBg = isLight ? '#0369a1' : '#0a2540'; // Deep blue/indigo pill matching reference image 1
  const activeColor = '#ffffff';

  // Recursive tree node renderer
  const renderTreeNode = (node) => {
    const isSelected = selectedFolderId === node._id;
    const isCollapsed = collapsedFolders[node._id];
    const hasChildren = node.children && node.children.length > 0;
    const folderItems = itemsByFolder.get(node._id) || [];
    const totalCount = (node.itemCount !== undefined ? node.itemCount : folderItems.length);
    const indentPadding = (node.depth - 1) * 14 + 6;

    // Filter folder by search if any
    const query = folderSearch.toLowerCase().trim();
    if (query && !node.name.toLowerCase().includes(query)) {
      const childMatches = node.children.some(c => c.name.toLowerCase().includes(query));
      if (!childMatches) return null;
    }

    const folderMenu = {
      items: [
        {
          key: 'add-subfolder',
          label: 'Add Subfolder',
          icon: <RiFolderAddLine size={14} />,
          disabled: node.depth >= 4,
          onClick: () => handleOpenCreateFolder(node._id),
        },
        {
          key: 'rename',
          label: 'Rename Folder',
          icon: <RiEditLine size={14} />,
          onClick: () => {
            setRenamingFolder(node);
            setRenameFolderName(node.name);
            setRenameModalOpen(true);
          },
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          label: 'Delete Folder',
          icon: <RiDeleteBinLine size={14} />,
          danger: true,
          onClick: () => {
            Modal.confirm({
              title: `Delete folder "${node.name}"?`,
              content: 'Items inside this folder will be safely moved to Workspace root.',
              okText: 'Delete',
              okType: 'danger',
              cancelText: 'Cancel',
              onOk: () => deleteFolderMutation.mutate(node._id),
            });
          },
        },
      ],
    };

    return (
      <div key={node._id} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Folder Row */}
        <div
          onClick={() => onSelectFolder?.(node._id, node)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            paddingLeft: `${indentPadding}px`,
            borderRadius: '8px',
            background: isSelected ? (isLight ? '#0284c7' : '#0d2847') : 'transparent',
            color: isSelected ? '#ffffff' : textColor,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: isSelected ? 600 : 500,
            transition: 'all 0.12s ease',
            userSelect: 'none',
            margin: '1px 0',
          }}
          onMouseEnter={e => {
            if (!isSelected) e.currentTarget.style.background = hoverBg;
          }}
          onMouseLeave={e => {
            if (!isSelected) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
            {/* Expand / Collapse Button */}
            <div
              onClick={(e) => toggleCollapse(node._id, e)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isSelected ? '#ffffff' : textMuted,
                flexShrink: 0,
              }}
            >
              {isCollapsed ? <RiArrowRightSLine size={14} /> : <RiArrowDownSLine size={14} />}
            </div>

            {/* Folder Icon */}
            {isCollapsed ? (
              <RiFolderLine size={15} style={{ color: isSelected ? '#38bdf8' : (isLight ? '#4f46e5' : '#818cf8'), flexShrink: 0 }} />
            ) : (
              <RiFolderOpenLine size={15} style={{ color: isSelected ? '#38bdf8' : (isLight ? '#4f46e5' : '#818cf8'), flexShrink: 0 }} />
            )}

            {/* Folder Name */}
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}
              title={node.name}
            >
              {node.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {/* Count Badge */}
            <span
              style={{
                fontSize: '11px',
                color: isSelected ? 'rgba(255,255,255,0.85)' : textMuted,
                fontWeight: 600,
                padding: '0 4px',
              }}
            >
              {totalCount}
            </span>

            {/* Actions Dropdown */}
            <Dropdown menu={folderMenu} trigger={['click']} placement="bottomRight">
              <button
                type="button"
                onClick={e => e.stopPropagation()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '2px',
                  borderRadius: '4px',
                  color: isSelected ? 'rgba(255,255,255,0.8)' : textMuted,
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
              const itemPadding = indentPadding + 22;

              return (
                <div
                  key={item._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem?.(item);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    paddingLeft: `${itemPadding}px`,
                    borderRadius: '6px',
                    background: isItemActive ? (isLight ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.18)') : 'transparent',
                    color: isItemActive ? (isLight ? '#4338ca' : '#a5b4fc') : textMuted,
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
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.title}
                    >
                      {item.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const totalAllItemsCount = allItems.length;

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
            Folders (all modules)
          </span>

          <Tooltip title="Create new folder" placement="left">
            <button
              type="button"
              onClick={() => handleOpenCreateFolder(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: textMuted,
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = isLight ? '#4f46e5' : '#818cf8';
                e.currentTarget.style.background = hoverBg;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = textMuted;
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <RiFolderAddLine size={16} />
            </button>
          </Tooltip>
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
              placeholder="Filter folders..."
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
        {/* All Folders Row (Root / Unfiltered) */}
        <div
          onClick={() => onSelectFolder?.(null, null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            borderRadius: '8px',
            background: selectedFolderId === null ? (isLight ? '#0284c7' : '#0d2847') : 'transparent',
            color: selectedFolderId === null ? '#ffffff' : textColor,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: selectedFolderId === null ? 600 : 500,
            margin: '2px 0 4px',
            transition: 'all 0.12s ease',
            userSelect: 'none',
          }}
          onMouseEnter={e => {
            if (selectedFolderId !== null) e.currentTarget.style.background = hoverBg;
          }}
          onMouseLeave={e => {
            if (selectedFolderId !== null) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RiAppsLine
              size={15}
              style={{ color: selectedFolderId === null ? '#38bdf8' : (isLight ? '#4f46e5' : '#818cf8') }}
            />
            <span>All folders</span>
          </div>

          <span
            style={{
              fontSize: '11px',
              color: selectedFolderId === null ? 'rgba(255,255,255,0.85)' : textMuted,
              fontWeight: 600,
            }}
          >
            {totalAllItemsCount}
          </span>
        </div>

        {/* Folder Hierarchy Tree */}
        {folderTree.map(rootNode => renderTreeNode(rootNode))}

        {folders.length === 0 && !foldersLoading && (
          <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: '12px', color: textMuted }}>
            No folders created yet.
          </div>
        )}
      </div>

      {/* ── Create Folder Modal ── */}
      <Modal
        title="Create New Folder"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreateSubmit}
        okText="Create Folder"
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
                Parent Folder
              </label>
              <code style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.06)' }}>
                {folders.find(f => f._id === createParentId)?.path || folders.find(f => f._id === createParentId)?.name || 'Workspace Root'}
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
              onPressEnter={handleCreateSubmit}
              autoFocus
            />
          </div>

          <p style={{ margin: 0, fontSize: '11px', color: textMuted }}>
            Maximum folder depth is 4 levels.
          </p>
        </div>
      </Modal>

      {/* ── Rename Folder Modal ── */}
      <Modal
        title="Rename Folder"
        open={renameModalOpen}
        onCancel={() => { setRenameModalOpen(false); setRenamingFolder(null); }}
        onOk={() => {
          if (!renameFolderName.trim() || !renamingFolder) return;
          renameFolderMutation.mutate({ folderId: renamingFolder._id, name: renameFolderName });
        }}
        okText="Rename"
        cancelText="Cancel"
        confirmLoading={renameFolderMutation.isPending}
        width={380}
        style={{ top: 60 }}
        styles={{ mask: { backdropFilter: 'blur(4px)' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Folder Name
            </label>
            <Input
              value={renameFolderName}
              onChange={e => setRenameFolderName(e.target.value)}
              onPressEnter={() => {
                if (!renameFolderName.trim() || !renamingFolder) return;
                renameFolderMutation.mutate({ folderId: renamingFolder._id, name: renameFolderName });
              }}
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
