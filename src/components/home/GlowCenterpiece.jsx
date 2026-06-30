import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';

export default function GlowCenterpiece() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse move handler for 3D parallax tilt
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Parallax angles
  const tiltX = isHovered ? mousePos.y * 32 : 0;
  const tiltY = isHovered ? -mousePos.x * 32 : 0;

  return (
    <div 
      className="centerpiece-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={handleMouseLeave}
      style={{
        width: '320px',
        height: '320px',
        cursor: 'pointer',
        perspective: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* Soft blurred background radial glow */}
      <motion.div 
        animate={{
          scale: isHovered ? 1.35 : [1, 1.08, 1],
          opacity: isHovered ? 0.95 : [0.55, 0.68, 0.55],
        }}
        transition={{
          repeat: isHovered ? 0 : Infinity,
          duration: 3.5,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-color) 0%, rgba(var(--accent-color-rgb), 0) 70%)',
          filter: 'blur(55px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 3D tilt wrapper */}
      <motion.div
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
          scale: isHovered ? 1.08 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 140,
          damping: 15,
        }}
        style={{
          width: '200px',
          height: '240px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Core Glow Line (Vertical laser connector, visible when hovered/touched) */}
        <motion.div
          animate={{
            scaleY: isHovered ? 1 : 0,
            opacity: isHovered ? 0.8 : 0,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: '2px',
            top: '20px',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to bottom, transparent, #06b6d4 20%, #a855f7 80%, transparent)',
            boxShadow: '0 0 12px var(--accent-color)',
            zIndex: 4,
            originY: 0.5
          }}
        />

        {/* Layer 1: Top Sheet (AI Prompts & Sparkles - Explodes Upward) */}
        <motion.div
          animate={{
            y: isHovered ? -45 : -15,
            rotate: isHovered ? -2 : [-2, 2, -2],
          }}
          transition={isHovered ? {
            type: 'spring',
            stiffness: 160,
            damping: 14
          } : {
            rotate: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
            y: { type: 'spring', stiffness: 100, damping: 15 }
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '110px',
            top: '20px',
            transformStyle: 'preserve-3d',
            zIndex: 8,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 200 110" fill="none">
            {/* Holographic Isometric Plate */}
            <path 
              d="M100 15 L170 50 L100 85 L30 50 Z" 
              fill="rgba(168, 85, 247, 0.08)" 
              stroke="#a855f7" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
              style={{ filter: isHovered ? 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))' : 'none', transition: 'filter 0.3s' }}
            />
            {/* Sparkle SVG inside plate */}
            <g transform="translate(100, 50)" fill="#ffffff">
              <path d="M-6 0 Q0 0 0 -6 Q0 0 6 0 Q0 0 0 6 Q0 0 -6 0 Z" />
              <circle cx="12" cy="-8" r="1.5" />
              <circle cx="-12" cy="8" r="1" />
            </g>
          </svg>
        </motion.div>

        {/* Layer 2: Middle Sheet (Docs, Notes & Snippets - Neutral Position) */}
        <motion.div
          animate={{
            y: 0,
            rotate: isHovered ? 2 : [2, -2, 2],
          }}
          transition={isHovered ? {
            type: 'spring',
            stiffness: 160,
            damping: 14
          } : {
            rotate: { repeat: Infinity, duration: 6, ease: 'easeInOut' }
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '110px',
            top: '65px',
            transformStyle: 'preserve-3d',
            zIndex: 6,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 200 110" fill="none">
            {/* Isometric Plate */}
            <path 
              d="M100 15 L170 50 L100 85 L30 50 Z" 
              fill="rgba(99, 102, 241, 0.06)" 
              stroke="var(--accent-color)" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
              style={{ filter: isHovered ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' : 'none', transition: 'filter 0.3s' }}
            />
            {/* Text lines tracers */}
            <g stroke="var(--text-color)" strokeWidth="2" strokeLinecap="round" opacity="0.6">
              <line x1="75" y1="45" x2="110" y2="60" />
              <line x1="85" y1="38" x2="125" y2="55" />
              <line x1="95" y1="48" x2="115" y2="57" />
            </g>
          </svg>
        </motion.div>

        {/* Layer 3: Bottom Sheet (Repos & Infrastructure - Explodes Downward) */}
        <motion.div
          animate={{
            y: isHovered ? 45 : 15,
            rotate: isHovered ? -1 : [-1, 1, -1],
          }}
          transition={isHovered ? {
            type: 'spring',
            stiffness: 160,
            damping: 14
          } : {
            rotate: { repeat: Infinity, duration: 5.5, ease: 'easeInOut' },
            y: { type: 'spring', stiffness: 100, damping: 15 }
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '110px',
            top: '110px',
            transformStyle: 'preserve-3d',
            zIndex: 4,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 200 110" fill="none">
            {/* Isometric Plate */}
            <path 
              d="M100 15 L170 50 L100 85 L30 50 Z" 
              fill="rgba(6, 182, 212, 0.06)" 
              stroke="#06b6d4" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
              style={{ filter: isHovered ? 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))' : 'none', transition: 'filter 0.3s' }}
            />
            {/* Repo / database network nodes */}
            <g stroke="#06b6d4" strokeWidth="1.8" fill="#06b6d4">
              <circle cx="100" cy="50" r="3.5" />
              <circle cx="75" cy="40" r="2.5" />
              <circle cx="125" cy="60" r="2.5" />
              <path d="M75 40 L100 50 L125 60" strokeLinecap="round" strokeDasharray="3 3" opacity="0.7" />
            </g>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
