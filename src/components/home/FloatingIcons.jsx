import React from 'react';
import { motion } from 'motion/react';

// Custom SVG Icons for Tech Stack
const icons = {
  React: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="#61DAFB" strokeWidth="2" transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="#61DAFB" strokeWidth="2" transform="rotate(90 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="#61DAFB" strokeWidth="2" transform="rotate(150 12 12)" />
      <circle cx="12" cy="12" r="2" fill="#61DAFB" />
    </svg>
  ),
  Node: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 6.5v11L12 22l8-4.5v-11L12 2z" stroke="#339933" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 2v20M4 6.5L12 11l8-4.5" stroke="#339933" strokeWidth="1.5" />
      <circle cx="12" cy="11" r="3" fill="#339933" opacity="0.3" />
    </svg>
  ),
  MongoDB: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 6 7 6 12C6 16.5 9 19.5 12 22C15 19.5 18 16.5 18 12C18 7 12 2 12 2Z" stroke="#47A248" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 2v20" stroke="#47A248" strokeWidth="1.5" />
    </svg>
  ),
  Docker: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="3" height="3" rx="0.5" fill="#2496ED" />
      <rect x="9" y="10" width="3" height="3" rx="0.5" fill="#2496ED" />
      <rect x="13" y="10" width="3" height="3" rx="0.5" fill="#2496ED" />
      <rect x="9" y="6" width="3" height="3" rx="0.5" fill="#2496ED" />
      <path d="M4 14C4 18 8 19 12 19C16 19 20 18 20 14C20 12 18 11.5 17 11.5H3C2 11.5 4 13 4 14Z" stroke="#2496ED" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  Git: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.5 11.5l-8-8a1.5 1.5 0 00-2.1 0l-8 8a1.5 1.5 0 000 2.1l8 8a1.5 1.5 0 002.1 0l8-8a1.5 1.5 0 000-2.1z" stroke="#F05032" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="#F05032" />
      <circle cx="9" cy="9" r="2" fill="#F05032" />
      <circle cx="12" cy="16" r="2" fill="#F05032" />
      <path d="M9 9h3v7" stroke="#F05032" strokeWidth="1.5" />
    </svg>
  ),
  VSCode: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6.5L16.5 19L20 17.5V6.5L16.5 5L4 17.5L2 16V8L4 6.5Z" stroke="#007ACC" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16.5 5v14" stroke="#007ACC" strokeWidth="1.5" />
    </svg>
  )
};

const badgeConfigs = [
  { id: 'react', name: 'React', icon: icons.React, top: '10%', left: '8%', delay: 0, duration: 5 },
  { id: 'node', name: 'Node.js', icon: icons.Node, top: '15%', right: '8%', delay: 1.2, duration: 6 },
  { id: 'mongo', name: 'MongoDB', icon: icons.MongoDB, bottom: '15%', left: '12%', delay: 0.6, duration: 5.5 },
  { id: 'docker', name: 'Docker', icon: icons.Docker, bottom: '12%', right: '10%', delay: 1.8, duration: 6.5 },
  { id: 'git', name: 'Git', icon: icons.Git, top: '48%', left: '-5%', delay: 2.4, duration: 4.8 },
  { id: 'vscode', name: 'VS Code', icon: icons.VSCode, top: '45%', right: '-4%', delay: 0.3, duration: 5.2 }
];

export default function FloatingIcons() {
  return (
    <>
      {badgeConfigs.map((badge) => (
        <motion.div
          key={badge.id}
          className="floating-badge"
          style={{
            top: badge.top,
            left: badge.left,
            right: badge.right,
            bottom: badge.bottom,
            width: '52px',
            height: '52px',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -15, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: badge.delay * 0.3 + 0.5 },
            scale: { duration: 0.8, delay: badge.delay * 0.3 + 0.5 },
            y: {
              duration: badge.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: badge.delay,
            }
          }}
          whileHover={{
            scale: 1.1,
            borderColor: 'var(--accent-color)',
            boxShadow: '0 8px 25px rgba(var(--accent-color-rgb), 0.25)',
          }}
        >
          {badge.icon}
        </motion.div>
      ))}
    </>
  );
}
