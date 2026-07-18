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
  RiHome4Line, RiFileTextLine, RiStickyNoteLine, RiCodeSSlashLine,
  RiGitRepositoryLine, RiRobot2Line, RiTeamLine, RiPriceTag3Line,
  RiSettings3Line, RiAddLine, RiHistoryLine,
} from 'react-icons/ri';
import Logo from '../components/layout/Logo';
import OnlyLogo from '../components/layout/OnlyLogo';
import DocsSection from '../components/spaces/DocsSection';
import NotesSection from '../components/spaces/NotesSection';
import SnippetsSection from '../components/spaces/SnippetsSection';
import ReposSection from '../components/spaces/ReposSection';
import PromptsSection from '../components/spaces/PromptsSection';
import CommunitiesSection from '../components/spaces/CommunitiesSection';
import TagsSection from '../components/spaces/TagsSection';
import SettingsSection from '../components/spaces/SettingsSection';
import SpaceIcon from '../components/spaces/SpaceIcon';

const SIDEBAR_ITEMS = [
  { id: 'home', icon: RiHome4Line, label: 'Home' },
  { id: 'docs', icon: RiFileTextLine, label: 'Docs' },
  { id: 'notes', icon: RiStickyNoteLine, label: 'Notes' },
  { id: 'snippets', icon: RiCodeSSlashLine, label: 'Snippets' },
  { id: 'repos', icon: RiGitRepositoryLine, label: 'Repos' },
  { id: 'prompts', icon: RiRobot2Line, label: 'Prompts' },
  { id: 'communities', icon: RiTeamLine, label: 'Communities' },
  { id: 'tags', icon: RiPriceTag3Line, label: 'Tags' },
];

