import React, { useState } from 'react';

// Custom icons for the Sidebar Menu
const menuIcons = {
  Home: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Docs: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  ),
  Notes: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Snippets: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Repos: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  ),
  Prompts: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  Communities: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Tags: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  ),
  Settings: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
};

export default function DashboardMockup() {
  const [activeItem, setActiveItem] = useState('Home');

  const menuItems = [
    { name: 'Home', icon: menuIcons.Home },
    { name: 'Docs', icon: menuIcons.Docs },
    { name: 'Notes', icon: menuIcons.Notes },
    { name: 'Snippets', icon: menuIcons.Snippets },
    { name: 'Repos', icon: menuIcons.Repos },
    { name: 'Prompts', icon: menuIcons.Prompts },
    { name: 'Communities', icon: menuIcons.Communities },
    { name: 'Tags', icon: menuIcons.Tags },
  ];

  const statCards = [
    { label: 'Docs', value: 120, color: 'rgba(59, 130, 246, 0.1)', iconColor: '#3b82f6', icon: menuIcons.Docs },
    { label: 'Notes', value: 86, color: 'rgba(139, 92, 246, 0.1)', iconColor: '#8b5cf6', icon: menuIcons.Notes },
    { label: 'Snippets', value: 54, color: 'rgba(99, 102, 241, 0.1)', iconColor: '#6366f1', icon: menuIcons.Snippets },
    { label: 'Repos', value: 23, color: 'rgba(249, 115, 22, 0.1)', iconColor: '#f97316', icon: menuIcons.Repos },
    { label: 'Prompts', value: 34, color: 'rgba(236, 72, 153, 0.1)', iconColor: '#ec4899', icon: menuIcons.Prompts },
    { label: 'Communities', value: 12, color: 'rgba(6, 182, 212, 0.1)', iconColor: '#06b6d4', icon: menuIcons.Communities },
  ];

  return (
    <div className="dashboard-mockup">
      {/* Sidebar navigation */}
      <div className="db-sidebar">
        <div>
          <div className="db-logo">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L6 7L16 12L26 7L16 2Z" fill="var(--accent-color)" stroke="var(--accent-color)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M6 13L16 18L26 13" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
              <path d="M6 19L16 24L26 19" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            </svg>
            <span>DevOneStack</span>
          </div>

          <div className="db-menu">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className={`db-menu-item ${activeItem === item.name ? 'active' : ''}`}
                onClick={() => setActiveItem(item.name)}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="db-menu-item db-menu-item-bottom">
          {menuIcons.Settings}
          <span>Settings</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="db-main">
        {/* Header greeting & search */}
        <div className="db-header">
          <div className="db-header-left">
            <div className="db-greeting">Welcome back, Developer 👋</div>
            <div className="db-status">Your workspace is ready.</div>
          </div>
          <div className="db-search-container">
            <input type="text" className="db-search-input" placeholder="Search anything..." readOnly />
            <span className="db-search-kbd">⌘ K</span>
            <span className="db-search-icon">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="db-grid">
          {statCards.map((card) => (
            <div key={card.label} className="db-card">
              <div className="db-card-icon-wrapper" style={{ background: card.color, color: card.iconColor }}>
                {card.icon}
              </div>
              <div className="db-card-info">
                <span className="db-card-label">{card.label}</span>
                <span className="db-card-value">{card.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Log */}
        <div className="db-activity-box">
          <div className="db-activity-title">Recent activity</div>
          <div className="db-activity-list">
            <div className="db-activity-item">
              <div className="db-activity-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                JS
              </div>
              <div className="db-activity-details">
                <span className="db-activity-text">Added new snippet</span>
                <span className="db-activity-time">2 hours ago · JavaScript</span>
              </div>
            </div>

            <div className="db-activity-item">
              <div className="db-activity-icon" style={{ background: 'rgba(15, 23, 42, 0.15)', color: 'var(--text-color)' }}>
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </div>
              <div className="db-activity-details">
                <span className="db-activity-text">Updated README.md</span>
                <span className="db-activity-time">5 hours ago · DevOneStack</span>
              </div>
            </div>

            <div className="db-activity-item">
              <div className="db-activity-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <div className="db-activity-details">
                <span className="db-activity-text">Saved new prompt</span>
                <span className="db-activity-time">1 day ago · System Design</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
