import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  RiFolderAddLine,
  RiCodeSSlashLine,
  RiGitBranchLine,
  RiCheckLine,
  RiLockLine,
  RiFileCopyLine,
  RiStarLine,
  RiTerminalBoxLine,
  RiDraftLine,
  RiLightbulbLine,
} from 'react-icons/ri';

const STEPS = [
  {
    step: '01',
    icon: RiFolderAddLine,
    title: 'Create Dedicated Spaces',
    subtitle:
      'Set up isolated workspaces for any language, framework, project, or interview topic. Choose between Public discovery or Private access.',
    visual: (
      <div className="step-mini-visual">
        <div className="step-visual-topbar">
          <div className="step-dots">
            <span style={{ background: '#ef4444' }} />
            <span style={{ background: '#f59e0b' }} />
            <span style={{ background: '#10b981' }} />
          </div>
          <span className="step-topbar-title">New Workspace Setup</span>
          <span className="step-badge-private">
            <RiLockLine size={10} /> Private
          </span>
        </div>
        <div className="step-visual-content">
          <div className="step-space-preview-box">
            <div className="step-space-avatar">⚛️</div>
            <div className="step-space-meta">
              <span className="step-space-name">Full-Stack React 19 Workspace</span>
              <span className="step-space-desc">Production patterns, hooks & state architecture</span>
            </div>
          </div>
          <div className="step-modules-toggle-row">
            <span className="step-module-tag active">✓ Notes</span>
            <span className="step-module-tag active">✓ Snippets</span>
            <span className="step-module-tag active">✓ Docs</span>
            <span className="step-module-tag active">✓ Prompts</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '02',
    icon: RiCodeSSlashLine,
    title: 'Organize Across 6 Native Modules',
    subtitle:
      'Store syntax-highlighted snippets, rich markdown notes, PDF documents, AI prompts, and bug fixes inside hierarchical folders.',
    visual: (
      <div className="step-mini-visual">
        <div className="step-visual-topbar">
          <div className="step-dots">
            <span style={{ background: '#ef4444' }} />
            <span style={{ background: '#f59e0b' }} />
            <span style={{ background: '#10b981' }} />
          </div>
          <span className="step-topbar-title">📁 hooks / useDebounce.ts</span>
          <span className="step-badge-lang">TypeScript</span>
        </div>
        <div className="step-visual-content">
          <div className="step-code-preview">
            <div className="step-code-line">
              <span className="code-kw">export function</span> <span className="code-fn">useDebounce</span>&lt;T&gt;(val: T, ms = 300) &#123;
            </div>
            <div className="step-code-line indent">
              <span className="code-kw">const</span> [state, setState] = <span className="code-fn">useState</span>(val);
            </div>
            <div className="step-code-line indent">
              <span className="code-comment">// Auto-cancel pending timers</span>
            </div>
          </div>
          <div className="step-modules-toggle-row" style={{ marginTop: '8px' }}>
            <span className="step-module-tag-sm"><RiDraftLine size={11} /> Markdown</span>
            <span className="step-module-tag-sm"><RiLightbulbLine size={11} /> Gotchas</span>
            <span className="step-module-tag-sm"><RiTerminalBoxLine size={11} /> Claude 3.5</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '03',
    icon: RiGitBranchLine,
    title: 'Collaborate, Clone & Publish',
    subtitle:
      'Publish your spaces to the community, clone resources with owner approval, or invite team members with granular Editor and Viewer roles.',
    visual: (
      <div className="step-mini-visual">
        <div className="step-visual-topbar">
          <div className="step-dots">
            <span style={{ background: '#ef4444' }} />
            <span style={{ background: '#f59e0b' }} />
            <span style={{ background: '#10b981' }} />
          </div>
          <span className="step-topbar-title">Community & Team Access</span>
          <span className="step-badge-community">Public</span>
        </div>
        <div className="step-visual-content">
          <div className="step-collab-row">
            <div className="step-user-stack">
              <div className="step-avatar-circle" style={{ background: '#4f46e5' }}>AL</div>
              <div className="step-avatar-circle" style={{ background: '#059669', marginLeft: '-8px' }}>TS</div>
              <div className="step-avatar-circle" style={{ background: '#d97706', marginLeft: '-8px' }}>+3</div>
            </div>
            <div className="step-roles-pill-group">
              <span className="step-role-chip owner">Owner</span>
              <span className="step-role-chip editor">Editor</span>
              <span className="step-role-chip viewer">Viewer</span>
            </div>
          </div>
          <div className="step-clone-action-bar">
            <span className="step-clone-btn">
              <RiFileCopyLine size={12} /> 1-Click Clone
            </span>
            <span className="step-stars-count">
              <RiStarLine size={12} style={{ color: '#eab308' }} /> 184 Stars
            </span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function StepsSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.15 });

  return (
    <section className="section-container" id="how-it-works" ref={containerRef}>
      <div className="section-header">
        <div className="hero-pill-badge" style={{ marginBottom: '16px' }}>
          <span>Simple 3-Step Flow</span>
        </div>
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">
          A structured, distraction-free workflow for organizing your technology stacks and engineering knowledge.
        </p>
      </div>

      <div className="steps-container-v2">
        {STEPS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              className="step-card-v2"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -3 }}
            >
              {/* Card Header with Step Number & Icon */}
              <div className="step-card-header">
                <div className="step-icon-squircle">
                  <Icon size={22} />
                </div>
                <div className="step-card-num-v2">{item.step}</div>
              </div>

              {/* Title & Description */}
              <h3 className="step-card-title-v2">{item.title}</h3>
              <p className="step-card-desc-v2">{item.subtitle}</p>

              {/* Small Visualized Image Below Point */}
              <div className="step-card-visual-wrapper">{item.visual}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
