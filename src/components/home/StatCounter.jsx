import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

export default function StatCounter({ value, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseFloat(value.toString().replace(/,/g, ''));
    if (isNaN(numericValue)) {
      setCount(value);
      return;
    }

    let startTimestamp = null;
    const duration = 2000; // 2 seconds animation duration

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out quad formula: f(t) = t * (2 - t)
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * numericValue);
      
      setCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(numericValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, value]);

  const displayCount = typeof count === 'number' 
    ? count.toLocaleString() 
    : count;

  return (
    <div ref={ref} className="stat-counter-card">
      <div className="stat-counter-val">
        {displayCount}{suffix}
      </div>
      <div className="stat-counter-lbl">{label}</div>
    </div>
  );
}
