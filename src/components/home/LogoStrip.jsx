import React, { useState } from 'react';

// Inline SVGs for logo grid
const icons = {
  react: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="3" ry="9" stroke="currentColor" strokeWidth="1.8" transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="3" ry="9" stroke="currentColor" strokeWidth="1.8" transform="rotate(90 12 12)" />
      <ellipse cx="12" cy="12" rx="3" ry="9" stroke="currentColor" strokeWidth="1.8" transform="rotate(150 12 12)" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  docker: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="9" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="13" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="9" y="6" width="3" height="3" rx="0.5" fill="currentColor" />
      <path d="M2 14c0-2 2-3 5-3h11c2.5 0 4 1.5 4 4s-2 3-5 3H5c-2 0-3-1-3-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  mongodb: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 6 7 6 12.5C6 17 9.5 20.5 12 22C14.5 20.5 18 17 18 12.5C18 7 12 2 12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2v20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  ),
  tailwind: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6.5c-2.67-1.33-5.33-.67-8 2 4 1.33 5.33 0 8-2 2.67-1.33 5.33-.67 8 2-4-1.33-5.33 0-8-2ZM4 15.5c-2.67-1.33-5.33-.67-8 2 4 1.33 5.33 0 8-2 2.67-1.33 5.33-.67 8 2-4-1.33-5.33 0-8-2Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  git: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 11.5L9.5 5M9.5 5a2.5 2.5 0 1 0 0 5M9.5 5v11M9.5 16a2.5 2.5 0 1 0 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="11.5" r="2" fill="currentColor" />
    </svg>
  ),
  figma: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 9h3.5a3.5 3.5 0 1 1-3.5 3.5V9Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  postman: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  node: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L4 7.5v9L12 21l8-4.5v-9L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 3v18M4 7.5L12 12l8-4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  nextjs: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L9.5 7.5v9h1.5v-6.5l5.5 7Z" fill="currentColor" />
    </svg>
  ),
  typescript: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.8" />
      <text x="14" y="17" fill="currentColor" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="bold" fontSize="10" textAnchor="middle">TS</text>
    </svg>
  ),
  more: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

const brandColors = {
  react: '#61DAFB',
  docker: '#2496ED',
  mongodb: '#47A248',
  tailwind: '#38BDF8',
  git: '#F05032',
  figma: '#F24E1E',
  postman: '#FF6C37',
  node: '#68A063',
  nextjs: 'var(--text-color)',
  typescript: '#3178C6',
  more: 'var(--accent-color)',
};

export default function LogoStrip() {
  const [hoveredTool, setHoveredTool] = useState(null);

  const cells = [
    { type: 'label', text: 'Built for developers. Supporting any tool, language, or stack.' },
    { type: 'logo', id: 'react', name: 'React', icon: icons.react },
    { type: 'logo', id: 'docker', name: 'Docker', icon: icons.docker },
    { type: 'logo', id: 'mongodb', name: 'MongoDB', icon: icons.mongodb },
    { type: 'logo', id: 'git', name: 'Git', icon: icons.git },
    { type: 'logo', id: 'tailwind', name: 'Tailwind CSS', icon: icons.tailwind },
    { type: 'logo', id: 'figma', name: 'Figma', icon: icons.figma },
    { type: 'logo', id: 'postman', name: 'Postman', icon: icons.postman },
    { type: 'logo', id: 'node', name: 'Node.js', icon: icons.node },
    { type: 'logo', id: 'nextjs', name: 'Next.js', icon: icons.nextjs },
    { type: 'logo', id: 'typescript', name: 'TypeScript', icon: icons.typescript },
    { type: 'logo', id: 'more', name: 'And More...', icon: icons.more },
  ];

  return (
    <section
      style={{
        background: 'var(--bg-color)',
        padding: '0',
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          borderTop: '1px dashed var(--grid-line)',
          borderLeft: '1px dashed var(--grid-line)',
          boxSizing: 'border-box'
        }}
        className="logo-grid-table"
      >
        {cells.map((cell, idx) => {
          const isHovered = hoveredTool === cell.id;
          const color = cell.id ? brandColors[cell.id] : 'inherit';

          return (
            <div
              key={idx}
              style={{
                borderBottom: '1px dashed var(--grid-line)',
                borderRight: '1px dashed var(--grid-line)',
                position: 'relative',
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                boxSizing: 'border-box',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                background: isHovered ? 'rgba(var(--accent-color-rgb), 0.03)' : 'transparent',
              }}
              onMouseEnter={() => cell.id && setHoveredTool(cell.id)}
              onMouseLeave={() => setHoveredTool(null)}
            >
              {/* Top-Left intersection dot */}
              <div
                style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  width: '3.5px',
                  height: '3.5px',
                  background: 'var(--grid-dot)',
                  zIndex: 2,
                }}
              />

              {cell.type === 'label' ? (
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    lineHeight: '1.4',
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {cell.text}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    color: isHovered ? color : 'var(--text-secondary)',
                    transition: 'color 0.2s ease, transform 0.2s ease',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ transition: 'opacity 0.2s ease', opacity: isHovered ? 1 : 0.65 }}>
                    {cell.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      fontFamily: 'monospace'
                    }}
                  >
                    {cell.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CSS overrides for grid layout on responsive dimensions */}
      <style>{`
        @media (max-width: 992px) {
          .logo-grid-table {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 576px) {
          .logo-grid-table {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
