import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tooltip, message } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import NotFoundPage from './NotFoundPage';
import NewSpaceModal from '../components/dashboard/NewSpaceModal';
import CommandPalette from '../components/dashboard/CommandPalette';
import {
  RiArrowLeftLine, RiMenuLine, RiShareLine, RiSearchLine,
  RiHome4Line, RiFileTextLine, RiLightbulbLine, RiCodeSSlashLine,
  RiGitRepositoryLine, RiRobot2Line, RiTeamLine, RiPriceTag3Line,
  RiSettings3Line, RiAddLine, RiHistoryLine, RiFlashlightLine, RiCloseLine,
  RiCompass3Line, RiLoader4Line, RiStickyNoteLine
} from 'react-icons/ri';
import Logo from '../components/layout/Logo';
import OnlyLogo from '../components/layout/OnlyLogo';
import { ALL_MODULES, getModuleById } from '../constants/templates';
import OverviewSection from '../components/spaces/OverviewSection';
import ExplorerSection from '../components/spaces/ExplorerSection';
import NotesSection from '../components/spaces/NotesSection';
import DocsSection from '../components/spaces/DocsSection';
import LearningsSection from '../components/spaces/LearningsSection';
import SnippetsSection from '../components/spaces/SnippetsSection';
import ReposSection from '../components/spaces/ReposSection';
import PromptsSection from '../components/spaces/PromptsSection';
import CommunitiesSection from '../components/spaces/CommunitiesSection';
import TagsSection from '../components/spaces/TagsSection';
import SettingsSection from '../components/spaces/SettingsSection';
import SpaceIcon from '../components/spaces/SpaceIcon';
import {
  QuickAddNoteModal,
  QuickAddLearningModal,
  QuickAddSnippetModal,
  QuickAddDocModal,
  QuickAddRepoModal,
  QuickAddPromptModal,
  QuickAddCommunityModal,
} from '../components/spaces/QuickAddModals';

const SIDEBAR_ITEMS = [
  { id: 'overview', icon: RiHome4Line, label: 'Overview', isFixed: true },
  { id: 'explorer', icon: RiCompass3Line, label: 'Explorer', isFixed: true },
  { id: 'notes', icon: RiStickyNoteLine, label: 'Notes' },
  { id: 'learnings', icon: RiLightbulbLine, label: 'Learnings' },
  { id: 'snippets', icon: RiCodeSSlashLine, label: 'Snippets' },
  { id: 'docs', icon: RiFileTextLine, label: 'Docs' },
  { id: 'repos', icon: RiGitRepositoryLine, label: 'Repos' },
  { id: 'prompts', icon: RiRobot2Line, label: 'Prompts' },
  { id: 'communities', icon: RiTeamLine, label: 'Communities' },
  { id: 'tags', icon: RiPriceTag3Line, label: 'Tags' },
];

