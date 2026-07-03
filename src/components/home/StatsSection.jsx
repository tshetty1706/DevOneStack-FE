import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import StatCounter from './StatCounter';

export default function StatsSection() {
  const [mainCount, setMainCount] = useState(0);
  const mainRef = useRef(null);
  const isMainInView = useInView(mainRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isMainInView) return;

    let startTimestamp = null;
    const duration = 1500; // 1.5 seconds for the main statistic

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * 12);
      
      setMainCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setMainCount(12);
      }
    };

    window.requestAnimationFrame(step);
  }, [isMainInView]);

  return (
    <section className="stats-section" id="stats">
      <div className="stats-main-row" ref={mainRef}>
        <motion.div
          className="stats-main-num"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={isMainInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {mainCount}+
        </motion.div>
        <p className="stats-main-label">
          resource types tracked per tool — notes, links, snippets, repos, prompts, communities, and more
        </p>
      </div>

      <div className="stats-grid">
        <StatCounter value="1240" label="Tool spaces created" />
        <StatCounter value="8500" label="Resources saved" />
        <StatCounter value="320" label="Active developers" />
      </div>
    </section>
  );
}
