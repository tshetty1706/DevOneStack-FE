import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';

export default function PullQuote() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: '120px 24px',
        background: 'var(--bg-color)',
        borderTop: '1px dashed var(--grid-line)',
        borderBottom: '1px dashed var(--grid-line)',
        overflow: 'hidden'
      }}
    >
      {/* Precision corner-dot accents on section border */}
      <div style={{ position: 'absolute', top: '-2px', left: '8%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />
      <div style={{ position: 'absolute', top: '-2px', right: '8%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />
      <div style={{ position: 'absolute', bottom: '-2px', left: '8%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />
      <div style={{ position: 'absolute', bottom: '-2px', right: '8%', width: '4px', height: '4px', background: 'var(--grid-dot)', zIndex: 5 }} />

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          textAlign: 'left'
        }}
      >
        {/* Double Quote SVG Mark (Langbase 4th image reference) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 0.8, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '32px' }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--accent-color)" opacity="0.8">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </motion.div>

        {/* Large left-aligned quote text */}
        <motion.blockquote
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 700,
            lineHeight: 1.35,
            color: 'var(--text-color)',
            margin: '0 0 40px 0',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
          }}
        >
          If you are building code workspaces for software you learn, DevOneStack is what it should look like.
        </motion.blockquote>

        {/* Attribution Row with Badges (Langbase style) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            borderTop: '1px dashed var(--grid-line)',
            paddingTop: '24px'
          }}
        >
          {/* Avatar placeholder */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              fontFamily: 'monospace',
              color: 'var(--accent-color)'
            }}
          >
            DOS
          </div>

          {/* Author Name / Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color)' }}>
              Built By
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Trisha Shetty
            </span>
          </div>

          {/* Badges / Pill Tags (Langbase style) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              marginLeft: '12px'
            }}
          >
            {/* Tag 1 */}
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5" />
              </svg>
              GitHub
            </span>

            {/* Tag 2 */}
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--accent-color)'
              }}
            >
              Early Access
            </span>

            {/* Tag 3 */}
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-color)'
              }}
            >
              DevOneStack
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
