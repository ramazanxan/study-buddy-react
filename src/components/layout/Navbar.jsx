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
  { to: '/chat',  label: 'Чаты',    icon: '💬', badge: true },
  { to: '/wins',  label: 'Победы',  icon: '🏆' },
  { to: '/admin', label: 'Панель',  icon: '⚡' },
];

const NOTIF_SEEN_KEY = 'studybuddy_notif_seen';

export default function Navbar({ theme, onToggleTheme }) {
  const { currentUser, logout, unreadCount, announcements } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(() => Number(localStorage.getItem(NOTIF_SEEN_KEY) || 0));
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  const unread = currentUser ? unreadCount() : 0;

  const notifList = [...(announcements || [])]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 8);
  const newNotifCount = notifList.filter(
    (a) => new Date(a.createdAt || a.date).getTime() > seenAt
  ).length;

  const openNotifs = () => {
    setNotifOpen((o) => !o);
    const now = Date.now();
    setSeenAt(now);
    localStorage.setItem(NOTIF_SEEN_KEY, String(now));
  };

  useEffect(() => {
    const onClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  if (!currentUser) return null;

  const role = currentUser.role;
  const isMod = role === 'moderator' || currentUser.isModerator;
  const links = role === 'admin'
    ? ADMIN_LINKS
    : isMod
      ? [...STUDENT_LINKS, { to: '/moderator', label: 'Модерация', icon: '🛡️' }]
      : (role === 'mentor' || currentUser.isMentor) ? MENTOR_LINKS : STUDENT_LINKS;

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
            <div className="nav-notif-wrap" ref={notifRef}>
              <button className="nav-notif-bell" onClick={openNotifs} aria-label="Уведомления">
                🔔
                {newNotifCount > 0 && <span className="nav-notif-dot">{newNotifCount}</span>}
              </button>
              {notifOpen && (
                <div className="nav-dropdown nav-notif-drop">
                  <div className="nav-notif-drop-head">
                    <strong>Уведомления</strong>
                    {notifList.length > 0 && (
                      <span className="nav-notif-count">{notifList.length}</span>
                    )}
                  </div>
                  {notifList.length === 0 ? (
                    <div className="nav-notif-empty">
                      <span className="nav-notif-empty-icon">🔕</span>
                      Пока нет уведомлений
                    </div>
                  ) : (
                    <>
                      {notifList.map((a) => {
                        const isNew = new Date(a.createdAt || a.date).getTime() > seenAt - 1000;
                        const icon = a.level === 'urgent' ? '🚨' : a.level === 'important' ? '⚠️' : '📢';
                        return (
                          <button
                            key={a.id}
                            className={`nav-notif-item ${isNew ? 'unread' : ''}`}
                            onClick={() => { setNotifOpen(false); navigate('/announcements'); }}
                          >
                            <div className={`nav-notif-icon ${a.level || 'normal'}`}>{icon}</div>
                            <div className="nav-notif-body">
                              <div className="nav-notif-title">{a.title || a.text?.slice(0, 50)}</div>
                              {a.text && <div className="nav-notif-text">{a.text?.slice(0, 90)}</div>}
                            </div>
                            {isNew && <span className="nav-notif-unread-dot" />}
                          </button>
                        );
                      })}
                      <div className="nav-notif-footer">
                        <button className="nav-notif-all-btn" onClick={() => { setNotifOpen(false); navigate('/announcements'); }}>
                          Все объявления →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          <button
            className="nav-theme-btn nav-theme-pill"
            onClick={onToggleTheme}
            aria-label="Переключить тему"
          >
            <span className={`pill-opt ${theme !== 'dark' ? 'pill-active' : ''}`}>☀️ Светлая</span>
            <span className={`pill-opt ${theme === 'dark' ? 'pill-active' : ''}`}>🌙 Тёмная</span>
          </button>
          <button
            className="nav-theme-compact"
            onClick={onToggleTheme}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
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
