import React, { useState, useRef, useEffect } from 'react';
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

  // Touch move handler for mobile screen touch parallax
  const handleTouchMove = (e) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    setIsHovered(true);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Smooth springs for rotation angles
  const tiltX = isHovered ? mousePos.y * 38 : 0;
  const tiltY = isHovered ? -mousePos.x * 38 : 0;

  return (
    <div 
      className="centerpiece-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsHovered(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: 220,
        height: 240,
        cursor: 'grab',
        perspective: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background glow specific to the centerpiece */}
      <motion.div 
        animate={{
          scale: isHovered ? 1.25 : [1, 1.08, 1],
          opacity: isHovered ? 0.8 : [0.45, 0.55, 0.45],
        }}
        transition={{
          repeat: isHovered ? 0 : Infinity,
          duration: 4,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-color) 0%, rgba(var(--accent-color-rgb), 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 3D Rotatable Wrapper */}
      <motion.div
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
          scale: isHovered ? 1.06 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 140,
          damping: 16,
        }}
        style={{
          width: 170,
          height: 190,
          position: 'relative',
          transformStyle: 'preserve-3d',
          zIndex: 5,
        }}
      >
        {/* Layer 1: Bottom (Repos & Code) */}
        <motion.div
          animate={{
            y: isHovered ? 36 : 12,
            opacity: isHovered ? 0.7 : 0.4,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100px',
            top: '80px',
            transformStyle: 'preserve-3d',
            color: 'var(--accent-color)',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 170 100" fill="none">
            {/* Isometric Card Panel */}
            <path d="M85 10 L155 45 L85 80 L15 45 Z" fill="rgba(var(--accent-color-rgb), 0.04)" stroke="currentColor" strokeWidth="2" />
            {/* Repository link nodes */}
            <circle cx="85" cy="45" r="4.5" fill="currentColor" />
            <path d="M50 30 L85 45 L120 30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          </svg>
        </motion.div>

        {/* Layer 2: Middle (Docs & Notes) */}
        <motion.div
          animate={{
            y: isHovered ? 0 : 0,
            opacity: isHovered ? 0.85 : 0.65,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100px',
            top: '45px',
            transformStyle: 'preserve-3d',
            color: 'var(--text-color)',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 170 100" fill="none">
            <path d="M85 10 L155 45 L85 80 L15 45 Z" fill="rgba(var(--text-color-rgb), 0.03)" stroke="currentColor" strokeWidth="2" />
            {/* Document isometric line traces */}
            <path d="M60 40 L90 55 M65 33 L110 55 M95 33 L120 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </svg>
        </motion.div>

        {/* Layer 3: Top (Prompts & AI Sparkles) */}
        <motion.div
          animate={{
            y: isHovered ? -36 : -12,
            opacity: isHovered ? 1.0 : 0.9,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100px',
            top: '10px',
            transformStyle: 'preserve-3d',
            color: 'var(--accent-color)',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 170 100" fill="none">
            <path d="M85 10 L155 45 L85 80 L15 45 Z" fill="rgba(var(--accent-color-rgb), 0.12)" stroke="currentColor" strokeWidth="2.5" />
            
            {/* AI sparkle path inside top card */}
            <g transform="translate(85, 45)">
              <path d="M-8 0 Q0 0 0 -8 Q0 0 8 0 Q0 0 0 8 Q0 0 -8 0 Z" fill="currentColor" />
              <circle cx="-16" cy="-10" r="1.5" fill="currentColor" opacity="0.8" />
              <circle cx="16" cy="10" r="2.2" fill="currentColor" opacity="0.8" />
            </g>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