const SECTIONS = {
  overview: ({ space, isLight, onNavigateSection }) => (
    <OverviewSection space={space} isLight={isLight} onNavigateSection={onNavigateSection} />
  ),
  explorer: ({ space, isLight, onNavigateSection, highlightId, highlightFolderId }) => (
    <ExplorerSection
      space={space}
      isLight={isLight}
      onNavigateSection={onNavigateSection}
      highlightId={highlightId}
      highlightFolderId={highlightFolderId}
    />
  ),
  notes: ({ space, isLight, openNoteId, highlightId, onNavigateSection }) => (
    <NotesSection
      space={space}
      isLight={isLight}
      openNoteId={openNoteId}
      highlightId={highlightId}
      onNavigateSection={onNavigateSection}
    />
  ),
  docs: ({ space, isLight, highlightId, onNavigateSection }) => (
    <DocsSection space={space} isLight={isLight} highlightId={highlightId} onNavigateSection={onNavigateSection} />
  ),
  learnings: ({ space, isLight, highlightId, onNavigateSection }) => (
    <LearningsSection space={space} isLight={isLight} highlightId={highlightId} onNavigateSection={onNavigateSection} />
  ),
  snippets: ({ space, isLight, highlightId, onNavigateSection }) => (
    <SnippetsSection space={space} isLight={isLight} highlightId={highlightId} onNavigateSection={onNavigateSection} />
  ),
  repos: ({ space, isLight, highlightId, onNavigateSection }) => (
    <ReposSection space={space} isLight={isLight} highlightId={highlightId} onNavigateSection={onNavigateSection} />
  ),
  prompts: ({ space, isLight, highlightId, onNavigateSection }) => (
    <PromptsSection space={space} isLight={isLight} highlightId={highlightId} onNavigateSection={onNavigateSection} />
  ),
  communities: ({ space, isLight, highlightId }) => (
    <CommunitiesSection space={space} isLight={isLight} highlightId={highlightId} />
  ),
  tags: ({ space, isLight, onNavigateSection }) => (
    <TagsSection space={space} isLight={isLight} onNavigateSection={onNavigateSection} />
  ),
  settings: ({ space, isLight }) => (
    <SettingsSection space={space} isLight={isLight} />
  ),
};



