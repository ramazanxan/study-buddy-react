import { useState, useMemo, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { formatDate, truncate } from '../../utils/helpers';
import './Admin.css';

// ── Excel/CSV export — открывается в Excel, с BOM для кириллицы ──
function exportToExcel(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(';'),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(';')),
  ].join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Toast ──────────────────────────────────────────────
function Toast({ msg, onDone }) {
  return msg ? <div className="admin-toast" onAnimationEnd={onDone}>{msg}</div> : null;
}
function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m) => { setMsg(''); setTimeout(() => setMsg(m), 10); };
  return [msg, show, () => setMsg('')];
}

// ── Mock static data ───────────────────────────────────
const MOCK_NEWS_INIT = [
  { id: 'n1', title: 'Открытие нового IT-корпуса', text: 'В КГТУ открылся новый корпус Института информационных технологий с современным оборудованием и коворкингом для студентов.', date: '2026-06-01', pinned: true },
  { id: 'n2', title: 'Хакатон KSTU Hack 2026', text: 'Приглашаем студентов принять участие в ежегодном хакатоне. Призовой фонд — 150 000 сом. Регистрация открыта.', date: '2026-06-10', pinned: false },
  { id: 'n3', title: 'Стипендиальная программа от Huawei', text: 'Компания Huawei объявила о стипендиальной программе для студентов IT-специальностей КГТУ.', date: '2026-06-05', pinned: false },
];
const MOCK_FILES = [
  { id: 'f1', name: 'Учебный план ИИТ 2026.pdf', size: '1.2 МБ', date: '01.06.2026', icon: '📄' },
  { id: 'f2', name: 'Статистика успеваемости.xlsx', size: '456 КБ', date: '28.05.2026', icon: '📊' },
  { id: 'f3', name: 'Правила общежития.docx', size: '234 КБ', date: '15.05.2026', icon: '📋' },
  { id: 'f4', name: 'Расписание экзаменов.png', size: '890 КБ', date: '10.05.2026', icon: '🖼️' },
  { id: 'f5', name: 'Положение о студ. совете.pdf', size: '315 КБ', date: '01.05.2026', icon: '📄' },
];
const MOCK_NOTIF_HISTORY = [
  { id: 'nh1', text: 'Напоминание: сдача курсовых работ до 12 июня', recipients: 'Все студенты', date: '04.06.2026' },
  { id: 'nh2', text: 'Обновление расписания ИИТ на следующую неделю', recipients: 'Институт ИИТ', date: '02.06.2026' },
  { id: 'nh3', text: 'Добро пожаловать в StudyBuddy! Заполните профиль.', recipients: 'Новые пользователи', date: '01.06.2026' },
];
const MOCK_EVENTS = [
  { date: '10 июн', name: 'Хакатон KSTU Hack 2026', loc: 'Корпус А, ауд. 301' },
  { date: '14 июн', name: 'День открытых дверей ИИТ', loc: 'Главный корпус' },
  { date: '16 июн', name: 'Начало экзаменационной сессии', loc: 'Все корпуса' },
];
const WEEKLY_LOGINS = [42, 58, 71, 49, 83, 96, 67]; // Mon–Sun

// ── Sidebar nav config ─────────────────────────────────
const NAV = [
  { section: 'Главное', items: [{ key: 'dashboard', icon: '📊', label: 'Дашборд' }] },
  { section: 'Пользователи', items: [
    { key: 'students', icon: '👨‍🎓', label: 'Студенты' },
    { key: 'mentors', icon: '🧭', label: 'Наставники' },
    { key: 'moderators', icon: '🛡️', label: 'Модераторы' },
  ]},
  { section: 'Контент', items: [
    { key: 'news', icon: '📰', label: 'Новости' },
    { key: 'ann_admin', icon: '📢', label: 'Объявления' },
    { key: 'notifications', icon: '🔔', label: 'Уведомления' },
    { key: 'complaints_admin', icon: '🚩', label: 'Жалобы' },
  ]},
  { section: 'Система', items: [
    { key: 'files', icon: '📁', label: 'Файлы' },
    { key: 'statistics', icon: '📈', label: 'Статистика' },
    { key: 'settings', icon: '⚙️', label: 'Настройки' },
  ]},
];

