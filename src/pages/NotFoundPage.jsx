import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { RiSparklingFill } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import OnlyLogo from '../components/layout/OnlyLogo';
import pageNotFoundSvg from '../assets/404_Page.svg';
import './NotFoundPage.css';

/**
 * DevOneStack 404 Not Found Page
 * Clean, modern layout utilizing the official 404_Page.svg illustration,
 * matching DevOneStack theme (Dark & Light modes) across all screen sizes.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user?.username) {
      navigate(`/u/${encodeURIComponent(user.username)}/dashboard`);
    } else {
      navigate('/');
    }
  };

  const handleSearchSpaces = () => {
    if (user?.username) {
      navigate(`/u/${encodeURIComponent(user.username)}/dashboard?view=spaces`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="notfound-root">
      {/* Background Cyber Grid & Ambient Glows */}
      <div className="notfound-grid-layer" />
      <div className="notfound-glow-left" />
      <div className="notfound-glow-right" />

      {/* Clean Brand Header */}
      <header className="notfound-top-bar">
        <Link to="/" className="notfound-brand-link" aria-label="DevOneStack Home">
          <OnlyLogo width={26} height={26} />
          <span className="notfound-brand-name">DevOneStack</span>
        </Link>
      </header>

      {/* Main Section */}
      <main className="notfound-main">
        <div className="notfound-layout">
          {/* Left Column: Text & CTAs */}
          <div className="notfound-content">
            {/* Pill Badge */}
            <div className="notfound-badge">
              <RiSparklingFill className="notfound-badge-sparkle" size={13} />
              <span className="notfound-badge-text">404 · Page Not Found</span>
            </div>

            {/* Main Heading - Themed strictly with DevOneStack colors */}
            <h1 className="notfound-title">
              Lost in the <span className="notfound-title-accent">dev universe?</span>
            </h1>

            {/* Description */}
            <p className="notfound-description">
              The page you’re looking for doesn’t exist or has been moved to another orbit.
            </p>

            {/* CTA Action Buttons */}
            <div className="notfound-actions">
              <button
                type="button"
                className="notfound-btn-primary"
                onClick={handleGoHome}
                id="404-go-home-btn"
              >
                <FiArrowLeft size={16} />
                <span>Go back home</span>
              </button>

              <button
                type="button"
                className="notfound-btn-secondary"
                onClick={handleSearchSpaces}
                id="404-search-spaces-btn"
              >
                <FiSearch size={15} />
                <span>Search spaces</span>
              </button>
            </div>
          </div>

          {/* Right Column: 404_Page.svg Illustration */}
          <div className="notfound-visual-column">
            <div className="notfound-illustration-wrapper">
              <img
                src={pageNotFoundSvg}
                alt="404 Page Not Found Illustration"
                className="notfound-illustration-svg"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
