import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  RiStackLine,
  RiDraftLine,
  RiSearch2Line,
  RiTeamLine,
  RiGitBranchLine,
  RiShieldCheckLine,
  RiFolderLine,
  RiFileCodeLine,
  RiCheckLine,
  RiLockLine,
  RiStarLine,
  RiFileCopyLine,
  RiUserFollowLine,
} from 'react-icons/ri';

const FEATURES = [
  {
    id: 'organized-spaces',
    title: 'Organized Spaces',
    icon: RiStackLine,
    description:
      'Create dedicated workspaces for technologies, learning paths, interview preparation, and projects. Keep everything organized with folders and tags.',
    visual: (
      <div className="feature-mini-visual">
        <div className="mini-visual-header">
          <div className="mini-visual-dots">
            <span style={{ background: '#ef4444' }} />
            <span style={{ background: '#f59e0b' }} />
            <span style={{ background: '#10b981' }} />
          </div>
          <span className="mini-visual-title-pill">
            <RiFolderLine size={12} style={{ color: '#818cf8' }} />
            <span>Frontend Architecture 2026</span>
          </span>
          <span className="mini-visual-badge">Private</span>
        </div>
        <div className="mini-visual-body">
          <div className="mini-folder-tree">
            <div className="mini-folder-row">
              <span className="mini-tree-icon">📁</span>
              <span className="mini-tree-label">01-react-internals</span>
              <span className="mini-tree-count">12 items</span>
            </div>
            <div className="mini-folder-row">
              <span className="mini-tree-icon">📁</span>
              <span className="mini-tree-label">02-state-management</span>
              <span className="mini-tree-count">8 items</span>
            </div>
            <div className="mini-folder-row active">
              <span className="mini-tree-icon">📄</span>
              <span className="mini-tree-label">useDebounceHook.ts</span>
              <span className="mini-tag-pill">#react19</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'knowledge-library',
    title: 'Your Knowledge Library',
    icon: RiDraftLine,
    description:
      'Keep notes, documentation, code snippets, learning logs, prompts, and repository references together instead of scattered across different tools.',
    visual: (
      <div className="feature-mini-visual">
        <div className="mini-visual-header">
          <span className="mini-visual-label-small">Unified Modules Hub</span>
          <span className="mini-visual-badge" style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
            <RiCheckLine size={12} /> Synced
          </span>
        </div>
        <div className="mini-visual-body">
          <div className="mini-modules-shelf">
            <div className="mini-module-chip" style={{ borderLeftColor: '#6366f1' }}>
              <span className="chip-icon">📝</span>
              <span className="chip-name">Notes</span>
              <span className="chip-val">14</span>
            </div>
            <div className="mini-module-chip" style={{ borderLeftColor: '#3b82f6' }}>
              <span className="chip-icon">📄</span>
              <span className="chip-name">Docs</span>
              <span className="chip-val">8</span>
            </div>
            <div className="mini-module-chip" style={{ borderLeftColor: '#10b981' }}>
              <span className="chip-icon">💻</span>
              <span className="chip-name">Snippets</span>
              <span className="chip-val">32</span>
            </div>
            <div className="mini-module-chip" style={{ borderLeftColor: '#f59e0b' }}>
              <span className="chip-icon">💡</span>
              <span className="chip-name">Learnings</span>
              <span className="chip-val">19</span>
            </div>
            <div className="mini-module-chip" style={{ borderLeftColor: '#a855f7' }}>
              <span className="chip-icon">🤖</span>
              <span className="chip-name">Prompts</span>
              <span className="chip-val">12</span>
            </div>
            <div className="mini-module-chip" style={{ borderLeftColor: '#ec4899' }}>
              <span className="chip-icon">📦</span>
              <span className="chip-name">Repos</span>
              <span className="chip-val">5</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'find-faster',
    title: 'Find Anything Faster',
    icon: RiSearch2Line,
    description:
      'Search your resources and navigate folders to retrieve the knowledge you need without digging through scattered files.',
    visual: (
      <div className="feature-mini-visual">
        <div className="mini-search-bar">
          <RiSearch2Line size={13} style={{ color: '#818cf8', flexShrink: 0 }} />
          <span className="mini-search-query">useIntersectionObserver</span>
          <span className="mini-kbd">⌘K</span>
        </div>
        <div className="mini-visual-body">
          <div className="mini-search-results">
            <div className="mini-result-item active">
              <span className="result-type-tag snippet">Snippet</span>
              <span className="result-title">useIntersectionObserver.ts</span>
              <span className="result-path">frontend/hooks</span>
            </div>
            <div className="mini-result-item">
              <span className="result-type-tag note">Note</span>
              <span className="result-title">Lazy Loading Image Component</span>
              <span className="result-path">frontend/docs</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'developer-community',
    title: 'Developer Community',
    icon: RiTeamLine,
    description:
      'Discover public Spaces, follow developers, share posts, and learn from resources the community finds useful.',
    visual: (
      <div className="feature-mini-visual">
        <div className="mini-post-card">
          <div className="mini-post-author">
            <div className="mini-avatar">JD</div>
            <div className="mini-author-meta">
              <span className="author-name">Josh Dev</span>
              <span className="author-handle">@josh_builds • 2h ago</span>
            </div>
            <span className="mini-follow-btn">
              <RiUserFollowLine size={11} /> Follow
            </span>
          </div>
          <p className="mini-post-snippet">
            Curated 2026 Production Dockerfile with multi-stage caching & minimal Alpine images!
          </p>
          <div className="mini-post-footer">
            <span className="footer-metric">❤️ 42 Likes</span>
            <span className="footer-metric">💬 8 Replies</span>
            <span className="footer-metric" style={{ color: '#eab308' }}>
              <RiStarLine size={12} /> Star Space
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'clone-customize',
    title: 'Clone & Customize',
    icon: RiGitBranchLine,
    description:
      'Clone public Spaces or request a copy of private Spaces with owner approval. Make your own independent version and organize it your way.',
    visual: (
      <div className="feature-mini-visual">
        <div className="mini-clone-flow">
          <div className="clone-node source">
            <span className="node-icon">🌐</span>
            <div className="node-info">
              <span className="node-title">Public Original Space</span>
              <span className="node-sub">Authoritative Read-Only</span>
            </div>
          </div>
          <div className="clone-arrow">
            <span className="arrow-line" />
            <span className="arrow-badge">
              <RiFileCopyLine size={11} /> 1-Click Clone
            </span>
            <span className="arrow-line" />
          </div>
          <div className="clone-node dest">
            <span className="node-icon">🔒</span>
            <div className="node-info">
              <span className="node-title">Your Independent Space</span>
              <span className="node-sub">100% Private & Fully Editable</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'privacy-access',
    title: 'Privacy & Access Control',
    icon: RiShieldCheckLine,
    description:
      'Keep Spaces private or make them public. Invite collaborators with defined permissions and control how your knowledge is shared.',
    visual: (
      <div className="feature-mini-visual">
        <div className="mini-permissions-matrix">
          <div className="matrix-row owner">
            <div className="role-col">
              <span className="role-badge owner">Owner</span>
              <span className="user-label">You</span>
            </div>
            <span className="perm-desc">Full control, Settings & Invitations</span>
          </div>
          <div className="matrix-row editor">
            <div className="role-col">
              <span className="role-badge editor">Editor</span>
              <span className="user-label">Collaborator</span>
            </div>
            <span className="perm-desc">Create, Edit & Move Items</span>
          </div>
          <div className="matrix-row viewer">
            <div className="role-col">
              <span className="role-badge viewer">Viewer</span>
              <span className="user-label">Collaborator</span>
            </div>
            <span className="perm-desc">Strict Read-Only Access</span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function FeaturesSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  return (
    <section className="section-container" id="features" ref={containerRef}>
      <div className="section-header">
        <div className="hero-pill-badge" style={{ marginBottom: '16px' }}>
          <span>Core Capabilities</span>
        </div>
        <h2 className="section-title">Everything Built for Developers</h2>
        <p className="section-subtitle">
          A modern command center designed specifically for organizing code, documentation, and workflows.
        </p>
      </div>

      <div className="features-grid-v2">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.id}
              className="feature-card-v2"
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
            >
              <div className="feature-card-header">
                <div className="feature-icon-squircle">
                  <Icon size={22} />
                </div>
                <div className="feature-title-block">
                  <h3 className="feature-card-title">{feat.title}</h3>
                </div>
              </div>

              <p className="feature-card-desc">{feat.description}</p>

              {/* Visualized UI Mini Preview Below Point */}
              <div className="feature-visual-wrapper">{feat.visual}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
