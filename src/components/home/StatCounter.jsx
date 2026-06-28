import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

export default function StatCounter({ value, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!isInView) return;

    // Remove commas to parse raw integer
    const rawVal = parseInt(value.toString().replace(/,/g, ''), 10);
    if (isNaN(rawVal)) {
      setCount(value);
      return;
    }

    const duration = 1800; // Duration of count-up in ms
    const frameRate = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const easeOutQuad = (t) => t * (2 - t);

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const current = Math.round(rawVal * easeOutQuad(progress));
      
      // format with locale strings if needed
      if (value.toString().includes(',')) {
        setCount(current.toLocaleString());
      } else {
        setCount(current);
      }

      if (frame === totalFrames) {
        clearInterval(timer);
        setCount(value);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div className="stat-counter-card" ref={ref}>
      <div className="stat-counter-val">
        {count}
        {suffix}
      </div>
      <div className="stat-counter-lbl">{label}</div>
    </div>
  );
}
