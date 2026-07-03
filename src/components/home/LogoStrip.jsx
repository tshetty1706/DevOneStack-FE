import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

// React Icons Imports
import { FaReact, FaDocker, FaGitAlt, FaFigma, FaPython, FaJava } from 'react-icons/fa';
import { SiMongodb, SiPostman, SiPycharm } from 'react-icons/si';
import { RiTailwindCssFill } from 'react-icons/ri';
import { DiNodejs } from 'react-icons/di';
import { VscVscodeInsiders } from 'react-icons/vsc';

const tools = [
  { name: 'React', icon: <FaReact size={32} />, color: '#61DAFB' },
  { name: 'Docker', icon: <FaDocker size={32} />, color: '#2496ED' },
  { name: 'MongoDB', icon: <SiMongodb size={32} />, color: '#47A248' },
  { name: 'Tailwind', icon: <RiTailwindCssFill size={32} />, color: '#38BDF8' },
  { name: 'Git', icon: <FaGitAlt size={32} />, color: '#F05032' },
  { name: 'Figma', icon: <FaFigma size={32} />, color: '#F24E1E' },
  { name: 'Postman', icon: <SiPostman size={32} />, color: '#FF6C37' },
  { name: 'Node.js', icon: <DiNodejs size={32} />, color: '#339933' },
  { name: 'VS Code', icon: <VscVscodeInsiders size={32} />, color: '#007ACC' },
  { name: 'PyCharm', icon: <SiPycharm size={32} />, color: '#21D789' },
  { name: 'Python', icon: <FaPython size={32} />, color: '#3776AB' },
  { name: 'Java', icon: <FaJava size={32} />, color: '#5382A1' }
];

// Helper to convert hex to RGB string for box-shadow support
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '99, 102, 241';
}

export default function LogoStrip() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="logo-strip-section">
      <h3 className="logo-strip-title">Built for the tools you already use</h3>

      <Swiper
        modules={[Autoplay]}
        slidesPerView={2}
        spaceBetween={20}
        loop={true}
        speed={4000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        breakpoints={{
          480: { slidesPerView: 3, spaceBetween: 24 },
          768: { slidesPerView: 4, spaceBetween: 30 },
          1024: { slidesPerView: 6, spaceBetween: 40 },
        }}
        style={{ width: '100%', pointerEvents: 'none' }}
      >
        {tools.map((tool, index) => {
          const isHovered = index === hoveredIndex;
          return (
            <SwiperSlide key={`${tool.name}-${index}`} style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                className={`logo-strip-icon-card ${isHovered ? 'glow-active' : ''}`}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  marginTop: '10px',
                  ...(isHovered ? {
                    borderColor: tool.color,
                    color: tool.color,
                    boxShadow: `0 10px 25px rgba(${hexToRgb(tool.color)}, calc(0.24 * var(--glow-intensity)))`,
                  } : {})
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
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
