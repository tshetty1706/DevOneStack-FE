import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

// Custom inline SVG icons for 12 tools
const icons = {
  react: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="3" ry="9" stroke="#61DAFB" strokeWidth="1.8" transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="3" ry="9" stroke="#61DAFB" strokeWidth="1.8" transform="rotate(90 12 12)" />
      <ellipse cx="12" cy="12" rx="3" ry="9" stroke="#61DAFB" strokeWidth="1.8" transform="rotate(150 12 12)" />
      <circle cx="12" cy="12" r="1.5" fill="#61DAFB" />
    </svg>
  ),
  node: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L4 7.5v9L12 21l8-4.5v-9L12 3Z" stroke="#68A063" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 3v18M4 7.5L12 12l8-4.5" stroke="#68A063" strokeWidth="1.5" />
    </svg>
  ),
  mongodb: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 6 7 6 12.5C6 17 9.5 20.5 12 22C14.5 20.5 18 17 18 12.5C18 7 12 2 12 2Z" stroke="#47A248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2v20" stroke="#47A248" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  ),
  docker: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="3" height="3" rx="0.5" fill="#2496ED" />
      <rect x="9" y="10" width="3" height="3" rx="0.5" fill="#2496ED" />
      <rect x="13" y="10" width="3" height="3" rx="0.5" fill="#2496ED" />
      <rect x="9" y="6" width="3" height="3" rx="0.5" fill="#2496ED" />
      <path d="M2 14c0-2 2-3 5-3h11c2.5 0 4 1.5 4 4s-2 3-5 3H5c-2 0-3-1-3-4Z" stroke="#2496ED" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  git: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 11.5L9.5 5M9.5 5a2.5 2.5 0 1 0 0 5M9.5 5v11M9.5 16a2.5 2.5 0 1 0 3 3" stroke="#F05032" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="11.5" r="2" fill="#F05032" />
    </svg>
  ),
  vscode: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7.5L16.5 21L21 18L3 7.5Z" stroke="#007ACC" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M3 16.5L16.5 3L21 6L3 16.5Z" stroke="#007ACC" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M21 6v12M3 7.5v9" stroke="#007ACC" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  typescript: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#3178C6" />
      <text x="14" y="17" fill="white" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="bold" fontSize="10" textAnchor="middle">TS</text>
    </svg>
  ),
  nextjs: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="black" stroke="#333" strokeWidth="1.2" />
      <path d="M16.5 16.5L9.5 7.5v9h1.5v-6.5l5.5 7Z" fill="white" />
    </svg>
  ),
  tailwind: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6c-2.5-1.25-5-.625-7.5 1.875 3.75 1.25 5 0 7.5-1.875 2.5-1.25 5-.625 7.5 1.875-3.75-1.25-5 0-7.5 1.875Z" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  figma: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5Z" stroke="#F24E1E" strokeWidth="1.8" />
      <path d="M12 9h3.5a3.5 3.5 0 1 1-3.5 3.5V9Z" stroke="#FF7262" strokeWidth="1.8" />
      <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5Z" stroke="#A259FF" strokeWidth="1.8" />
      <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0Z" stroke="#1ABCFE" strokeWidth="1.8" />
      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2Z" stroke="#0ACF83" strokeWidth="1.8" />
    </svg>
  ),
  python: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8 2 8 3.5 8 5v2.5h8V5c0-1.5 0-3-4-3Z" fill="#3776AB" />
      <path d="M12 22c4 0 4-1.5 4-3v-2.5H8V19c0 1.5 0 3 4 3Z" fill="#FFE052" />
      <path d="M8 8.5v3c0 .8.6 1.5 1.5 1.5H12V10c0-.8-.6-1.5-1.5-1.5H8Z" fill="#3776AB" />
      <path d="M16 15.5v-3c0-.8-.6-1.5-1.5-1.5H12v3c0 .8.6 1.5 1.5 1.5H16Z" fill="#FFE052" />
    </svg>
  ),
  rust: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7" stroke="#DEA584" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5l1.5 1.5M5 19l1.5-1.5M17.5 6.5L19 5" stroke="#DEA584" />
    </svg>
  ),
};

