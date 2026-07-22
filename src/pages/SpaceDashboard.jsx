import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tooltip, message } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ThemeToggle from '../components/layout/ThemeToggle';
import NewSpaceModal from '../components/dashboard/NewSpaceModal';
import {
  RiArrowLeftLine, RiMenuLine, RiShareLine, RiSearchLine,
  RiHome4Line, RiFileTextLine, RiLightbulbLine, RiCodeSSlashLine,
  RiGitRepositoryLine, RiRobot2Line, RiTeamLine, RiPriceTag3Line,
  RiSettings3Line, RiAddLine, RiHistoryLine, RiFlashlightLine,
} from 'react-icons/ri';
import Logo from '../components/layout/Logo';
import OnlyLogo from '../components/layout/OnlyLogo';
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
  QuickAddLearningModal,
  QuickAddSnippetModal,
  QuickAddDocModal,
  QuickAddRepoModal,
  QuickAddPromptModal,
  QuickAddCommunityModal,
} from '../components/spaces/QuickAddModals';

const SIDEBAR_ITEMS = [
  { id: 'home', icon: RiHome4Line, label: 'Overview' },
  { id: 'learnings', icon: RiLightbulbLine, label: 'Learnings' },
  { id: 'snippets', icon: RiCodeSSlashLine, label: 'Snippets' },
  { id: 'docs', icon: RiFileTextLine, label: 'Docs' },
  { id: 'repos', icon: RiGitRepositoryLine, label: 'Repos' },
  { id: 'prompts', icon: RiRobot2Line, label: 'Prompts' },
  { id: 'communities', icon: RiTeamLine, label: 'Communities' },
  { id: 'tags', icon: RiPriceTag3Line, label: 'Tags' },
];

