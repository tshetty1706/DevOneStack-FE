import React from 'react';
import { motion } from 'motion/react';

export default function GradientBars() {
  const bars = [
    { width: '140px', height: '6px', top: '18%', left: '15%', delay: 0.7, rotate: -12 },
    { width: '220px', height: '8px', top: '65%', right: '12%', delay: 0.9, rotate: 8 },
    { width: '90px', height: '5px', bottom: '28%', left: '28%', delay: 1.1, rotate: 35 },
  ];

  return (
    <div 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        overflow: 'hidden', 
        pointerEvents: 'none', 
        zIndex: 1 
      }}
    >
      {bars.map((bar, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scaleX: 0, rotate: bar.rotate }}
          animate={{ opacity: 0.5, scaleX: 1, rotate: bar.rotate }}
          transition={{ duration: 1.4, delay: bar.delay, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            width: bar.width,
            height: bar.height,
            top: bar.top,
            left: bar.left,
            right: bar.right,
            bottom: bar.bottom,
            transformOrigin: 'left center',
            background: 'var(--mesh-gradient)',
            borderRadius: '10px',
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}
