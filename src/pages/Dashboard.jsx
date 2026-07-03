import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import RecentActivity from '../components/dashboard/RecentActivity';
import CommandPalette from '../components/dashboard/CommandPalette';
import PinnedBoilerplates from '../components/dashboard/PinnedBoilerplates';
import QuickInbox from '../components/dashboard/QuickInbox';
import StackHealthScanner from '../components/dashboard/StackHealthScanner';
import ThemeToggle from '../components/layout/ThemeToggle';

function DashboardContent() {
  const { theme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const isLight = theme === 'light';
  const bg = 'var(--bg-color)';
  const textMuted = 'var(--text-secondary)';
  const divider = isLight ? '#e5e7eb' : '#18181b';

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.3s ease', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Flowing Orbs */}
      <div className="hero-background-flow">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      <DashboardNavbar onSearchOpen={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          maxWidth: '1024px',
          margin: '0 auto',
          padding: '76px 24px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Page title */}
        <div style={{ marginBottom: '8px' }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
            background: isLight 
              ? 'linear-gradient(180deg, #16161a 0%, #4b5563 100%)' 
              : 'linear-gradient(180deg, #ffffff 0%, #a3a3a3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>
            DevOneStack — Organize. Build. Learn.
          </p>
        </div>

        {/* YOUR WORKSPACE label */}
        <p style={{
          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
          color: textMuted, fontWeight: 600, margin: '4px 0 2px',
        }}>
          Your Workspace
        </p>

        {/* Widget 1 — full width horizontal scroll boilerplates */}
        <PinnedBoilerplates />

        {/* Widget 2 — Quick Inbox */}
        <QuickInbox />

        {/* Widget 3 — Stack Health Scanner */}
        <StackHealthScanner />

        {/* Divider */}
        <div style={{ height: '1px', background: divider, margin: '8px 0' }} />

        {/* Recent activity */}
        <RecentActivity />
      </motion.main>

      {/* Single ThemeToggle — same component used on homepage */}
      <ThemeToggle />
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
