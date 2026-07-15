import React from 'react';
import { motion } from 'motion/react';

export default function Testimonial() {
  return (
    <section className="testimonial-section">
      {/* Left side horizontal line */}
      <div className="testimonial-left-line" />

      {/* Left vertical boundary line */}
      <div className="testimonial-divider-vertical" />

      {/* Central content container */}
      <motion.div
        className="testimonial-content-block"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="testimonial-quote-icon">
          <svg width="36" height="30" viewBox="0 0 36 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Emerald Green Quotes Logo */}
            <path d="M0 16.6667C0 7.46193 7.46193 0 16.6667 0V6.66667C11.1438 6.66667 6.66667 11.1438 6.66667 16.6667H13.3333V30H0V16.6667Z" fill="#a855f7" />
            <path d="M22.2222 16.6667C22.2222 7.46193 29.6841 0 38.8889 0V6.66667C33.366 6.66667 28.8889 11.1438 28.8889 16.6667H35.5556V30H22.2222V16.6667Z" fill="#a855f7" />
          </svg>
        </div>

        <p className="testimonial-quote-text">
          "Every technology deserves its own workspace. Every developer deserves a better way to organize knowledge."
        </p>
      </motion.div>

      {/* Right vertical boundary line */}
      <div className="testimonial-divider-vertical" />

      {/* Right side horizontal line */}
      <div className="testimonial-right-line" />
    </section>
  );
}
