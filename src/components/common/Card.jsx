import React from 'react';
import { motion } from 'motion/react';

/**
 * Common Card component with glassmorphism, border, and hover elevation.
 */
export default function Card({
  children,
  hoverable = true,
  onClick,
  className = '',
  style = {},
  padding = '18px',
  ...props
}) {
  const isClickable = Boolean(onClick);

  return (
    <motion.div
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
        border: '1px solid var(--card-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '14px',
        padding,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        ...style,
      }}
      whileHover={hoverable ? { y: -2, transition: { duration: 0.2 } } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}
