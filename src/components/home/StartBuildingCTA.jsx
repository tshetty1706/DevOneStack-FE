import React, { useRef } from 'react';
import { Card, Button } from 'antd';
import { motion, useInView } from 'motion/react';

export default function StartBuildingCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Helper block placeholder component (simulates code lines in 3rd image)
  const BlockPlaceholder = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
        <div style={{ height: '6px', width: '30%', borderRadius: '3px', background: 'var(--grid-dot)', opacity: 0.6 }} />
        <div style={{ height: '6px', width: '50%', borderRadius: '3px', background: 'var(--grid-line)', opacity: 0.4 }} />
      </div>
      <div style={{ height: '6px', width: '85%', borderRadius: '3px', background: 'var(--grid-line)', opacity: 0.3 }} />
      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
        <div style={{ height: '6px', width: '20%', borderRadius: '3px', background: 'var(--grid-line)', opacity: 0.4 }} />
        <div style={{ height: '6px', width: '40%', borderRadius: '3px', background: 'var(--grid-dot)', opacity: 0.6 }} />
      </div>
    </div>
  );

  return (
    <section 
      className="cta-section" 
      ref={ref}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-color)',
        borderTop: '1px dashed var(--grid-line)',
        borderBottom: '1px dashed var(--grid-line)',
        padding: '120px 0'
      }}
    >
      {/* Precision corner dots framing CTA section */}
      <div style={{ position: 'absolute', top: '-2px', left: '10%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />
      <div style={{ position: 'absolute', top: '-2px', right: '10%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />
      <div style={{ position: 'absolute', bottom: '-2px', left: '10%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />
      <div style={{ position: 'absolute', bottom: '-2px', right: '10%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />

      {/* Flowing background gradient stream */}
      <div className="hero-background-flow">
        <div className="glow-orb glow-orb-1" style={{ top: '10%', left: '10%' }} />
        <div className="glow-orb glow-orb-2" style={{ bottom: '10%', right: '10%' }} />
      </div>

      {/* Diagonal light-beam gradient sweep (Payload CMS reference) */}
      <div 
        style={{
          position: 'absolute',
          top: '-30%',
          left: '-30%',
          right: '-30%',
          bottom: '-30%',
          background: 'linear-gradient(135deg, transparent 40%, rgba(var(--accent-color-rgb), 0.03) 48%, rgba(var(--accent-color-rgb), 0.07) 50%, rgba(var(--accent-color-rgb), 0.03) 52%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box',
          width: '100%',
        }}
        className="cta-grid-container"
      >
        {/* Left Column: Grid box placeholders (3rd image reference) */}
        <div className="cta-side-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 24px' }}>
          <div style={{ border: '1px dashed var(--grid-line)', borderRadius: '8px', padding: '20px', background: 'rgba(var(--text-color-rgb), 0.01)' }}>
            <BlockPlaceholder />
          </div>
          <div style={{ border: '1px dashed var(--grid-line)', borderRadius: '8px', padding: '20px', background: 'rgba(var(--text-color-rgb), 0.01)', opacity: 0.6 }}>
            <BlockPlaceholder />
          </div>
        </div>

        {/* Center Column: CTA Glass Card */}
        <div style={{ padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card 
              className="premium-card cta-glass-card"
              style={{
                background: 'var(--card-bg)',
                border: '1px dashed var(--grid-line)',
                boxShadow: 'var(--shadow-elevation)',
                backdropFilter: 'blur(16px)',
                textAlign: 'center',
                padding: '60px 30px',
                borderRadius: '16px'
              }}
            >
              <h2 className="cta-headline" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                Start building your stack with DevOneStack
              </h2>
              <p className="cta-subtext" style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Zero scattered tabs. Zero forgotten bookmarks.
              </p>
              
              <Button
                type="primary"
                size="large"
                style={{
                  background: '#ffffff',
                  borderColor: '#ffffff',
                  color: '#000000',
                  height: 48,
                  padding: '0 28px',
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)'
                }}
                onClick={() => console.log('CTA: Create First Space clicked')}
              >
                Create your first tool space
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Grid box placeholders (3rd image reference) */}
        <div className="cta-side-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 24px' }}>
          <div style={{ border: '1px dashed var(--grid-line)', borderRadius: '8px', padding: '20px', background: 'rgba(var(--text-color-rgb), 0.01)' }}>
            <BlockPlaceholder />
          </div>
          <div style={{ border: '1px dashed var(--grid-line)', borderRadius: '8px', padding: '20px', background: 'rgba(var(--text-color-rgb), 0.01)', opacity: 0.6 }}>
            <BlockPlaceholder />
          </div>
        </div>
      </div>

      {/* Responsive media overrides for CTA grid */}
      <style>{`
        @media (max-width: 768px) {
          .cta-grid-container {
            grid-template-columns: 1fr !important;
          }
          .cta-side-column {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