// Each stat card gets its own accent color to match the screenshot
const STAT_CARDS = [
  { key: 'docsCount', icon: RiFileTextLine, label: 'Docs', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#60a5fa' },
  { key: 'learningsCount', icon: RiLightbulbLine, label: 'Learnings', iconBg: 'rgba(234,179,8,0.15)', iconColor: '#eab308' },
  { key: 'snippetsCount', icon: RiCodeSSlashLine, label: 'Snippets', iconBg: 'rgba(99,102,241,0.15)', iconColor: '#818cf8' },
  { key: 'reposCount', icon: RiGitRepositoryLine, label: 'Repos', iconBg: 'rgba(249,115,22,0.15)', iconColor: '#fb923c' },
  { key: 'promptsCount', icon: RiRobot2Line, label: 'Prompts', iconBg: 'rgba(236,72,153,0.15)', iconColor: '#f472b6' },
  { key: 'communitiesCount', icon: RiTeamLine, label: 'Communities', iconBg: 'rgba(6,182,212,0.15)', iconColor: '#22d3ee' },
];

// ── Empty section template ────────────────────────────────────────────────────
function EmptySection({ icon: Icon, title, body, btnLabel, accent }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '80px 24px', gap: '16px', textAlign: 'center',
    }}>
      <Icon size={48} style={{ color: 'var(--text-muted)' }} />
      <div>
        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-color)', margin: '0 0 8px' }}>{title}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 0 20px', lineHeight: 1.6 }}>{body}</p>
        {btnLabel && (
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 20px', borderRadius: '10px',
            border: '1px solid var(--card-border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '13px', fontWeight: 600,
            cursor: 'default', fontFamily: 'var(--font-body)',
          }}>
            <RiAddLine /> {btnLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Section content per tab ───────────────────────────────────────────────────
const SECTIONS = {
  docs: ({ space, isLight, highlightId }) => <DocsSection space={space} isLight={isLight} highlightId={highlightId} />,
  learnings: ({ space, isLight, highlightId }) => <LearningsSection space={space} isLight={isLight} highlightId={highlightId} />,
  snippets: ({ space, isLight, highlightId }) => <SnippetsSection space={space} isLight={isLight} highlightId={highlightId} />,
  repos: ({ space, isLight, highlightId }) => <ReposSection space={space} isLight={isLight} highlightId={highlightId} />,
  prompts: ({ space, isLight, highlightId }) => <PromptsSection space={space} isLight={isLight} highlightId={highlightId} />,
  communities: ({ space, isLight, highlightId }) => <CommunitiesSection space={space} isLight={isLight} highlightId={highlightId} />,
  tags: ({ space, isLight }) => <TagsSection space={space} isLight={isLight} />,
  settings: ({ space, isLight }) => <SettingsSection space={space} isLight={isLight} />,
};

// ── CountUp animation hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

function StatCard({ stat, value, isLight }) {
  const count = useCountUp(value);
  const Icon = stat.icon;
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      borderRadius: '12px', padding: '18px 16px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      transition: 'border-color 0.2s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
    >
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px',
        background: stat.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: stat.iconColor,
        flexShrink: 0,
      }}>
        <Icon size={17} />
      </div>
      <div>
        <div style={{
          fontSize: '26px', fontWeight: 600, lineHeight: 1,
          color: 'var(--text-color)',
          fontFamily: 'var(--font-display)',
        }}>
          {count}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
          {stat.label}
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SpaceDashboard() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isLight = theme === 'light';

  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [userName, setUserName] = useState('Developer');
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [openNoteId, setOpenNoteId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [quickAddModal, setQuickAddModal] = useState(null); // 'learnings'|'snippets'|'docs'|'repos'|'prompts'|'communities'|null

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

    if (section) setActiveSection(section);
    if (noteId) setOpenNoteId(noteId);
    if (id) setHighlightId(id);
  }, [searchParams]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setOpenNoteId(null);
    setHighlightId(null);
    if (sectionId === 'home') {
      setSearchParams({});
    } else {
      setSearchParams({ section: sectionId });
    }
  };

  useEffect(() => {
    if (user) {
      setUserName(localStorage.getItem('dos_profile_name') || user.displayName || user.username || 'Developer');
    }
  }, [user]);

  const { data: space, isLoading, error } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: async () => {
      const { data } = await api.get(`/api/spaces/${spaceId}`);
      return data;
    },
    retry: false,
  });

  // Track space visit for "Continue Where You Left Off" widget
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

  // ── Theme tokens ── matching user dashboard (Dashboard.jsx) theme colors
  const bg = 'var(--bg-color)';
  const sidebarBg = isLight ? '#ffffff' : '#08080c';
  const sidebarBrd = isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)';
  const mainBg = 'var(--bg-color)';
  const cardBg = 'var(--card-bg)';
  const cardBorder = 'var(--card-border)';
  const navBg = isLight ? 'rgba(250,250,250,0.92)' : 'rgba(8, 8, 12, 0.92)';
  const navBorder = 'var(--nav-border)';

  // Indigo/violet accent
  const accent = 'var(--accent-color)';
  const accentBg = isLight ? 'rgba(79,70,229,0.05)' : 'rgba(99,102,241,0.08)';
  const accentText = accent;

  const textColor = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const textSub = 'var(--text-muted)';

  // ── Loading ──
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

  // ── 404 ──
  if (error || !space) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, gap: '16px', textAlign: 'center', padding: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: textColor, margin: 0 }}>Workspace not found</h2>
        <p style={{ fontSize: '13px', color: textMuted, maxWidth: '320px', margin: 0, lineHeight: 1.6 }}>
          This space doesn't exist or you don't have access to it.
        </p>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: accent, color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <RiArrowLeftLine /> Back to Dashboard
        </button>
      </div>
    );
  }

  const SectionComp = SECTIONS[activeSection];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: bg, transition: 'background 0.3s ease', position: 'relative' }}>

      {/* Spacer to reserve space for collapsed sidebar */}
      <div style={{ width: '70px', height: '100vh', flexShrink: 0 }} />

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: isHovered ? '220px' : '64px',
          height: '100vh',
          zIndex: 1000,
          transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms ease',
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
        {/* Brand */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '16px 14px 12px',
            paddingLeft: isHovered ? '24px' : '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '52px',
            cursor: 'pointer',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'padding-left 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', flexShrink: 0 }}>
            <OnlyLogo />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '16px',
            color: textColor,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}>
            DevOneStack
          </span>
        </div>


        {/* Nav items */}
        <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', padding: '2px 8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {SIDEBAR_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <Tooltip key={item.id} title={!isHovered ? item.label : ''} placement="right">
                <button
                  onClick={() => handleSectionChange(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 0',
                    paddingLeft: isHovered ? '14px' : '11px',
                    borderRadius: '8px', border: 'none',
                    background: isActive ? accentBg : 'transparent',
                    color: isActive ? accentText : textMuted,
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                    transition: 'padding-left 250ms cubic-bezier(0.4, 0, 0.2, 1), background 0.15s, color 0.15s, border-left-color 0.15s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = textColor; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                  <span style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                    transition: 'opacity 200ms ease, transform 200ms ease',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    marginLeft: '12px',
                  }}>
                    {item.label}
                  </span>
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px', borderTop: `1px solid ${sidebarBrd}`, display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <Tooltip title={!isHovered ? 'Settings' : ''} placement="right">
            <button
              onClick={() => handleSectionChange('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 0',
                paddingLeft: isHovered ? '14px' : '11px',
                borderRadius: '8px', border: 'none',
                background: activeSection === 'settings' ? accentBg : 'transparent',
                color: activeSection === 'settings' ? accentText : textMuted,
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: activeSection === 'settings' ? 600 : 500,
                cursor: 'pointer', width: '100%', whiteSpace: 'nowrap',
                transition: 'padding-left 250ms cubic-bezier(0.4, 0, 0.2, 1), background 0.15s, color 0.15s, border-left-color 0.15s',
                borderLeft: activeSection === 'settings' ? `3px solid ${accent}` : '3px solid transparent',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (activeSection !== 'settings') { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = textColor; } }}
              onMouseLeave={e => { if (activeSection !== 'settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
                <RiSettings3Line size={20} />
              </div>
              <span style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                transition: 'opacity 200ms ease, transform 200ms ease',
                fontSize: '13px',
                fontWeight: activeSection === 'settings' ? 600 : 500,
                marginLeft: '12px',
              }}>
                Settings
              </span>
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: mainBg }}>

        {/* Top bar */}
        <header style={{
          height: '52px', display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: '12px', flexShrink: 0,
          background: navBg, backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${navBorder}`,
          position: 'sticky', top: 0, zIndex: 50,
          transition: 'background 0.3s ease',
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px', transition: 'color 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = textColor}
              onMouseLeave={e => e.currentTarget.style.color = textMuted}>
              <RiArrowLeftLine size={17} />
            </button>
            <span style={{ height: '14px', width: '1px', background: sidebarBrd }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SpaceIcon iconKey={space.iconKey || space.icon} size={16} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: textColor, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                {space.name}
              </span>
            </div>
            {space.tags?.slice(0, 2).map(t => (
              <span key={t} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: isLight ? '#f0f0f0' : '#1e1e1e', border: `1px solid ${sidebarBrd}`, color: textMuted, fontWeight: 500 }}>
                {t}
              </span>
            ))}
          </div>

          {/* Center search */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '340px', height: '32px', padding: '0 12px', borderRadius: '20px', border: `1px solid ${sidebarBrd}`, background: isLight ? '#ffffff' : '#1a1a1a', cursor: 'text' }}>
              <RiSearchLine size={13} style={{ color: textMuted }} />
              <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', color: textMuted, opacity: 0.7 }}>Search anything…</span>
              <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: isLight ? '#f5f5f5' : '#242424', border: `1px solid ${sidebarBrd}`, color: textSub }}>⌘K</span>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* TODO: implement share functionality */}
            <button
              onClick={() => message.info('Sharing coming soon!')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 13px', borderRadius: '8px', border: `1px solid ${sidebarBrd}`, background: 'transparent', color: textMuted, fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = textColor; e.currentTarget.style.borderColor = isLight ? '#aaaaaa' : '#444444'; }}
              onMouseLeave={e => { e.currentTarget.style.color = textMuted; e.currentTarget.style.borderColor = sidebarBrd; }}
            >
              <RiShareLine size={14} /> Share
            </button>
          </div>
        </header>

        {/* Content */}
        <main
          data-lenis-prevent
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent',
          }}
        >
          <AnimatePresence mode="wait">

            {/* ── Home ── */}
            {activeSection === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}
              >
                {/* Welcome */}
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 700, color: textColor, margin: '0 0 4px', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                    Welcome back, {userName.split(' ')[0]} 👋
                  </h1>
                  <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>
                    Your {space.name} workspace is ready.
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {STAT_CARDS.map(stat => (
                    <StatCard key={stat.key} stat={stat} value={space[stat.key] || 0} isLight={isLight} />
                  ))}
                </div>

                {/* Recent Activity + Quick Add side-by-side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>

                  {/* ── Recent Activity Timeline ── */}
                  <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '14px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: textColor, margin: 0, letterSpacing: '-0.01em' }}>
                        Recent Activity
                      </p>

                    </div>

                    {activity.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '32px 0', textAlign: 'center' }}>
                        <RiHistoryLine size={36} style={{ color: textSub }} />
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: textColor, margin: '0 0 4px' }}>No activity yet</p>
                          <p style={{ fontSize: '12px', color: textMuted, margin: 0, lineHeight: 1.5 }}>
                            Start adding docs, notes, or snippets — your activity will appear here.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', position: 'relative' }}>
                        {/* Vertical timeline line */}
                        <div style={{
                          position: 'absolute',
                          left: '15px',
                          top: '6px',
                          bottom: '6px',
                          width: '2px',
                          background: isLight ? '#e5e5e5' : 'rgba(255,255,255,0.06)',
                          borderRadius: '1px',
                          zIndex: 0,
                        }} />

                        {activity.map((item, i) => {
                          // Determine activity type for icon/color from the action field
                          const actionMap = {
                            created_learning: { icon: RiLightbulbLine, color: '#eab308', bg: 'rgba(234,179,8,0.12)', tag: 'Learning' },
                            created_snippet: { icon: RiCodeSSlashLine, color: '#818cf8', bg: 'rgba(99,102,241,0.12)', tag: 'Snippet' },
                            created_doc: { icon: RiFileTextLine, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', tag: 'Doc' },
                            created_repo: { icon: RiGitRepositoryLine, color: '#fb923c', bg: 'rgba(249,115,22,0.12)', tag: 'Repository' },
                            created_prompt: { icon: RiRobot2Line, color: '#f472b6', bg: 'rgba(236,72,153,0.12)', tag: 'Prompt' },
                            created_community: { icon: RiTeamLine, color: '#22d3ee', bg: 'rgba(6,182,212,0.12)', tag: 'Community' },
                          };
                          const meta = actionMap[item.action] || { icon: RiHistoryLine, color: isLight ? '#888' : '#666', bg: isLight ? '#f0f0f0' : 'rgba(255,255,255,0.06)', tag: item.action?.replace('created_', '').replace('_', ' ') || 'Activity' };
                          const ActIcon = meta.icon;

                          return (
                            <div
                              key={item._id || i}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '10px 10px 10px 0', position: 'relative',
                                borderRadius: '9px', transition: 'background 0.15s ease',
                                cursor: 'default',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {/* Timeline dot + icon */}
                              <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: meta.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, zIndex: 1,
                                color: meta.color,
                                border: `2px solid ${isLight ? '#fff' : '#0a0a10'}`,
                              }}>
                                <ActIcon size={14} />
                              </div>

                              {/* Label + tag */}
                              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                  {item.label}
                                </p>
                                <span style={{
                                  fontSize: '10px', fontWeight: 600,
                                  padding: '2px 8px', borderRadius: '20px',
                                  background: meta.bg, color: meta.color,
                                  whiteSpace: 'nowrap',
                                  letterSpacing: '0.02em',
                                }}>
                                  {meta.tag}
                                </span>
                              </div>

                              {/* Timestamp */}
                              <span style={{ fontSize: '11px', color: textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {timeAgo(item.createdAt)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Quick Add Panel ── */}
                  <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                      <RiFlashlightLine size={15} style={{ color: '#eab308' }} />
                      <p style={{
                        fontSize: '12px', fontWeight: 800, color: textColor,
                        margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase',
                        fontFamily: 'var(--font-display)',
                      }}>
                        Quick Add
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
                      {[
                        { label: 'Learning', section: 'learnings', icon: RiLightbulbLine, color: '#eab308', bg: 'rgba(234,179,8,0.08)' },
                        { label: 'Snippet', section: 'snippets', icon: RiCodeSSlashLine, color: '#818cf8', bg: 'rgba(99,102,241,0.08)' },
                        { label: 'Doc', section: 'docs', icon: RiFileTextLine, color: '#60a5fa', bg: 'rgba(59,130,246,0.08)' },
                        { label: 'Repository', section: 'repos', icon: RiGitRepositoryLine, color: '#fb923c', bg: 'rgba(249,115,22,0.08)' },
                        { label: 'Prompt', section: 'prompts', icon: RiRobot2Line, color: '#f472b6', bg: 'rgba(236,72,153,0.08)' },
                        { label: 'Community', section: 'communities', icon: RiTeamLine, color: '#22d3ee', bg: 'rgba(6,182,212,0.08)' },
                      ].map(qa => {
                        const QaIcon = qa.icon;
                        return (
                          <button
                            key={qa.section}
                            onClick={() => setQuickAddModal(qa.section)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '12px 14px', borderRadius: '10px',
                              border: `1px solid ${isLight ? '#e8e8e8' : 'rgba(255,255,255,0.07)'}`,
                              background: 'transparent',
                              color: textColor,
                              fontSize: '13px', fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: 'var(--font-body)',
                              transition: 'all 0.2s ease',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = qa.bg;
                              e.currentTarget.style.borderColor = qa.color + '44';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = isLight ? '#e8e8e8' : 'rgba(255,255,255,0.07)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '7px',
                              background: qa.bg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: qa.color, flexShrink: 0,
                            }}>
                              <QaIcon size={14} />
                            </div>
                            <span>+ {qa.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </motion.div>

            ) : (
              /* ── Sub section ── */
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ maxWidth: '1200px' }}
              >
                {/* Section heading */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                    letterSpacing: '-0.01em',
                  }}>
                    {activeSection === 'snippets' ? 'Boilerplates & Snippets'
                      : activeSection === 'settings' ? 'Settings'
                        : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 0 }}>
                    {activeSection === 'docs' ? 'Reference documents, PDFs and external links'
                      : activeSection === 'learnings' ? 'Structured developer learnings and logs'
                        : activeSection === 'snippets' ? 'Reusable boilerplates, scripts and configuration'
                          : activeSection === 'repos' ? 'Tracked code repositories and platforms'
                            : activeSection === 'prompts' ? 'Saved AI prompt engineering templates'
                              : activeSection === 'communities' ? 'Linked developer communities and channels'
                                : activeSection === 'tags' ? 'Manage workspace tags and taxonomy'
                                  : activeSection === 'settings' ? 'Customize space workspace settings'
                                    : ''}
                  </p>
                </div>

                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '14px', minHeight: '300px', padding: activeSection === 'settings' ? '24px' : '0' }}>
                  {SectionComp && <SectionComp space={space} isLight={isLight} openNoteId={openNoteId} highlightId={highlightId} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ThemeToggle />
      <NewSpaceModal open={newSpaceOpen} onClose={() => setNewSpaceOpen(false)} />

      {/* ── Quick Add Modals (rendered at dashboard home level) ── */}
      {space && (
        <>
          <QuickAddLearningModal   open={quickAddModal === 'learnings'}   onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddSnippetModal    open={quickAddModal === 'snippets'}    onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddDocModal        open={quickAddModal === 'docs'}        onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddRepoModal       open={quickAddModal === 'repos'}       onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddPromptModal     open={quickAddModal === 'prompts'}     onClose={() => setQuickAddModal(null)} space={space} />
          <QuickAddCommunityModal  open={quickAddModal === 'communities'} onClose={() => setQuickAddModal(null)} space={space} />
        </>
      )}
    </div>
  );
}
