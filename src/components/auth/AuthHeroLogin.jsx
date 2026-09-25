import React from 'react';
import { FaGithub, FaReact, FaNodeJs } from 'react-icons/fa';
import { SiSpringboot } from 'react-icons/si';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { FiSearch, FiHome, FiBookOpen, FiCode, FiLayers, FiUsers } from 'react-icons/fi';

export default function AuthHeroLogin() {
  return (
    <div className="auth-hero-container">
      {/* Badge */}
      <div className="auth-hero-badge">
        <span className="auth-badge-sparkle">✦</span>
        <span className="auth-badge-text">Organize. Build. Learn.</span>
      </div>

      {/* Main Heading */}
      <h1 className="auth-hero-title">
        Welcome back,<br />
        <span className="auth-hero-gradient">Developer.</span>
      </h1>

      {/* Subtitle */}
      <p className="auth-hero-subtitle">
        Continue building, learning and organizing your developer knowledge with DevOneStack.
      </p>

      {/* Visual Workspace & Laptop Area */}
      <div className="auth-hero-visual-wrapper login-visual-wrapper">
        {/* Annotation with curved arrow pointing into search box */}
        <div className="auth-hero-annotation login-annotation">
          <span className="annotation-text">Pick up right where you left off</span>
          <svg
            className="annotation-arrow login-arrow"
            width="42"
            height="28"
            viewBox="0 0 42 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
            aria-hidden="true"
          >
            <path
              d="M36 4 C 26 8, 16 15, 10 24 M 10 24 L 5 16 M 10 24 L 16 19"
              stroke="#818cf8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3 3.5"
            />
          </svg>
        </div>

        {/* 3D Angled Laptop Display Container */}
        <div className="auth-laptop-container">
          {/* Laptop Screen */}
          <div className="auth-laptop-screen">
            <div className="auth-screen-glare" />

            {/* Mock Screen Top Bar */}
            <div className="auth-screen-topbar">
              <div className="screen-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="screen-search-box">
                <FiSearch size={12} className="screen-search-icon" />
                <span>Search anything...</span>
                <kbd>⌘K</kbd>
              </div>
            </div>

            {/* Mock Screen Content Body */}
            <div className="auth-screen-body">
              {/* Sidebar */}
              <div className="auth-screen-sidebar">
                <div className="screen-logo-mark">
                  <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
                    <path d="M16 2L6 7L16 12L26 7L16 2Z" fill="#6366f1" />
                    <path d="M6 13L16 18L26 13" stroke="#6366f1" strokeWidth="2" />
                    <path d="M6 19L16 24L26 19" stroke="#6366f1" strokeWidth="2" opacity="0.6" />
                  </svg>
                </div>
                <div className="screen-nav-item active"><FiHome size={11} /> <span>Home</span></div>
                <div className="screen-nav-item"><FiBookOpen size={11} /> <span>Docs</span></div>
                <div className="screen-nav-item"><FiLayers size={11} /> <span>Learning</span></div>
                <div className="screen-nav-item"><FiCode size={11} /> <span>Snippets</span></div>
                <div className="screen-nav-item"><FaGithub size={11} /> <span>Repos</span></div>
                <div className="screen-nav-item"><FiUsers size={11} /> <span>Communities</span></div>
              </div>

              {/* Main Preview Grid */}
              <div className="auth-screen-main">
                <div className="screen-grid-cards">
                  <div className="screen-mini-card">
                    <div className="mini-card-icon blue"><FaReact size={13} /></div>
                    <div className="mini-card-lines">
                      <span className="line-sm" style={{ width: '60%' }} />
                      <span className="line-xs" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div className="screen-mini-card">
                    <div className="mini-card-icon purple"><SiSpringboot size={13} /></div>
                    <div className="mini-card-lines">
                      <span className="line-sm" style={{ width: '70%' }} />
                      <span className="line-xs" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div className="screen-mini-card">
                    <div className="mini-card-icon green"><FaNodeJs size={13} /></div>
                    <div className="mini-card-lines">
                      <span className="line-sm" style={{ width: '55%' }} />
                      <span className="line-xs" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div className="screen-mini-card">
                    <div className="mini-card-icon indigo"><FiCode size={13} /></div>
                    <div className="mini-card-lines">
                      <span className="line-sm" style={{ width: '65%' }} />
                      <span className="line-xs" style={{ width: '30%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Base Stand */}
          <div className="auth-laptop-base">
            <div className="laptop-notch" />
          </div>

          {/* Floating Recent Activity Card */}
          <div className="auth-recent-activity-card">
            <div className="recent-activity-header">
              <span className="activity-pulse-dot" />
              <h4>Recent activity</h4>
            </div>

            <div className="recent-activity-list">
              <div className="recent-activity-item">
                <div className="activity-badge js-badge">JS</div>
                <div className="activity-info">
                  <p className="activity-title">Added new snippet</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>

              <div className="recent-activity-item">
                <div className="activity-badge git-badge">
                  <FaGithub size={13} />
                </div>
                <div className="activity-info">
                  <p className="activity-title">Updated README.md</p>
                  <span className="activity-time">5 hours ago</span>
                </div>
              </div>

              <div className="recent-activity-item">
                <div className="activity-badge prompt-badge">
                  <HiOutlineSparkles size={13} />
                </div>
                <div className="activity-info">
                  <p className="activity-title">Saved new prompt</p>
                  <span className="activity-time">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
