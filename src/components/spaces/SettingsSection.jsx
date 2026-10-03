import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Modal, Input, Select, Button, Switch, message } from 'antd';
import { RiSearchLine, RiFolder5Line, RiArrowUpSLine, RiArrowDownSLine, RiRefreshLine } from 'react-icons/ri';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import SpaceIcon from './SpaceIcon';
import { ALL_MODULES } from '../../constants/templates';

function getIconKeyByName(name = '') {
  const n = (name || '').toLowerCase();
  if (n.includes('react')) return 'simple-icons:react';
  if (n.includes('vue')) return 'simple-icons:vuejs';
  if (n.includes('angular')) return 'simple-icons:angular';
  if (n.includes('node')) return 'simple-icons:nodedotjs';
  if (n.includes('python')) return 'simple-icons:python';
  if (n.includes('java')) return 'simple-icons:java';
  if (n.includes('docker')) return 'simple-icons:docker';
  if (n.includes('aws')) return 'logos:aws';
  if (n.includes('go') || n.includes('golang')) return 'simple-icons:go';
  if (n.includes('rust')) return 'simple-icons:rust';
  return 'lucide:stack';
}

export default function SettingsSection({ space, isLight }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Rename states
  const [name, setName] = useState(space.name || '');
  const [tags, setTags] = useState(space.tags || []);
  const [enabledModules, setEnabledModules] = useState(() => {
    if (Array.isArray(space?.enabledModules) && space.enabledModules.length > 0) {
      return space.enabledModules;
    }
    return ['overview', 'explorer', 'notes', 'learnings', 'snippets', 'docs', 'repos', 'prompts', 'communities', 'tags'];
  });
  const [iconKey, setIconKey] = useState(() => {
    const current = space.iconKey || space.icon || 'lucide:folder';
    return current === 'folder' ? 'lucide:folder' : current;
  });
  const [isCustomIcon, setIsCustomIcon] = useState(() => {
    const defaultIcon = getIconKeyByName(space.name);
    let currentIcon = space.iconKey || space.icon || 'lucide:folder';
    if (currentIcon === 'folder') currentIcon = 'lucide:folder';
    return currentIcon !== defaultIcon;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-detect icon when name changes if not custom
  useEffect(() => {
    if (!isCustomIcon) {
      setIconKey(getIconKeyByName(name));
    }
  }, [name, isCustomIcon]);

  // Keep local enabledModules in sync with space updates
  useEffect(() => {
    if (Array.isArray(space?.enabledModules) && space.enabledModules.length > 0) {
      setEnabledModules(space.enabledModules);
    }
  }, [space?.enabledModules]);

  // Save changes mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Space name cannot be empty');
      return api.patch(`/api/spaces/${space._id}`, {
        name: name.trim(),
        tags,
        iconKey,
        enabledModules,
      });
    },
    onSuccess: (res) => {
      message.success('Space settings updated successfully');
      queryClient.setQueryData(['space', space._id], res.data);
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
      navigate(`/u/${encodeURIComponent(user?.username || 'user')}/dashboard`);
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '13px', flex: 1 }}
            />
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              border: `1px solid ${isLight ? '#d9d9d9' : '#3f3f46'}`,
              background: isLight ? '#ffffff' : '#18181b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isLight ? '#111' : '#fff', flexShrink: 0
            }}>
              <SpaceIcon iconKey={iconKey} size={22} />
            </div>
          </div>
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

        {/* Enabled Modules */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
            Active Modules
          </label>
          <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px' }}>
            Enable or disable workspace modules in your sidebar.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: isLight ? '#f9fafb' : '#14141e',
            padding: '12px',
            borderRadius: '10px',
            border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
          }}>
            {ALL_MODULES.map(mod => {
              const isFixed = mod.isFixed;
              const isEnabled = isFixed || enabledModules.includes(mod.id);
              const ModIcon = mod.icon;
              return (
                <div
                  key={mod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: isLight ? '#ffffff' : '#1a1a24',
                    border: `1px solid ${isLight ? '#f3f4f6' : 'rgba(255,255,255,0.04)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ModIcon size={16} style={{ color: isLight ? '#4f46e5' : '#818cf8' }} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: isLight ? '#111' : '#fff' }}>
                      {mod.label}
                    </span>
                    {isFixed && (
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: isLight ? '#e5e7eb' : '#27272a', color: '#888' }}>
                        Fixed
                      </span>
                    )}
                  </div>
                  <Switch
                    size="small"
                    disabled={isFixed}
                    checked={isEnabled}
                    onChange={(checked) => {
                      if (isFixed) return;
                      if (checked) {
                        setEnabledModules(prev => [...prev.filter(m => m !== mod.id), mod.id]);
                      } else {
                        setEnabledModules(prev => prev.filter(m => m !== mod.id));
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
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
