import React from 'react';

export default function GridlineBackground() {
  const cols = 6;
  const rows = 6;
  const cells = Array.from({ length: cols * rows });

  return (
    <div 
      className="gridline-background"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        pointerEvents: 'none',
        zIndex: 0,
        maskImage: 'radial-gradient(circle at 50% 50%, black 50%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 50%, transparent 100%)',
      }}
    >
      {cells.map((_, i) => {
        const isLastCol = (i + 1) % cols === 0;
        const isLastRow = i >= cols * (rows - 1);

        return (
          <div 
            key={i}
            style={{
              borderTop: '1px dashed var(--grid-line)',
              borderLeft: '1px dashed var(--grid-line)',
              borderRight: isLastCol ? '1px dashed var(--grid-line)' : 'none',
              borderBottom: isLastRow ? '1px dashed var(--grid-line)' : 'none',
              position: 'relative',
              boxSizing: 'border-box',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Top-Left Corner dot */}
            <div 
              style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                width: '3.5px',
                height: '3.5px',
                background: 'var(--grid-dot)',
                zIndex: 2,
              }}
            />
            {/* If last column, render top-right dot */}
            {isLastCol && (
              <div 
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '3.5px',
                  height: '3.5px',
                  background: 'var(--grid-dot)',
                  zIndex: 2,
                }}
              />
            )}
            {/* If last row, render bottom-left dot */}
            {isLastRow && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '-2px',
                  width: '3.5px',
                  height: '3.5px',
                  background: 'var(--grid-dot)',
                  zIndex: 2,
                }}
              />
            )}
            {/* If last row and last col, render bottom-right dot */}
            {isLastRow && isLastCol && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '3.5px',
                  height: '3.5px',
                  background: 'var(--grid-dot)',
                  zIndex: 2,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
