import React, { useRef } from 'react';
import { Card } from 'antd';
import { motion, useInView } from 'motion/react';

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const cards = [1, 2, 3, 4, 5, 6];

  return (
    <section className="section-container" id="features" ref={ref}>
      {/* Header Info */}
      <div className="section-header">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Workspace Features
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

      {/* Grid of Cards */}
      <div className="features-grid">
        {cards.map((num, idx) => (
          <motion.div
            key={num}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.1 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="premium-card feature-card">
              {/* Skeletal Visual Placeholders */}
              <div className="feature-icon-placeholder skeleton-shimmer" />
              <div className="feature-title-placeholder skeleton-shimmer" />
              <div className="feature-desc-placeholder skeleton-shimmer" />
              <div className="feature-desc-placeholder-short skeleton-shimmer" />
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
