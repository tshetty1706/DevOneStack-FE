import React, { useState, useRef } from 'react';
import { Modal, Button, message, Upload } from 'antd';
import {
  RiCameraLine,
  RiUpload2Line,
  RiGoogleFill,
  RiDeleteBinLine,
  RiCheckLine,
  RiUserLine
} from 'react-icons/ri';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function AvatarUploadModal({ open, onClose }) {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const accentColor = isLight ? '#4f46e5' : '#6366f1';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const cardBg = isLight ? '#ffffff' : '#111116';
  const border = 'var(--card-border)';
  const inputBg = isLight ? '#f9fafb' : 'rgba(255,255,255,0.03)';

  // Reset states on open/close
  React.useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      setSelectedFile(null);
      setUploading(false);
    }
  }, [open]);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      message.error('Please upload a valid image (JPEG, PNG, or WEBP)');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Upload to backend -> Cloudinary
  const handleSaveUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const res = await api.post('/api/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.user) {
        setUser(res.data.user);
        // Update localStorage for other components
        localStorage.setItem('dos_profile_name', res.data.user.displayName || '');
        localStorage.setItem('dos_profile_avatar', res.data.user.avatarUrl || '');
        // Notify other parts of app
        window.dispatchEvent(new Event('profile_update'));
      }
      message.success('Profile photo updated successfully');
      onClose();
    } catch (err) {
      console.error('Avatar upload error:', err);
      message.error(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  // Switch to Google / Provider photo
  const handleUseProviderPhoto = async () => {
    if (!user?.googleAvatarUrl) return;
    setUploading(true);
    try {
      const res = await api.put('/api/auth/profile', { avatarUrl: user.googleAvatarUrl });
      if (res.data.user) {
        setUser(res.data.user);
      }
      message.success('Profile photo reset to provider image');
      onClose();
    } catch (err) {
      message.error('Failed to update photo');
    } finally {
      setUploading(false);
    }
  };

  // Remove photo (revert to initials)
  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      const res = await api.put('/api/auth/profile', { avatarUrl: '' });
      if (res.data.user) {
        setUser(res.data.user);
      }
      message.success('Profile photo removed');
      onClose();
    } catch (err) {
      message.error('Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const currentDisplayAvatar = previewUrl || user?.avatarUrl;

  return (
    <Modal
      title="Edit Profile Photo"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={440}
      styles={{
        body: { padding: '16px 0 0' },
        mask: { backdropFilter: 'blur(4px)' }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        
        {/* Avatar Preview Ring */}
        <div style={{
          position: 'relative',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          border: `3px solid ${accentColor}`,
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: inputBg,
        }}>
          {currentDisplayAvatar ? (
            <img
              src={currentDisplayAvatar}
              alt="Avatar Preview"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${accentColor}, #a855f7)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: 700,
              color: '#ffffff'
            }}>
              {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Action Options */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Option A: Upload from Device */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <Button
            icon={<RiUpload2Line size={16} />}
            onClick={() => fileInputRef.current?.click()}
            style={{
              height: '42px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 600,
              borderColor: border,
              background: inputBg,
              color: textPrimary,
            }}
          >
            {selectedFile ? 'Choose Different File' : 'Upload from Device'}
          </Button>

          {/* Option B: Use Provider Image (if available) */}
          {user?.googleAvatarUrl && user.avatarUrl !== user.googleAvatarUrl && (
            <Button
              icon={<RiGoogleFill size={16} style={{ color: '#ea4335' }} />}
              onClick={handleUseProviderPhoto}
              loading={uploading}
              style={{
                height: '42px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                borderColor: border,
                background: inputBg,
                color: textPrimary,
              }}
            >
              Use Google Account Photo
            </Button>
          )}

          {/* Option C: Remove Photo */}
          {user?.avatarUrl && (
            <Button
              danger
              icon={<RiDeleteBinLine size={16} />}
              onClick={handleRemovePhoto}
              loading={uploading}
              style={{
                height: '42px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
              }}
            >
              Remove Photo
            </Button>
          )}
        </div>

        {/* Footer Buttons if a new file is chosen */}
        {selectedFile && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            width: '100%',
            paddingTop: '12px',
            borderTop: `1px solid ${border}`,
          }}>
            <Button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSaveUpload}
              loading={uploading}
              style={{ background: accentColor, borderColor: accentColor }}
            >
              Save New Photo
            </Button>
          </div>
        )}

      </div>
    </Modal>
  );
}
