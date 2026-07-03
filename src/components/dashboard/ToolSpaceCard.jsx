import React from 'react';
import { motion } from 'motion/react';
import { SiReact, SiDocker, SiNodedotjs, SiMongodb } from 'react-icons/si';
import { useTheme } from '../../context/ThemeContext';

const ICON_MAP = {
  react: <SiReact />,
  docker: <SiDocker />,
  nodejs: <SiNodedotjs />,
  mongodb: <SiMongodb />,
};

export default function ToolSpaceCard({ space, index }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const cardBg = isLight ? '#ffffff' : '#111111';
  const cardBorder = isLight ? '#e5e5e5' : '#1a1a1a';
  const cardBorderHover = isLight ? '#333333' : '#E5E5E5';
  const textPrimary = isLight ? '#111111' : '#ffffff';
  const textMuted = isLight ? '#666666' : '#666666';
  const tagBg = isLight ? '#f0f0f0' : '#1a1a1a';
  const tagBorder = isLight ? '#e5e5e5' : '#222222';
  const iconColor = isLight ? '#333333' : '#B2B2B2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '12px',
        padding: '18px',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = cardBorderHover;
        e.currentTarget.style.boxShadow = isLight
          ? '0 6px 24px rgba(0,0,0,0.09)'
          : '0 6px 24px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = cardBorder;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header: Icon + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '12px' }}>
        <span style={{
          fontSize: '20px', color: iconColor, display: 'flex',
          // Override brand colors — use currentColor only
          filter: isLight ? 'grayscale(1) brightness(0.4)' : 'grayscale(1) brightness(1.8)',
        }}>
          {ICON_MAP[space.icon]}
        </span>
        <span style={{
          fontSize: '14px', fontWeight: 600, color: textPrimary,
          fontFamily: 'var(--font-display)',
        }}>
          {space.name}
        </span>
      </div>

      {/* Meta */}
      <p style={{
        fontSize: '12px', color: textMuted, marginBottom: '14px',
        lineHeight: 1.4,
      }}>
        {space.meta}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {space.tags.map(tag => (
          <span key={tag} style={{
            fontSize: '11px', fontWeight: 500,
            padding: '2px 8px', borderRadius: '20px',
            background: tagBg, border: `1px solid ${tagBorder}`,
            color: textMuted,
          }}>
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
