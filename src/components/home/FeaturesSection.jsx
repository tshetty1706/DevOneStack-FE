import React, { useRef } from 'react';
import { Card } from 'antd';
import { motion, useInView } from 'motion/react';

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const cards = [1, 2, 3, 4, 5, 6];

  return (
    <section className="section-container" id="features" ref={ref} style={{ borderBottom: '1px dashed var(--grid-line)', position: 'relative' }}>
      {/* Precision corner-dots framing section */}
      <div style={{ position: 'absolute', bottom: '-2px', left: '20%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />
      <div style={{ position: 'absolute', bottom: '-2px', right: '20%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />

      {/* Header Info */}
      <div className="section-header">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Features
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 0.75, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          Discover structural components of your workspace. Real features content will be rendered here.
        </motion.p>
      </div>

      {/* Grid of Cards (Reference from 3rd image placeholders) */}
      <div className="features-grid">
        {cards.map((num, idx) => (
          <motion.div
            key={num}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.1 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card 
              className="premium-card feature-card"
              style={{
                background: 'var(--card-bg)',
                border: '1px dashed var(--grid-line)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                height: '210px'
              }}
            >
              {/* Code / block placeholders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                {/* Header mock */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px dashed var(--grid-line)', background: 'rgba(var(--text-color-rgb), 0.02)' }} />
                  <div style={{ height: '7px', width: '40%', borderRadius: '4px', background: 'var(--grid-dot)', opacity: 0.65 }} />
                </div>
                
                {/* Simulated content bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginTop: '8px' }}>
                  <div style={{ height: '6px', width: '90%', borderRadius: '3px', background: 'var(--grid-line)', opacity: 0.35 }} />
                  <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                    <div style={{ height: '6px', width: '30%', borderRadius: '3px', background: 'var(--grid-line)', opacity: 0.35 }} />
                    <div style={{ height: '6px', width: '50%', borderRadius: '3px', background: 'var(--grid-line)', opacity: 0.25 }} />
                  </div>
                  <div style={{ height: '6px', width: '75%', borderRadius: '3px', background: 'var(--grid-line)', opacity: 0.35 }} />
                  <div style={{ height: '6px', width: '60%', borderRadius: '3px', background: 'var(--grid-line)', opacity: 0.25 }} />
                </div>
              </div>

              {/* Mini tag block */}
              <div style={{ display: 'flex', gap: '4px', width: '100%', marginTop: '16px' }}>
                <div style={{ height: '14px', width: '25%', borderRadius: '8px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', opacity: 0.7 }} />
                <div style={{ height: '14px', width: '35%', borderRadius: '8px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', opacity: 0.7 }} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
