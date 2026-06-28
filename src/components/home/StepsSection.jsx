import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';

export default function StepsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [1, 2, 3];

  return (
    <section className="section-container" id="steps" ref={ref}>
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

      {/* Grid of Steps */}
      <div className="steps-container">
        {steps.map((num, idx) => (
          <motion.div
            key={num}
            className="step-card"
            initial={{ opacity: 0, y: 35 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
            transition={{ duration: 0.8, delay: 0.2 + idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Number label in card backdrop */}
            <div className="step-card-num">0{num}</div>
            
            {/* Skeletal Visual Placeholders */}
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
