import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Lightweight, robust Markdown Renderer supporting:
 * - Headings (#, ##, ###, ####)
 * - Code blocks (```language ... ```) with syntax highlighting
 * - Inline code (`code`)
 * - Blockquotes (> quote)
 * - Ordered & Unordered lists (- item, 1. item, checkboxes [ ], [x])
 * - Tables (| Header 1 | Header 2 |)
 * - Links ([text](url)) and Images (![alt](url))
 * - Bold (**text**), Italic (*text*), Strikethrough (~~text~~)
 * - Horizontal rules (---)
 */
export default function MarkdownRenderer({ content = '', isLight = false }) {
  if (!content) return null;

  // Split into blocks
  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines = [];
  let inTable = false;
  let tableRows = [];

  const flushCodeBlock = (key) => {
    if (codeLines.length > 0) {
      elements.push(
        <div
          key={`code-${key}`}
          style={{
            margin: '12px 0',
            borderRadius: '8px',
            overflow: 'hidden',
            border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <div
            style={{
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 600,
              background: isLight ? '#f3f4f6' : '#181824',
              color: isLight ? '#6b7280' : '#9ca3af',
              borderBottom: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{codeLanguage || 'code'}</span>
          </div>
          <SyntaxHighlighter
            language={codeLanguage || 'javascript'}
            style={isLight ? coy : vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '12px',
              fontSize: '12.5px',
              background: isLight ? '#f9fafb' : '#0e0e16',
              lineHeight: 1.5,
            }}
          >
            {codeLines.join('\n')}
          </SyntaxHighlighter>
        </div>
      );
      codeLines = [];
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const isHeader = (line) => line.includes('|---') || line.includes('|:---');
      const rows = tableRows.filter(r => !isHeader(r));
      elements.push(
        <div key={`table-${key}`} style={{ overflowX: 'auto', margin: '14px 0' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
              border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <thead>
              {rows.slice(0, 1).map((r, i) => (
                <tr key={i} style={{ background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.05)' }}>
                  {r.split('|').filter(c => c.trim() !== '').map((cell, cIdx) => (
                    <th
                      key={cIdx}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}`,
                        fontWeight: 600,
                      }}
                    >
                      {renderInline(cell.trim())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.slice(1).map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.05)'}` }}>
                  {r.split('|').filter(c => c.trim() !== '').map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  const renderInline = (text) => {
    if (!text) return null;

    // Replace images ![alt](url)
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const italicRegex = /\*([^*]+)\*/g;
    const strikeRegex = /~~([^~]+)~~/g;

    // Simple parser for standard inline styles with broken image fallback
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: text
            .replace(imgRegex, (match, alt, url) => {
              const cleanAlt = (alt || '').replace(/"/g, '&quot;');
              const cleanUrl = (url || '').replace(/"/g, '&quot;');
              const altText = cleanAlt ? ` (${cleanAlt})` : '';
              return `<span class="md-img-wrapper" style="display:inline-block; max-width:100%;"><img src="${cleanUrl}" alt="${cleanAlt}" style="max-width:100%; height:auto; border-radius:8px; margin:8px 0; display:block;" onerror="this.onerror=null; this.outerHTML='<span style=\\'display:inline-flex;align-items:center;gap:6px;padding:6px 12px;margin:6px 0;border-radius:6px;background:rgba(245,158,11,0.08);border:1px dashed rgba(245,158,11,0.3);font-size:12px;color:${isLight ? '#4b5563' : '#9ca3af'};\\'>🖼️ We couldn\\'t find this image${altText}.</span>';" /></span>`;
            })
            .replace(linkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--accent-color); text-decoration:underline;">$1</a>')
            .replace(inlineCodeRegex, '<code style="background:rgba(120,120,150,0.15); padding:2px 5px; border-radius:4px; font-family:monospace; font-size:12px;">$1</code>')
            .replace(boldRegex, '<strong>$1</strong>')
            .replace(italicRegex, '<em>$1</em>')
            .replace(strikeRegex, '<del>$1</del>')
        }}
      />
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCodeBlock(i);
      } else {
        if (inTable) { inTable = false; flushTable(i); }
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableRows.push(line.trim());
      continue;
    } else if (inTable) {
      inTable = false;
      flushTable(i);
    }

    // Horizontal divider
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      elements.push(
        <hr
          key={`hr-${i}`}
          style={{
            border: 'none',
            borderTop: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}`,
            margin: '18px 0',
          }}
        />
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: '22px', fontWeight: 800, margin: '18px 0 8px', color: 'var(--text-color)' }}>{renderInline(line.slice(2))}</h1>);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: '18px', fontWeight: 700, margin: '16px 0 6px', color: 'var(--text-color)' }}>{renderInline(line.slice(3))}</h2>);
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: '15px', fontWeight: 700, margin: '14px 0 4px', color: 'var(--text-color)' }}>{renderInline(line.slice(4))}</h3>);
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push(<h4 key={i} style={{ fontSize: '13.5px', fontWeight: 600, margin: '12px 0 4px', color: 'var(--text-color)' }}>{renderInline(line.slice(5))}</h4>);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          style={{
            margin: '10px 0',
            padding: '8px 14px',
            borderLeft: `3px solid var(--accent-color)`,
            background: isLight ? 'rgba(79,70,229,0.04)' : 'rgba(99,102,241,0.06)',
            borderRadius: '0 8px 8px 0',
            fontSize: '13px',
            color: isLight ? '#4b5563' : '#d1d5db',
            fontStyle: 'italic',
          }}
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const itemText = line.trim().slice(2);
      elements.push(
        <li key={i} style={{ marginLeft: '20px', fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-color)' }}>
          {renderInline(itemText)}
        </li>
      );
      continue;
    }

    // Ordered List
    const matchOrdered = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (matchOrdered) {
      elements.push(
        <li key={i} value={matchOrdered[1]} style={{ marginLeft: '20px', fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-color)' }}>
          {renderInline(matchOrdered[2])}
        </li>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={i} style={{ height: '8px' }} />);
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} style={{ margin: '4px 0', fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text-color)' }}>
        {renderInline(line)}
      </p>
    );
  }

  if (inCodeBlock) flushCodeBlock('end');
  if (inTable) flushTable('end');

  return (
    <div className="markdown-body" style={{ width: '100%', wordBreak: 'break-word' }}>
      {elements}
    </div>
  );
}
