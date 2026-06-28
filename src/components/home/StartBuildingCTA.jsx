import React, { useRef } from 'react';
import { Card, Button } from 'antd';
import { motion, useInView } from 'motion/react';

export default function StartBuildingCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Floating SVGs specific to this CTA section for visual alignment
  const floatIcons = [
    { id: 'react', color: '#61DAFB', style: { top: '-25px', left: '12%' }, yDelta: -8, duration: 4.2 },
    { id: 'git', color: '#F05032', style: { bottom: '-20px', right: '15%' }, yDelta: 10, duration: 5.6 },
    { id: 'docker', color: '#2496ED', style: { top: '30%', right: '-20px' }, yDelta: -11, duration: 4.5 },
    { id: 'node', color: '#68A063', style: { bottom: '30%', left: '-15px' }, yDelta: 9, duration: 5.2 },
  ];

  return (
    <section className="cta-section" ref={ref}>
      {/* Background radial glow */}
      <div 
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-color-rgb), 0.08) 0%, rgba(var(--accent-color-rgb), 0) 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}
      >
        {/* Floating Icons scattered behind the CTA Glass Card */}
        {floatIcons.map((ico, idx) => (
          <motion.div
            key={ico.id}
            className="floating-badge"
            style={{
              ...ico.style,
              width: 48,
              height: 48,
              zIndex: 1,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={isInView ? { opacity: 0.9, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.6, delay: 0.2 + idx * 0.15, ease: 'easeOut' }}
          >
            <motion.div
              animate={{ y: [0, ico.yDelta, 0] }}
              transition={{ repeat: Infinity, duration: ico.duration, ease: 'easeInOut' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
            >
              {ico.id === 'react' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ico.color} strokeWidth="2">
                  <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(30 12 12)" />
                  <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(90 12 12)" />
                  <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(150 12 12)" />
                </svg>
              )}
              {ico.id === 'git' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ico.color} strokeWidth="2">
                  <path d="M16 11.5L9.5 5M9.5 5a2.5 2.5 0 1 0 0 5M9.5 5v11" />
                </svg>
              )}
              {ico.id === 'docker' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ico.color} strokeWidth="2">
                  <path d="M2 14c0-2 2-3 5-3h11c2.5 0 4 1.5 4 4s-2 3-5 3H5" />
                </svg>
              )}
              {ico.id === 'node' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ico.color} strokeWidth="2">
                  <path d="M12 3L4 7.5v9L12 21l8-4.5v-9z" />
                </svg>
              )}
            </motion.div>
          </motion.div>
        ))}

        {/* CTA Glass Card (reusing premium-card) */}
        <Card className="premium-card cta-glass-card">
          <h2 className="cta-headline">Start building your stack with DevOneStack</h2>
          <p className="cta-subtext">Zero scattered tabs, zero forgotten bookmarks.</p>
          <Button
            type="primary"
            size="large"
            style={{
              background: 'var(--accent-color)',
              borderColor: 'var(--accent-color)',
              height: 48,
              padding: '0 28px',
              fontSize: 16,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
            onClick={() => console.log('CTA: Create First Space clicked')}
          >
            Create your first tool space
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Button>
        </Card>
      </motion.div>
    </section>
  );
}