const badgeData = [
  // Outer Cloud
  { id: 'react', name: 'React', icon: icons.react, color: '#61DAFB', style: { top: '8%', left: '8%' }, delay: 0.1, duration: 4.8, yDelta: -12, rDelta: 4 },
  { id: 'node', name: 'Node.js', icon: icons.node, color: '#68A063', style: { top: '5%', right: '10%' }, delay: 0.2, duration: 5.6, yDelta: 10, rDelta: -5 },
  { id: 'mongodb', name: 'MongoDB', icon: icons.mongodb, color: '#47A248', style: { top: '42%', right: '3%' }, delay: 0.3, duration: 5.0, yDelta: -14, rDelta: 3 },
  { id: 'docker', name: 'Docker', icon: icons.docker, color: '#2496ED', style: { bottom: '10%', left: '8%' }, delay: 0.4, duration: 5.2, yDelta: 11, rDelta: -6 },
  { id: 'vscode', name: 'VS Code', icon: icons.vscode, color: '#007ACC', style: { bottom: '8%', right: '9%' }, delay: 0.5, duration: 4.5, yDelta: -9, rDelta: 5 },
  { id: 'git', name: 'Git', icon: icons.git, color: '#F05032', style: { top: '45%', left: '2%' }, delay: 0.6, duration: 5.8, yDelta: 13, rDelta: -4 },
  
  // Inner Cloud
  { id: 'typescript', name: 'TypeScript', icon: icons.typescript, color: '#3178C6', style: { top: '22%', left: '26%' }, delay: 0.7, duration: 4.2, yDelta: -8, rDelta: -3 },
  { id: 'nextjs', name: 'Next.js', icon: icons.nextjs, color: '#94a3b8', style: { top: '18%', right: '23%' }, delay: 0.8, duration: 5.4, yDelta: 9, rDelta: 4 },
  { id: 'tailwind', name: 'Tailwind CSS', icon: icons.tailwind, color: '#38BDF8', style: { bottom: '26%', left: '21%' }, delay: 0.9, duration: 4.6, yDelta: -10, rDelta: -4 },
  { id: 'figma', name: 'Figma', icon: icons.figma, color: '#A259FF', style: { bottom: '22%', right: '22%' }, delay: 1.0, duration: 4.9, yDelta: 11, rDelta: 5 },
  
  // Top/Bottom Center poles
  { id: 'python', name: 'Python', icon: icons.python, color: '#FFE052', style: { bottom: '4%', left: '46%' }, delay: 1.1, duration: 5.1, yDelta: -7, rDelta: -3 },
  { id: 'rust', name: 'Rust', icon: icons.rust, color: '#DEA584', style: { top: '4%', left: '47%' }, delay: 1.2, duration: 5.3, yDelta: 9, rDelta: 3 },
];

export default function FloatingIcons() {
  const { theme } = useTheme();

  return (
    <>
      {badgeData.map((badge) => {
        const isDark = theme === 'dark';
        const brandColor = badge.color;

        return (
          <motion.div
            key={badge.id}
            className="floating-badge"
            style={{
              ...badge.style,
              width: 58,
              height: 58,
              borderRadius: 14,
              cursor: 'pointer',
              // Glassmorphism background that matches dark/light mode
              background: isDark ? 'rgba(9, 9, 11, 0.45)' : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              // Borders matching the icon's brand color
              borderColor: isDark ? `rgba(${hexToRgb(brandColor)}, 0.15)` : `rgba(${hexToRgb(brandColor)}, 0.22)`,
              // Box shadows matching the brand color glow
              boxShadow: isDark 
                ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(${hexToRgb(brandColor)}, 0.08)` 
                : `0 4px 15px rgba(0, 0, 0, 0.04), 0 0 8px rgba(${hexToRgb(brandColor)}, 0.08)`,
            }}
            // Entrance Scale + Fade-In animation on Load
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: badge.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
            // Micro-Interactions on hover
            whileHover={{
              scale: 1.15,
              borderColor: brandColor,
              boxShadow: isDark 
                ? `0 10px 25px rgba(0, 0, 0, 0.6), 0 0 18px rgba(${hexToRgb(brandColor)}, 0.3)`
                : `0 8px 20px rgba(0, 0, 0, 0.06), 0 0 14px rgba(${hexToRgb(brandColor)}, 0.25)`,
              zIndex: 40,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.92 }}
          >
            {/* Smooth continuous vertical movement and soft rotational swing */}
            <motion.div
              animate={{
                y: [0, badge.yDelta, 0],
                rotate: [0, badge.rDelta, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: badge.duration,
                ease: 'easeInOut',
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
              title={badge.name}
            >
              {badge.icon}
            </motion.div>
          </motion.div>
        );
      })}
    </>
  );
}

// Helper to convert hex colors to RGB values
function hexToRgb(hex) {
  // If variable, return indigo rgb
  if (hex.startsWith('var')) return '99, 102, 241';
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
