import React from 'react';
import { Button } from 'antd';
import { motion } from 'motion/react';
import GlowCenterpiece from './GlowCenterpiece';
import FloatingIcons from './FloatingIcons';

export default function Hero() {
  return (
    <section className="hero-section" id="product">
      {/* Grid overlay for rich visual texture */}
      <div className="grid-bg-overlay" />
      
      {/* Subtly shifted ambient glow behind hero elements */}
      <div 
        style={{
          position: 'absolute',
          top: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-color-rgb), 0.08) 0%, rgba(var(--accent-color-rgb), 0) 70%)',
          filter: 'blur(100px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div className="hero-content">
        {/* Headline Entrance */}
        <motion.h1 
          className="hero-headline"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Organize. Learn. Build.
        </motion.h1>

        {/* Subtitle Entrance */}
        <motion.p 
          className="hero-subheading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          DevOneStack brings your docs, notes, snippets, repos, prompts, and communities into a single workspace per tool — so you stop losing your best resources across fifty browser tabs and a Notion page you forgot existed.
        </motion.p>

        {/* CTA Buttons Entrance */}
        <motion.div 
          className="hero-ctas"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
            onClick={() => console.log('CTA: Get Started clicked')}
          >
            Get started
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
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
              color: 'var(--text-color)',
              borderColor: 'var(--card-border)',
            }}
            onClick={() => {
              const stepsEl = document.getElementById('steps');
              if (stepsEl) {
                stepsEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            See how it works
          </Button>
        </motion.div>
      </div>

      {/* Hero Visual Area: Centerpiece + floating icons */}
      <motion.div 
        className="hero-visual-wrapper"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlowCenterpiece />
        <FloatingIcons />
      </motion.div>
    </section>
  );
}
