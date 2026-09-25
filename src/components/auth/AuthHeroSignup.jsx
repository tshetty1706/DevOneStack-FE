import React from 'react';
import { FaReact, FaNodeJs } from 'react-icons/fa';
import { SiSpringboot } from 'react-icons/si';
import { FiFolder, FiMoreHorizontal, FiBookOpen, FiEdit3, FiCode, FiLink } from 'react-icons/fi';

export default function AuthHeroSignup() {
  return (
    <div className="auth-hero-container">
      {/* Badge */}
      <div className="auth-hero-badge">
        <span className="auth-badge-sparkle">✦</span>
        <span className="auth-badge-text">Organize. Build. Learn.</span>
      </div>

      {/* Main Heading */}
      <h1 className="auth-hero-title">
        Your developer<br />
        workspace <span className="auth-hero-gradient">starts here.</span>
      </h1>

      {/* Subtitle */}
      <p className="auth-hero-subtitle">
        Create your DevOneStack account and start organizing your knowledge, notes, snippets and more — all in one place.
      </p>

      {/* Visual Workspace & Spaces Area */}
      <div className="auth-hero-visual-wrapper signup-visual-wrapper">
        {/* Floating Connecting Lines SVG */}
        <svg
          className="auth-connecting-lines"
          viewBox="0 0 500 320"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Path to Docs */}
          <path
            d="M230 65 C 265 50, 275 35, 285 30"
            stroke="rgba(56, 189, 248, 0.45)"
            strokeWidth="1.75"
            strokeDasharray="3.5 4.5"
          />
          {/* Path to Notes */}
          <path
            d="M230 115 C 275 110, 305 105, 335 105"
            stroke="rgba(192, 132, 252, 0.45)"
            strokeWidth="1.75"
            strokeDasharray="3.5 4.5"
          />
          {/* Path to Snippets */}
          <path
            d="M230 165 C 255 175, 265 185, 275 190"
            stroke="rgba(129, 140, 248, 0.45)"
            strokeWidth="1.75"
            strokeDasharray="3.5 4.5"
          />
          {/* Path to Resources */}
          <path
            d="M230 205 C 270 220, 305 235, 340 245"
            stroke="rgba(244, 114, 182, 0.45)"
            strokeWidth="1.75"
            strokeDasharray="3.5 4.5"
          />
        </svg>

        {/* Main "My Spaces" Card */}
        <div className="auth-spaces-card">
          <div className="spaces-card-header">
            <div className="spaces-card-title">
              <FiFolder className="folder-icon" size={17} />
              <span>My Spaces</span>
            </div>
            <FiMoreHorizontal className="spaces-card-dots" size={17} />
          </div>

          <div className="spaces-card-list">
            <div className="space-item space-react">
              <div className="space-icon-wrap react-wrap">
                <FaReact size={16} />
              </div>
              <span className="space-name">React</span>
              <span className="space-arrow">›</span>
            </div>

            <div className="space-item space-spring">
              <div className="space-icon-wrap spring-wrap">
                <SiSpringboot size={16} />
              </div>
              <span className="space-name">Spring Boot</span>
              <span className="space-arrow">›</span>
            </div>

            <div className="space-item space-node">
              <div className="space-icon-wrap node-wrap">
                <FaNodeJs size={16} />
              </div>
              <span className="space-name">Node.js</span>
              <span className="space-arrow">›</span>
            </div>

            <div className="space-item space-system">
              <div className="space-icon-wrap system-wrap">
                <FiBookOpen size={16} />
              </div>
              <span className="space-name">System Design</span>
              <span className="space-arrow">›</span>
            </div>
          </div>
        </div>

        {/* Floating Satellite Tiles */}
        <div className="auth-floating-satellite tile-docs">
          <div className="satellite-icon cyan">
            <FiBookOpen size={15} />
          </div>
          <span className="satellite-label">Docs</span>
        </div>

        <div className="auth-floating-satellite tile-notes">
          <div className="satellite-icon purple">
            <FiEdit3 size={15} />
          </div>
          <span className="satellite-label">Notes</span>
        </div>

        <div className="auth-floating-satellite tile-snippets">
          <div className="satellite-icon indigo">
            <FiCode size={15} />
          </div>
          <span className="satellite-label">Snippets</span>
        </div>

        <div className="auth-floating-satellite tile-resources">
          <div className="satellite-icon magenta">
            <FiLink size={15} />
          </div>
          <span className="satellite-label">Resources</span>
        </div>

        {/* Dedicated Bottom Annotation with curved arrow pointing up to My Spaces */}
        <div className="auth-hero-annotation signup-annotation">
          <svg
            className="annotation-arrow signup-arrow"
            width="36"
            height="28"
            viewBox="0 0 36 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
            aria-hidden="true"
          >
            <path
              d="M4 24 C 10 16, 18 9, 28 5 M 28 5 L 18 5 M 28 5 L 25 14"
              stroke="#c084fc"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3 3.5"
            />
          </svg>
          <span className="annotation-text">One space for everything you learn</span>
        </div>
      </div>
    </div>
  );
}
