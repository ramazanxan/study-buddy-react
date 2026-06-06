import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Avatar from '../common/Avatar';
import './Navbar.css';

const STUDENT_LINKS = [
  { to: '/feed',         label: 'Лента',      icon: '🔥' },
  { to: '/chat',         label: 'Чаты',       icon: '💬', badge: true },
  { to: '/mentorship',   label: 'Наставники', icon: '🧭' },
  { to: '/goals',        label: 'Мои цели',   icon: '🎯' },
  { to: '/wins',         label: 'Достижения', icon: '🏆' },
  { to: '/announcements',label: 'Объявления', icon: '📢' },
  { to: '/marketplace',  label: 'Маркет',     icon: '🛍️' },
];

const MENTOR_LINKS = [
  { to: '/feed',         label: 'Лента',      icon: '🔥' },
  { to: '/chat',         label: 'Чаты',       icon: '💬', badge: true },
  { to: '/mentor-panel', label: 'Подопечные', icon: '🧭' },
  { to: '/wins',         label: 'Достижения', icon: '🏆' },
  { to: '/announcements',label: 'Объявления', icon: '📢' },
  { to: '/marketplace',  label: 'Маркет',     icon: '🛍️' },
];

const ADMIN_LINKS = [
  { to: '/feed',  label: 'Лента',   icon: '🔥' },
  { to: '/wins',  label: 'Победы',  icon: '🏆' },
  { to: '/admin', label: 'Панель',  icon: '⚡' },
];

export default function Navbar() {
  const { currentUser, logout, unreadCount } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const unread = currentUser ? unreadCount() : 0;

  useEffect(() => {
    const onClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  if (!currentUser) return null;

  const role = currentUser.role;
  const links = role === 'admin' ? ADMIN_LINKS : (role === 'mentor' || currentUser.isMentor) ? MENTOR_LINKS : STUDENT_LINKS;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to={role === 'admin' ? '/admin' : '/feed'} className="nav-logo">
          <span className="nav-logo-icon">S</span>
          <span className="nav-logo-text">StudyBuddy</span>
        </NavLink>

        <button className="nav-burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Меню">
          <span /><span /><span />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon">{l.icon}</span>
              <span className="nav-label">{l.label}</span>
              {l.badge && unread > 0 && <span className="nav-badge">{unread}</span>}
            </NavLink>
          ))}
        </div>

        <div className="nav-right" ref={dropRef}>
          {role !== 'admin' && (
            <NavLink to="/complaints" className="nav-complaint-btn" title="Пожаловаться" onClick={() => setMenuOpen(false)}>
              🚩
            </NavLink>
          )}
          <button className="nav-avatar-btn" onClick={() => setDropOpen((o) => !o)}>
            <Avatar user={currentUser} size="sm" />
          </button>
          {dropOpen && (
            <div className="nav-dropdown">
              <div className="nav-drop-head">
                <strong>{currentUser.fullName}</strong>
                <span className="nav-drop-role">
                  {role === 'admin' ? '⚡ Администратор' : (role === 'mentor' || currentUser.isMentor) ? '🧭 Наставник' : '🎓 Студент'}
                </span>
                <span className="nav-drop-login">@{currentUser.login}</span>
              </div>
              {role !== 'admin' && (
                <button className="nav-drop-item" onClick={() => { setDropOpen(false); navigate('/profile'); }}>
                  👤 Мой профиль
                </button>
              )}
              <button className="nav-drop-item danger" onClick={handleLogout}>
                🚪 Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
