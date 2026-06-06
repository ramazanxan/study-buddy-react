import { useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { formatDate, truncate } from '../../utils/helpers';
import './ModeratorPanel.css';

function Toast({ msg, onDone }) {
  return msg ? <div className="mod-toast" onAnimationEnd={onDone}>{msg}</div> : null;
}
function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m) => { setMsg(''); setTimeout(() => setMsg(m), 10); };
  return [msg, show, () => setMsg('')];
}

const NAV = [
  { key: 'overview',    icon: '📊', label: 'Обзор' },
  { key: 'listings',    icon: '🛍️', label: 'Маркетплейс' },
  { key: 'complaints',  icon: '🚩', label: 'Жалобы' },
  { key: 'wins',        icon: '🏆', label: 'Доска побед' },
];

export default function ModeratorPanel() {
  const { currentUser } = useApp();

  const isMod = currentUser?.role === 'moderator' || currentUser?.isModerator;
  const isAdmin = currentUser?.role === 'admin';
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isMod && !isAdmin) return <Navigate to="/feed" replace />;

  const [section, setSection] = useState('overview');

  return (
    <div className="mod-page">
      <aside className="mod-sidebar">
        <div className="mod-sidebar-head">
          <div className="mod-sidebar-icon">🛡️</div>
          <div>
            <div className="mod-sidebar-title">Панель модератора</div>
            <div className="mod-sidebar-sub">@{currentUser.login}</div>
          </div>
        </div>
        {NAV.map((item) => (
          <button
            key={item.key}
            className={`mod-nav-btn ${section === item.key ? 'active' : ''}`}
            onClick={() => setSection(item.key)}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
        <div className="mod-sidebar-footer">
          <Link to="/feed" className="mod-back-link">← Вернуться на сайт</Link>
        </div>
      </aside>

      <main className="mod-main">
        {section === 'overview'   && <OverviewSection />}
        {section === 'listings'   && <ListingsSection />}
        {section === 'complaints' && <ComplaintsSection />}
        {section === 'wins'       && <WinsSection />}
      </main>
    </div>
  );
}

/* ── Overview ── */
function OverviewSection() {
  const { users, listings, complaints, wins } = useApp();
  const openComplaints = complaints.filter((c) => c.status === 'open').length;
  const stats = [
    { icon: '🛍️', label: 'Объявлений', value: listings.length,  color: 'green' },
    { icon: '🚩', label: 'Открытых жалоб', value: openComplaints, color: openComplaints > 0 ? 'red' : 'green' },
    { icon: '🏆', label: 'Записей побед',  value: wins.length,   color: 'teal' },
    { icon: '👥', label: 'Пользователей',  value: users.filter((u) => u.role !== 'admin').length, color: 'blue' },
  ];
  return (
    <>
      <h2 className="mod-section-title">📊 Обзор</h2>
      <div className="mod-stat-grid">
        {stats.map((s) => (
          <div key={s.label} className={`mod-stat-card ${s.color}`}>
            <div className="mod-stat-icon">{s.icon}</div>
            <div>
              <div className="mod-stat-num">{s.value}</div>
              <div className="mod-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mod-info-box">
        <h3>🛡️ Что могут делать модераторы</h3>
        <ul>
          <li>✅ Удалять объявления, которые нарушают правила</li>
          <li>✅ Закрывать жалобы от пользователей</li>
          <li>✅ Удалять записи с доски побед</li>
          <li>✅ Просматривать профили пользователей</li>
          <li>❌ Блокировать пользователей (только администратор)</li>
          <li>❌ Изменять роли пользователей</li>
        </ul>
      </div>
    </>
  );
}

/* ── Listings ── */
function ListingsSection() {
  const { listings, users, removeListing, getUser } = useApp();
  const [search, setSearch] = useState('');
  const [toast, showToast, clearToast] = useToast();

  const filtered = useMemo(() =>
    listings.filter((l) => !search || l.title.toLowerCase().includes(search.toLowerCase())),
    [listings, search]
  );

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      <h2 className="mod-section-title">🛍️ Объявления маркетплейса</h2>
      <input
        className="input mod-search"
        placeholder="Поиск по названию..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 320 }}
      />
      <div className="mod-listings-grid">
        {filtered.length === 0 && (
          <div className="mod-empty">Объявлений не найдено</div>
        )}
        {filtered.map((l) => {
          const seller = getUser(l.userId);
          return (
            <div key={l.id} className="mod-listing-card">
              <div className="mod-listing-thumb">
                {l.photos?.[0]
                  ? <img src={l.photos[0]} alt={l.title} />
                  : <span className="mod-listing-emoji">📦</span>}
              </div>
              <div className="mod-listing-info">
                <div className="mod-listing-title">{l.title}</div>
                <div className="mod-listing-price">{Number(l.price).toLocaleString()} сом</div>
                <div className="mod-listing-meta">
                  <Avatar user={seller} size="xs" />
                  <span>{seller?.fullName}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{formatDate(l.at)}</span>
                </div>
                {l.description && (
                  <p className="mod-listing-desc">{truncate(l.description, 80)}</p>
                )}
              </div>
              <div className="mod-listing-actions">
                <Link to={`/profile/${l.userId}`} className="act-btn primary" style={{ textDecoration: 'none' }}>
                  👤 Профиль
                </Link>
                <button
                  className="act-btn danger"
                  onClick={() => { removeListing(l.id); showToast('Объявление удалено'); }}
                >
                  🗑 Удалить
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Complaints ── */
function ComplaintsSection() {
  const { complaints, users, resolveComplaint, getUser } = useApp();
  const [filter, setFilter] = useState('open');
  const [toast, showToast, clearToast] = useToast();

  const TYPES = { spam: 'Спам', harassment: 'Оскорбления', fake: 'Фейк', content: 'Контент', scam: 'Мошенничество', other: 'Другое' };
  const filtered = complaints.filter((c) => filter === 'all' ? true : c.status === filter);

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      <h2 className="mod-section-title">🚩 Жалобы</h2>
      <div className="mod-filter-chips" style={{ marginBottom: 16 }}>
        {[['open','Открытые'],['resolved','Решённые'],['all','Все']].map(([k,l]) => (
          <button key={k} className={`mod-chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 && <div className="mod-empty">Жалоб нет 🎉</div>}
      {filtered.map((c) => {
        const from = getUser(c.fromId);
        const about = getUser(c.aboutId);
        return (
          <div key={c.id} className={`mod-complaint-card ${c.status}`}>
            <div className="mod-complaint-head">
              <span className="mod-complaint-type">{TYPES[c.type] || c.type}</span>
              <span className={`mod-complaint-status ${c.status}`}>
                {c.status === 'resolved' ? '✅ Решена' : '⏳ Открыта'}
              </span>
              <span className="mod-complaint-date">{formatDate(c.createdAt)}</span>
            </div>
            <div className="mod-complaint-users">
              <span>От: <b>{from?.fullName}</b> (@{from?.login})</span>
              <span>На: <b>{about?.fullName}</b> (@{about?.login})</span>
            </div>
            <p className="mod-complaint-text">"{c.text}"</p>
            {c.status === 'open' && (
              <div className="mod-complaint-actions">
                <button
                  className="act-btn success"
                  onClick={() => { resolveComplaint(c); showToast('Жалоба закрыта'); }}
                >✅ Закрыть</button>
                <Link to={`/profile/${c.aboutId}`} className="act-btn primary" style={{ textDecoration: 'none' }}>
                  👁 Профиль
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ── Wins ── */
function WinsSection() {
  const { wins, getUser, removeWin } = useApp();
  const [toast, showToast, clearToast] = useToast();
  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      <h2 className="mod-section-title">🏆 Доска побед</h2>
      <div className="mod-wins-list">
        {wins.length === 0 && <div className="mod-empty">Побед пока нет</div>}
        {wins.map((w) => {
          const user = getUser(w.users?.[0]);
          return (
            <div key={w.id} className="mod-win-row">
              <Avatar user={user} size="sm" />
              <div className="mod-win-info">
                <span className="mod-win-name">{user?.fullName}</span>
                <span className="mod-win-text">{truncate(w.text, 80)}</span>
              </div>
              <button
                className="act-btn danger"
                onClick={() => { removeWin(w.id); showToast('Запись удалена'); }}
              >🗑</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
