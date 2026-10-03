import React from 'react';
import { Button } from 'antd';
import { RiArrowLeftLine } from 'react-icons/ri';

/**
 * Reusable Space Editor Shell
 * Standardizes the 2-column full-height layout across all editor-based modules:
 * (Notes, Docs, Snippets, Learnings, Prompts, Repos).
 *
 * Left Column: Module Sidebar (Header, Search, Filters, Folder Tree, Item List)
 * Right Column: Editor Workspace (Top Toolbar, Editor Content, or Empty State)
 */
export default function SpaceEditorShell({
  isLight = false,
  sidebarTitle,
  sidebarIcon: SidebarIcon,
  sidebarAction,
  sidebarSearch,
  sidebarFilters,
  sidebarFolderTree,
  sidebarItems,
  hasActiveItem = false,
  emptyState,
  editorToolbar,
  editorContent,
  isMobile = false,
  mobileSidebarVisible = true,
  onBackToSidebar,
  isFullscreen = false,
  sidebarWidth = '270px',
}) {
  // Standard DevOneStack theme tokens matching Notes editor
  const cardBorder = isLight ? '#ebebeb' : 'rgba(255, 255, 255, 0.06)';
  const sidebarBg = isLight ? '#fafafa' : '#0a0a0f';
  const editorBg = isLight ? '#ffffff' : '#0b0b0e';
  const textColor = isLight ? '#111827' : '#ffffff';
  const textMuted = '#64748b';
  const accent = isLight ? '#4f46e5' : '#6366f1';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: isFullscreen ? '100vh' : '100%',
        width: '100%',
        minHeight: 0,
        flex: 1,
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1200 : 'auto',
        background: editorBg,
        overflow: 'hidden',
      }}
    >
      {/* ── LEFT COLUMN: Module Sidebar ── */}
      {(!isMobile || (!hasActiveItem || mobileSidebarVisible)) && (
        <aside
          style={{
            width: isMobile ? '100%' : sidebarWidth,
            minWidth: isMobile ? '100%' : '240px',
            maxWidth: isMobile ? '100%' : '320px',
            borderRight: isMobile ? 'none' : `1px solid ${cardBorder}`,
            background: sidebarBg,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {/* Header & CTA */}
          <div
            style={{
              height: '48px',
              minHeight: '48px',
              maxHeight: '48px',
              padding: '0 14px',
              borderBottom: `1px solid ${cardBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {SidebarIcon && <SidebarIcon size={17} style={{ color: accent }} />}
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: textColor,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {sidebarTitle}
              </span>
            </div>

            {sidebarAction}
          </div>

          {/* Search Input Bar */}
          {sidebarSearch && (
            <div
              style={{
                padding: '8px 12px',
                borderBottom: `1px solid ${cardBorder}`,
                flexShrink: 0,
              }}
            >
              {sidebarSearch}
            </div>
          )}

          {/* Filter Pills / Tabs */}
          {sidebarFilters && (
            <div
              style={{
                padding: '6px 12px',
                borderBottom: `1px solid ${cardBorder}`,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflowX: 'auto',
              }}
            >
              {sidebarFilters}
            </div>
          )}

          {/* Scrollable Tree & Item List */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {sidebarFolderTree}
            {sidebarItems}
          </div>
        </aside>
      )}

      {/* ── RIGHT COLUMN: Main Editor / Empty State Workspace ── */}
      {(!isMobile || (hasActiveItem && !mobileSidebarVisible)) && (
        <main
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: editorBg,
            overflow: 'hidden',
          }}
        >
          {!hasActiveItem ? (
            /* ── Clean Empty State ── */
            <div
              style={{
                flex: 1,
                minHeight: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 20px',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              {emptyState?.illustration && (
                <img
                  src={emptyState.illustration}
                  alt={sidebarTitle || 'Workspace'}
                  style={{
                    width: '100%',
                    maxWidth: '180px',
                    maxHeight: '150px',
                    height: 'auto',
                    objectFit: 'contain',
                    marginBottom: '18px',
                    opacity: isLight ? 0.9 : 0.8,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {emptyState?.badge && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: textMuted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  {emptyState.badge}
                </span>
              )}

              {emptyState?.title && (
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: textColor,
                    margin: '0 0 6px',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {emptyState.title}
                </h2>
              )}

              {emptyState?.description && (
                <p
                  style={{
                    fontSize: '13px',
                    color: textMuted,
                    margin: '0 0 20px',
                    maxWidth: '400px',
                    lineHeight: 1.5,
                  }}
                >
                  {emptyState.description}
                </p>
              )}

              {emptyState?.actions && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    maxWidth: '100%',
                  }}
                >
                  {emptyState.actions}
                </div>
              )}
            </div>
          ) : (
            /* ── Active Item Editor Workspace ── */
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Top Toolbar */}
              <div
                style={{
                  height: '48px',
                  minHeight: '48px',
                  maxHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  borderBottom: `1px solid ${cardBorder}`,
                  background: isLight ? '#fafafa' : '#101017',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                }}
              >
                {/* Mobile Back Button (if on mobile) */}
                {isMobile && onBackToSidebar && (
                  <button
                    type="button"
                    onClick={onBackToSidebar}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: textColor,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                      marginRight: '8px',
                      borderRadius: '4px',
                    }}
                    title="Back to list"
                  >
                    <RiArrowLeftLine size={18} />
                  </button>
                )}

                {editorToolbar}
              </div>

              {/* Editor / Detail Content Area */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  background: editorBg,
                }}
              >
                {editorContent}
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
