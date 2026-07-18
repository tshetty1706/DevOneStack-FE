import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Modal, Input, Select, Button, message } from 'antd';
import { RiSearchLine, RiFolder5Line, RiArrowUpSLine, RiArrowDownSLine, RiRefreshLine } from 'react-icons/ri';
import api from '../../api/axios';
import SpaceIcon from './SpaceIcon';
import { ICON_MAPPING, getIconKeyByName } from '../../utils/iconMapping';

export default function SettingsSection({ space, isLight }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Rename states
  const [name, setName] = useState(space.name || '');
  const [tags, setTags] = useState(space.tags || []);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
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

  // Save changes mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Space name cannot be empty');
      return api.patch(`/api/spaces/${space._id}`, {
        name: name.trim(),
        tags,
        iconKey
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

        {/* Customize Icon Selector */}
        <div>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              background: isLight ? '#f9fafb' : '#18181b',
              border: `1px solid ${isLight ? '#d9d9d9' : '#3f3f46'}`,
              color: isLight ? '#111' : '#fff', cursor: 'pointer', fontSize: '12px',
              fontWeight: 600, transition: 'background 0.2s', outline: 'none'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Icon: <code style={{ color: isLight ? '#4f46e5' : '#6366f1', fontWeight: 700 }}>{iconKey}</code>
              {isCustomIcon && <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>(Custom)</span>}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {showIconPicker ? <RiArrowUpSLine size={16} /> : <RiArrowDownSLine size={16} />}
            </span>
          </button>

          {showIconPicker && (
            <div style={{
              marginTop: '10px', overflow: 'hidden',
              border: `1px solid ${isLight ? '#d9d9d9' : '#3f3f46'}`,
              borderRadius: '8px', background: isLight ? '#ffffff' : '#18181b', padding: '12px',
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              {/* Search & Reset */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{
                  flex: 1, height: '32px', display: 'flex', alignItems: 'center',
                  gap: '6px', border: `1px solid ${isLight ? '#d9d9d9' : '#3f3f46'}`, borderRadius: '6px',
                  padding: '0 8px', background: isLight ? '#ffffff' : '#0d0d0d'
                }}>
                  <RiSearchLine size={13} style={{ color: '#888' }} />
                  <input
                    type="text"
                    placeholder="Search tech logo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1, border: 'none', background: 'transparent',
                      color: isLight ? '#111' : '#fff', fontSize: '12px', outline: 'none'
                    }}
                  />
                </div>
                {isCustomIcon && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomIcon(false);
                      setIconKey(getIconKeyByName(name));
                    }}
                    style={{
                      height: '32px', padding: '0 8px', borderRadius: '6px',
                      border: `1px solid ${isLight ? '#d9d9d9' : '#3f3f46'}`, background: 'transparent',
                      color: '#888', cursor: 'pointer', fontSize: '11px',
                      display: 'flex', alignItems: 'center', gap: '4px',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = isLight ? '#4f46e5' : '#6366f1'}
                    onMouseLeave={e => e.currentTarget.style.color = '#888'}
                  >
                    <RiRefreshLine size={12} /> Auto
                  </button>
                )}
              </div>

              {/* Icon Grid */}
              <div
                data-lenis-prevent
                style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '6px', maxHeight: '160px', overflowY: 'auto',
                  paddingRight: '4px'
                }}
              >
                {/* Default Folder Option */}
                <div
                  onClick={() => {
                    setIconKey('lucide:folder');
                    setIsCustomIcon(true);
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: '8px 4px', borderRadius: '6px',
                    cursor: 'pointer', gap: '4px',
                    background: iconKey === 'lucide:folder' ? (isLight ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.15)') : 'transparent',
                    border: `1px solid ${iconKey === 'lucide:folder' ? (isLight ? '#4f46e5' : '#6366f1') : 'transparent'}`,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => { if (iconKey !== 'lucide:folder') e.currentTarget.style.background = isLight ? '#f3f4f6' : '#27272a'; }}
                  onMouseLeave={e => { if (iconKey !== 'lucide:folder') e.currentTarget.style.background = 'transparent'; }}
                >
                  <RiFolder5Line size={18} style={{ color: '#888' }} />
                  <span style={{ fontSize: '9px', fontWeight: 500, color: isLight ? '#111' : '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                    Default
                  </span>
                </div>

                {/* Technology Logos */}
                {Object.values(ICON_MAPPING).filter(icon => {
                  const q = searchQuery.toLowerCase().trim();
                  if (!q) return true;
                  return icon.name.toLowerCase().includes(q) || icon.keywords.some(kw => kw.includes(q));
                }).slice(0, 48).map(icon => {
                  const isSelected = iconKey === icon.slug;
                  return (
                    <div
                      key={icon.slug}
                      onClick={() => {
                        setIconKey(icon.slug);
                        setIsCustomIcon(true);
                      }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '8px 4px', borderRadius: '6px',
                        cursor: 'pointer', gap: '4px',
                        background: isSelected ? (isLight ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.15)') : 'transparent',
                        border: `1px solid ${isSelected ? (isLight ? '#4f46e5' : '#6366f1') : 'transparent'}`,
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = isLight ? '#f3f4f6' : '#27272a'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <SpaceIcon iconKey={icon.slug} size={18} />
                      <span style={{ fontSize: '9px', fontWeight: 500, color: isLight ? '#111' : '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                        {icon.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
