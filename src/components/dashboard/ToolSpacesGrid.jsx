import React from 'react';
import { motion } from 'motion/react';
import { RiAddCircleLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import ToolSpaceCard from './ToolSpaceCard';

export default function ToolSpacesGrid({ spaces, onAddSpaceClick }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const textMuted = isLight ? '#666666' : '#666666';
  const dashBorder = isLight ? '#e5e5e5' : '#222222';
  const textPrimary = isLight ? '#111111' : '#ffffff';

  return (
    <div>
      <p style={{
        fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
        color: textMuted, fontWeight: 600, marginBottom: '14px',
      }}>
        Your tool spaces
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px',
      }}>
        {spaces.map((space, i) => (
          <ToolSpaceCard key={space._id || space.id} space={space} index={i} />
        ))}

        {/* Add tool space card */}
        <motion.div
          onClick={onAddSpaceClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + spaces.length * 0.08, duration: 0.4 }}
          whileHover={{ y: -4 }}
          style={{
            border: `2px dashed ${dashBorder}`,
            borderRadius: '12px',
            padding: '18px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '110px',
            transition: 'border-color 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = isLight ? '#999999' : '#4C4C4C'}
          onMouseLeave={e => e.currentTarget.style.borderColor = dashBorder}
        >
          <RiAddCircleLine size={22} style={{ color: textMuted }} />
          <span style={{ fontSize: '13px', color: textMuted, fontWeight: 500 }}>
            Add tool space
          </span>
        </motion.div>
      </div>
    </div>
  );
}
