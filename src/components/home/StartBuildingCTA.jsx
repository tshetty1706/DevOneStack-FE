import React, { useRef } from 'react';
import { Card, Button } from 'antd';
import { motion, useInView } from 'motion/react';

// React Icons Imports for CTA visual badging
import { FaReact, FaDocker, FaGitAlt } from 'react-icons/fa';
import { SiMongodb } from 'react-icons/si';

const smallIcons = [
  {
    id: 'react-cta',
    style: { top: '25%', left: '12%' },
    delay: 0,
    duration: 5.5,
    color: '#61DAFB',
    icon: <FaReact size={22} />,
  },
  {
    id: 'git-cta',
    style: { bottom: '20%', left: '12%' },
    delay: 0.8,
    duration: 4.8,
    color: '#F05032',
    icon: <FaGitAlt size={22} />,
  },
  {
    id: 'docker-cta',
    style: { top: '22%', right: '12%' },
    delay: 0.4,
    duration: 6.2,
    color: '#2496ED',
    icon: <FaDocker size={22} />,
  },
  {
    id: 'mongo-cta',
    style: { bottom: '18%', right: '18%' },
    delay: 1.2,
    duration: 5.0,
    color: '#47A248',
    icon: <SiMongodb size={22} />,
  },
];

// Helper to convert hex to RGB string for box-shadow support
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '99, 102, 241';
}

export default function StartBuildingCTA() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  return (
    <section className="cta-section" ref={containerRef} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background soft glow orb */}
      <div
        className="radial-glow-backdrop"
        style={{
          width: '500px',
          height: '500px',
          filter: 'blur(100px)',
          opacity: 'calc(0.25 * var(--glow-intensity))',
          zIndex: 1,
        }}
      />

      {/* Constellation Connecting Network Lines */}
      {isInView && (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {/* React Node Connections */}
          <line x1="14%" y1="30%" x2="33%" y2="35%" stroke="var(--grid-line)" strokeWidth="1" />
          <line x1="14%" y1="30%" x2="0%" y2="10%" stroke="var(--grid-line)" strokeWidth="1" />
          <line x1="14%" y1="30%" x2="14%" y2="78%" stroke="var(--grid-line)" strokeWidth="1" />

          {/* Git Node Connections */}
          <line x1="14%" y1="78%" x2="33%" y2="65%" stroke="var(--grid-line)" strokeWidth="1" />
          <line x1="14%" y1="78%" x2="0%" y2="92%" stroke="var(--grid-line)" strokeWidth="1" />

          {/* Docker Node Connections */}
          <line x1="86%" y1="27%" x2="67%" y2="35%" stroke="var(--grid-line)" strokeWidth="1" />
          <line x1="86%" y1="27%" x2="100%" y2="10%" stroke="var(--grid-line)" strokeWidth="1" />
          <line x1="86%" y1="27%" x2="80%" y2="80%" stroke="var(--grid-line)" strokeWidth="1" />

          {/* MongoDB Node Connections */}
          <line x1="80%" y1="80%" x2="67%" y2="65%" stroke="var(--grid-line)" strokeWidth="1" />
          <line x1="80%" y1="80%" x2="100%" y2="92%" stroke="var(--grid-line)" strokeWidth="1" />
          
          {/* Connection to Sparkle Star */}
          <line x1="80%" y1="80%" x2="91%" y2="75%" stroke="var(--grid-line)" strokeWidth="1" />
        </svg>
      )}

      {/* 4-pointed Sparkle Star (Bottom Right background element) */}
      <motion.div
        style={{
          position: 'absolute',
          right: '8%',
          bottom: '22%',
          color: 'var(--text-secondary)',
          opacity: 0.3,
          zIndex: 2,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
        </svg>
      </motion.div>

      {/* Floating background badges around the CTA */}
      {smallIcons.map((badge) => (
        <motion.div
          key={badge.id}
          className="floating-badge"
          style={{
            ...badge.style,
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            zIndex: 10,
            borderColor: badge.color,
            color: badge.color,
            boxShadow: `0 0 20px rgba(${hexToRgb(badge.color)}, calc(0.35 * var(--glow-intensity)))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--card-bg)',
            transition: 'background 0.4s ease, border-color 0.4s ease, color 0.4s ease',
          }}
          initial={{ opacity: 0 }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: [0, -10, 0],
                }
              : {}
          }
          transition={{
            opacity: { duration: 0.8 },
            y: {
              duration: badge.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: badge.delay,
            },
          }}
        >
          {badge.icon}
        </motion.div>
      ))}

      {/* The main Glass Card container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', display: 'flex', justifyContent: 'center', zIndex: 10 }}
      >
        <Card className="premium-card cta-glass-card" variant="borderless">
          <h2 className="cta-headline">Start building your stack with DevOneStack</h2>
          <p className="cta-subtext">Zero scattered tabs, zero forgotten bookmarks.</p>

          <Button
            type="primary"
            size="large"
            style={{
              background: 'var(--accent-color)',
              borderColor: 'var(--accent-color)',
              height: '48px',
              padding: '0 28px',
              fontSize: '15px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ffffff',
            }}
            onClick={() => console.log('Start Building CTA click')}
          >
            Create your first tool space
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Button>
        </Card>
      </motion.div>
    </section>
  );
}
