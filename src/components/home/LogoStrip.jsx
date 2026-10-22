import React from 'react';
import {
  RiDraftLine,
  RiFileTextLine,
  RiCodeSSlashLine,
  RiLightbulbLine,
  RiTerminalBoxLine,
} from 'react-icons/ri';

// Pixel-perfect Folder with Git Branch icon matching Image 2
const RepoGitIcon = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H5a2 2 0 0 0-2 2v3Z" />
    <circle cx="15.5" cy="13.5" r="1.5" />
    <circle cx="18.5" cy="17.5" r="1.5" />
    <path d="M15.5 15v2.5h1.5" />
  </svg>
);

const MODULE_ITEMS = [
  { id: 'notes', name: 'Notes', icon: RiDraftLine },
  { id: 'docs', name: 'Docs', icon: RiFileTextLine },
  { id: 'snippets', name: 'Snippets', icon: RiCodeSSlashLine },
  { id: 'learnings', name: 'Learnings', icon: RiLightbulbLine },
  { id: 'prompts', name: 'Prompts', icon: RiTerminalBoxLine },
  { id: 'repos', name: 'Repositories', icon: RepoGitIcon },
];

// Duplicate items twice per track so each track is >2200px wide (fits all monitors)
const TRACK_ITEMS = [...MODULE_ITEMS, ...MODULE_ITEMS];

export default function LogoStrip() {
  return (
    <section className="logo-strip-section" aria-label="Developer Modules Flow">
      <h3 className="logo-strip-title">YOUR DEVELOPER KNOWLEDGE, ORGANIZED</h3>

      <div className="modules-marquee-container">
        {/* Soft edge fade overlays without mask-image rasterization bugs */}
        <div className="modules-fade-left" aria-hidden="true" />
        <div className="modules-fade-right" aria-hidden="true" />

        {/* Track 1: continuous non-stopping motion */}
        <div className="modules-marquee-track">
          {TRACK_ITEMS.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <div
                key={`t1-${mod.id}-${index}`}
                className="module-strip-card"
                title={`${mod.name} module`}
              >
                <div className="module-strip-icon-wrapper">
                  <Icon size={28} />
                </div>
                <span className="module-strip-name">{mod.name}</span>
              </div>
            );
          })}
        </div>

        {/* Track 2: duplicate track for seamless infinite marquee loop */}
        <div className="modules-marquee-track" aria-hidden="true">
          {TRACK_ITEMS.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <div
                key={`t2-${mod.id}-${index}`}
                className="module-strip-card"
                title={`${mod.name} module`}
              >
                <div className="module-strip-icon-wrapper">
                  <Icon size={28} />
                </div>
                <span className="module-strip-name">{mod.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
