import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

// Inline SVGs for logo strip
const icons = {
  react: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="3" ry="9" stroke="currentColor" strokeWidth="1.8" transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="3" ry="9" stroke="currentColor" strokeWidth="1.8" transform="rotate(90 12 12)" />
      <ellipse cx="12" cy="12" rx="3" ry="9" stroke="currentColor" strokeWidth="1.8" transform="rotate(150 12 12)" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  docker: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="9" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="13" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="9" y="6" width="3" height="3" rx="0.5" fill="currentColor" />
      <path d="M2 14c0-2 2-3 5-3h11c2.5 0 4 1.5 4 4s-2 3-5 3H5c-2 0-3-1-3-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  mongodb: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 6 7 6 12.5C6 17 9.5 20.5 12 22C14.5 20.5 18 17 18 12.5C18 7 12 2 12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2v20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  ),
  tailwind: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6.5c-2.67-1.33-5.33-.67-8 2 4 1.33 5.33 0 8-2 2.67-1.33 5.33-.67 8 2-4-1.33-5.33 0-8-2ZM4 15.5c-2.67-1.33-5.33-.67-8 2 4 1.33 5.33 0 8-2 2.67-1.33 5.33-.67 8 2-4-1.33-5.33 0-8-2Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  git: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 11.5L9.5 5M9.5 5a2.5 2.5 0 1 0 0 5M9.5 5v11M9.5 16a2.5 2.5 0 1 0 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="11.5" r="2" fill="currentColor" />
    </svg>
  ),
  figma: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 9h3.5a3.5 3.5 0 1 1-3.5 3.5V9Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  postman: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  node: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L4 7.5v9L12 21l8-4.5v-9L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 3v18M4 7.5L12 12l8-4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  nextjs: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L9.5 7.5v9h1.5v-6.5l5.5 7Z" fill="currentColor" />
    </svg>
  ),
  typescript: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.8" />
      <text x="14" y="17" fill="currentColor" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="bold" fontSize="10" textAnchor="middle">TS</text>
    </svg>
  ),
  python: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8 2 8 3.5 8 5v2.5h8V5c0-1.5 0-3-4-3Z" fill="currentColor" fillOpacity="0.65" />
      <path d="M12 22c4 0 4-1.5 4-3v-2.5H8V19c0 1.5 0 3 4 3Z" fill="currentColor" />
      <path d="M8 8.5v3c0 .8.6 1.5 1.5 1.5H12V10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  rust: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5l1.5 1.5M5 19l1.5-1.5M17.5 6.5L19 5" />
    </svg>
  ),
  vscode: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7.5L16.5 21L21 18L3 7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M3 16.5L16.5 3L21 6L3 16.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M21 6v12M3 7.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  github: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 18c-4.51 2-5-2-7-2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  graphql: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3.5 7v10L12 22l8.5-5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    </svg>
  ),
  kubernetes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 9.5L5.5 21h13L22 9.5L12 2Z" />
      <path d="M12 2v19M2 9.5h20" opacity="0.5" />
    </svg>
  ),
};

const tools = [
  { id: 'react', name: 'React', icon: icons.react },
  { id: 'docker', name: 'Docker', icon: icons.docker },
  { id: 'mongodb', name: 'MongoDB', icon: icons.mongodb },
  { id: 'tailwind', name: 'Tailwind CSS', icon: icons.tailwind },
  { id: 'git', name: 'Git', icon: icons.git },
  { id: 'figma', name: 'Figma', icon: icons.figma },
  { id: 'postman', name: 'Postman', icon: icons.postman },
  { id: 'node', name: 'Node.js', icon: icons.node },
  { id: 'nextjs', name: 'Next.js', icon: icons.nextjs },
  { id: 'typescript', name: 'TypeScript', icon: icons.typescript },
  { id: 'python', name: 'Python', icon: icons.python },
  { id: 'rust', name: 'Rust', icon: icons.rust },
  { id: 'vscode', name: 'VS Code', icon: icons.vscode },
  { id: 'github', name: 'GitHub', icon: icons.github },
  { id: 'graphql', name: 'GraphQL', icon: icons.graphql },
  { id: 'kubernetes', name: 'Kubernetes', icon: icons.kubernetes },
];

// Repeat slides to guarantee Swiper loop behaves smoothly with slidesPerView
const repeatedSlides = [...tools, ...tools];

const brandColors = {
  react: { color: '#61DAFB', shadow: 'rgba(97, 218, 251, 0.2)' },
  docker: { color: '#2496ED', shadow: 'rgba(36, 150, 237, 0.2)' },
  mongodb: { color: '#47A248', shadow: 'rgba(71, 162, 72, 0.2)' },
  tailwind: { color: '#38BDF8', shadow: 'rgba(56, 189, 248, 0.2)' },
  git: { color: '#F05032', shadow: 'rgba(240, 80, 50, 0.2)' },
  figma: { color: '#F24E1E', shadow: 'rgba(242, 78, 30, 0.2)' },
  postman: { color: '#FF6C37', shadow: 'rgba(255, 108, 55, 0.2)' },
  node: { color: '#68A063', shadow: 'rgba(104, 160, 99, 0.2)' },
  nextjs: { color: '#ffffff', shadow: 'rgba(255, 255, 255, 0.15)' },
  typescript: { color: '#3178C6', shadow: 'rgba(49, 120, 198, 0.2)' },
  python: { color: '#3776AB', shadow: 'rgba(55, 118, 171, 0.2)' },
  rust: { color: '#DEA584', shadow: 'rgba(222, 165, 132, 0.2)' },
  vscode: { color: '#007ACC', shadow: 'rgba(0, 122, 204, 0.2)' },
  github: { color: '#f4f4f5', shadow: 'rgba(244, 244, 245, 0.15)' },
  graphql: { color: '#E10098', shadow: 'rgba(225, 0, 152, 0.2)' },
  kubernetes: { color: '#326CE5', shadow: 'rgba(50, 108, 229, 0.2)' },
};

export default function LogoStrip() {
  const [hoveredTool, setHoveredTool] = useState(null);

  return (
    <section className="logo-strip-section">
      <h3 className="logo-strip-title">Built for the tools you already use</h3>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={3}
        loop={true}
        speed={4000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: { slidesPerView: 3, spaceBetween: 15 },
          480: { slidesPerView: 4, spaceBetween: 20 },
          768: { slidesPerView: 6, spaceBetween: 25 },
          1024: { slidesPerView: 8, spaceBetween: 30 },
        }}
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '20px 0px 0px 0px'
        }}
      >
        {repeatedSlides.map((tool, idx) => {
          const isActive = hoveredTool === tool.id;
          const brand = brandColors[tool.id];

          return (
            <SwiperSlide key={`${tool.id}-${idx}`}>
              <div
                className={`logo-strip-icon-card ${isActive ? 'glow-active' : ''}`}
                style={isActive ? {
                  borderColor: brand.color,
                  color: brand.color,
                  boxShadow: `0 10px 25px ${brand.shadow}`,
                  transform: 'translateY(-4px)',
                } : {}}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                {tool.icon}
                <span className="logo-strip-icon-name">{tool.name}</span>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
