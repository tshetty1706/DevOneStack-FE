import React, { useMemo, useState } from 'react';
import { Tooltip, Select } from 'antd';
import { useTheme } from '../../context/ThemeContext';

/**
 * Isolated static contribution activity generator.
 * Structured so real contribution data can replace this without changing the UI.
 */
const generateStaticContributions = () => {
  const weeks = 52;
  const daysPerWeek = 7;
  const grid = [];
  const today = new Date();
  
  // Seeded pseudo-random pattern for realistic look
  let total = 0;
  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < daysPerWeek; d++) {
      // Calculate date
      const daysAgo = (weeks - 1 - w) * 7 + (6 - d);
      const cellDate = new Date(today);
      cellDate.setDate(cellDate.getDate() - daysAgo);

      // Deterministic activity pattern
      const pseudoVal = (Math.sin(w * 12.9898 + d * 78.233) * 43758.5453) % 1;
      const absVal = Math.abs(pseudoVal);
      let count = 0;
      let level = 0;

      if (absVal > 0.82) {
        count = Math.floor(absVal * 8) + 1;
        level = count > 5 ? 4 : count > 3 ? 3 : count > 1 ? 2 : 1;
      } else if (absVal > 0.65) {
        count = Math.floor(absVal * 3) + 1;
        level = 1;
      }

      total += count;
      week.push({
        date: cellDate.toISOString().split('T')[0],
        dateFormatted: cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        count,
        level,
      });
    }
    grid.push(week);
  }

  return { grid, totalContributions: total || 132 };
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = [
  { label: 'Mon', index: 1 },
  { label: 'Wed', index: 3 },
  { label: 'Fri', index: 5 },
];

export default function ContributionHeatmap({
  data = null, // Future real data placeholder
  className = '',
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [selectedRange, setSelectedRange] = useState('12');

  const { grid, totalContributions } = useMemo(() => {
    return generateStaticContributions();
  }, []);

  // Theme color tokens
  const cardBg = 'var(--card-bg)';
  const border = 'var(--card-border)';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const accentColor = isLight ? '#4f46e5' : '#6366f1';

  // Heatmap cell color maps
  const getCellBg = (level) => {
    if (level === 0) return isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)';
    if (level === 1) return isLight ? 'rgba(79, 70, 229, 0.25)' : 'rgba(99, 102, 241, 0.25)';
    if (level === 2) return isLight ? 'rgba(79, 70, 229, 0.50)' : 'rgba(99, 102, 241, 0.50)';
    if (level === 3) return isLight ? 'rgba(79, 70, 229, 0.75)' : 'rgba(99, 102, 241, 0.75)';
    return isLight ? '#4f46e5' : '#6366f1';
  };

  const getCellBorder = (level) => {
    if (level === 0) return isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)';
    return 'transparent';
  };

  return (
    <div
      className={className}
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: '16px',
        padding: 'clamp(18px, 3vw, 24px)',
        position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxSizing: 'border-box',
        width: '100%',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = border}
    >
      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '20px',
      }}>
        <div>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 700,
            color: textPrimary,
            margin: '0 0 4px 0',
            fontFamily: 'var(--font-display)',
          }}>
            Contribution Activity
          </h3>
          <p style={{
            fontSize: '12.5px',
            color: textMuted,
            margin: 0,
            lineHeight: 1.4,
          }}>
            Your activity across spaces, learnings, snippets, notes and more.
          </p>
        </div>

        <Select
          value={selectedRange}
          onChange={setSelectedRange}
          size="small"
          style={{ width: 130 }}
          options={[
            { value: '12', label: 'Last 12 months' },
            { value: '6', label: 'Last 6 months' },
            { value: '3', label: 'Last 3 months' },
          ]}
        />
      </div>

      {/* Heatmap Container with horizontal scroll container for small screens */}
      <div
        data-lenis-prevent
        style={{
          overflowX: 'auto',
          paddingBottom: '8px',
          width: '100%',
          scrollbarWidth: 'thin',
          scrollbarColor: `${isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)'} transparent`,
        }}
      >
        <div style={{ minWidth: '660px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          
          {/* Month labels row */}
          <div style={{
            display: 'flex',
            paddingLeft: '32px',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: textMuted,
            fontWeight: 500,
            marginBottom: '2px',
          }}>
            {MONTHS.map((m) => (
              <span key={m} style={{ flex: 1, textAlign: 'left' }}>
                {m}
              </span>
            ))}
          </div>

          {/* Grid with Day Labels on Left */}
          <div style={{ display: 'flex', gap: '8px' }}>
            
            {/* Days of week labels */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '88px',
              fontSize: '10px',
              color: textMuted,
              fontWeight: 500,
              width: '24px',
              flexShrink: 0,
            }}>
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks Columns */}
            <div style={{
              display: 'flex',
              gap: '3px',
              flex: 1,
            }}>
              {grid.map((week, wIdx) => (
                <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                  {week.map((cell, dIdx) => {
                    const tooltipTitle = cell.count > 0
                      ? `${cell.count} contribution${cell.count > 1 ? 's' : ''} on ${cell.dateFormatted}`
                      : `No contributions on ${cell.dateFormatted}`;

                    return (
                      <Tooltip key={dIdx} title={tooltipTitle} placement="top">
                        <div
                          style={{
                            aspectRatio: '1/1',
                            width: '100%',
                            minWidth: '10px',
                            minHeight: '10px',
                            borderRadius: '2.5px',
                            background: getCellBg(cell.level),
                            border: `1px solid ${getCellBorder(cell.level)}`,
                            transition: 'transform 0.1s ease, filter 0.1s ease',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.25)';
                            e.currentTarget.style.zIndex = 10;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.zIndex = 1;
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Footer / Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)'}`,
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: textMuted }}>
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: getCellBg(level),
                border: `1px solid ${getCellBorder(level)}`,
              }}
            />
          ))}
          <span>More</span>
        </div>

        {/* Count summary */}
        <div style={{ fontSize: '11.5px', fontWeight: 600, color: textMuted }}>
          <span style={{ color: accentColor, fontWeight: 700 }}>{totalContributions}</span> contributions this year
        </div>
      </div>
    </div>
  );
}
