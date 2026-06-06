import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/helpers';
import './MentorPanel.css';

const TABS = [
  { key: 'students', icon: '👥', label: 'Подопечные' },
  { key: 'requests', icon: '📩', label: 'Запросы' },
  { key: 'deadlines', icon: '📅', label: 'Дедлайны' },
  { key: 'tasks', icon: '✅', label: 'Задания' },
];

function Toast({ msg, onDone }) {
  if (!msg) return null;
  return <div className="mp-toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function MentorPanel() {
  const { currentUser, mentorships, users, deadlines, tasks } = useApp();
  const isMentor = currentUser.role === 'mentor' || currentUser.isMentor;

  if (!isMentor) return (
    <div className="page"><div className="container"><div className="empty-state">
      <div className="emoji">🧭</div><p>Только наставники могут видеть эту панель.</p>
    </div></div></div>
  );

  const [tab, setTab] = useState('students');

  const myActive = mentorships.filter((m) => m.mentorId === currentUser.id && m.status === 'active');
  const myRequests = mentorships.filter((m) => m.mentorId === currentUser.id && m.status === 'pending');
  const myDeadlines = deadlines.filter((d) => d.mentorId === currentUser.id);
  const myTasks = tasks.filter((t) => t.mentorId === currentUser.id);

  return (
    <div className="page mp-page">
      <div className="container mp-container">
        {/* Header */}
        <div className="mp-header">
          <div className="mp-header-left">
            <h1 className="mp-title">Панель наставника 🧭</h1>
            <p className="mp-subtitle">{currentUser.fullName} · {myActive.length} подопечных</p>
          </div>
          <div className="mp-header-stats">
            <div className="mp-stat"><span>{myActive.length}</span><small>Подопечных</small></div>
            <div className="mp-stat"><span>{myRequests.length}</span><small>Запросов</small></div>
            <div className="mp-stat"><span>{myTasks.filter(t => t.status === 'pending').length}</span><small>Задач в работе</small></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mp-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`mp-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span>{t.icon}</span> {t.label}
              {t.key === 'requests' && myRequests.length > 0 && (
                <span className="mp-tab-badge">{myRequests.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'students'   && <StudentsTab mentorships={myActive} users={users} deadlines={deadlines} tasks={tasks} />}
        {tab === 'requests'   && <RequestsTab requests={myRequests} users={users} />}
        {tab === 'deadlines'  && <DeadlinesTab mentorships={myActive} users={users} deadlines={myDeadlines} />}
        {tab === 'tasks'      && <TasksTab mentorships={myActive} users={users} tasks={myTasks} />}
      </div>
    </div>
  );
}

// ── Students tab ─────────────────────────────────────────────────
function StudentsTab({ mentorships, users, deadlines, tasks }) {
  const navigate = useNavigate();

  if (mentorships.length === 0) return (
    <div className="empty-state"><div className="emoji">👥</div><p>У вас пока нет подопечных.</p><span className="text-muted">Подождите запросов от студентов.</span></div>
  );

  return (
    <div className="mp-students-grid">
      {mentorships.map((m) => {
        const student = users.find((u) => u.id === m.menteeId);
        if (!student) return null;
        const stuDeadlines = deadlines.filter((d) => d.studentId === student.id);
        const stuTasks = tasks.filter((t) => t.studentId === student.id);
        const pendingDl = stuDeadlines.filter((d) => d.status === 'pending').length;
        const pendingT = stuTasks.filter((t) => t.status === 'pending').length;
        return (
          <div key={m.id} className="mp-student-card">
            <div className="mp-student-head">
              <Avatar user={student} size="lg" />
              <div>
                <strong>{student.fullName}</strong>
                <span>{student.faculty} · {student.direction}</span>
                <span>{student.course} курс · {student.groupName}</span>
              </div>
            </div>
            <div className="mp-student-stats">
              <div className="mp-student-stat">
                <span>{stuDeadlines.length}</span>
                <small>дедлайнов</small>
                {pendingDl > 0 && <span className="mp-badge-warn">{pendingDl} в работе</span>}
              </div>
              <div className="mp-student-stat">
                <span>{stuTasks.length}</span>
                <small>заданий</small>
                {pendingT > 0 && <span className="mp-badge-warn">{pendingT} в работе</span>}
              </div>
            </div>
            <div className="mp-student-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/profile/${student.id}`)}>👤 Профиль</button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/chat')}>💬 Написать</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Requests tab ─────────────────────────────────────────────────
