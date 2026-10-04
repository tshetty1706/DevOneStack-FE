import React, { useState, useMemo } from 'react';
import { Tooltip, Select, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { communityApi } from '../../api/communityApi';

export default function ContributionHeatmap({
  username = '',
  className = '',
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isLight = theme === 'light';
  const [selectedRange, setSelectedRange] = useState('12');

  const targetUsername = username || user?.username;

  // Fetch real server-calculated contributions
  const {
    data: contributionData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['contributions', targetUsername, selectedRange],
    queryFn: () => communityApi.getUserContributions(targetUsername, { months: selectedRange }),
    enabled: Boolean(targetUsername),
    staleTime: 60 * 1000,
  });

  // Theme color tokens
  const cardBg = 'var(--card-bg)';
  const border = 'var(--card-border)';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const accentColor = isLight ? '#4f46e5' : '#6366f1';

  // Heatmap cell color maps (5 discrete levels)
  const getCellBg = (level) => {
    if (level === 0) return isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)';
    if (level === 1) return isLight ? 'rgba(79, 70, 229, 0.28)' : 'rgba(99, 102, 241, 0.28)';
    if (level === 2) return isLight ? 'rgba(79, 70, 229, 0.52)' : 'rgba(99, 102, 241, 0.52)';
    if (level === 3) return isLight ? 'rgba(79, 70, 229, 0.78)' : 'rgba(99, 102, 241, 0.78)';
    return isLight ? '#4f46e5' : '#6366f1';
  };

  const getCellBorder = (level) => {
    if (level === 0) return isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)';
    return 'transparent';
  };

  const grid = contributionData?.grid || [];
  const monthHeaders = contributionData?.monthHeaders || [];
  const totalContributions = contributionData?.totalContributions || 0;

  // Map month names to column index for aligned header row
  const headerMap = useMemo(() => {
    const map = new Map();
    monthHeaders.forEach((m) => {
      map.set(m.colIndex, m.month);
    });
    return map;
  }, [monthHeaders]);

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
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--card-hover-border)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: textPrimary,
              margin: '0 0 4px 0',
              fontFamily: 'var(--font-display)',
            }}
          >
            Contribution Activity
          </h3>
          <p
            style={{
              fontSize: '12.5px',
              color: textMuted,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Meaningful developer activity across items, notes, learnings, docs, and snippets.
          </p>
        </div>

        <Select
          value={selectedRange}
          onChange={setSelectedRange}
          size="small"
          style={{ width: 135 }}
          options={[
            { value: '12', label: 'Last 12 months' },
            { value: '6', label: 'Last 6 months' },
            { value: '3', label: 'Last 3 months' },
          ]}
        />
      </div>

      {/* Heatmap Grid Container - Fluid without horizontal scrollbar */}
      {isLoading ? (
        <div style={{ padding: '50px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="default" />
        </div>
      ) : isError || grid.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: textMuted, fontSize: '13px' }}>
          No contribution activity recorded for this period.
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Month labels header row aligned to each week column */}
          <div style={{ display: 'flex', gap: '2.5px', paddingLeft: '28px', width: '100%', boxSizing: 'border-box' }}>
            {grid.map((_, colIdx) => {
              const monthLabel = headerMap.get(colIdx);
              return (
                <div
                  key={colIdx}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: '10.5px',
                    color: textMuted,
                    fontWeight: 500,
                    height: '16px',
                    lineHeight: '16px',
                    position: 'relative',
                  }}
                >
                  {monthLabel && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        whiteSpace: 'nowrap',
                        zIndex: 2,
                      }}
                    >
                      {monthLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid with Day of Week Labels on the left */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch', width: '100%' }}>
            {/* Days of week labels (Mon, Wed, Fri aligned with rows 1, 3, 5) */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: 'repeat(7, 1fr)',
                gap: '2.5px',
                fontSize: '9.5px',
                color: textMuted,
                fontWeight: 500,
                width: '22px',
                flexShrink: 0,
                textAlign: 'left',
              }}
            >
              <div />
              <div style={{ display: 'flex', alignItems: 'center' }}>Mon</div>
              <div />
              <div style={{ display: 'flex', alignItems: 'center' }}>Wed</div>
              <div />
              <div style={{ display: 'flex', alignItems: 'center' }}>Fri</div>
              <div />
            </div>

            {/* Week Columns */}
            <div
              style={{
                display: 'flex',
                gap: '2.5px',
                flex: 1,
                width: '100%',
                minWidth: 0,
              }}
            >
              {grid.map((week, wIdx) => (
                <div
                  key={wIdx}
                  style={{
                    display: 'grid',
                    gridTemplateRows: 'repeat(7, 1fr)',
                    gap: '2.5px',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {week.map((cell, dIdx) => {
                    if (cell.isFuture || cell.level < 0) {
                      return <div key={dIdx} style={{ aspectRatio: '1/1', width: '100%', visibility: 'hidden' }} />;
                    }

                    const breakdownParts = [];
                    if (cell.creates > 0) breakdownParts.push(`${cell.creates} create${cell.creates > 1 ? 's' : ''}`);
                    if (cell.edits > 0) breakdownParts.push(`${cell.edits} edit${cell.edits > 1 ? 's' : ''}`);
                    if (cell.reads > 0) breakdownParts.push(`${cell.reads} read${cell.reads > 1 ? 's' : ''}`);

                    const breakdownStr = breakdownParts.length > 0 ? ` (${breakdownParts.join(', ')})` : '';

                    const tooltipTitle =
                      cell.count > 0
                        ? `${cell.count} contribution${cell.count > 1 ? 's' : ''}${breakdownStr} on ${cell.dateFormatted}`
                        : `No contributions on ${cell.dateFormatted}`;

                    return (
                      <Tooltip key={dIdx} title={tooltipTitle} placement="top" trigger={['hover', 'click']}>
                        <div
                          tabIndex={0}
                          style={{
                            aspectRatio: '1/1',
                            width: '100%',
                            borderRadius: '2px',
                            background: getCellBg(cell.level),
                            border: `1px solid ${getCellBorder(cell.level)}`,
                            transition: 'transform 0.1s ease, filter 0.1s ease',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.35)';
                            e.currentTarget.style.zIndex = 10;
                          }}
                          onMouseLeave={(e) => {
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
      )}

      {/* Footer / Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)'}`,
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: textMuted }}>
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
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
          <span style={{ color: accentColor, fontWeight: 700 }}>{totalContributions}</span> contributions in selected period
        </div>
      </div>
    </div>
  );
}