// Each stat card gets its own accent color to match the screenshot
const STAT_CARDS = [
  { key: 'docsCount', icon: RiFileTextLine, label: 'Docs', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#60a5fa' },
  { key: 'notesCount', icon: RiStickyNoteLine, label: 'Notes', iconBg: 'rgba(139,92,246,0.15)', iconColor: '#a78bfa' },
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
      <Icon size={48} style={{ color: isLight ? '#bbbbbb' : '#444444' }} />
      <div>
        <p style={{ fontSize: '16px', fontWeight: 700, color: isLight ? '#111111' : '#ffffff', margin: '0 0 8px' }}>{title}</p>
        <p style={{ fontSize: '13px', color: isLight ? '#666666' : '#888888', maxWidth: '340px', margin: '0 0 20px', lineHeight: 1.6 }}>{body}</p>
        {btnLabel && (
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 20px', borderRadius: '10px',
            border: `1px solid ${isLight ? '#e5e5e5' : '#2a2a2a'}`,
            background: 'transparent',
            color: isLight ? '#333333' : '#cccccc',
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
  notes: ({ space, isLight, openNoteId }) => <NotesSection space={space} isLight={isLight} openNoteId={openNoteId} />,
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
      background: isLight ? '#ffffff' : '#161616',
      border: `1px solid ${isLight ? '#ebebeb' : '#242424'}`,
      borderRadius: '12px', padding: '18px 16px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      transition: 'border-color 0.2s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = isLight ? '#cccccc' : '#3a3a3a'}
      onMouseLeave={e => e.currentTarget.style.borderColor = isLight ? '#ebebeb' : '#242424'}
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
          color: isLight ? '#111111' : '#ffffff',
          fontFamily: 'var(--font-display)',
        }}>
          {count}
        </div>
        <div style={{ fontSize: '12px', color: isLight ? '#999999' : '#666666', marginTop: '4px', fontWeight: 500 }}>
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
  const queryClient = useQueryClient();
  const isLight = theme === 'light';

  const [collapsed, setCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [userName, setUserName] = useState('Developer');
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [openNoteId, setOpenNoteId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (import.meta.env.DEV) {
      api.patch(`/api/spaces/${spaceId}/recount`)
        .then(r => console.log('Recount result:', r.data.counts))
        .catch(err => console.error('Recount error:', err));
    }
  }, [spaceId]);

  useEffect(() => {
    const section = searchParams.get('section');
    const noteId  = searchParams.get('noteId');
    const id      = searchParams.get('id');

    if (section) setActiveSection(section);
    if (noteId)  setOpenNoteId(noteId);
    if (id)      setHighlightId(id);
  }, [searchParams]);

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

  // ── Theme tokens ── matching screenshot precisely
  const bg = isLight ? '#f2f2f7' : '#0d0d0d';
  const sidebarBg = isLight ? '#ffffff' : '#111111';
  const sidebarBrd = isLight ? '#ebebeb' : '#1e1e1e';
  const mainBg = isLight ? '#f2f2f7' : '#0d0d0d';
  const cardBg = isLight ? '#ffffff' : '#161616';
  const cardBorder = isLight ? '#ebebeb' : '#242424';
  const navBg = isLight ? 'rgba(242,242,247,0.92)' : 'rgba(13,13,13,0.92)';
  const navBorder = isLight ? '#e0e0e0' : '#1e1e1e';

  // Indigo/violet accent — matches the active-item highlight in screenshot
  const accent = isLight ? '#4f46e5' : '#6366f1';
  const accentBg = isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)';
  const accentText = accent;

  const textColor = isLight ? '#111111' : '#f0f0f0';
  const textMuted = isLight ? '#888888' : '#666666';
  const textSub = isLight ? '#bbbbbb' : '#444444';

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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: bg, transition: 'background 0.3s ease' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? '56px' : '200px',
        transition: 'width 250ms ease',
        height: '100vh',
        overflow: 'hidden',
        flexShrink: 0,
        background: sidebarBg,
        borderRight: `1px solid ${sidebarBrd}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}>
        {/* Brand + toggle */}
        <div style={{ padding: '14px 12px 10px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '8px', minHeight: '52px' }}>
          {!collapsed && (
            <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: textColor, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              <Logo />
            </div>
          )}
          <button onClick={() => setCollapsed(p => !p)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '6px', flexShrink: 0 }}>
            <RiMenuLine size={16} />
          </button>
        </div>


        {/* Nav items */}
        <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', padding: '2px 8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {SIDEBAR_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <Tooltip key={item.id} title={collapsed ? item.label : ''} placement="right">
                <button
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: '9px',
                    padding: collapsed ? '10px 0' : '8px 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '8px', border: 'none',
                    background: isActive ? accentBg : 'transparent',
                    color: isActive ? accentText : textMuted,
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    borderLeft: isActive ? `2.5px solid ${accent}` : '2.5px solid transparent',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = textColor; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; } }}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px', borderTop: `1px solid ${sidebarBrd}`, display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <Tooltip title={collapsed ? 'Settings' : ''} placement="right">
            <button
              onClick={() => setActiveSection('settings')}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: collapsed ? '10px 0' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '8px', border: 'none',
                background: activeSection === 'settings' ? accentBg : 'transparent',
                color: activeSection === 'settings' ? accentText : textMuted,
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: activeSection === 'settings' ? 600 : 500,
                cursor: 'pointer', width: '100%', whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                borderLeft: activeSection === 'settings' ? `2.5px solid ${accent}` : '2.5px solid transparent',
              }}
              onMouseEnter={e => { if (activeSection !== 'settings') { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = textColor; } }}
              onMouseLeave={e => { if (activeSection !== 'settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; } }}
            >
              <RiSettings3Line size={15} />
              {!collapsed && <span>Settings</span>}
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
                style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}
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

                {/* Recent activity */}
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '14px', padding: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: textColor, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
                    Recent activity
                  </p>

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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {activity.map((item, i) => (
                        <div key={item._id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '9px', transition: 'background 0.15s ease' }}
                          onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f8f8f8' : '#1e1e1e'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accentText, fontSize: '11px', fontWeight: 700 }}>
                            {(item.meta?.spaceName || space.name).slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: textColor }}>{item.label}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: textMuted }}>
                              {timeAgo(item.createdAt)} · {item.meta?.spaceName || space.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                style={{ maxWidth: '1100px' }}
              >
                {/* Section heading */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <h2 style={{
                    fontSize:      20,
                    fontWeight:    600,
                    color:         'var(--text-primary)',
                    marginBottom:  4,
                    letterSpacing: '-0.01em',
                  }}>
                    {activeSection === 'snippets' ? 'Boilerplates & Snippets'
                      : activeSection === 'settings' ? 'Settings'
                        : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 0 }}>
                    {activeSection === 'docs' ? 'Reference documents, PDFs and external links'
                      : activeSection === 'notes' ? 'Concept notes and markdown documentation'
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
    </div>
  );
}
