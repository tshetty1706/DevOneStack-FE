import React from 'react';
import { Button } from 'antd';
import { motion } from 'motion/react';
import GridlineBackground from './GridlineBackground';
import GlowCenterpiece from './GlowCenterpiece';
import FloatingIcons from './FloatingIcons';

export default function Hero() {
  return (
    <section className="hero-section" id="product">
      {/* Precision Gridline Background */}
      <GridlineBackground />

      {/* Flowing background gradient stream */}
      <div className="hero-background-flow">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      <div className="hero-grid">
        {/* Left Column: Headline and text details */}
        <div className="hero-content">
          {/* Monospace Command Pill (Langbase + Payload details) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              padding: '6px 12px',
              marginBottom: '24px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-elevation)',
            }}
          >
            <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>[input]</span>
            <span style={{ color: 'var(--text-color)' }}>npx devonestack init</span>
          </motion.div>

          {/* Headline Entrance */}
          <motion.h1
            className="hero-headline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Organize. Build.<br />
            Learn.<br />
          </motion.h1>

          {/* Subtitle Entrance */}
          <motion.p
            className="hero-subheading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            DevOneStack brings your docs, notes, snippets, boilerplate, repos, prompts, and communities into a single structured page for any tool, library, or language you learn — so you never lose your best resources.
          </motion.p>

          {/* CTA Buttons Entrance */}
          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button
              type="primary"
              size="large"
              style={{
                background: 'var(--accent-color)',
                borderColor: 'var(--accent-color)',
                height: 48,
                padding: '0 24px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => console.log('CTA: Start building clicked')}
            >
              Start building
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>

            <Button
              type="default"
              ghost
              size="large"
              style={{
                height: 48,
                padding: '0 24px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: '24px',
                color: 'var(--text-color)',
                borderColor: 'var(--card-border)',
                background: 'rgba(var(--text-color-rgb), 0.02)',
              }}
              onClick={() => {
                const stepsEl = document.getElementById('steps');
                if (stepsEl) {
                  stepsEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Explore docs
            </Button>
          </motion.div>
        </div>

        {/* Right Column: Hero Visual Container */}
        <motion.div
          className="hero-visual-wrapper"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', position: 'relative', marginTop: 0 }}
        >
          <GlowCenterpiece />
          <FloatingIcons />
        </motion.div>
      </div>
    </section>
  );
}
