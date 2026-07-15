import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Modal, Input, Select, Button, message } from 'antd';
import api from '../../api/axios';

export default function SettingsSection({ space, isLight }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Rename states
  const [name, setName] = useState(space.name || '');
  const [tags, setTags] = useState(space.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  // Delete states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Save changes mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Space name cannot be empty');
      return api.patch(`/api/spaces/${space._id}`, {
        name: name.trim(),
        tags
      });
    },
    onSuccess: (res) => {
      message.success('Space settings updated successfully');
      queryClient.invalidateQueries(['space', space._id]);
      queryClient.invalidateQueries(['spaces']);
    },
    onError: (err) => {
      message.error(err.message || err.response?.data?.error || 'Failed to update settings');
    }
  });

  // Delete space mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/api/spaces/${space._id}`);
    },
    onSuccess: () => {
      message.success('Space deleted successfully');
      queryClient.invalidateQueries(['spaces']);
      navigate('/dashboard');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to delete space');
      setIsDeleting(false);
    }
  });

  const handleSave = () => {
    setIsSaving(true);
    saveMutation.mutate(null, {
      onSettled: () => setIsSaving(false)
    });
  };

  const handleDelete = () => {
    if (confirmName !== space.name) {
      message.error('Confirm name mismatch');
      return;
    }
    setIsDeleting(true);
    deleteMutation.mutate();
  };

  return (
    <div style={{ maxWidth: '520px', padding: '8px 0' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: isLight ? '#111' : '#fff', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Space Settings
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Name Input */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
            Space Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}
          />
        </div>

        {/* Tags Select */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
            Space tags
          </label>
          <Select
            mode="tags"
            style={{ width: '100%', minHeight: '38px' }}
            placeholder="Type tag and hit Enter"
            value={tags}
            onChange={(val) => setTags(val)}
          />
        </div>

        {/* Save button */}
        <Button
          type="primary"
          onClick={handleSave}
          loading={isSaving}
          style={{
            alignSelf: 'flex-start',
            background: isLight ? '#4f46e5' : '#6366f1',
            borderColor: isLight ? '#4f46e5' : '#6366f1',
            borderRadius: '8px', fontWeight: 600
          }}
        >
          Save Changes
        </Button>

        {/* Danger Zone */}
        <div style={{
          marginTop: '24px', padding: '16px', borderRadius: '12px',
          border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.05)'
        }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444', margin: '0 0 6px' }}>Danger Zone</p>
          <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px', lineHeight: 1.4 }}>
            Deleting this space is permanent and will delete all associated Notes, Snippets, Docs, Repos, Prompts, and Communities.
          </p>
          <Button
            danger
            type="primary"
            onClick={() => setDeleteModalOpen(true)}
            style={{ borderRadius: '8px', fontWeight: 600 }}
          >
            Delete this space
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Space Deletion"
        open={deleteModalOpen}
        onCancel={() => { setDeleteModalOpen(false); setConfirmName(''); }}
        onOk={handleDelete}
        okText="Permanently Delete Space"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          disabled: confirmName !== space.name,
          loading: isDeleting
        }}
        style={{ top: 40 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            padding: '20px 24px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent',
          },
          mask: { backdropFilter: 'blur(4px)' },
        }}
        getContainer={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
            This action **cannot** be undone. This will permanently delete the space <strong style={{ color: isLight ? '#111' : '#fff' }}>{space.name}</strong> and all its content.
          </p>
          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>
              TYPE <strong style={{ color: isLight ? '#111' : '#fff' }}>{space.name}</strong> TO CONFIRM:
            </label>
            <Input
              placeholder={space.name}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