function timeAgo(dateStr) {
  if (!dateStr) return 'just now';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SpaceDashboard() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isLight = theme === 'light';

  const [isHovered, setIsHovered] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [userName, setUserName] = useState('Developer');
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [openNoteId, setOpenNoteId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [highlightFolderId, setHighlightFolderId] = useState(null);
  const [quickAddModal, setQuickAddModal] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const { data: space, isLoading, error } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: async () => {
      const { data } = await api.get(`/api/spaces/${spaceId}`);
      return data;
    },
    retry: false,
  });

  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [addingModuleId, setAddingModuleId] = useState(null);

  // Compute enabled modules (Overview & Explorer are ALWAYS fixed as first two)
  const enabledModules = useMemo(() => {
    if (Array.isArray(space?.enabledModules) && space.enabledModules.length > 0) {
      const rest = space.enabledModules.filter(m => m !== 'overview' && m !== 'explorer');
      return ['overview', 'explorer', ...rest];
    }
    // Backward compatibility fallback for legacy spaces: enable all standard modules
    return ['overview', 'explorer', 'notes', 'learnings', 'snippets', 'docs', 'repos', 'prompts', 'communities', 'tags'];
  }, [space?.enabledModules]);

  const visibleSidebarItems = useMemo(() => {
    return SIDEBAR_ITEMS.filter(item => {
      if (item.id === 'overview' || item.id === 'explorer') return true; // Fixed modules
      return enabledModules.includes(item.id);
    });
  }, [enabledModules]);

  const availableToAddModules = useMemo(() => {
    return ALL_MODULES.filter(m => !m.isFixed && !enabledModules.includes(m.id));
  }, [enabledModules]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      api.patch(`/api/spaces/${spaceId}/recount`)
        .then(r => console.log('Recount result:', r.data.counts))
        .catch(err => console.error('Recount error:', err));
    }
  }, [spaceId]);

  useEffect(() => {
    const section = searchParams.get('section');
    const noteId = searchParams.get('noteId');
    const id = searchParams.get('id');
    const folderId = searchParams.get('folderId');

    if (section) {
      setActiveSection(section === 'home' ? 'overview' : section);
    } else {
      setActiveSection('overview');
    }
    if (noteId) setOpenNoteId(noteId);
    if (id) setHighlightId(id);
    if (folderId) setHighlightFolderId(folderId);
  }, [searchParams]);

  const handleNavigateSection = (sectionId, id = null, folderId = null) => {
    const target = sectionId === 'home' ? 'overview' : sectionId;
    setActiveSection(target);
    if (target === 'notes') setOpenNoteId(id);
    setHighlightId(id);
    setHighlightFolderId(folderId);
    setMobileSidebarOpen(false);

    const params = {};
    if (target !== 'overview') params.section = target;
    if (id) {
      if (target === 'notes') params.noteId = id;
      else params.id = id;
    }
    if (folderId) params.folderId = folderId;

    if (target === 'overview' && !id && !folderId) {
      setSearchParams({});
    } else {
      setSearchParams(params);
    }
  };

  const handleSectionChange = (sectionId) => {
    handleNavigateSection(sectionId);
  };

  useEffect(() => {
    if (user) {
      setUserName(localStorage.getItem('dos_profile_name') || user.displayName || user.username || 'Developer');
    }
  }, [user]);

  // Track space visit
  useEffect(() => {
    if (space && space._id && user && user._id) {
      try {
        const key = `dos_recent_spaces_${user._id}`;
        const recent = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = recent.filter(item => item._id !== space._id);
        updated.unshift({
          _id: space._id,
          openedAt: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(updated.slice(0, 5)));
      } catch (err) {
        console.error('Error tracking space visit:', err);
      }
    }
  }, [space, user]);

  const { data: activity = [] } = useQuery({
    queryKey: ['history', spaceId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/history?spaceId=${spaceId}`);
        return data.slice(0, 5);
      } catch { return []; }
    },
    staleTime: 30000,
  });

  const bg = 'var(--bg-color)';
  const sidebarBg = isLight ? '#ffffff' : '#08080c';
  const sidebarBrd = isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)';
  const mainBg = 'var(--bg-color)';
  const cardBg = 'var(--card-bg)';
  const cardBorder = 'var(--card-border)';
  const navBg = isLight ? 'rgba(250,250,250,0.92)' : 'rgba(8, 8, 12, 0.92)';
  const navBorder = 'var(--nav-border)';

  const accent = 'var(--accent-color)';
  const accentBg = isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)';
  const accentText = accent;

  const textColor = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const textSub = 'var(--text-muted)';

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', border: `2.5px solid ${sidebarBrd}`, borderTopColor: accent, borderRadius: '50%', animation: 'sd-spin 0.7s linear infinite' }} />
          <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: '13px', color: textMuted, fontWeight: 500 }}>Loading workspace…</span>
        </div>
      </div>
    );
  }

  if (error || !space) {
    return <NotFoundPage />;
  }





  const handleAddModule = async (moduleId) => {
    if (enabledModules.includes(moduleId)) return;
    setAddingModuleId(moduleId);
    try {
      const rest = enabledModules.filter(m => m !== 'overview' && m !== 'explorer' && m !== moduleId);
      const updated = ['overview', 'explorer', ...rest, moduleId];
      const targetId = space?._id || spaceId;
      const res = await api.patch(`/api/spaces/${targetId}`, { enabledModules: updated });
      if (res.data) {
        queryClient.setQueryData(['space', spaceId], res.data);
      }
      await queryClient.invalidateQueries({ queryKey: ['space', spaceId] });
      await queryClient.invalidateQueries({ queryKey: ['spaces'] });
      const modLabel = getModuleById(moduleId)?.label || moduleId;
      message.success(`Added ${modLabel} to your Space!`);
      setShowAddModuleModal(false);
      handleSectionChange(moduleId);
    } catch (err) {
      console.error('Error adding module:', err);
      message.error(err?.response?.data?.error || 'Failed to add module');
    } finally {
      setAddingModuleId(null);
    }
  };

  const SectionComp = SECTIONS[activeSection] || SECTIONS.home || SECTIONS.docs;

  const sidebarContent = (isMobile = false) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: sidebarBg,
    }}>
      {/* Brand */}
      <div
        style={{
          padding: isMobile ? '16px 20px' : (isHovered ? '16px 20px' : '16px 14px'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '52px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          borderBottom: `1px solid ${sidebarBrd}`,
        }}
      >
        <div
          onClick={() => navigate(`/u/${encodeURIComponent(user?.username || 'user')}/dashboard`)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', flexShrink: 0 }}>
            <OnlyLogo />
          </div>
          {(isMobile || isHovered) && (
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '16px',
              color: textColor,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}>
              DevOneStack
            </span>
          )}
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.06)',
              color: textColor,
              cursor: 'pointer',
            }}
          >
            <RiCloseLine size={20} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {visibleSidebarItems.map(item => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <Tooltip key={item.id} title={!isHovered && !isMobile ? item.label : ''} placement="right">
              <button
                type="button"
                onClick={() => handleSectionChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? accentBg : 'transparent',
                  color: isActive ? accentText : textMuted,
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                  transition: 'background 0.15s, color 0.15s, border-left-color 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  minHeight: '40px',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = textColor; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                {(isMobile || isHovered) && (
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    marginLeft: '12px',
                  }}>
                    {item.label}
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}

        {/* Add Module Button */}
        {availableToAddModules.length > 0 && (
          <Tooltip title={!isHovered && !isMobile ? 'Add Module' : ''} placement="right">
            <button
              type="button"
              onClick={() => setShowAddModuleModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px dashed ${isLight ? '#cbd5e1' : 'rgba(255,255,255,0.15)'}`,
                background: isLight ? 'rgba(79,70,229,0.03)' : 'rgba(99,102,241,0.04)',
                color: accent,
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                marginTop: '6px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                minHeight: '36px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isLight ? 'rgba(79,70,229,0.03)' : 'rgba(99,102,241,0.04)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
                <RiAddLine size={16} />
              </div>
              {(isMobile || isHovered) && (
                <span style={{ fontSize: '12px', fontWeight: 600, marginLeft: '12px' }}>
                  + Add Module
                </span>
              )}
            </button>
          </Tooltip>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px', borderTop: `1px solid ${sidebarBrd}` }}>
        <Tooltip title={!isHovered && !isMobile ? 'Settings' : ''} placement="right">
          <button
            type="button"
            onClick={() => handleSectionChange('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeSection === 'settings' ? accentBg : 'transparent',
              color: activeSection === 'settings' ? accentText : textMuted,
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: activeSection === 'settings' ? 600 : 500,
              cursor: 'pointer',
              width: '100%',
              whiteSpace: 'nowrap',
              borderLeft: activeSection === 'settings' ? `3px solid ${accent}` : '3px solid transparent',
              overflow: 'hidden',
              minHeight: '40px',
            }}
            onMouseEnter={e => { if (activeSection !== 'settings') { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = textColor; } }}
            onMouseLeave={e => { if (activeSection !== 'settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
              <RiSettings3Line size={18} />
            </div>
            {(isMobile || isHovered) && (
              <span style={{
                fontSize: '13px',
                fontWeight: activeSection === 'settings' ? 600 : 500,
                marginLeft: '12px',
              }}>
                Settings
              </span>
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: bg, transition: 'background 0.3s ease', position: 'relative' }}>

      {/* Spacer to reserve space for collapsed sidebar on desktop */}
      <div className="space-sidebar-spacer" style={{ width: '64px', height: '100vh', flexShrink: 0 }} />

      {/* ── Desktop Hover Sidebar ────────────────────────────────────────── */}
      <aside
        className="space-desktop-sidebar"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: isHovered ? '220px' : '64px',
          height: '100vh',
          zIndex: 800,
          transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 220ms ease',
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBrd}`,
          boxShadow: isHovered
            ? (isLight ? '0 0 20px rgba(0,0,0,0.06), 4px 0 24px rgba(0,0,0,0.06)' : '0 0 20px rgba(0,0,0,0.4), 4px 0 24px rgba(0,0,0,0.5)')
            : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {sidebarContent(false)}
      </aside>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              key="mobile-space-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />
            <motion.aside
              key="mobile-space-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: 'min(280px, 85vw)',
                zIndex: 1001,
                boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: mainBg }}>

        {/* Top bar */}
        <header style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(12px, 3vw, 24px)',
          gap: '12px',
          flexShrink: 0,
          background: navBg,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${navBorder}`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'background 0.3s ease',
        }}>
          {/* Left Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="space-sidebar-mobile-toggle"
              aria-label="Open workspace navigation"
              style={{
                display: 'none', // shown via CSS on mobile/tablet
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: `1px solid ${sidebarBrd}`,
                background: 'transparent',
                color: textColor,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <RiMenuLine size={19} />
            </button>

            <button
              type="button"
              onClick={() => navigate(`/u/${encodeURIComponent(user?.username || 'user')}/dashboard`)}
              aria-label="Back to Dashboard"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: textMuted,
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                borderRadius: '6px',
                transition: 'color 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = textColor}
              onMouseLeave={e => e.currentTarget.style.color = textMuted}
            >
              <RiArrowLeftLine size={18} />
            </button>

            <span style={{ height: '14px', width: '1px', background: sidebarBrd, flexShrink: 0 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
              <SpaceIcon iconKey={space.iconKey || space.icon} size={16} />
              <span style={{
                fontSize: '14px',
                fontWeight: 700,
                color: textColor,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {space.name}
              </span>
            </div>

            {space.tags?.slice(0, 1).map(t => (
              <span
                key={t}
                className="space-header-tag"
                style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: isLight ? '#f0f0f0' : '#1e1e1e',
                  border: `1px solid ${sidebarBrd}`,
                  color: textMuted,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Center search (Opens Command Palette) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '340px', minWidth: '40px' }}>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search within space (⌘K)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                height: '34px',
                padding: '0 12px',
                borderRadius: '20px',
                border: `1px solid ${sidebarBrd}`,
                background: isLight ? '#ffffff' : '#141418',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                minWidth: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = sidebarBrd}
            >
              <RiSearchLine size={13} style={{ color: textMuted, flexShrink: 0 }} />
              <span style={{
                flex: 1,
                textAlign: 'left',
                fontSize: '12px',
                color: textMuted,
                opacity: 0.8,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                Search anything…
              </span>
              <span style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                background: isLight ? '#f5f5f5' : '#222228',
                border: `1px solid ${sidebarBrd}`,
                color: textSub,
                flexShrink: 0,
              }}>
                ⌘K
              </span>
            </button>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                message.success('Space URL copied to clipboard!');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: `1px solid ${sidebarBrd}`,
                background: 'transparent',
                color: textMuted,
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s ease',
                minHeight: '34px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = textColor;
                e.currentTarget.style.borderColor = accent;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = textMuted;
                e.currentTarget.style.borderColor = sidebarBrd;
              }}
            >
              <RiShareLine size={14} />
              <span className="space-share-btn-text">Share</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main
          data-lenis-prevent
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            height: '100%',
            overflowY: activeSection === 'notes' ? 'hidden' : 'auto',
            padding: activeSection === 'notes' ? '0' : 'clamp(16px, 3.5vw, 28px)',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent',
            boxSizing: 'border-box',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                maxWidth: activeSection === 'notes' ? '100%' : '1200px',
                margin: activeSection === 'notes' ? '0' : '0 auto',
                width: '100%',
                height: activeSection === 'notes' ? '100%' : 'auto',
                flex: activeSection === 'notes' ? 1 : 'none',
                display: activeSection === 'notes' ? 'flex' : 'block',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              {activeSection !== 'notes' && activeSection !== 'overview' && activeSection !== 'explorer' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <h2 style={{
                    fontSize: 'clamp(18px, 3vw, 22px)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                    letterSpacing: '-0.01em',
                  }}>
                    {activeSection === 'snippets' ? 'Snippets'
                      : activeSection === 'settings' ? 'Settings'
                        : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 0 }}>
                    {activeSection === 'docs' ? 'Documentation, guides, and links'
                      : activeSection === 'learnings' ? 'Key takeaways, bug fixes, and knowledge items'
                        : activeSection === 'snippets' ? 'Reusable code blocks and syntax solutions'
                          : activeSection === 'repos' ? 'GitHub and repository bookmarks'
                            : activeSection === 'prompts' ? 'AI prompts and templates'
                              : activeSection === 'communities' ? 'Discussion forums and community channels'
                                : activeSection === 'tags' ? 'Categories and cross-resource indexing'
                                  : activeSection === 'settings' ? 'Manage your Space settings'
                                    : ''}
                  </p>
                </div>
              )}

              <div style={{
                flex: activeSection === 'notes' ? 1 : 'none',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                height: activeSection === 'notes' ? '100%' : 'auto',
                width: '100%',
                background: (activeSection === 'notes' || activeSection === 'overview' || activeSection === 'explorer') ? 'transparent' : cardBg,
                border: (activeSection === 'notes' || activeSection === 'overview' || activeSection === 'explorer') ? 'none' : `1px solid ${cardBorder}`,
                borderRadius: activeSection === 'notes' ? 0 : '14px',
                padding: activeSection === 'settings' ? '20px' : '0',
                overflow: 'hidden',
              }}>
                {SectionComp && (
                  <SectionComp
                    space={space}
                    isLight={isLight}
                    openNoteId={openNoteId}
                    highlightId={highlightId}
                    highlightFolderId={highlightFolderId}
                    onNavigateSection={handleNavigateSection}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <NewSpaceModal open={newSpaceOpen} onClose={() => setNewSpaceOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* ── Quick Add Modals ── */}
      {space && (
        <>
          <QuickAddNoteModal open={quickAddModal === 'notes'} onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddLearningModal open={quickAddModal === 'learnings'} onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddSnippetModal open={quickAddModal === 'snippets'} onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddDocModal open={quickAddModal === 'docs'} onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddRepoModal open={quickAddModal === 'repos'} onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddPromptModal open={quickAddModal === 'prompts'} onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddCommunityModal open={quickAddModal === 'communities'} onClose={() => setQuickAddModal(null)} space={space} />
        </>
      )}

      {/* ── Add Module Modal ── */}
      <AnimatePresence>
        {showAddModuleModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModuleModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '480px',
                background: isLight ? '#ffffff' : '#101018',
                border: `1px solid ${cardBorder}`,
                borderRadius: '16px',
                padding: '24px',
                boxShadow: isLight ? '0 20px 40px rgba(0,0,0,0.1)' : '0 20px 50px rgba(0,0,0,0.5)',
                zIndex: 1101,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RiAddLine size={18} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      color: textColor,
                      margin: 0,
                    }}>
                      Add Module to Space
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: textMuted }}>
                      Enable additional tools in your sidebar anytime.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: textMuted,
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = textColor}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <RiCloseLine size={20} />
                </button>
              </div>

              {/* Module List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                {availableToAddModules.map(mod => {
                  const ModIcon = mod.icon;
                  const isAdding = addingModuleId === mod.id;
                  return (
                    <div
                      key={mod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${cardBorder}`,
                        background: isLight ? '#f9fafb' : '#14141e',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isLight ? '#ffffff' : '#1f1f2c',
                          color: 'var(--accent-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: `1px solid ${cardBorder}`,
                        }}>
                          <ModIcon size={16} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: textColor }}>
                            {mod.label}
                          </p>
                          <p style={{ margin: 0, fontSize: '11px', color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAdding}
                        onClick={() => handleAddModule(mod.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--accent-color)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: isAdding ? 'not-allowed' : 'pointer',
                          opacity: isAdding ? 0.7 : 1,
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isAdding ? (
                          <>
                            <RiLoader4Line size={13} className="animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <RiAddLine size={14} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}

                {availableToAddModules.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: textMuted, fontSize: '13px' }}>
                    All available modules are already enabled in this Space!
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