// ── Root ───────────────────────────────────────────────
export default function Admin() {
  const { currentUser } = useApp();
  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/feed" replace />;

  const [section, setSection] = useState('dashboard');
  const allItems = NAV.flatMap((g) => g.items);

  return (
    <div className="admin-page">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        {NAV.map((g) => (
          <div key={g.section} className="admin-sidebar-group">
            <span className="admin-sidebar-group-label">{g.section}</span>
            {g.items.map((item) => (
              <button key={item.key}
                className={`admin-nav-btn ${section === item.key ? 'active' : ''}`}
                onClick={() => setSection(item.key)}>
                <span className="nav-icon">{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Content area */}
      <div className="admin-right">

        {/* Mobile tabs — always visible, horizontal scroll, NO button needed */}
        <div className="admin-mtabs">
          {allItems.map((item) => (
            <button
              key={item.key}
              className={`admin-mtab ${section === item.key ? 'active' : ''}`}
              onClick={() => setSection(item.key)}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{item.label}</span>
            </button>
          ))}
        </div>

        <main className="admin-main">
          {section === 'dashboard'         && <DashboardSection />}
          {section === 'students'          && <StudentsSection />}
          {section === 'mentors'           && <MentorsSection />}
          {section === 'moderators'        && <ModeratorsSection />}
          {section === 'news'              && <NewsSection />}
          {section === 'ann_admin'         && <AnnouncementsSection />}
          {section === 'notifications'     && <NotificationsSection />}
          {section === 'complaints_admin'  && <ComplaintsAdminSection />}
          {section === 'files'             && <FilesSection />}
          {section === 'statistics'        && <StatisticsSection />}
          {section === 'settings'          && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────
function DashboardSection() {
  const { users, matches, mentorships } = useApp();
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const students = users.filter((u) => u.role !== 'admin');
  const newUsers = users.filter((u) => new Date(u.createdAt).getTime() >= weekAgo).length;
  const activeMentors = mentorships.filter((m) => m.status === 'active').length;
  const recent = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const CARDS = [
    { icon: '👨‍🎓', label: 'Всего студентов', value: students.length, cls: 'blue' },
    { icon: '🆕', label: 'Новых за неделю', value: newUsers, cls: '' },
    { icon: '🤝', label: 'Активных менторств', value: activeMentors, cls: 'green' },
    { icon: '⚠️', label: 'Жалоб', value: 3, cls: 'red' },
    { icon: '👥', label: 'Учебных групп', value: matches.length + 5, cls: 'orange' },
    { icon: '📅', label: 'Ближайших мероприятий', value: MOCK_EVENTS.length, cls: 'amber' },
  ];

  return (
    <>
      <h2 className="admin-section-title">📊 Дашборд</h2>
      <div className="admin-stat-grid">
        {CARDS.map((c) => (
          <div key={c.label} className={`admin-stat-card ${c.cls}`}>
            <div className="admin-stat-icon">{c.icon}</div>
            <div><div className="admin-stat-num">{c.value}</div><div className="admin-stat-label">{c.label}</div></div>
          </div>
        ))}
      </div>
      <div className="dash-cols">
        <div className="dash-widget">
          <h3>👋 Последние регистрации</h3>
          {recent.map((u) => (
            <div key={u.id} className="recent-user-row">
              <Avatar user={u} size="sm" />
              <div className="recent-user-info">
                <div className="recent-user-name">{u.fullName}</div>
                <div className="recent-user-meta">{u.faculty} · {formatDate(u.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="dash-widget">
          <h3>📅 Ближайшие мероприятия</h3>
          {MOCK_EVENTS.map((e, i) => (
            <div key={i} className="event-row">
              <div className="event-date">{e.date}</div>
              <div><div className="event-name">{e.name}</div><div className="event-loc">📍 {e.loc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── ADD USER MODAL ─────────────────────────────────────
function AddUserModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ login: '', fullName: '', faculty: KGTU_FACULTIES[0].id, direction: KGTU_FACULTIES[0].directions[0], course: 1, age: 18, password: 'pass123', role: 'student' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setFaculty = (id) => setForm((f) => ({ ...f, faculty: id, direction: KGTU_FACULTIES.find((x) => x.id === id)?.directions[0] || '' }));
  const currentFaculty = KGTU_FACULTIES.find((f) => f.id === form.faculty) || KGTU_FACULTIES[0];
  const submit = () => {
    if (!form.login.trim() || !form.fullName.trim()) return;
    onAdd(form);
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 16 }}>➕ Добавить пользователя</h3>
        <div className="form-group"><label className="label">Логин</label><input className="input" value={form.login} onChange={(e) => set('login', e.target.value)} placeholder="ivanov" /></div>
        <div className="form-group" style={{ marginTop: 10 }}><label className="label">ФИО</label><input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Иван Иванов" /></div>
        <div className="form-group" style={{ marginTop: 10 }}>
          <label className="label">Институт</label>
          <select className="input" value={form.faculty} onChange={(e) => setFaculty(e.target.value)}>
            {KGTU_FACULTIES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginTop: 10 }}>
          <label className="label">Направление</label>
          <select className="input" value={form.direction} onChange={(e) => set('direction', e.target.value)}>
            {currentFaculty.directions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="admin-form-row" style={{ marginTop: 10 }}>
          <div className="form-group"><label className="label">Курс</label><input className="input" type="number" min={1} max={5} value={form.course} onChange={(e) => set('course', e.target.value)} /></div>
          <div className="form-group"><label className="label">Возраст</label><input className="input" type="number" min={14} max={80} value={form.age} onChange={(e) => set('age', e.target.value)} /></div>
        </div>
        <div className="form-group" style={{ marginTop: 10 }}><label className="label">Пароль</label><input className="input" value={form.password} onChange={(e) => set('password', e.target.value)} /></div>
        <div className="form-group" style={{ marginTop: 10 }}>
          <label className="label">О себе</label>
          <textarea className="textarea" rows={2} placeholder="Интересы, цели, чем занимается..." value={form.about || ''} onChange={(e) => set('about', e.target.value)} />
        </div>
        <div className="form-group" style={{ marginTop: 10 }}>
          <label className="label">Роль</label>
          <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)}>
            <option value="student">Студент</option>
            <option value="mentor">Наставник</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Button variant="primary" onClick={submit}>Добавить</Button>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    </div>
  );
}

// ── STUDENTS ───────────────────────────────────────────
const PAGE_SIZE = 10;
function StudentsSection() {
  const { users, banUser, unbanUser, grantBadge, toggleModerator, deleteUser, importUsers, register } = useApp();
  const [search, setSearch] = useState('');
  const [faculty, setFaculty] = useState('');
  const [course, setCourse] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, showToast, clearToast] = useToast();

  const faculties = useMemo(() => [...new Set(users.filter(u => u.role !== 'admin').map(u => u.faculty))], [users]);

  const filtered = useMemo(() => users.filter((u) => {
    if (u.role === 'admin') return false;
    if (search && !u.fullName.toLowerCase().includes(search.toLowerCase()) && !u.login.toLowerCase().includes(search.toLowerCase()) && !(u.groupName || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (faculty && u.faculty !== faculty) return false;
    if (course && String(u.course) !== String(course)) return false;
    if (status === 'banned' && !u.isBanned) return false;
    if (status === 'active' && u.isBanned) return false;
    return true;
  }), [users, search, faculty, course, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageUsers = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleAdd = (form) => {
    const result = importUsers([form]);
    if (result > 0) showToast(`✅ Пользователь @${form.login} добавлен`);
    else showToast('Логин уже занят');
  };

  const handleDelete = (u) => {
    if (!window.confirm(`Удалить пользователя ${u.fullName}? Это действие нельзя отменить.`)) return;
    deleteUser(u.id);
    showToast(`${u.fullName} удалён`);
  };

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      {showAdd && <AddUserModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
      <h2 className="admin-section-title">👨‍🎓 Студенты</h2>
      <div style={{ marginBottom: 12 }}>
        <Button variant="primary" onClick={() => setShowAdd(true)}>➕ Добавить пользователя</Button>
      </div>
      <div className="admin-toolbar">
        <input className="input" placeholder="Поиск по ФИО, логину, группе..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} style={{ maxWidth: 280 }} />
        <select className="input" value={faculty} onChange={(e) => { setFaculty(e.target.value); setPage(0); }} style={{ maxWidth: 180 }}>
          <option value="">Все институты</option>
          {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="input" value={course} onChange={(e) => { setCourse(e.target.value); setPage(0); }} style={{ maxWidth: 120 }}>
          <option value="">Все курсы</option>
          {[1,2,3,4,5].map((c) => <option key={c} value={c}>{c} курс</option>)}
        </select>
      </div>
      <div className="admin-filter-chips" style={{ marginBottom: 16 }}>
        {[['all','Все'],['active','Активные'],['banned','Заблокированные']].map(([k,l]) => (
          <button key={k} className={`admin-filter-chip ${status === k ? 'active' : ''}`} onClick={() => { setStatus(k); setPage(0); }}>{l}</button>
        ))}
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th></th><th>Логин</th><th>ФИО</th><th>Институт</th><th>Курс</th><th>Реп.</th><th>Статус</th><th>Действия</th></tr></thead>
          <tbody>
            {pageUsers.map((u) => (
              <tr key={u.id}>
                <td><Avatar user={u} size="sm" /></td>
                <td style={{ fontWeight: 600 }}>@{u.login}</td>
                <td>{u.fullName}</td>
                <td>{u.faculty}</td>
                <td>{u.course}</td>
                <td><b style={{ color: 'var(--primary)' }}>{u.reputation}</b></td>
                <td>
                  <span className={`status-chip ${u.isBanned ? 'banned' : u.role === 'mentor' || u.isMentor ? 'mentor' : 'active'}`}>
                    {u.isBanned ? 'Заблокирован' : u.role === 'mentor' || u.isMentor ? 'Наставник' : 'Активен'}
                  </span>
                </td>
                <td><div className="admin-actions">
                  <Link to={`/profile/${u.id}`} className="act-btn primary">👁</Link>
                  {u.isBanned
                    ? <button className="act-btn success" onClick={() => { unbanUser(u.id); showToast(`${u.fullName} разблокирован`); }}>✅</button>
                    : <button className="act-btn danger" onClick={() => { banUser(u.id); showToast(`${u.fullName} заблокирован`); }}>🚫</button>}
                  <button className="act-btn" onClick={() => { toggleModerator(u.id); showToast(u.isModerator || u.role==='moderator' ? `Снят с модерации` : `Теперь модератор`); }}>
                    {u.isModerator || u.role === 'moderator' ? '🛡️−' : '🛡️+'}
                  </button>
                  <button className="act-btn danger" onClick={() => handleDelete(u)}>🗑</button>
                </div></td>
              </tr>
            ))}
            {pageUsers.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--text-muted)', padding: 32 }}>Нет результатов</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Показано {pageUsers.length} из {filtered.length}</span>
        <button className="page-btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>← Назад</button>
        {Array.from({ length: pages }, (_, i) => (
          <button key={i} className={`page-btn ${i === page ? 'current' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
        ))}
        <button className="page-btn" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}>Вперёд →</button>
      </div>
    </>
  );
}

// ── MENTORS ────────────────────────────────────────────
function MentorsSection() {
  const { users, mentorships, banUser, unbanUser, deleteUser, importUsers } = useApp();
  const [toast, showToast, clearToast] = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const mentors = users.filter((u) => u.isMentor || u.role === 'mentor');

  const handleDelete = (u) => {
    if (!window.confirm(`Удалить наставника ${u.fullName}?`)) return;
    deleteUser(u.id);
    showToast(`${u.fullName} удалён`);
  };

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      {showAdd && <AddUserModal onAdd={(form) => { const n = importUsers([{ ...form, role: 'mentor' }]); showToast(n > 0 ? `Наставник добавлен` : 'Логин занят'); setShowAdd(false); }} onClose={() => setShowAdd(false)} />}
      <h2 className="admin-section-title">🧭 Наставники</h2>
      <div style={{ marginBottom: 12 }}>
        <Button variant="primary" onClick={() => setShowAdd(true)}>➕ Добавить наставника</Button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th></th><th>Логин</th><th>ФИО</th><th>Институт</th><th>Курс</th><th>Подопечных</th><th>Статус</th><th>Действия</th></tr></thead>
          <tbody>
            {mentors.map((u) => {
              const menteeCount = mentorships.filter((m) => m.mentorId === u.id && m.status === 'active').length;
              return (
                <tr key={u.id}>
                  <td><Avatar user={u} size="sm" /></td>
                  <td style={{ fontWeight: 600 }}>@{u.login}</td>
                  <td>{u.fullName}</td>
                  <td>{u.faculty}</td>
                  <td>{u.course}</td>
                  <td><b>{menteeCount}</b></td>
                  <td><span className={`status-chip ${u.isBanned ? 'banned' : 'mentor'}`}>{u.isBanned ? 'Заблокирован' : 'Наставник'}</span></td>
                  <td><div className="admin-actions">
                    <Link to={`/profile/${u.id}`} className="act-btn primary">👁</Link>
                    {u.isBanned
                      ? <button className="act-btn success" onClick={() => { unbanUser(u.id); showToast(`Разблокирован`); }}>✅</button>
                      : <button className="act-btn danger" onClick={() => { banUser(u.id); showToast(`Заблокирован`); }}>🚫</button>}
                    <button className="act-btn danger" onClick={() => handleDelete(u)}>🗑</button>
                  </div></td>
                </tr>
              );
            })}
            {mentors.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--text-muted)', padding: 32 }}>Нет наставников</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── MODERATORS ─────────────────────────────────────────
function ModeratorsSection() {
  const { users, toggleModerator, deleteUser, importUsers } = useApp();
  const [toast, showToast, clearToast] = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const mods = users.filter((u) => u.role === 'moderator' || u.isModerator);

  const handleDelete = (u) => {
    if (!window.confirm(`Удалить модератора ${u.fullName}?`)) return;
    deleteUser(u.id);
    showToast(`${u.fullName} удалён`);
  };

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      {showAdd && <AddUserModal onAdd={(form) => { const n = importUsers([form]); if (n > 0) { const created = users.find(u => u.login === form.login); if (created) toggleModerator(created.id); showToast('Модератор добавлен'); } else showToast('Логин занят'); setShowAdd(false); }} onClose={() => setShowAdd(false)} />}
      <h2 className="admin-section-title">🛡️ Модераторы</h2>
      <div style={{ marginBottom: 16 }}>
        <Button variant="primary" onClick={() => setShowAdd(true)}>➕ Добавить модератора</Button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th></th><th>Логин</th><th>ФИО</th><th>Институт</th><th>Действия</th></tr></thead>
          <tbody>
            {mods.map((u) => (
              <tr key={u.id}>
                <td><Avatar user={u} size="sm" /></td>
                <td style={{ fontWeight: 600 }}>@{u.login}</td>
                <td>{u.fullName}</td>
                <td>{u.faculty}</td>
                <td><div className="admin-actions">
                  <Link to={`/profile/${u.id}`} className="act-btn primary">👁</Link>
                  <button className="act-btn" onClick={() => { toggleModerator(u.id); showToast(`${u.fullName} снят с модерации`); }}>🛡️ Снять</button>
                  <button className="act-btn danger" onClick={() => handleDelete(u)}>🗑</button>
                </div></td>
              </tr>
            ))}
            {mods.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding: 32 }}>Нет модераторов</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── NEWS ───────────────────────────────────────────────
function NewsSection() {
  const [news, setNews] = useState(MOCK_NEWS_INIT);
  const [form, setForm] = useState({ title: '', text: '' });
  const [toast, showToast, clearToast] = useToast();

  const addNews = () => {
    if (!form.title.trim() || !form.text.trim()) return;
    setNews([{ id: 'n' + Date.now(), title: form.title, text: form.text, date: new Date().toISOString().slice(0, 10), pinned: false }, ...news]);
    setForm({ title: '', text: '' });
    showToast('Новость опубликована');
  };
  const pin = (id) => setNews(news.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const del = (id) => { setNews(news.filter((n) => n.id !== id)); showToast('Новость удалена'); };

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      <h2 className="admin-section-title">📰 Новости</h2>
      <div className="admin-form-card">
        <h3>Опубликовать новость</h3>
        <div className="form-group">
          <label className="label">Заголовок</label>
          <input className="input" placeholder="Название новости" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="label">Текст</label>
          <textarea className="textarea" placeholder="Содержание новости..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} />
        </div>
        <div style={{ marginTop: 14 }}>
          <Button variant="primary" onClick={addNews}>Опубликовать</Button>
        </div>
      </div>
      <div className="news-list">
        {news.map((n) => (
          <div key={n.id} className={`news-card ${n.pinned ? 'pinned' : ''}`}>
            <div className="news-card-body">
              {n.pinned && <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginRight: 8 }}>📌 Закреплено</span>}
              <div className="news-card-title">{n.title}</div>
              <div className="news-card-text">{truncate(n.text, 120)}</div>
              <div className="news-card-date">{n.date}</div>
            </div>
            <div className="news-card-actions">
              <button className="act-btn" onClick={() => pin(n.id)}>{n.pinned ? '📌 Открепить' : '📌 Закрепить'}</button>
              <button className="act-btn danger" onClick={() => del(n.id)}>🗑 Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── ANNOUNCEMENTS ──────────────────────────────────────
function AnnouncementsSection() {
  const { announcements, addAnnouncement, updateAnnouncement, removeAnnouncement } = useApp();
  const items = announcements;
  const [form, setForm] = useState({ text: '', level: 'normal', date: '' });
  const [toast, showToast, clearToast] = useToast();
  const LEVEL_LABEL = { normal: 'Обычное', important: 'Важное', urgent: 'Срочное' };

  const add = () => {
    if (!form.text.trim()) return;
    addAnnouncement({ text: form.text, level: form.level, date: form.date || new Date().toISOString().slice(0,10), pinned: false });
    setForm({ text: '', level: 'normal', date: '' });
    showToast('✅ Опубликовано — видно студентам и наставникам');
  };
  const pin = (id) => { const a = items.find((x) => x.id === id); if (a) updateAnnouncement({ ...a, pinned: !a.pinned }); };
  const del = (id) => { removeAnnouncement(id); showToast('Объявление удалено'); };

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      <h2 className="admin-section-title">📢 Объявления</h2>
      <div className="admin-form-card">
        <h3>Новое объявление</h3>
        <div className="form-group">
          <label className="label">Текст объявления</label>
          <textarea className="textarea" placeholder="Текст объявления..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={2} />
        </div>
        <div className="admin-form-row" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label className="label">Важность</label>
            <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="normal">Обычное</option>
              <option value="important">Важное</option>
              <option value="urgent">Срочное</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Срок действия</label>
            <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Button variant="primary" onClick={add}>Опубликовать</Button>
        </div>
      </div>
      <div className="announce-list">
        {items.map((a) => (
          <div key={a.id} className={`announce-card ${a.level}`}>
            <div style={{ flex: 1 }}>
              <span className={`announce-label ${a.level}`}>{LEVEL_LABEL[a.level]}</span>
              {a.pinned && <span style={{ fontSize: 12, marginRight: 6 }}>📌</span>}
              {a.text}
              {a.date && <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 8 }}>до {a.date}</span>}
            </div>
            <div className="admin-actions">
              <button className="act-btn" onClick={() => pin(a.id)}>{a.pinned ? 'Открепить' : '📌 Закрепить'}</button>
              <button className="act-btn danger" onClick={() => del(a.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── NOTIFICATIONS ──────────────────────────────────────
function NotificationsSection() {
  const { users, addAnnouncement } = useApp();
  const [recipients, setRecipients] = useState('all');
  const [institute, setInstitute] = useState('');
  const [text, setText] = useState('');
  const [history, setHistory] = useState(MOCK_NOTIF_HISTORY);
  const [toast, showToast, clearToast] = useToast();
  const institutes = [...new Set(users.map(u => u.faculty).filter(Boolean))];

  const send = () => {
    if (!text.trim()) return;
    let label = 'Все студенты';
    if (recipients === 'institute' && institute) label = `Институт ${institute}`;
    if (recipients === 'new') label = 'Новые пользователи';
    const count = recipients === 'all' ? users.length : recipients === 'institute' ? users.filter(u => u.faculty === institute).length : 5;
    // Publish to the shared announcements feed so students AND mentors see it in their "Объявления" tab.
    addAnnouncement({
      title: '🔔 Уведомление от администрации',
      text,
      audience: label,
      level: 'important',
      date: new Date().toISOString().slice(0, 10),
      pinned: false,
    });
    setHistory([{ id: 'nh' + Date.now(), text, recipients: label, date: new Date().toLocaleDateString('ru') }, ...history]);
    setText('');
    showToast(`✅ Уведомление отправлено ${count} пользователям — видно в их вкладке «Объявления»`);
  };

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      <h2 className="admin-section-title">🔔 Уведомления</h2>
      <div className="admin-form-card">
        <h3>Отправить уведомление</h3>
        <div className="form-group">
          <label className="label">Получатели</label>
          <div className="notif-recipients">
            {[['all','Все студенты'],['institute','По институту'],['new','Новые пользователи']].map(([k,l]) => (
              <button key={k} className={`admin-filter-chip ${recipients === k ? 'active' : ''}`} onClick={() => setRecipients(k)}>{l}</button>
            ))}
          </div>
          {recipients === 'institute' && (
            <select className="input" value={institute} onChange={(e) => setInstitute(e.target.value)} style={{ maxWidth: 240, marginTop: 8 }}>
              <option value="">Выберите институт</option>
              {institutes.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
        </div>
        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="label">Текст уведомления</label>
          <textarea className="textarea" placeholder="Введите текст уведомления..." value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        </div>
        <div style={{ marginTop: 14 }}>
          <Button variant="primary" onClick={send}>Отправить</Button>
        </div>
      </div>
      <h3 className="section-h" style={{ fontSize: 15, marginBottom: 12 }}>История уведомлений</h3>
      <div className="notif-history">
        {history.map((n) => (
          <div key={n.id} className="notif-item">
            <div>{n.text}<div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>→ {n.recipients}</div></div>
            <div className="notif-meta">{n.date}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── FILES ──────────────────────────────────────────────
const FILES_KEY = 'studybuddy_admin_files';
const iconFor = (name) => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  if (['doc', 'docx'].includes(ext)) return '📋';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return '🖼️';
  if (ext === 'pdf') return '📄';
  return '📁';
};

function FilesSection() {
  const { importUsers } = useApp();
  const [files, setFiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FILES_KEY)) || MOCK_FILES; }
    catch { return MOCK_FILES; }
  });
  const [toast, showToast, clearToast] = useToast();
  const fileRef = useRef(null);
  const importRef = useRef(null);

  const persist = (next) => {
    setFiles(next);
    try { localStorage.setItem(FILES_KEY, JSON.stringify(next)); } catch { /* quota */ }
  };

  const del = (id) => { persist(files.filter((f) => f.id !== id)); showToast('Файл удалён'); };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const entry = {
        id: 'f' + Date.now(),
        name: file.name,
        size: file.size > 1024 * 1024
          ? (file.size / 1024 / 1024).toFixed(1) + ' МБ'
          : (file.size / 1024).toFixed(0) + ' КБ',
        date: new Date().toLocaleDateString('ru'),
        icon: iconFor(file.name),
        data: reader.result,
      };
      persist([entry, ...files]);
      showToast(`Файл "${file.name}" загружен`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        if (!rows.length) { showToast('Файл пустой'); return; }
        const usersData = rows.map((r) => ({
          login:    String(r['Логин']      || r['login']    || '').trim(),
          fullName: String(r['Имя']        || r['ФИО']      || r['fullName'] || '').trim(),
          faculty:  String(r['Институт']   || r['faculty']  || '').trim(),
          direction:String(r['Направление']|| r['direction']|| '').trim(),
          course:   r['Курс']    || r['course']   || 1,
          age:      r['Возраст'] || r['age']      || 18,
          password: String(r['Пароль']     || r['password'] || 'pass123').trim(),
          about:    String(r['О себе']     || r['about']    || '').trim(),
        }));
        const count = importUsers(usersData);
        showToast(`✅ Добавлено ${count} участников из "${file.name}"`);
      } catch (err) {
        showToast('Ошибка чтения файла: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    exportToExcel('шаблон_участников.csv', [{
      Логин: 'ivanov', Имя: 'Иван Иванов', Институт: 'ИИТ',
      Направление: 'Программная инженерия (ПИ)', Курс: 2,
      Возраст: 20, Пароль: 'pass123', 'О себе': '',
    }]);
    showToast('Шаблон скачан — заполните и загрузите обратно');
  };

  const download = (f) => {
    if (!f.data) { showToast('Это демо-файл без содержимого'); return; }
    const a = document.createElement('a');
    a.href = f.data;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      <h2 className="admin-section-title">📁 Файлы</h2>

      <div className="admin-form-card" style={{ margin: '0 0 20px' }}>
        <h3>📥 Импорт участников из Excel</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          Загрузите файл .xlsx или .csv со столбцами: <b>Логин, Имя, Институт, Направление, Курс, Возраст, Пароль, О себе</b>
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => importRef.current?.click()}>📂 Загрузить файл участников</Button>
          <Button variant="secondary" onClick={downloadTemplate}>📄 Скачать шаблон</Button>
        </div>
        <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleImport} />
      </div>

      <div className="upload-zone" style={{ cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📤</div>
        <p>Перетащите файл сюда или нажмите для загрузки</p>
        <Button variant="secondary" size="sm" type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Загрузить файл</Button>
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      <div className="file-list">
        {files.map((f) => (
          <div key={f.id} className="file-row">
            <div className="file-icon">{f.icon}</div>
            <div className="file-info">
              <div className="file-name">{f.name}</div>
              <div className="file-meta">{f.size} · {f.date}</div>
            </div>
            <div className="file-actions">
              <button className="act-btn primary" onClick={() => download(f)}>⬇ Скачать</button>
              <button className="act-btn danger" onClick={() => del(f.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── STATISTICS ─────────────────────────────────────────
function StatisticsSection() {
  const { users, matches } = useApp();
  const byFaculty = useMemo(() => {
    const map = {};
    users.filter(u => u.role !== 'admin').forEach((u) => { map[u.faculty] = (map[u.faculty] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [users]);
  const maxFac = byFaculty[0]?.[1] || 1;

  const topUsers = useMemo(() =>
    [...users].filter(u => u.role !== 'admin').sort((a, b) => b.reputation - a.reputation).slice(0, 5)
  , [users]);

  const maxWeekly = Math.max(...WEEKLY_LOGINS);
  const DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

  return (
    <>
      <h2 className="admin-section-title">📈 Статистика</h2>
      <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card blue"><div className="admin-stat-icon">👥</div><div><div className="admin-stat-num">{users.filter(u=>u.role!=='admin').length}</div><div className="admin-stat-label">Всего студентов</div></div></div>
        <div className="admin-stat-card green"><div className="admin-stat-icon">💞</div><div><div className="admin-stat-num">{matches.length}</div><div className="admin-stat-label">Всего мэтчей</div></div></div>
        <div className="admin-stat-card"><div className="admin-stat-icon">📊</div><div><div className="admin-stat-num">{WEEKLY_LOGINS.reduce((a,b)=>a+b,0)}</div><div className="admin-stat-label">Входов за неделю</div></div></div>
      </div>
      <div className="stat-panels">
        <div className="stat-panel">
          <h3>Студентов по институтам</h3>
          <div className="bar-chart">
            {byFaculty.map(([fac, cnt]) => (
              <div key={fac} className="bar-row">
                <div className="bar-label" style={{ width: 60, fontSize: 11 }}>{fac}</div>
                <div className="bar-track"><div className="bar-fill blue" style={{ width: `${(cnt / maxFac) * 100}%` }} /></div>
                <div className="bar-count">{cnt}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-panel">
          <h3>Активность за неделю (входов)</h3>
          <div className="weekly-chart">
            {WEEKLY_LOGINS.map((v, i) => (
              <div key={i} className="weekly-bar-col">
                <div className="weekly-bar" style={{ height: `${Math.round((v / maxWeekly) * 68)}px` }} />
                <div className="weekly-day">{DAYS[i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-panel">
          <h3>Топ-5 студентов по репутации</h3>
          <div className="top-list">
            {topUsers.map((u, i) => (
              <div key={u.id} className="top-row">
                <div className="top-rank">{i + 1}</div>
                <Avatar user={u} size="xs" />
                <div className="top-name">{u.fullName}</div>
                <div className="top-rep">⭐ {u.reputation}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-panel">
          <h3>Мэтчи за месяц</h3>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 900, color: 'var(--primary)' }}>{matches.length}</div>
            <div style={{ color: 'var(--success)', fontSize: 14, fontWeight: 600, marginTop: 8 }}>↑ +{Math.max(1, matches.length)} с прошлого месяца</div>
          </div>
          <div className="bar-chart" style={{ marginTop: 8 }}>
            {[['Создано мэтчей', matches.length, maxFac],['Учебных групп', matches.length + 5, maxFac + 5],['Активных пактов', 2, maxFac]].map(([l,v,m]) => (
              <div key={l} className="bar-row">
                <div className="bar-label" style={{ width: 130, fontSize: 11 }}>{l}</div>
                <div className="bar-track"><div className="bar-fill green" style={{ width: `${Math.round((v / (m||1)) * 100)}%` }} /></div>
                <div className="bar-count">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── SETTINGS ───────────────────────────────────────────
const SETTINGS_KEY = 'studybuddy_settings';

function SettingsSection() {
  const { users } = useApp();
  const [s, setS] = useState(() => {
    try { return { name: 'StudyBuddy', slogan: 'Найди своих по учёбе', regOpen: true, confirmAccounts: false, maxMentees: 5, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
    catch { return { name: 'StudyBuddy', slogan: 'Найди своих по учёбе', regOpen: true, confirmAccounts: false, maxMentees: 5 }; }
  });
  const [toast, showToast, clearToast] = useToast();
  // Сохраняем сразу при изменении — настройки реально применяются
  const upd = (k, v) => {
    const next = { ...s, [k]: v };
    setS(next);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* quota */ }
  };

  const backup = () => {
    const rows = users.filter((u) => u.role !== 'admin').map((u) => ({
      Логин: u.login,
      Имя: u.fullName,
      'Name (EN)': u.fullNameEn || '',
      Институт: u.faculty,
      Направление: u.direction,
      Курс: u.course,
      Возраст: u.age,
      Роль: u.role,
      Наставник: u.isMentor ? 'да' : 'нет',
      Репутация: u.reputation,
      Заблокирован: u.isBanned ? 'да' : 'нет',
    }));
    if (!rows.length) { showToast('Нет пользователей для экспорта'); return; }
    exportToExcel(`studybuddy_users_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    showToast(`✅ Экспортировано ${rows.length} пользователей в Excel`);
  };

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      <h2 className="admin-section-title">⚙️ Настройки</h2>
      <div className="settings-form">
        <div className="admin-form-card" style={{ margin: 0 }}>
          <h3>Основные настройки</h3>
          <div className="settings-field">
            <label>Название платформы</label>
            <input className="input" value={s.name} onChange={(e) => upd('name', e.target.value)} />
          </div>
          <div className="settings-field" style={{ marginTop: 12 }}>
            <label>Слоган</label>
            <input className="input" value={s.slogan} onChange={(e) => upd('slogan', e.target.value)} />
          </div>
          <div className="settings-field" style={{ marginTop: 12 }}>
            <label>Макс. подопечных у наставника</label>
            <input className="input" type="number" min={1} max={20} value={s.maxMentees} onChange={(e) => upd('maxMentees', Number(e.target.value))} style={{ maxWidth: 100 }} />
          </div>
        </div>
        <div className="admin-form-card" style={{ margin: 0 }}>
          <h3>Доступ и безопасность</h3>
          <div className="setting-row">
            <div><div className="setting-label">Регистрация открыта</div><div className="setting-desc">Новые пользователи могут создавать аккаунты</div></div>
            <label className="switch"><input type="checkbox" checked={s.regOpen} onChange={(e) => upd('regOpen', e.target.checked)} /><span className="slider" /></label>
          </div>
        </div>
        <div className="admin-form-card" style={{ margin: 0 }}>
          <h3>Резервное копирование</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Создайте резервную копию всех данных платформы.</p>
          <Button variant="primary" onClick={backup}>💾 Создать резервную копию</Button>
        </div>
        <Button variant="primary" size="lg" onClick={() => showToast('Настройки сохранены')}>Сохранить настройки</Button>
      </div>
    </>
  );
}

// ── COMPLAINTS ADMIN ──────────────────────────────────
function ComplaintsAdminSection() {
  const { complaints, users, resolveComplaint, banUser } = useApp();
  const [toast, showToast, clearToast] = useToast();
  const [filter, setFilter] = useState('open');

  const COMPLAINT_TYPES = {
    spam: 'Спам', harassment: 'Оскорбления', fake: 'Фейк',
    content: 'Контент', scam: 'Мошенничество', other: 'Другое',
  };

  const filtered = complaints.filter((c) => filter === 'all' ? true : c.status === filter);

  return (
    <>
      <Toast msg={toast} onDone={clearToast} />
      <h2 className="admin-section-title">🚩 Жалобы</h2>
      <div className="admin-filter-chips" style={{ marginBottom: 16 }}>
        {[['open','Открытые'],['resolved','Решённые'],['all','Все']].map(([k,l]) => (
          <button key={k} className={`admin-filter-chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      <div className="complaints-admin-list">
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Нет жалоб</div>}
        {filtered.map((c) => {
          const from = users.find((u) => u.id === c.fromId);
          const about = users.find((u) => u.id === c.aboutId);
          return (
            <div key={c.id} className={`complaint-admin-card ${c.status}`}>
              <div className="cac-header">
                <span className="cac-type">{COMPLAINT_TYPES[c.type] || c.type}</span>
                <span className={`cac-status ${c.status}`}>{c.status === 'resolved' ? '✅ Решена' : '⏳ Открыта'}</span>
                <span className="cac-date">{new Date(c.createdAt).toLocaleDateString('ru')}</span>
              </div>
              <div className="cac-body">
                <div className="cac-users">
                  <span>От: <strong>{from?.fullName || '?'}</strong> (@{from?.login})</span>
                  <span>На: <strong>{about?.fullName || '?'}</strong> (@{about?.login})</span>
                </div>
                <p className="cac-text">"{c.text}"</p>
              </div>
              {c.status === 'open' && (
                <div className="admin-actions">
                  <button className="act-btn success" onClick={() => { resolveComplaint(c); showToast('Жалоба закрыта'); }}>✅ Закрыть</button>
                  <button className="act-btn danger" onClick={() => { banUser(c.aboutId); resolveComplaint(c); showToast(`${about?.fullName} заблокирован`); }}>🚫 Заблокировать</button>
                  <Link to={`/profile/${c.aboutId}`} className="act-btn primary">👁 Профиль</Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