function RequestsTab({ requests, users }) {
  const { respondMentorship } = useApp();
  const [toast, setToast] = useState('');
  const showToast = (m) => { setToast(''); setTimeout(() => setToast(m), 10); };

  if (requests.length === 0) return (
    <div className="empty-state"><div className="emoji">📩</div><p>Нет новых запросов.</p></div>
  );

  return (
    <>
      <Toast msg={toast} onDone={() => setToast('')} />
      <div className="mp-requests-list">
        {requests.map((r) => {
          const student = users.find((u) => u.id === r.menteeId);
          if (!student) return null;
          return (
            <div key={r.id} className="mp-request-card">
              <div className="mp-request-info">
                <Avatar user={student} size="lg" />
                <div>
                  <strong>{student.fullName}</strong>
                  <span>{student.faculty} · {student.direction}</span>
                  <span>{student.course} курс · {student.age} лет</span>
                  {student.about && <p className="mp-request-about">"{student.about}"</p>}
                </div>
              </div>
              <div className="mp-request-actions">
                <Button variant="primary" size="sm" onClick={() => { respondMentorship(r, 'active'); showToast(`✅ Запрос от ${student.fullName} принят`); }}>
                  Принять
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { respondMentorship(r, 'declined'); showToast(`Запрос отклонён`); }}>
                  Отклонить
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Deadlines tab ────────────────────────────────────────────────
function DeadlinesTab({ mentorships, users, deadlines }) {
  const { createDeadline, updateDeadlineStatus, removeDeadline } = useApp();
  const [form, setForm] = useState({ studentId: '', title: '', description: '', dueDate: '' });
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);
  const showToast = (m) => { setToast(''); setTimeout(() => setToast(m), 10); };

  const students = mentorships.map((m) => users.find((u) => u.id === m.menteeId)).filter(Boolean);

  const submit = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.title || !form.dueDate) return;
    createDeadline(form.studentId, form.title, form.description, form.dueDate);
    setForm({ studentId: '', title: '', description: '', dueDate: '' });
    setShowForm(false);
    showToast('✅ Дедлайн назначен');
  };

  const grouped = useMemo(() => {
    const map = {};
    deadlines.forEach((d) => {
      if (!map[d.studentId]) map[d.studentId] = [];
      map[d.studentId].push(d);
    });
    return map;
  }, [deadlines]);

  return (
    <>
      <Toast msg={toast} onDone={() => setToast('')} />
      <div className="mp-section-head">
        <h3>Дедлайны студентов</h3>
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          + Назначить дедлайн
        </Button>
      </div>

      {showForm && (
        <form className="mp-form card" onSubmit={submit}>
          <div className="field">
            <label className="label">Студент *</label>
            <select className="select" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
              <option value="">Выберите студента...</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Название дедлайна *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Написать реферат..." required />
          </div>
          <div className="field">
            <label className="label">Описание</label>
            <textarea className="textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Подробности..." />
          </div>
          <div className="field">
            <label className="label">Срок сдачи *</label>
            <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required min={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="mp-form-actions">
            <Button variant="primary" type="submit" disabled={!form.studentId || !form.title || !form.dueDate}>Назначить</Button>
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Отмена</Button>
          </div>
        </form>
      )}

      {students.length === 0 && <div className="empty-state"><div className="emoji">📅</div><p>Сначала примите студентов в подопечные.</p></div>}

      {students.map((s) => {
        const sDls = grouped[s.id] || [];
        return (
          <div key={s.id} className="mp-student-section">
            <div className="mp-student-section-head">
              <Avatar user={s} size="sm" />
              <strong>{s.fullName}</strong>
              <span className="text-muted">{sDls.length} дедлайнов</span>
            </div>
            {sDls.length === 0 ? (
              <p className="text-muted mp-no-items">Нет дедлайнов.</p>
            ) : (
              <div className="mp-dl-list">
                {sDls.map((d) => {
                  const overdue = d.status === 'pending' && new Date(d.dueDate) < new Date();
                  return (
                    <div key={d.id} className={`mp-dl-item ${d.status} ${overdue ? 'overdue' : ''}`}>
                      <div className="mp-dl-main">
                        <span className={`mp-dl-status ${d.status}`}>
                          {d.status === 'done' ? '✅' : overdue ? '⚠️' : '🕐'}
                        </span>
                        <div>
                          <strong>{d.title}</strong>
                          {d.description && <p>{d.description}</p>}
                          <span className="mp-dl-due">до {formatDate(d.dueDate)}</span>
                        </div>
                      </div>
                      <div className="mp-dl-actions">
                        {d.status === 'pending' && (
                          <button className="act-btn success" onClick={() => { updateDeadlineStatus(d, 'done'); showToast('Дедлайн отмечен выполненным'); }}>
                            ✓ Выполнен
                          </button>
                        )}
                        <button className="act-btn danger" onClick={() => removeDeadline(d.id)}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ── Tasks tab ────────────────────────────────────────────────────
function TasksTab({ mentorships, users, tasks }) {
  const { createTask, updateTaskStatus, removeTask } = useApp();
  const [form, setForm] = useState({ studentId: '', title: '', description: '', priority: 'medium' });
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);
  const showToast = (m) => { setToast(''); setTimeout(() => setToast(m), 10); };

  const students = mentorships.map((m) => users.find((u) => u.id === m.menteeId)).filter(Boolean);

  const submit = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.title) return;
    createTask(form.studentId, form.title, form.description, form.priority);
    setForm({ studentId: '', title: '', description: '', priority: 'medium' });
    setShowForm(false);
    showToast('✅ Задание выдано');
  };

  const grouped = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!map[t.studentId]) map[t.studentId] = [];
      map[t.studentId].push(t);
    });
    return map;
  }, [tasks]);

  const PRIORITY_LABEL = { high: '🔴 Высокий', medium: '🟡 Средний', low: '🟢 Низкий' };

  return (
    <>
      <Toast msg={toast} onDone={() => setToast('')} />
      <div className="mp-section-head">
        <h3>Задания студентов</h3>
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          + Выдать задание
        </Button>
      </div>

      {showForm && (
        <form className="mp-form card" onSubmit={submit}>
          <div className="mp-form-row">
            <div className="field">
              <label className="label">Студент *</label>
              <select className="select" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
                <option value="">Выбрать...</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Приоритет</label>
              <select className="select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Название задания *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Прочитать главу 5..." required />
          </div>
          <div className="field">
            <label className="label">Описание</label>
            <textarea className="textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Подробности задания..." />
          </div>
          <div className="mp-form-actions">
            <Button variant="primary" type="submit" disabled={!form.studentId || !form.title}>Выдать задание</Button>
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Отмена</Button>
          </div>
        </form>
      )}

      {students.length === 0 && <div className="empty-state"><div className="emoji">✅</div><p>Сначала примите студентов в подопечные.</p></div>}

      {students.map((s) => {
        const sTasks = grouped[s.id] || [];
        return (
          <div key={s.id} className="mp-student-section">
            <div className="mp-student-section-head">
              <Avatar user={s} size="sm" />
              <strong>{s.fullName}</strong>
              <span className="text-muted">{sTasks.filter(t => t.status === 'pending').length} активных</span>
            </div>
            {sTasks.length === 0 ? (
              <p className="text-muted mp-no-items">Нет заданий.</p>
            ) : (
              <div className="mp-task-list">
                {sTasks.map((t) => (
                  <div key={t.id} className={`mp-task-item ${t.status}`}>
                    <span className={`mp-task-priority ${t.priority}`}>{PRIORITY_LABEL[t.priority]}</span>
                    <div className="mp-task-main">
                      <strong className={t.status === 'done' ? 'mp-done-text' : ''}>{t.title}</strong>
                      {t.description && <p>{t.description}</p>}
                    </div>
                    <div className="mp-task-actions">
                      {t.status === 'pending' && (
                        <button className="act-btn success" onClick={() => { updateTaskStatus(t, 'done'); showToast('Задание отмечено выполненным'); }}>
                          ✓
                        </button>
                      )}
                      {t.status === 'done' && <span className="mp-done-chip">✅ Выполнено</span>}
                      <button className="act-btn danger" onClick={() => removeTask(t.id)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
