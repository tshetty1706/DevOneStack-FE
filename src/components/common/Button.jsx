import React from 'react';
import { motion } from 'motion/react';
import { RiLoader4Line } from 'react-icons/ri';

/**
 * Common Button Component with variants, sizes, loading and icon support.
 * 
 * @param {('primary'|'secondary'|'ghost'|'danger'|'outline')} variant
 * @param {('xs'|'sm'|'md'|'lg')} size
 * @param {boolean} loading
 * @param {boolean} disabled
 * @param {React.ReactNode} icon
 * @param {React.ReactNode} rightIcon
 * @param {Function} onClick
 * @param {string} type
 * @param {string} className
 * @param {object} style
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  rightIcon = null,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...props
}) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    xs: { padding: '5px 10px', fontSize: '12px', gap: '5px', borderRadius: '7px' },
    sm: { padding: '7px 14px', fontSize: '13px', gap: '6px', borderRadius: '8px' },
    md: { padding: '9px 18px', fontSize: '14px', gap: '8px', borderRadius: '10px' },
    lg: { padding: '12px 24px', fontSize: '15px', gap: '10px', borderRadius: '12px' },
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 10px rgba(99, 102, 241, 0.25)',
    },
    secondary: {
      background: 'var(--card-bg, rgba(255,255,255,0.05))',
      color: 'var(--text-color, #ffffff)',
      border: '1px solid var(--card-border, rgba(255,255,255,0.1))',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary, #94a3b8)',
      border: 'none',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.15)',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-color, #ffffff)',
      border: '1px solid var(--card-border, rgba(255,255,255,0.15))',
    },
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontFamily: 'var(--font-body, inherit)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    transition: 'all 0.18s ease',
    outline: 'none',
    userSelect: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <motion.button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      style={baseStyle}
      className={className}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading ? (
        <RiLoader4Line className="animate-spin" size={size === 'xs' ? 14 : size === 'sm' ? 16 : 18} />
      ) : (
        icon
      )}
      {children}
      {!loading && rightIcon}
    </motion.button>
  );
}
