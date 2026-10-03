import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Tabs, Tag, message } from 'antd';
import {
  RiUserLine,
  RiInformationLine,
  RiGlobalLine,
  RiBookOpenLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCloseLine
} from 'react-icons/ri';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function EditProfileModal({ open, onClose, defaultTab = 'about' }) {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');

  const [socials, setSocials] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
  });

  const [education, setEducation] = useState([]);
  const [editingEduIndex, setEditingEduIndex] = useState(null);

  // New / editing education entry state
  const [newEdu, setNewEdu] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: '',
  });
  const [showAddEduForm, setShowAddEduForm] = useState(false);

  // Initialize fields when modal opens or user changes
  useEffect(() => {
    if (open && user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setRole(user.role || '');
      setSkills(Array.isArray(user.skills) ? [...user.skills] : []);
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setSocials({
        github: user.socials?.github || '',
        linkedin: user.socials?.linkedin || '',
        twitter: user.socials?.twitter || '',
        website: user.socials?.website || '',
      });
      setEducation(Array.isArray(user.education) ? [...user.education] : []);
      setActiveTab(defaultTab || 'about');
      setShowAddEduForm(false);
      setEditingEduIndex(null);
      setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
    }
  }, [open, user, defaultTab]);

  // Skill tag handlers
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      if (trimmed.length > 50) {
        message.warning('Skill name cannot exceed 50 characters');
        return;
      }
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Education item handlers
  const handleOpenAddEdu = () => {
    if (showAddEduForm) {
      setShowAddEduForm(false);
      setEditingEduIndex(null);
      setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
    } else {
      setEditingEduIndex(null);
      setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
      setShowAddEduForm(true);
    }
  };

  const handleEditEducationEntry = (index) => {
    const item = education[index];
    if (!item) return;
    setNewEdu({
      institution: item.institution || '',
      degree: item.degree || '',
      fieldOfStudy: item.fieldOfStudy || '',
      startYear: item.startYear || '',
      endYear: item.endYear || '',
    });
    setEditingEduIndex(index);
    setShowAddEduForm(true);
  };

  const handleSaveEducationEntry = () => {
    if (!newEdu.institution.trim() && !newEdu.degree.trim()) {
      message.warning('Please enter an institution or degree');
      return;
    }

    if (newEdu.startYear && isNaN(Number(newEdu.startYear))) {
      message.error('Start year must be a valid number (e.g. 2022)');
      return;
    }
    if (newEdu.endYear && newEdu.endYear.toLowerCase() !== 'present' && isNaN(Number(newEdu.endYear))) {
      message.error('End year must be a number or "Present"');
      return;
    }
    if (newEdu.startYear && newEdu.endYear && newEdu.endYear.toLowerCase() !== 'present' && Number(newEdu.endYear) < Number(newEdu.startYear)) {
      message.error('End year cannot be earlier than start year');
      return;
    }

    if (editingEduIndex !== null && editingEduIndex >= 0 && editingEduIndex < education.length) {
      const updated = [...education];
      updated[editingEduIndex] = { ...newEdu };
      setEducation(updated);
      message.success('Education entry updated');
    } else {
      setEducation([...education, { ...newEdu }]);
      message.success('Education entry added');
    }

    setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
    setEditingEduIndex(null);
    setShowAddEduForm(false);
  };

  const handleRemoveEducationEntry = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
    if (editingEduIndex === index) {
      setEditingEduIndex(null);
      setShowAddEduForm(false);
      setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
    }
  };

  // Save profile to backend with validation and global sync
  const validateInputs = () => {
    const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
    if (phone && !phoneRegex.test(phone)) {
      message.error('Invalid phone number format');
      return false;
    }
    const urlRegex = /^(https?:\/\/)?([\w.-]+)+[\w-]+(\.[\w-]+)+(\/([\w/_.-]*)?)?$/i;
    if (website && !urlRegex.test(website)) {
      message.error('Invalid website URL');
      return false;
    }
    const socialFields = ['github', 'linkedin', 'twitter', 'website'];
    for (const field of socialFields) {
      if (socials[field] && !urlRegex.test(socials[field])) {
        message.error(`Invalid URL for ${field}`);
        return false;
      }
    }
    // Display name validation
    const nameRegex = /^[a-zA-Z0-9 .'-]{2,}$/;
    if (!displayName.trim() || !nameRegex.test(displayName)) {
      message.error('Display name is required and must be a valid name');
      return false;
    }
    // Bio length validation
    if (bio && bio.length > 500) {
      message.error('Bio must be under 500 characters');
      return false;
    }
    // Role length validation
    if (role && role.length > 100) {
      message.error('Role must be under 100 characters');
      return false;
    }
    // Education years validation
    for (const edu of education) {
      if (edu.startYear && isNaN(Number(edu.startYear))) {
        message.error('Start year must be a number');
        return false;
      }
      if (edu.endYear && edu.endYear.toLowerCase() !== 'present' && isNaN(Number(edu.endYear))) {
        message.error('End year must be a number or "Present"');
        return false;
      }
      if (edu.startYear && edu.endYear && edu.endYear.toLowerCase() !== 'present' && Number(edu.endYear) < Number(edu.startYear)) {
        message.error('End year cannot be earlier than start year');
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const payload = {
        displayName,
        bio,
        role,
        skills,
        phone,
        location,
        website,
        socials,
        education,
      };

      const res = await api.put('/api/auth/profile', payload);
      if (res.data.user) {
        setUser(res.data.user);
        // Update localStorage for other components
        localStorage.setItem('dos_profile_name', res.data.user.displayName || res.data.user.username || '');
        localStorage.setItem('dos_profile_avatar', res.data.user.avatarUrl || '');
        // Notify other parts of app
        window.dispatchEvent(new Event('profile_update'));
      }
      message.success('Profile updated successfully');
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      message.error(err.response?.data?.error || 'Failed to save profile changes');
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isLight ? '#4f46e5' : '#6366f1';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const border = 'var(--card-border)';
  const inputBg = isLight ? '#f9fafb' : '#14141a';

  const textInputStyle = {
    background: inputBg,
    borderColor: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)',
    color: textPrimary,
    fontFamily: 'var(--font-body)',
  };

  const items = [
    {
      key: 'about',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RiUserLine /> About Me
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your full name"
              maxLength={100}
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Current Role / Headline
            </label>
            <Input
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Full Stack Developer, DevOps Enthusiast"
              maxLength={100}
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Bio / Introduction
            </label>
            <Input.TextArea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Passionate about building scalable web applications and developer tools..."
              maxLength={500}
              showCount
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Technologies & Skills
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <Input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onPressEnter={handleAddSkill}
                placeholder="Add a technology (e.g. React, Node.js, MongoDB)"
                maxLength={50}
                style={textInputStyle}
              />
              <Button onClick={handleAddSkill} icon={<RiAddLine />} style={{ borderColor: border }}>
                Add
              </Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills.map(s => (
                <Tag
                  key={s}
                  closable
                  onClose={() => handleRemoveSkill(s)}
                  style={{
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)',
                    borderColor: isLight ? 'rgba(79,70,229,0.2)' : 'rgba(99,102,241,0.25)',
                    color: accentColor,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {s}
                </Tag>
              ))}
              {skills.length === 0 && (
                <span style={{ fontSize: '12px', color: textMuted }}>No skills added yet.</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'personal',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RiInformationLine /> Personal Info
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Phone Number
            </label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              maxLength={25}
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Location
            </label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Mumbai, India"
              maxLength={100}
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Website / Blog
            </label>
            <Input
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              maxLength={150}
              style={textInputStyle}
            />
          </div>
        </div>
      )
    },
    {
      key: 'socials',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RiGlobalLine /> Social Profiles
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              GitHub URL
            </label>
            <Input
              value={socials.github}
              onChange={e => setSocials({ ...socials, github: e.target.value })}
              placeholder="https://github.com/username"
              maxLength={150}
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              LinkedIn URL
            </label>
            <Input
              value={socials.linkedin}
              onChange={e => setSocials({ ...socials, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              maxLength={150}
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Twitter / X URL
            </label>
            <Input
              value={socials.twitter}
              onChange={e => setSocials({ ...socials, twitter: e.target.value })}
              placeholder="https://x.com/username"
              maxLength={150}
              style={textInputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Personal / Portfolio Website
            </label>
            <Input
              value={socials.website}
              onChange={e => setSocials({ ...socials, website: e.target.value })}
              placeholder="https://portfolio.dev"
              maxLength={150}
              style={textInputStyle}
            />
          </div>
        </div>
      )
    },
    {
      key: 'education',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RiBookOpenLine /> Education
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>
              Education History
            </span>
            <Button
              type="dashed"
              size="small"
              icon={<RiAddLine />}
              onClick={handleOpenAddEdu}
              style={{ borderColor: border }}
            >
              {showAddEduForm && editingEduIndex === null ? 'Cancel' : '+ Add School'}
            </Button>
          </div>

          {showAddEduForm && (
            <div style={{
              background: inputBg,
              border: `1px solid ${border}`,
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: accentColor }}>
                {editingEduIndex !== null ? 'Edit Education Entry' : 'Add Education Entry'}
              </div>
              <Input
                placeholder="Institution (e.g. Stanford University / College of Engineering)"
                value={newEdu.institution}
                onChange={e => setNewEdu({ ...newEdu, institution: e.target.value })}
                maxLength={120}
                style={textInputStyle}
              />
              <Input
                placeholder="Degree (e.g. B.Tech / B.S. / Master's)"
                value={newEdu.degree}
                onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })}
                maxLength={100}
                style={textInputStyle}
              />
              <Input
                placeholder="Field of Study (e.g. Computer Science & Engineering)"
                value={newEdu.fieldOfStudy}
                onChange={e => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                maxLength={100}
                style={textInputStyle}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <Input
                  placeholder="Start Year (e.g. 2022)"
                  value={newEdu.startYear}
                  onChange={e => setNewEdu({ ...newEdu, startYear: e.target.value })}
                  maxLength={10}
                  style={textInputStyle}
                />
                <Input
                  placeholder="End Year (e.g. 2026 or Present)"
                  value={newEdu.endYear}
                  onChange={e => setNewEdu({ ...newEdu, endYear: e.target.value })}
                  maxLength={15}
                  style={textInputStyle}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <Button
                  size="small"
                  onClick={() => {
                    setShowAddEduForm(false);
                    setEditingEduIndex(null);
                    setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={handleSaveEducationEntry}
                  style={{ background: accentColor, borderColor: accentColor }}
                >
                  {editingEduIndex !== null ? 'Update Entry' : 'Add to List'}
                </Button>
              </div>
            </div>
          )}

          {education.length === 0 ? (
            <p style={{ fontSize: '12.5px', color: textMuted, margin: '8px 0' }}>
              No education records added.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: inputBg,
                    border: `1px solid ${editingEduIndex === idx ? accentColor : border}`
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {edu.degree ? `${edu.degree} - ` : ''}{edu.institution}
                    </div>
                    <div style={{ fontSize: '11.5px', color: textMuted }}>
                      {edu.fieldOfStudy ? `${edu.fieldOfStudy} • ` : ''}
                      {edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : edu.startYear || edu.endYear || ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                    <Button
                      type="text"
                      icon={<RiEditLine size={15} />}
                      style={{ color: textMuted }}
                      onClick={() => handleEditEducationEntry(idx)}
                      title="Edit education entry"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<RiDeleteBinLine size={15} />}
                      onClick={() => handleRemoveEducationEntry(idx)}
                      title="Delete education entry"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <Modal
      title="Edit Profile"
      open={open}
      onCancel={onClose}
      centered
      width={560}
      styles={{
        body: { padding: '8px 0 16px', maxHeight: '70vh', overflowY: 'auto' },
        mask: { backdropFilter: 'blur(4px)' }
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSave}
          style={{ background: accentColor, borderColor: accentColor }}
        >
          Save Changes
        </Button>
      ]}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        style={{ padding: '0 4px' }}
      />
    </Modal>
  );
}
