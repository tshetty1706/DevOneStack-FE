import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';

export default function StepsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [1, 2, 3];

  return (
    <section className="section-container" id="steps" ref={ref} style={{ borderBottom: '1px dashed var(--grid-line)', position: 'relative' }}>
      {/* Precision corner-dots framing section */}
      <div style={{ position: 'absolute', bottom: '-2px', left: '12%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />
      <div style={{ position: 'absolute', bottom: '-2px', right: '12%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />

      {/* Header Info */}
      <div className="section-header">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          How it works
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 0.75, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          A structural mapping of resource curation. Real steps content will be rendered here.
        </motion.p>
      </div>

      {/* Grid of Steps with structured block placeholders (Reference from 3rd image) */}
      <div className="steps-container">
        {steps.map((num, idx) => (
          <motion.div
            key={num}
            className="step-card"
            style={{
              background: 'var(--card-bg)',
              border: '1px dashed var(--grid-line)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '240px',
              padding: '30px'
            }}
            initial={{ opacity: 0, y: 35 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
            transition={{ duration: 0.8, delay: 0.2 + idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Number label in card backdrop */}
            <div className="step-card-num" style={{ color: 'var(--grid-dot)', opacity: 0.25 }}>0{num}</div>
            
            {/* Code / Block structure from 3rd image */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {/* Icon / Top line simulation */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px dashed var(--grid-line)', background: 'rgba(var(--text-color-rgb), 0.02)' }} />
                <div style={{ height: '8px', width: '30%', borderRadius: '4px', background: 'var(--grid-dot)', opacity: 0.7 }} />
              </div>

              {/* Multi-line blocks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <div style={{ height: '8px', width: '20%', borderRadius: '4px', background: 'var(--grid-line)', opacity: 0.6 }} />
                  <div style={{ height: '8px', width: '60%', borderRadius: '4px', background: 'var(--grid-line)', opacity: 0.3 }} />
                </div>
                <div style={{ height: '8px', width: '85%', borderRadius: '4px', background: 'var(--grid-line)', opacity: 0.3 }} />
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <div style={{ height: '8px', width: '45%', borderRadius: '4px', background: 'var(--grid-line)', opacity: 0.4 }} />
                  <div style={{ height: '8px', width: '15%', borderRadius: '4px', background: 'var(--grid-line)', opacity: 0.6 }} />
                </div>
                <div style={{ height: '8px', width: '65%', borderRadius: '4px', background: 'var(--grid-line)', opacity: 0.3 }} />
              </div>
            </div>

            {/* Bottom active state simulation */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <div style={{ height: '6px', width: '35%', borderRadius: '3px', background: 'var(--accent-glow)', border: '1px solid var(--card-border)', opacity: 0.8 }} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
