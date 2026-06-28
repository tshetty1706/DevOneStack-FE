import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from 'antd';
import { motion, AnimatePresence } from 'motion/react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 15, opacity: 0, scale: 0.8, rotate: -45 }}
          animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
          exit={{ y: -15, opacity: 0, scale: 0.8, rotate: 45 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <Button
            type="text"
            shape="circle"
            size="large"
            onClick={toggleTheme}
            style={{
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
              color: 'var(--text-color)',
            }}
          >
            {theme === 'dark' ? (
              // Sun Icon
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              // Moon Icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            )}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
