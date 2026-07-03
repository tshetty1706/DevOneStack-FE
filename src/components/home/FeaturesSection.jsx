import React, { useRef } from 'react';
import { Card } from 'antd';
import { motion, useInView } from 'motion/react';

export default function FeaturesSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.15 });

  return (
    <section className="section-container" id="features" ref={containerRef}>
      <div className="section-header">
        <h2 className="section-title">Features</h2>
        <p className="section-subtitle">
          Everything you need to manage your engineering resources in one command center.
        </p>
      </div>

      <div className="features-grid">
        {[1, 2, 3, 4, 5, 6].map((feat, idx) => (
          <motion.div
            key={feat}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
          >
            <Card
              className="premium-card feature-card"
              variant="borderless"
              style={{
                height: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              {/* Feature card skeleton placeholders */}
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
