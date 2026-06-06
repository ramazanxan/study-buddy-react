import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Confetti from '../../components/common/Confetti';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import './Goals.css';

export default function Goals() {
  const app = useApp();
  const { currentUser } = app;
  const [tab, setTab] = useState('goals');
  const [confetti, setConfetti] = useState(false);

  const TABS = [
    { key: 'goals',    label: '🎯 Мои цели' },
    { key: 'deadlines',label: '📅 Дедлайны' },
    { key: 'tasks',    label: '✅ Задания' },
    { key: 'pacts',    label: '🤝 Пакты' },
    { key: 'checkin',  label: '📝 Чек-ин' },
    { key: 'callme',   label: '🙋 Позови меня' },
  ];

  const fireConfetti = () => {
    setConfetti(false);
    requestAnimationFrame(() => setConfetti(true));
    setTimeout(() => setConfetti(false), 3200);
  };

  return (
    <div className="page">
      <Confetti active={confetti} />
      <div className="container goals-container">
        <div className="goals-hero">
          <h1 className="goals-title">Цели и прогресс 🚀</h1>
        </div>

        <div className="tab-bar">
          {TABS.map((t) => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'goals'     && <GoalsTab    app={app} onComplete={fireConfetti} />}
        {tab === 'deadlines' && <DeadlinesTab app={app} />}
        {tab === 'tasks'     && <TasksStudentTab app={app} />}
        {tab === 'pacts'     && <PactsTab    app={app} />}
        {tab === 'checkin'   && <CheckinTab  app={app} />}
        {tab === 'callme'    && <CallMeTab   app={app} />}
      </div>
    </div>
  );
}

// ── Goals ────────────────────────────────────────────────────────
function GoalsTab({ app, onComplete }) {
  const { currentUser, goals, createGoal, updateGoalProgress, completGoal } = app;
  const [text, setText] = useState('');
  const myGoals = goals.filter((g) => g.userId === currentUser.id);

  const add = (e) => { e.preventDefault(); if (text.trim()) { createGoal(text.trim()); setText(''); } };
  const complete = (g) => { completGoal(g); onComplete(); };

  return (
    <div className="tab-content">
      <form className="add-form card" onSubmit={add}>
        <input className="input" value={text} placeholder="Новая цель, например: пройти курс по Python"
          onChange={(e) => setText(e.target.value)} />
        <Button variant="primary" type="submit">Добавить</Button>
      </form>

      {myGoals.length === 0 ? (
        <div className="empty-state"><div className="emoji">🎯</div><p>Пока нет целей. Поставь первую!</p></div>
      ) : (
        <div className="goal-grid">
          {myGoals.map((g) => (
            <div key={g.id} className={`goal-card card ${g.status === 'done' ? 'done' : ''}`}>
              <div className="goal-card-head">
                <span className="goal-text">{g.text}</span>
                <span className={`status-pill ${g.status}`}>{g.status === 'done' ? 'Готово' : 'В процессе'}</span>
              </div>
              <div className="progress"><div className="progress-fill" style={{ width: `${g.progress}%` }} /></div>
              <div className="goal-card-foot">
                <input type="range" min="0" max="100" value={g.progress} disabled={g.status === 'done'}
                  onChange={(e) => updateGoalProgress(g, Number(e.target.value))} />
                <span className="goal-pct">{g.progress}%</span>
              </div>
              {g.wantToo.length > 0 && <p className="goal-wanttoo">🤝 {g.wantToo.length} хотят так же</p>}
              {g.status !== 'done' && (
                <Button size="sm" variant="secondary" className="mt-8" onClick={() => complete(g)}>Завершить ✓</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Deadlines (from mentor) ──────────────────────────────────────
function DeadlinesTab({ app }) {
  const { currentUser, deadlines, getUser, updateDeadlineStatus } = app;
  const [toast, setToast] = useState('');
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const myDeadlines = deadlines.filter((d) => d.studentId === currentUser.id)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const pending = myDeadlines.filter((d) => d.status === 'pending');
  const done = myDeadlines.filter((d) => d.status === 'done');

  if (myDeadlines.length === 0) return (
    <div className="tab-content">
      <div className="empty-state"><div className="emoji">📅</div><p>Нет дедлайнов от наставника.</p></div>
    </div>
  );

  return (
    <div className="tab-content">
      {toast && <div className="toast">{toast}</div>}
      <div className="dl-stats">
        <div className="dl-stat blue"><span>{pending.length}</span><small>В работе</small></div>
        <div className="dl-stat green"><span>{done.length}</span><small>Выполнено</small></div>
      </div>

      {pending.length > 0 && (
        <>
          <h3 className="section-h">Активные дедлайны</h3>
          <div className="dl-list">
            {pending.map((d) => {
              const mentor = getUser(d.mentorId);
              const overdue = new Date(d.dueDate) < new Date();
              const daysLeft = Math.ceil((new Date(d.dueDate) - new Date()) / 86400000);
              return (
                <div key={d.id} className={`dl-card card ${overdue ? 'overdue' : ''}`}>
                  <div className="dl-card-head">
                    <div className="dl-card-left">
                      <strong>{d.title}</strong>
                      {d.description && <p>{d.description}</p>}
                      <div className="dl-meta">
                        <span className="dl-mentor">от {mentor?.fullName}</span>
                        <span className={`dl-due ${overdue ? 'overdue' : daysLeft <= 3 ? 'warning' : ''}`}>
                          {overdue ? `⚠️ Просрочено` : daysLeft === 0 ? '🔥 Сегодня' : `📅 ${formatDate(d.dueDate)}`}
                        </span>
                      </div>
                    </div>
                    <button
                      className="dl-done-btn"
                      onClick={() => { updateDeadlineStatus(d, 'done'); showToast('✅ Дедлайн выполнен!'); }}
                    >
                      ✓ Выполнить
                    </button>
                  </div>
                  {!overdue && (
                    <div className="dl-progress-bar">
                      <div className="dl-progress-fill" style={{
                        width: `${Math.max(0, Math.min(100, 100 - (daysLeft / 30) * 100))}%`,
                        background: daysLeft <= 3 ? 'var(--danger)' : 'var(--primary)',
                      }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <h3 className="section-h">Выполненные</h3>
          <div className="dl-list">
            {done.map((d) => {
              const mentor = getUser(d.mentorId);
              return (
                <div key={d.id} className="dl-card card done">
                  <strong>{d.title}</strong>
                  <span className="dl-mentor">от {mentor?.fullName} · сдано</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Tasks (from mentor) ──────────────────────────────────────────
function TasksStudentTab({ app }) {
  const { currentUser, tasks, getUser, updateTaskStatus } = app;
  const [toast, setToast] = useState('');
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const myTasks = tasks.filter((t) => t.studentId === currentUser.id);
  const pending = myTasks.filter((t) => t.status === 'pending');
  const done = myTasks.filter((t) => t.status === 'done');

  const PRIORITY = { high: { label: 'Высокий', cls: 'high' }, medium: { label: 'Средний', cls: 'medium' }, low: { label: 'Низкий', cls: 'low' } };

  if (myTasks.length === 0) return (
    <div className="tab-content">
      <div className="empty-state"><div className="emoji">✅</div><p>Нет заданий от наставника.</p></div>
    </div>
  );

  return (
    <div className="tab-content">
      {toast && <div className="toast">{toast}</div>}
      <div className="dl-stats">
        <div className="dl-stat blue"><span>{pending.length}</span><small>В работе</small></div>
        <div className="dl-stat green"><span>{done.length}</span><small>Выполнено</small></div>
      </div>

      {pending.length > 0 && (
        <>
          <h3 className="section-h">Текущие задания</h3>
          <div className="task-student-list">
            {pending.map((t) => {
              const mentor = getUser(t.mentorId);
              const p = PRIORITY[t.priority] || PRIORITY.medium;
              return (
                <div key={t.id} className="task-student-card card">
                  <div className="tsc-head">
                    <span className={`tsc-priority ${p.cls}`}>{p.label}</span>
                    <strong>{t.title}</strong>
                  </div>
                  {t.description && <p className="tsc-desc">{t.description}</p>}
                  <div className="tsc-foot">
                    <span className="tsc-mentor">от {mentor?.fullName}</span>
                    <button className="tsc-done-btn" onClick={() => { updateTaskStatus(t, 'done'); showToast('✅ Задание выполнено!'); }}>
                      ✓ Выполнить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <h3 className="section-h">Выполненные задания</h3>
          <div className="task-student-list">
            {done.map((t) => {
              const mentor = getUser(t.mentorId);
              return (
                <div key={t.id} className="task-student-card card done">
                  <strong style={{ textDecoration: 'line-through', opacity: 0.6 }}>{t.title}</strong>
                  <span className="tsc-mentor" style={{ marginTop: 4 }}>от {mentor?.fullName} · ✅ выполнено</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Pacts ─────────────────────────────────────────────────────────
function PactsTab({ app }) {
  const { currentUser, pacts, matches, getUser, createPact, updatePactStatus } = app;
  const [partner, setPartner] = useState('');
  const [text, setText] = useState('');
  const [deadline, setDeadline] = useState('');

  const myMatches = matches.filter((m) => m.users.includes(currentUser.id));
  const partnerOptions = myMatches.map((m) => getUser(m.users.find((u) => u !== currentUser.id))).filter(Boolean);
  const myPacts = pacts.filter((p) => p.users.includes(currentUser.id));

  const create = (e) => {
    e.preventDefault();
    if (!partner || !text.trim() || !deadline) return;
    createPact(partner, text.trim(), deadline);
    setPartner(''); setText(''); setDeadline('');
  };

  return (
    <div className="tab-content">
      <form className="card pact-form" onSubmit={create}>
        <h3>Создать пакт</h3>
        <div className="field">
          <label>Партнёр</label>
          <select className="select" value={partner} onChange={(e) => setPartner(e.target.value)}>
            <option value="">Выбери из мэтчей...</option>
            {partnerOptions.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
          </select>
        </div>
        <div className="field"><label>Цель пакта</label>
          <input className="input" value={text} placeholder="Например: каждый день учить новые слова" onChange={(e) => setText(e.target.value)} /></div>
        <div className="field"><label>Дедлайн</label>
          <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
        <Button variant="primary" type="submit" disabled={!partner || !text.trim() || !deadline}>Заключить пакт</Button>
      </form>

      {myPacts.length === 0 ? (
        <div className="empty-state"><div className="emoji">🤝</div><p>Нет пактов. Заключи договор с напарником!</p></div>
      ) : (
        <div className="pact-grid">
          {myPacts.map((p) => {
            const other = getUser(p.users.find((u) => u !== currentUser.id));
            return (
              <div key={p.id} className={`pact-card card status-${p.status}`}>
                <div className="pact-users">
                  <Avatar user={currentUser} size="md" />
                  <span className="pact-amp">🤝</span>
                  <Avatar user={other} size="md" />
                </div>
                <p className="pact-text">{p.text}</p>
                <div className="pact-meta">
                  <span className={`status-pill ${p.status}`}>{p.status === 'active' ? 'Активен' : p.status === 'done' ? 'Выполнен' : 'Провален'}</span>
                  <span className="text-muted">до {p.deadline}</span>
                </div>
                {p.status === 'active' && (
                  <div className="pact-actions">
                    <Button size="sm" variant="secondary" onClick={() => updatePactStatus(p, 'done')}>Выполнен</Button>
                    <Button size="sm" variant="ghost" onClick={() => updatePactStatus(p, 'failed')}>Провален</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Checkin (AI-assistant style) ─────────────────────────────────
const CHECKIN_PROMPTS = [
  '💡 Чем ты занимался(ась) на этой неделе?',
  '📚 Что нового ты изучил(а) сегодня?',
  '🎯 Насколько продвинулся(ась) к своей цели?',
  '⚡ Какое твоё самое большое достижение за неделю?',
  '🤔 С какими трудностями ты столкнулся(ась)?',
];

const MOODS = [
  { value: 'great',  emoji: '😄', label: 'Отлично' },
  { value: 'good',   emoji: '🙂', label: 'Хорошо' },
  { value: 'okay',   emoji: '😐', label: 'Нормально' },
  { value: 'bad',    emoji: '😔', label: 'Плохо' },
];

function CheckinTab({ app }) {
  const { currentUser, checkins, addCheckin } = app;
  const [text, setText] = useState('');
  const [mood, setMood] = useState('good');
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const myCheckins = checkins.filter((c) => c.userId === currentUser.id);

  const currentPrompt = CHECKIN_PROMPTS[step % CHECKIN_PROMPTS.length];

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addCheckin(text.trim(), mood);
    setText('');
    setSaved(true);
    setStep((s) => s + 1);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="tab-content">
      {/* AI-style checkin form */}
      <div className="checkin-assistant card">
        <div className="checkin-assistant-head">
          <div className="checkin-bot-avatar">🤖</div>
          <div>
            <strong>StudyBot</strong>
            <span>Твой учебный ассистент</span>
          </div>
        </div>
        <div className="checkin-bot-message">
          <p>{currentPrompt}</p>
        </div>

        {saved ? (
          <div className="checkin-saved">
            <span>✅</span>
            <span>Записал! Продолжай в том же духе 💪</span>
          </div>
        ) : (
          <form onSubmit={submit}>
            {/* Mood selector */}
            <div className="checkin-mood-row">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`checkin-mood-btn ${mood === m.value ? 'active' : ''}`}
                  onClick={() => setMood(m.value)}
                  title={m.label}
                >
                  {m.emoji} <span>{m.label}</span>
                </button>
              ))}
            </div>

            <textarea
              className="textarea"
              value={text}
              placeholder="Напиши свой ответ..."
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
            <div className="checkin-form-actions">
              <Button variant="primary" type="submit" disabled={!text.trim()}>Отправить</Button>
              <button type="button" className="checkin-skip-btn" onClick={() => setStep((s) => s + 1)}>
                Другой вопрос →
              </button>
            </div>
          </form>
        )}
      </div>

      {/* History */}
      <h3 className="section-h">История чек-инов</h3>
      {myCheckins.length === 0 ? (
        <div className="empty-state"><div className="emoji">📝</div><p>Ещё нет чек-инов.</p></div>
      ) : (
        <div className="checkin-list">
          {myCheckins.map((c) => {
            const moodInfo = MOODS.find((m) => m.value === c.mood) || MOODS[1];
            return (
              <div key={c.id} className="checkin-item card">
                <div className="checkin-item-head">
                  <span className="checkin-mood">{moodInfo.emoji}</span>
                  <span className="checkin-time text-muted">{formatRelativeTime(c.at)}</span>
                </div>
                <p>{c.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── CallMe ────────────────────────────────────────────────────────
function CallMeTab({ app }) {
  const { currentUser, callme, createCallMe, respondCallMe, clearCallMe, getUser } = app;
  const [text, setText] = useState('');
  const mine = callme.find((c) => c.userId === currentUser.id);
  const others = callme.filter((c) => c.userId !== currentUser.id);

  const create = (e) => { e.preventDefault(); if (text.trim()) { createCallMe(text.trim()); setText(''); } };

  return (
    <div className="tab-content">
      <div className="card callme-form">
        <h3>Твой клич</h3>
        {mine ? (
          <div className="my-callme">
            <p>📢 {mine.text}</p>
            <p className="text-muted">{mine.responders.length} откликнулись</p>
            <Button size="sm" variant="ghost" onClick={() => clearCallMe(mine.id)}>Убрать клич</Button>
          </div>
        ) : (
          <form onSubmit={create}>
            <textarea className="textarea" value={text} placeholder="Например: ищу напарника для подготовки к экзамену" onChange={(e) => setText(e.target.value)} />
            <Button variant="primary" type="submit" disabled={!text.trim()}>Бросить клич</Button>
          </form>
        )}
      </div>

      <h3 className="section-h">Призывы других</h3>
      {others.length === 0 ? (
        <div className="empty-state"><div className="emoji">🙋</div><p>Пока никто не зовёт.</p></div>
      ) : (
        <div className="callme-grid">
          {others.map((c) => {
            const u = getUser(c.userId);
            const responded = c.responders.includes(currentUser.id);
            return (
              <div key={c.id} className="callme-card card">
                <div className="callme-head"><Avatar user={u} size="md" /><strong>{u?.fullName}</strong></div>
                <p>{c.text}</p>
                <Button size="sm" variant={responded ? 'ghost' : 'secondary'} disabled={responded} onClick={() => respondCallMe(c)}>
                  {responded ? '✓ Вы откликнулись' : 'Откликнуться'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
