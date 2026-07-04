import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Input, Button, Upload, message, Tooltip } from 'antd';
import {
  RiUserLine, RiEditLine, RiCloseLine, RiMailLine, RiPhoneLine,
  RiMapPin2Line, RiGlobalLine, RiGithubLine, RiLinkedinLine,
  RiTwitterXLine, RiBookOpenLine, RiDeleteBin6Line, RiAddLine,
  RiArrowLeftLine, RiSaveLine
} from 'react-icons/ri';
import { RxRocket } from "react-icons/rx";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ThemeToggle from '../components/layout/ThemeToggle';
import { useSpaces } from '../hooks/useSpaces';
import ToolSpacesGrid from '../components/dashboard/ToolSpacesGrid';
import NewSpaceModal from '../components/dashboard/NewSpaceModal';

export default function Profile() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // State values initialized from localStorage or defaults
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);

  const [activeTab, setActiveTab] = useState('Overview');
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Auto-switch to Spaces tab if ?tab=spaces is in URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'spaces') {
      setActiveTab('Spaces');
    }
  }, [searchParams]);
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();

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
        // Fallback if empty/invalid
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
    // Dispatch custom event to trigger navbar/dropdown updates reactively
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

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.3s ease', position: 'relative', overflow: 'hidden' }}>

      {/* Background Flowing Orbs */}
      <div className="hero-background-flow">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      <DashboardNavbar onNewSpaceClick={() => { setActiveTab('Spaces'); setNewSpaceOpen(true); }} />


      <main style={{ maxWidth: '1024px', margin: '0 auto', padding: '76px 24px 80px', position: 'relative', zIndex: 10 }}>

        {/* Back Link / Breadcrumb */}
        <div style={{ marginBottom: '20px' }}>
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

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '24px',
          borderBottom: `1px solid ${divider}`, paddingBottom: '12px'
        }}>
          {[
            { id: 'Overview', label: 'Profile Overview' },
            { id: 'Spaces', label: 'Spaces' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: isActive ? (isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)') : 'transparent',
                  color: isActive ? accentColor : textMuted,
                  fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = textPrimary;
                    e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = textMuted;
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'Overview' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px', alignItems: 'start' }}>


            {/* LEFT COLUMN: Header Card & Personal Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Card 1: User Profile Header */}
              <div
                style={cardStyle}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}
              >
                {/* Edit button */}
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: isEditingProfile ? accentColor : textMuted, fontSize: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {isEditingProfile ? <RiCloseLine /> : <RiEditLine />}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                  {/* Avatar Display */}
                  <div style={{ position: 'relative' }}>
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accentColor}` }}
                      />
                    ) : (
                      <div style={{
                        width: '84px', height: '84px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${isLight ? '#4f46e5' : '#6366f1'}, ${isLight ? '#9333ea' : '#a855f7'})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', fontWeight: 600, color: '#ffffff'
                      }}>
                        {initials}
                      </div>
                    )}
                    {isEditingProfile && (
                      <Upload
                        beforeUpload={handleAvatarUpload}
                        showUploadList={false}
                      >
                        <button style={{
                          position: 'absolute', bottom: 0, right: 0,
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: accentColor, border: 'none', color: '#ffffff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                          <RiEditLine size={14} />
                        </button>
                      </Upload>
                    )}
                  </div>

                  {/* Profile Fields */}
                  {isEditingProfile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', textAlign: 'left' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Full Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} style={textInputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Caption / Title</label>
                        <Input value={caption} onChange={e => setCaption(e.target.value)} style={textInputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Avatar Image URL (Optional)</label>
                        <Input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Or paste any URL directly" style={textInputStyle} />
                      </div>
                      <Button type="primary" onClick={handleSaveProfile} style={{ background: accentColor, borderColor: accentColor, marginTop: '8px' }}>
                        Save Header
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 600, color: textPrimary, margin: '0 0 4px 0' }}>{name}</h2>
                      <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 8px 0' }}>@{handle}</p>
                      <p style={{
                        fontSize: '14px',
                        color: isLight ? '#333333' : '#e5e5e5',
                        margin: 0,
                        padding: '4px 12px',
                        borderRadius: '8px',
                        background: isLight ? 'rgba(79,70,229,0.05)' : 'rgba(99,102,241,0.08)',
                        border: `1px solid ${isLight ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.15)'}`
                      }}>
                        {caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Personal Information */}
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

                <h3 style={{ fontSize: '14px', fontWeight: 600, color: textPrimary, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Personal Information
                </h3>

                {isEditingInfo ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)} style={textInputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Location</label>
                      <Input value={location} onChange={e => setLocation(e.target.value)} style={textInputStyle} />
                    </div>
                    <Button type="primary" onClick={handleSaveInfo} style={{ background: accentColor, borderColor: accentColor, marginTop: '8px' }}>
                      Save Info
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RiMailLine size={18} style={{ color: textMuted }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '11px', color: textMuted, margin: 0, textTransform: 'uppercase' }}>Email Address</p>
                        <p style={{ fontSize: '13px', color: textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RiPhoneLine size={18} style={{ color: textMuted }} />
                      <div>
                        <p style={{ fontSize: '11px', color: textMuted, margin: 0, textTransform: 'uppercase' }}>Phone</p>
                        <p style={{ fontSize: '13px', color: textPrimary, margin: 0 }}>{phone || 'Not added'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RiMapPin2Line size={18} style={{ color: textMuted }} />
                      <div>
                        <p style={{ fontSize: '11px', color: textMuted, margin: 0, textTransform: 'uppercase' }}>Location</p>
                        <p style={{ fontSize: '13px', color: textPrimary, margin: 0 }}>{location || 'Not added'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Education & Social Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Card 3: Education */}
              <div
                style={cardStyle}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Education
                  </h3>
                  <button
                    onClick={() => setShowAddEdu(!showAddEdu)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: accentColor, display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: 500
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
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <RiBookOpenLine size={18} style={{ color: textMuted, marginTop: '2px' }} />
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: textPrimary, margin: 0 }}>{edu.school}</p>
                            <p style={{ fontSize: '12px', color: textMuted, margin: '2px 0 0 0' }}>{edu.degree} &middot; {edu.years}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEducation(index)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted }}
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

              {/* Card 4: Social Links */}
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

                <h3 style={{ fontSize: '14px', fontWeight: 600, color: textPrimary, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Social Profiles
                </h3>

                {isEditingSocials ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>GitHub Profile URL</label>
                      <Input value={socials.github} onChange={e => setSocials({ ...socials, github: e.target.value })} placeholder="https://github.com/..." style={textInputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>LinkedIn Profile URL</label>
                      <Input value={socials.linkedin} onChange={e => setSocials({ ...socials, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." style={textInputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Twitter / X URL</label>
                      <Input value={socials.twitter} onChange={e => setSocials({ ...socials, twitter: e.target.value })} placeholder="https://x.com/..." style={textInputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Personal Website</label>
                      <Input value={socials.website} onChange={e => setSocials({ ...socials, website: e.target.value })} placeholder="https://..." style={textInputStyle} />
                    </div>
                    <Button type="primary" onClick={handleSaveSocials} style={{ background: accentColor, borderColor: accentColor, marginTop: '8px' }}>
                      Save Socials
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${divider}`, paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <RiGithubLine size={20} style={{ color: textMuted }} />
                        <span style={{ fontSize: '13px', color: textPrimary }}>GitHub</span>
                      </div>
                      {socials.github ? (
                        <a href={socials.github} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: accentColor }}>View profile &rarr;</a>
                      ) : (
                        <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${divider}`, paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <RiLinkedinLine size={20} style={{ color: textMuted }} />
                        <span style={{ fontSize: '13px', color: textPrimary }}>LinkedIn</span>
                      </div>
                      {socials.linkedin ? (
                        <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: accentColor }}>View profile &rarr;</a>
                      ) : (
                        <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${divider}`, paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <RiTwitterXLine size={20} style={{ color: textMuted }} />
                        <span style={{ fontSize: '13px', color: textPrimary }}>Twitter / X</span>
                      </div>
                      {socials.twitter ? (
                        <a href={socials.twitter} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: accentColor }}>View profile &rarr;</a>
                      ) : (
                        <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <RiGlobalLine size={20} style={{ color: textMuted }} />
                        <span style={{ fontSize: '13px', color: textPrimary }}>Website</span>
                      </div>
                      {socials.website ? (
                        <a href={socials.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: accentColor }}>Visit &rarr;</a>
                      ) : (
                        <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : activeTab === 'Spaces' ? (
          <div style={{
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: '16px', padding: '24px', position: 'relative'
          }}>
            {spacesLoading ? (
              <div style={{ color: textMuted, fontSize: '13px', padding: '10px 0' }}>Loading spaces...</div>
            ) : spaces.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '60px 24px', textAlign: 'center', gap: '16px'
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px'
                }}><RxRocket />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: textPrimary, margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
                    No spaces yet
                  </p>
                  <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 20px', lineHeight: 1.55 }}>
                    Create your first tool space to get started.
                  </p>
                  <button
                    onClick={() => setNewSpaceOpen(true)}
                    style={{
                      padding: '10px 22px', borderRadius: '10px', border: 'none',
                      background: accentColor, color: '#ffffff', fontSize: '13px',
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    + Add New Space
                  </button>
                </div>
              </div>
            ) : (
              <ToolSpacesGrid spaces={spaces} onAddSpaceClick={() => setNewSpaceOpen(true)} />
            )}
          </div>
        ) : null}

      </main>

      <ThemeToggle />
      <NewSpaceModal open={newSpaceOpen} onClose={() => setNewSpaceOpen(false)} />
    </div>
  );
}
