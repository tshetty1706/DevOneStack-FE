import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Input, Button, Upload, message } from 'antd';
import {
  RiUserLine, RiEditLine, RiCloseLine, RiMailLine, RiPhoneLine,
  RiMapPin2Line, RiGlobalLine, RiGithubLine, RiLinkedinLine,
  RiTwitterXLine, RiBookOpenLine, RiDeleteBin6Line, RiAddLine,
  RiArrowLeftLine, RiCalendarLine, RiLayoutGridLine,
  RiFileTextLine, RiCodeSSlashLine, RiFolder5Line, RiCameraLine
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DashboardNav from '../components/dashboard/DashboardNav';
import ThemeToggle from '../components/layout/ThemeToggle';
import NewSpaceModal from '../components/dashboard/NewSpaceModal';
import { useSpaces } from '../hooks/useSpaces';

export default function Profile() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // State values initialized from localStorage or defaults
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);

  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const { data: spaces = [] } = useSpaces();

  const notesCount = spaces.reduce((acc, s) => acc + (s.notesCount || 0), 0);
  const snippetsCount = spaces.reduce((acc, s) => acc + (s.snippetsCount || 0), 0);
  const resourcesCount = spaces.reduce((acc, s) => acc + (s.docsCount || 0), 0);

  const [name, setName] = useState('');
  const [caption, setCaption] = useState('');
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [socials, setSocials] = useState({ github: '', linkedin: '', twitter: '', website: '' });
  const [education, setEducation] = useState([]);

  // New education form state
  const [showAddEdu, setShowAddEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ school: '', degree: '', years: '' });

  // Initialize fields once the user context is loaded
  useEffect(() => {
    if (user) {
      setName(localStorage.getItem('dos_profile_name') || user.displayName || user.username || '');
      setCaption(localStorage.getItem('dos_profile_caption') || 'Your Caption');
      setAvatar(localStorage.getItem('dos_profile_avatar') || user.avatarUrl || '');
      setPhone(localStorage.getItem('dos_profile_phone') || 'Your Phone Number');
      setLocation(localStorage.getItem('dos_profile_location') || 'Your Locations');

      try {
        const storedSocials = JSON.parse(localStorage.getItem('dos_profile_socials'));
        if (storedSocials) setSocials(storedSocials);
      } catch (e) {
        // Fallback
      }

      try {
        const storedEdu = JSON.parse(localStorage.getItem('dos_profile_education'));
        if (storedEdu) {
          setEducation(storedEdu);
        }
      } catch (e) {
        // Fallback
      }
    }
  }, [user]);

  // Save utility to persist to localstorage
  const saveProfileField = (key, value) => {
    localStorage.setItem(key, value);
    // Trigger update event
    window.dispatchEvent(new Event('profile_update'));
  };

  const handleSaveProfile = () => {
    saveProfileField('dos_profile_name', name);
    saveProfileField('dos_profile_caption', caption);
    saveProfileField('dos_profile_avatar', avatar);
    setIsEditingProfile(false);
    message.success({ content: 'Profile header updated', style: { marginTop: '60px' } });
  };

  const handleSaveInfo = () => {
    saveProfileField('dos_profile_phone', phone);
    saveProfileField('dos_profile_location', location);
    setIsEditingInfo(false);
    message.success({ content: 'Personal information updated', style: { marginTop: '60px' } });
  };

  const handleSaveSocials = () => {
    localStorage.setItem('dos_profile_socials', JSON.stringify(socials));
    window.dispatchEvent(new Event('profile_update'));
    setIsEditingSocials(false);
    message.success({ content: 'Social links updated', style: { marginTop: '60px' } });
  };

  const handleAddEducation = () => {
    if (!newEdu.school || !newEdu.degree || !newEdu.years) {
      message.error({ content: 'Please fill in all education fields', style: { marginTop: '60px' } });
      return;
    }
    const updatedEdu = [...education, newEdu];
    setEducation(updatedEdu);
    localStorage.setItem('dos_profile_education', JSON.stringify(updatedEdu));
    setNewEdu({ school: '', degree: '', years: '' });
    setShowAddEdu(false);
    message.success({ content: 'Education added successfully', style: { marginTop: '60px' } });
  };

  const handleDeleteEducation = (index) => {
    const updatedEdu = education.filter((_, idx) => idx !== index);
    setEducation(updatedEdu);
    localStorage.setItem('dos_profile_education', JSON.stringify(updatedEdu));
    message.info({ content: 'Education entry removed', style: { marginTop: '60px' } });
  };

  const handleAvatarUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setAvatar(base64);
      saveProfileField('dos_profile_avatar', base64);
      message.success({ content: 'Avatar updated successfully', style: { marginTop: '60px' } });
    };
    reader.readAsDataURL(file);
    return false; // prevent default upload action
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <div className="skeleton-shimmer" style={{ width: '200px', height: '40px', borderRadius: '8px' }} />
      </div>
    );
  }

  // extract initials
  const nameParts = name.trim().split(/\s+/);
  const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0][0] || 'U').toUpperCase();

  const handle = user.email.split('@')[0];

  // Joined date formatter
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Jan 15, 2024';

  // Theme variables
  const bg = 'var(--bg-color)';
  const cardBg = 'var(--card-bg)';
  const border = 'var(--card-border)';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const textSub = isLight ? '#9ca3af' : '#4b5563';
  const divider = isLight ? '#e5e7eb' : '#18181b';
  const inputBg = isLight ? '#f3f4f6' : '#121214';
  const accentColor = isLight ? '#4f46e5' : '#818cf8';

  const cardStyle = {
    background: cardBg,
    border: `1px solid ${border}`,
    borderRadius: '16px',
    padding: '24px',
    position: 'relative',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const textInputStyle = {
    background: inputBg,
    borderColor: border,
    color: textPrimary,
    fontFamily: 'var(--font-body)',
  };

  const statCardsData = [
    {
      label: 'Spaces',
      count: spaces.length,
      subtitle: `${spaces.length} owned`,
      icon: <RiLayoutGridLine size={18} />,
      color: '#818cf8',
      bg: 'rgba(129, 140, 248, 0.08)',
      borderColor: 'rgba(129, 140, 248, 0.15)'
    },
    {
      label: 'Notes',
      count: notesCount,
      subtitle: '+12 this week',
      icon: <RiFileTextLine size={18} />,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.15)'
    },
    {
      label: 'Snippets',
      count: snippetsCount,
      subtitle: '+7 this week',
      icon: <RiCodeSSlashLine size={18} />,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.15)'
    },
    {
      label: 'Resources',
      count: resourcesCount,
      subtitle: '+18 this week',
      icon: <RiFolder5Line size={18} />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.15)'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.3s ease', position: 'relative', overflow: 'hidden' }}>

      {/* Background Flowing Orbs - matched to dashboard precisely */}
      <div className="hero-background-flow" style={{ opacity: isLight ? 0.01 : 0.03 }}>
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      <DashboardNav onNewSpaceClick={() => setNewSpaceOpen(true)} />

      <main style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '30px 24px 80px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>

        {/* Back Link / Breadcrumb */}
        <div style={{ alignSelf: 'flex-start' }}>
          <Button
            type="link"
            href="/dashboard"
            icon={<RiArrowLeftLine />}
            style={{
              color: textMuted,
              display: 'inline-flex',
              alignItems: 'center',
              padding: 0,
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => e.currentTarget.style.color = textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = textMuted}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Main Combined Profile & Stats Container Card */}
        <div
          style={{
            ...cardStyle,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = border}
        >
          {/* TOP PART: User Profile Header */}
          <div style={{ position: 'relative', width: '100%' }}>
            {/* Edit profile toggle button */}
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              style={{
                position: 'absolute', top: 0, right: 0,
                background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px', cursor: 'pointer',
                color: isEditingProfile ? accentColor : textPrimary,
                fontSize: '13px', fontWeight: 600,
                padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'var(--font-body)', transition: 'all 0.15s ease',
                zIndex: 10
              }}
            >
              {isEditingProfile ? (
                <>
                  <RiCloseLine size={16} />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <RiEditLine size={15} />
                  <span>Edit Profile</span>
                </>
              )}
            </button>

            {isEditingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: textPrimary, margin: 0 }}>
                  Edit Profile Information
                </h3>
                <div>
                  <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} style={textInputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Caption / Bio</label>
                  <Input value={caption} onChange={e => setCaption(e.target.value)} style={textInputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Avatar Image URL (Optional)</label>
                  <Input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Or paste any image URL directly" style={textInputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button type="primary" onClick={handleSaveProfile} style={{ background: accentColor, borderColor: accentColor }}>
                    Save Profile
                  </Button>
                  <Upload beforeUpload={handleAvatarUpload} showUploadList={false}>
                    <Button type="default" style={textInputStyle}>
                      Upload Image File
                    </Button>
                  </Upload>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap', minWidth: 0, width: '100%' }}>
                {/* Left: Avatar with Blue Camera Icon overlay */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${isLight ? '#e5e5e5' : '#22222a'}` }}
                    />
                  ) : (
                    <div style={{
                      width: '96px', height: '96px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${isLight ? '#4f46e5' : '#6366f1'}, ${isLight ? '#9333ea' : '#a855f7'})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '36px', fontWeight: 700, color: '#ffffff'
                    }}>
                      {initials}
                    </div>
                  )}
                  {/* Camera icon picker */}
                  <Upload beforeUpload={handleAvatarUpload} showUploadList={false}>
                    <button style={{
                      position: 'absolute', bottom: '-2px', right: '-2px',
                      width: '30px', height: '30px', borderRadius: '50%',
                      background: '#4f46e5', border: `2.5px solid ${isLight ? '#ffffff' : '#111116'}`,
                      color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      transition: 'background 0.15s'
                    }}>
                      <RiCameraLine size={14} />
                    </button>
                  </Upload>
                </div>

                {/* Right of Avatar: User Meta */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: textPrimary, margin: '0 0 4px 0', fontFamily: 'var(--font-display)' }}>
                    {name}
                  </h2>
                  <p style={{ fontSize: '14px', color: textMuted, margin: '0 0 8px 0', fontWeight: 500 }}>
                    {user.email}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: textMuted, fontSize: '13px', margin: '8px 0 16px 0' }}>
                    <RiCalendarLine size={15} style={{ color: textMuted }} />
                    <span>Joined on {joinedDate}</span>
                  </div>

                  <p style={{
                    fontSize: '14px',
                    color: isLight ? '#475569' : '#d1d5db',
                    margin: 0,
                    lineHeight: 1.5,
                    fontStyle: 'normal',
                    maxWidth: '560px'
                  }}>
                    "{caption}" ✨
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM PART: Dynamic Stats Cards Row inside the same container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            width: '100%',
            borderTop: `1px solid ${divider}`,
            paddingTop: '28px'
          }}>
            {statCardsData.map(stat => (
              <div
                key={stat.label}
                style={{
                  background: isLight ? '#f9fafb' : '#141419',
                  border: `1px solid ${border}`,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}
              >
                {/* Colored icon box */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: stat.bg, border: `1px solid ${stat.borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color, flexShrink: 0
                }}>
                  {stat.icon}
                </div>

                {/* Counts details */}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: textPrimary, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {stat.count}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: textMuted }}>
                      {stat.label}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    marginTop: '4px',
                    color: stat.label === 'Spaces' ? textMuted : '#10b981'
                  }}>
                    {stat.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Columns Grid below: Personal Info, Socials, Education */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '24px',
          alignItems: 'start',
          width: '100%',
        }}>

          {/* Card A: Personal Info */}
          <div
            style={cardStyle}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = border}
          >
            <button
              onClick={() => setIsEditingInfo(!isEditingInfo)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: isEditingInfo ? accentColor : textMuted, fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {isEditingInfo ? <RiCloseLine /> : <RiEditLine />}
            </button>

            <h3 style={{ fontSize: '13px', fontWeight: 700, color: textPrimary, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>
              Personal Information
            </h3>

            {isEditingInfo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Phone Number</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} style={textInputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Location</label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} style={textInputStyle} />
                </div>
                <Button type="primary" onClick={handleSaveInfo} style={{ background: accentColor, borderColor: accentColor, marginTop: '8px' }}>
                  Save Info
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: textMuted, flexShrink: 0
                  }}>
                    <RiMailLine size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '10px', color: textMuted, margin: 0, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Email Address</p>
                    <p style={{ fontSize: '13px', color: textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: textMuted, flexShrink: 0
                  }}>
                    <RiPhoneLine size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: textMuted, margin: 0, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Phone</p>
                    <p style={{ fontSize: '13px', color: textPrimary, margin: 0 }}>{phone || 'Not added'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: textMuted, flexShrink: 0
                  }}>
                    <RiMapPin2Line size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: textMuted, margin: 0, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Location</p>
                    <p style={{ fontSize: '13px', color: textPrimary, margin: 0 }}>{location || 'Not added'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card B: Social Profiles */}
          <div
            style={cardStyle}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = border}
          >
            <button
              onClick={() => setIsEditingSocials(!isEditingSocials)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: isEditingSocials ? accentColor : textMuted, fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {isEditingSocials ? <RiCloseLine /> : <RiEditLine />}
            </button>

            <h3 style={{ fontSize: '13px', fontWeight: 700, color: textPrimary, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>
              Social Profiles
            </h3>

            {isEditingSocials ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>GitHub URL</label>
                  <Input value={socials.github} onChange={e => setSocials({ ...socials, github: e.target.value })} placeholder="https://github.com/..." style={textInputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>LinkedIn URL</label>
                  <Input value={socials.linkedin} onChange={e => setSocials({ ...socials, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." style={textInputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Twitter / X URL</label>
                  <Input value={socials.twitter} onChange={e => setSocials({ ...socials, twitter: e.target.value })} placeholder="https://x.com/..." style={textInputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Personal Website</label>
                  <Input value={socials.website} onChange={e => setSocials({ ...socials, website: e.target.value })} placeholder="https://..." style={textInputStyle} />
                </div>
                <Button type="primary" onClick={handleSaveSocials} style={{ background: accentColor, borderColor: accentColor, marginTop: '8px' }}>
                  Save Socials
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${divider}`, paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: textMuted, flexShrink: 0
                    }}>
                      <RiGithubLine size={18} />
                    </div>
                    <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 500 }}>GitHub</span>
                  </div>
                  {socials.github ? (
                    <a href={socials.github} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: accentColor, fontWeight: 600 }}>View profile &rarr;</a>
                  ) : (
                    <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${divider}`, paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: textMuted, flexShrink: 0
                    }}>
                      <RiLinkedinLine size={18} />
                    </div>
                    <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 500 }}>LinkedIn</span>
                  </div>
                  {socials.linkedin ? (
                    <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: accentColor, fontWeight: 600 }}>View profile &rarr;</a>
                  ) : (
                    <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifybox: 'space-between', justifyContent: 'space-between', borderBottom: `1px solid ${divider}`, paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: textMuted, flexShrink: 0
                    }}>
                      <RiTwitterXLine size={16} />
                    </div>
                    <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 500 }}>Twitter / X</span>
                  </div>
                  {socials.twitter ? (
                    <a href={socials.twitter} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: accentColor, fontWeight: 600 }}>View profile &rarr;</a>
                  ) : (
                    <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: textMuted, flexShrink: 0
                    }}>
                      <RiGlobalLine size={18} />
                    </div>
                    <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 500 }}>Website</span>
                  </div>
                  {socials.website ? (
                    <a href={socials.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: accentColor, fontWeight: 600 }}>Visit website &rarr;</a>
                  ) : (
                    <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card C: Education */}
          <div
            style={cardStyle}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = border}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, fontFamily: 'var(--font-display)' }}>
                Education
              </h3>
              <button
                onClick={() => setShowAddEdu(!showAddEdu)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: accentColor, display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: 600
                }}
              >
                {showAddEdu ? <><RiCloseLine /> Cancel</> : <><RiAddLine /> Add Entry</>}
              </button>
            </div>

            {/* Add Education Form */}
            <AnimatePresence>
              {showAddEdu && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', marginBottom: '16px', background: inputBg, borderRadius: '8px', padding: '16px', border: `1px solid ${border}` }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Input
                      placeholder="School / University"
                      value={newEdu.school}
                      onChange={e => setNewEdu({ ...newEdu, school: e.target.value })}
                      style={textInputStyle}
                    />
                    <Input
                      placeholder="Degree / Course"
                      value={newEdu.degree}
                      onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })}
                      style={textInputStyle}
                    />
                    <Input
                      placeholder="Years (e.g. 2020 - 2024)"
                      value={newEdu.years}
                      onChange={e => setNewEdu({ ...newEdu, years: e.target.value })}
                      style={textInputStyle}
                    />
                    <Button type="primary" onClick={handleAddEducation} style={{ background: accentColor, borderColor: accentColor, marginTop: '4px' }}>
                      Save Education
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Education List */}
            {education.length === 0 ? (
              <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>No education details added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {education.map((edu, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px', borderRadius: '8px', border: `1px solid ${divider}`,
                      background: isLight ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: textMuted, flexShrink: 0
                      }}>
                        <RiBookOpenLine size={16} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{edu.school}</p>
                        <p style={{ fontSize: '12px', color: textMuted, margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{edu.degree} &middot; {edu.years}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEducation(index)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted, flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = textMuted}
                    >
                      <RiDeleteBin6Line size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      <ThemeToggle />
      <NewSpaceModal open={newSpaceOpen} onClose={() => setNewSpaceOpen(false)} />
    </div>
  );
}
