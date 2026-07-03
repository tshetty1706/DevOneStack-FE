import React from 'react';
import { motion } from 'motion/react';

export default function GlowCenterpiece() {
  return (
    <div className="centerpiece-container">
      {/* Soft accent-color glow behind */}
      <div className="radial-glow-backdrop" />

      {/* Centerpiece rotating shape */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Spoke 1 & 2 (Vertical & Horizontal) */}
          <rect x="44" y="8" width="8" height="80" rx="4" fill="var(--text-color)" />
          <rect x="8" y="44" width="80" height="8" rx="4" fill="var(--text-color)" />
          
          {/* Spoke 3 (45 deg diagonal) */}
          <rect
            x="44"
            y="8"
            width="8"
            height="80"
            rx="4"
            fill="var(--text-color)"
            transform="rotate(45 48 48)"
          />
          
          {/* Spoke 4 (135 deg diagonal) */}
          <rect
            x="44"
            y="8"
            width="8"
            height="80"
            rx="4"
            fill="var(--text-color)"
            transform="rotate(135 48 48)"
          />
          
          {/* Inner accent ring and dot */}
          <circle
            cx="48"
            cy="48"
            r="16"
            stroke="var(--accent-color)"
            strokeWidth="3"
            fill="var(--bg-color)"
            style={{ transition: 'fill 0.4s ease' }}
          />
          <circle cx="48" cy="48" r="6" fill="var(--accent-color)" />
        </svg>
      </motion.div>
    </div>
  );
}
