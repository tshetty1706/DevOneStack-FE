import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import {
  RiStackLine, RiCodeSSlashLine, RiLinksLine, RiRobot2Line,
} from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';

function CountUp({ target, duration = 1200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView || target === 0) return;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

const STATS_CONFIG = [
  {
    key: 'spaces',
    icon: <RiStackLine />,
    label: 'Tool spaces',
    subtext: 'React, Node.js, MongoDB, TypeScript',
  },
  {
    key: 'snippets',
    icon: <RiCodeSSlashLine />,
    label: 'Boilerplates',
    subtext: 'Saved code snippets & starters',
  },
  {
    key: 'resources',
    icon: <RiLinksLine />,
    label: 'Resources',
    subtext: 'Docs, videos, links & learnings',
  },
  {
    key: 'prompts',
    icon: <RiRobot2Line />,
    label: 'AI Prompts',
    subtext: 'Prompts by tool & category',
  },
];

export default function StatsCards({ stats }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const cardBg = isLight ? '#ffffff' : '#111111';
  const cardBorder = isLight ? '#e5e5e5' : '#1a1a1a';
  const cardBorderHover = isLight ? '#333333' : '#E5E5E5';
  const accentLine = isLight ? '#111111' : '#ffffff';
  const textPrimary = isLight ? '#111111' : '#ffffff';
  const textMuted = isLight ? '#666666' : '#666666';
  const iconColor = isLight ? '#333333' : '#B2B2B2';

  return (
    <div>
      <p style={{
        fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
        color: textMuted, fontWeight: 600, marginBottom: '14px',
      }}>
        Overview
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px',
      }}>
        {STATS_CONFIG.map(({ key, icon, label, subtext }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderLeft: `3px solid ${accentLine}`,
              borderRadius: '10px',
              padding: '18px 18px 16px',
              cursor: 'default',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = cardBorderHover;
              e.currentTarget.style.borderLeftColor = accentLine;
              e.currentTarget.style.boxShadow = isLight
                ? '0 4px 20px rgba(0,0,0,0.08)'
                : '0 4px 20px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = cardBorder;
              e.currentTarget.style.borderLeftColor = accentLine;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '18px', color: iconColor, display: 'flex' }}>{icon}</span>
            </div>
            <div style={{
              fontSize: '32px', fontWeight: 800, lineHeight: 1,
              color: textPrimary, fontFamily: 'var(--font-display)',
              marginBottom: '4px', letterSpacing: '-0.02em',
            }}>
              <CountUp target={stats?.[key] ?? 0} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
              {label}
            </div>
            <div style={{ fontSize: '11px', color: textMuted, lineHeight: 1.4 }}>
              {subtext}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
