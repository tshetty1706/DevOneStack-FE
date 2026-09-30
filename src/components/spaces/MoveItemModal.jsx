import React, { useState, useEffect } from 'react';
import { Modal, message, Button } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RiFolderTransferLine } from 'react-icons/ri';
import api from '../../api/axios';
import FolderPicker from './FolderPicker';

/**
 * Reusable modal to move any item to a target folder
 */
export default function MoveItemModal({
  open,
  onClose,
  item,
  spaceId,
  isLight = false,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const [selectedFolderId, setSelectedFolderId] = useState(item?.folderId || null);

  useEffect(() => {
    if (open && item) {
      setSelectedFolderId(item.folderId || null);
    }
  }, [open, item]);

  const moveMutation = useMutation({
    mutationFn: async (targetFolderId) => {
      if (!item?._id) throw new Error('Item not specified');
      const res = await api.patch(`/api/spaces/${spaceId}/items/${item._id}`, {
        folderId: targetFolderId === 'root' ? null : targetFolderId,
      });
      return res.data.item;
    },
    onSuccess: (updatedItem) => {
      message.success(`Moved "${item.title}" successfully`);
      queryClient.invalidateQueries({ queryKey: ['items', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['folders', spaceId] });
      queryClient.invalidateQueries({ queryKey: [item.type + 's', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['space', spaceId] });
      onSuccess?.(updatedItem);
      onClose();
    },
    onError: (err) => {
      message.error(err.response?.data?.error || err.message || 'Failed to move item');
    },
  });

  const handleConfirmMove = () => {
    moveMutation.mutate(selectedFolderId);
  };

  if (!item) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiFolderTransferLine size={18} style={{ color: isLight ? '#4f46e5' : '#818cf8' }} />
          <span>Move Item</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleConfirmMove}
      okText="Move Item"
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
            Item Title
          </label>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
            {item.title}
          </p>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Current Location
          </label>
          <code style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.06)' }}>
            {item.folderPath || item.folderName || 'Workspace (Root)'}
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
          />
        </div>
      </div>
    </Modal>
  );
}
