import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../layout/Logo';
import { FaGithub } from 'react-icons/fa';

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
          {/* Github Icon */}
          <div className="flex items-center gap-2" onClick={() => window.open('https://github.com/devonestack/DevOneStack', '_blank')}>
            <FaGithub
              size={24}
              className="text-gray-300 hover:text-white/80 transition-colors cursor-pointer" />
          </div>

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
      </div>
    </nav>
  );
}
