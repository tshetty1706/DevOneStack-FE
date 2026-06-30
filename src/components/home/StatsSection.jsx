import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import StatCounter from './StatCounter';

export default function StatsSection() {
  const mainRef = useRef(null);
  const isMainInView = useInView(mainRef, { once: true, margin: '-100px' });

  // Custom count up specifically for the large "12+" stat
  const [largeCount, setLargeCount] = React.useState(0);
  
  React.useEffect(() => {
    if (!isMainInView) return;
    
    let frame = 0;
    const duration = 1500;
    const fps = 60;
    const totalFrames = Math.round(duration / (1000 / fps));
    const target = 12;
    
    const easeOutQuad = (t) => t * (2 - t);
    
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      setLargeCount(Math.round(target * easeOutQuad(progress)));
      
      if (frame === totalFrames) {
        clearInterval(interval);
        setLargeCount(target);
      }
    }, 1000 / fps);
    
    return () => clearInterval(interval);
  }, [isMainInView]);

  return (
    <section className="stats-section" id="solutions">
      {/* Primary Statistic */}
      <div className="stats-main-row" ref={mainRef}>
        <motion.div 
          className="stats-main-num"
          initial={{ opacity: 0, y: 30 }}
          animate={isMainInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {largeCount}+
        </motion.div>
        
        <motion.p 
          className="stats-main-label"
          initial={{ opacity: 0, y: 15 }}
          animate={isMainInView ? { opacity: 0.85, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          resource types tracked per tool — notes, links, snippets, boilerplate, repos, prompts, and communities, all in one page
        </motion.p>
      </div>

      {/* Secondary Statistics Grid */}
      <motion.div 
        className="stats-grid"
        initial={{ opacity: 0, y: 40 }}
        animate={isMainInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <StatCounter value="1,240" label="Tool spaces created" />
        <StatCounter value="8,500" label="Resources saved" />
        <StatCounter value="320" label="Active developers" />
      </motion.div>
    </section>
  );
}
