import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../layout/Logo';

const MENU_ITEMS = [
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Features', id: 'features' },
  { label: 'Contact', id: 'contact' }
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavClick = (e, target) => {
    e.preventDefault();
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
    <nav className="navbar">
      <div className="navbar-container">
        <Logo />

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

        <div className="navbar-actions">
          {/* Viewer count with eye icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              marginRight: '8px',
              userSelect: 'none',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>43.3k</span>
          </div>

          {user ? (
            <button
              className="navbar-btn-primary"
              onClick={() => navigate('/dashboard')}
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
      </div>
    </nav>
  );
}
