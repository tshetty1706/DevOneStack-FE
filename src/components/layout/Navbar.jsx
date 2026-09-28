import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../layout/Logo';
import { FaGithub } from 'react-icons/fa';
import { RiMenuLine, RiCloseLine, RiSunLine, RiMoonLine } from 'react-icons/ri';

const MENU_ITEMS = [
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Features', id: 'features' },
  { label: 'Contact', id: 'contact' }
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, target) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);

    if (target === 'login' || target === 'signup') {
      navigate(`/${target}`);
      return;
    }

    if (window.location.pathname === '/') {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollToId: target } });
    }
  };

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main Navigation">
        <div className="navbar-container">
          <Logo />

          {/* Desktop Navigation Links */}
          <div className="navbar-menu">
            {MENU_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="navbar-link"
                onClick={(e) => handleNavClick(e, item.id)}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="navbar-actions">
            {/* Github Icon */}
            <button
              type="button"
              className="navbar-icon-btn"
              onClick={() => window.open('https://github.com/tshetty1706/DevOneStack-FE.git', '_blank', 'noopener,noreferrer')}
              aria-label="DevOneStack GitHub Repository"
              title="GitHub Repository"
            >
              <FaGithub size={20} />
            </button>

            {user ? (
              <button
                className="navbar-btn-primary"
                onClick={() => navigate(`/u/${encodeURIComponent(user.username || 'user')}/dashboard`)}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  className="navbar-btn-text"
                  onClick={(e) => handleNavClick(e, 'login')}
                >
                  Log in
                </button>
                <button
                  className="navbar-btn-primary"
                  onClick={(e) => handleNavClick(e, 'signup')}
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="navbar-mobile-controls">
            <button
              type="button"
              className="navbar-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
            >
              {mobileMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer / Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              className="navbar-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Drawer */}
            <motion.div
              id="mobile-nav-panel"
              className="navbar-mobile-drawer"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              <div className="navbar-mobile-drawer-content">
                {/* Mobile Links */}
                <div className="navbar-mobile-links">
                  {MENU_ITEMS.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="navbar-mobile-link"
                      onClick={(e) => handleNavClick(e, item.id)}
                    >
                      {item.label}
                    </a>
                  ))}

                  <a
                    href="https://github.com/devonestack/DevOneStack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="navbar-mobile-link github-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaGithub size={18} />
                    <span>GitHub</span>
                  </a>
                </div>

                {/* Mobile Auth & Theme Actions */}
                <div className="navbar-mobile-actions">
                  {user ? (
                    <button
                      className="navbar-mobile-btn-primary"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(`/u/${encodeURIComponent(user.username || 'user')}/dashboard`);
                      }}
                    >
                      Go to Dashboard
                    </button>
                  ) : (
                    <div className="navbar-mobile-auth-group">
                      <button
                        className="navbar-mobile-btn-secondary"
                        onClick={(e) => handleNavClick(e, 'login')}
                      >
                        Log in
                      </button>
                      <button
                        className="navbar-mobile-btn-primary"
                        onClick={(e) => handleNavClick(e, 'signup')}
                      >
                        Sign up
                      </button>
                    </div>
                  )}

                  {/* Theme Switcher Row in Mobile Menu */}
                  <div className="navbar-mobile-theme-row">
                    <span className="navbar-mobile-theme-label">Appearance</span>
                    <button
                      type="button"
                      className="navbar-mobile-theme-btn"
                      onClick={toggleTheme}
                      aria-label="Toggle Theme"
                    >
                      {theme === 'dark' ? (
                        <>
                          <RiSunLine size={16} />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <RiMoonLine size={16} />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
