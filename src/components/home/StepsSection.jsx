import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';

export default function StepsSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  return (
    <section className="section-container" id="how-it-works" ref={containerRef}>
      <div className="section-header">
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">
          A structured, distraction-free workflow for organizing your technology stacks.
        </p>
      </div>

      <div className="steps-container">
        {[1, 2, 3].map((step, idx) => (
          <motion.div
            key={step}
            className="step-card"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
          >
            {/* Step indicator */}
            <div className="step-card-num">0{step}</div>
            
            {/* Structural Skeleton Placeholders */}
            <div className="step-card-icon-placeholder skeleton-shimmer" />
            <div className="step-card-title-placeholder skeleton-shimmer" />
            <div className="step-card-desc-placeholder skeleton-shimmer" />
            <div className="step-card-desc-placeholder-short skeleton-shimmer" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
