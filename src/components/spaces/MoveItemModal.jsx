import React, { useState, useEffect, useMemo } from 'react';
import { Modal, message, Button } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RiFolderTransferLine } from 'react-icons/ri';
import api from '../../api/axios';
import FolderPicker from './FolderPicker';

/**
 * Reusable modal to move any item or folder to a target folder or root
 */
export default function MoveItemModal({
  open,
  isOpen,
  onClose,
  item = null,
  folder = null,
  space = null,
  spaceId: propSpaceId = null,
  isLight = false,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const isModalOpen = Boolean(open !== undefined ? open : isOpen);
  const spaceId = propSpaceId || space?._id;
  const isMovingFolder = Boolean(folder && !item);
  const targetObject = isMovingFolder ? folder : item;

  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // Fetch all folders to compute excluded descendants if moving a folder
  const { data: folderData } = useQuery({
    queryKey: ['folders', spaceId],
    queryFn: async () => {
      const res = await api.get(`/api/spaces/${spaceId}/folders`);
      return res.data.folders || [];
    },
    enabled: !!spaceId && open,
    staleTime: 30000,
  });

  const allFolders = folderData || [];

  const excludeIds = useMemo(() => {
    if (!isMovingFolder || !folder?._id) return [];
    const excluded = new Set([String(folder._id)]);
    let added = true;
    while (added) {
      added = false;
      allFolders.forEach(f => {
        const pId = f.parentId ? (typeof f.parentId === 'object' ? f.parentId._id : f.parentId)?.toString() : null;
        const fId = String(f._id);
        if (pId && excluded.has(pId) && !excluded.has(fId)) {
          excluded.add(fId);
          added = true;
        }
      });
    }
    return Array.from(excluded);
  }, [isMovingFolder, folder, allFolders]);

  useEffect(() => {
    if (open) {
      if (isMovingFolder) {
        setSelectedFolderId(folder?.parentId || null);
      } else {
        const initialFId = item?.folderId
          ? (typeof item.folderId === 'object' ? item.folderId._id : item.folderId)
          : null;
        setSelectedFolderId(initialFId);
      }
    }
  }, [open, item, folder, isMovingFolder]);

  const moveMutation = useMutation({
    mutationFn: async (targetFolderId) => {
      const destination = targetFolderId === 'root' || targetFolderId === 'null' ? null : targetFolderId;
      if (isMovingFolder) {
        const res = await api.patch(`/api/spaces/${spaceId}/folders/${folder._id}`, {
          parentId: destination,
        });
        return res.data.folder;
      } else {
        if (!item?._id) throw new Error('Item not specified');
        const res = await api.patch(`/api/spaces/${spaceId}/items/${item._id}`, {
          folderId: destination,
        });
        return res.data.item;
      }
    },
    onSuccess: (updated) => {
      const name = isMovingFolder ? folder.name : item.title;
      message.success(`Moved "${name}" successfully`);
      queryClient.invalidateQueries({ queryKey: ['items', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
      if (!isMovingFolder && item?.type) {
        queryClient.invalidateQueries({ queryKey: [item.type + 's', spaceId] });
      }
      queryClient.invalidateQueries({ queryKey: ['space', spaceId] });
      onSuccess?.(updated);
      onClose();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || err.message || 'Failed to move');
    },
  });

  const handleConfirmMove = () => {
    moveMutation.mutate(selectedFolderId);
  };

  if (!targetObject) return null;

  const objectName = isMovingFolder ? folder.name : item.title;
  const currentPath = isMovingFolder
    ? (folder.path || folder.name || 'Space Root')
    : (item.folderPath || item.folderName || 'Space Root');

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiFolderTransferLine size={18} style={{ color: isLight ? '#4f46e5' : '#818cf8' }} />
          <span>{isMovingFolder ? 'Move Folder' : 'Move Item'}</span>
        </div>
      }
      open={isModalOpen}
      onCancel={onClose}
      onOk={handleConfirmMove}
      okText="Move"
      cancelText="Cancel"
      confirmLoading={moveMutation.isPending}
      width={460}
      style={{ top: 60 }}
      styles={{
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            {isMovingFolder ? 'Folder Name' : 'Item Title'}
          </label>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
            {objectName}
          </p>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Current Location
          </label>
          <code style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.06)' }}>
            {currentPath}
          </code>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Destination Folder
          </label>
          <FolderPicker
            spaceId={spaceId}
            value={selectedFolderId}
            onChange={(val) => setSelectedFolderId(val)}
            isLight={isLight}
            allowRoot={true}
            excludeIds={excludeIds}
          />
        </div>
      </div>
    </Modal>
  );
}
