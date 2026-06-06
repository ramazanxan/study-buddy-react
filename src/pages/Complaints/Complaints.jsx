import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import './Complaints.css';

const COMPLAINT_TYPES = [
  { value: 'spam',       label: 'Спам',              icon: '🚫' },
  { value: 'harassment', label: 'Оскорбления',        icon: '😡' },
  { value: 'fake',       label: 'Фейковый аккаунт',  icon: '🤥' },
  { value: 'content',    label: 'Неподходящий контент', icon: '⚠️' },
  { value: 'scam',       label: 'Мошенничество',      icon: '💸' },
  { value: 'other',      label: 'Другое',             icon: '📝' },
];

export default function Complaints() {
  const { currentUser, users, complaints, submitComplaint } = useApp();
  const [form, setForm] = useState({ aboutId: '', type: 'spam', text: '' });
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const otherUsers = users.filter((u) => u.id !== currentUser.id && u.role !== 'admin');
  const myComplaints = complaints.filter((c) => c.fromId === currentUser.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.aboutId || !form.text.trim()) return;
    submitComplaint(form.aboutId, form.type, form.text.trim());
    setForm({ aboutId: '', type: 'spam', text: '' });
    setSubmitted(true);
    showToast('Жалоба отправлена и будет рассмотрена администратором.');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="page complaints-page">
      <div className="container" style={{ maxWidth: 700 }}>

        <div className="complaints-hero">
          <h1>Жалобы 🚩</h1>
          <p>Сообщи о нарушениях — мы разберёмся в течение 24 часов.</p>
        </div>

        {/* Submit form */}
        <div className="card complaints-form-card">
          <h3>Отправить жалобу</h3>
          {submitted ? (
            <div className="complaints-success">
              <div className="complaints-success-icon">✅</div>
              <strong>Жалоба принята!</strong>
              <p>Мы рассмотрим её в ближайшее время. Спасибо, что помогаешь нам поддерживать порядок.</p>
              <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)}>Отправить ещё</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="complaints-form">
              <div className="field">
                <label className="label">На кого жалоба *</label>
                <select className="select" value={form.aboutId} onChange={(e) => setForm({ ...form, aboutId: e.target.value })} required>
                  <option value="">Выберите пользователя...</option>
                  {otherUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName} (@{u.login})</option>
                  ))}
                </select>
                {form.aboutId && (
                  <div className="complaints-user-preview">
                    <Avatar user={users.find(u => u.id === form.aboutId)} size="sm" />
                    <span>{users.find(u => u.id === form.aboutId)?.fullName}</span>
                  </div>
                )}
              </div>

              <div className="field">
                <label className="label">Причина *</label>
                <div className="complaint-types-grid">
                  {COMPLAINT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`complaint-type-btn ${form.type === t.value ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, type: t.value })}
                    >
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="label">Опишите ситуацию *</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Расскажи подробно, что произошло. Это поможет нам быстрее разобраться..."
                  required
                />
                <span className="field-hint">{form.text.length}/500 символов</span>
              </div>

              <div className="complaints-form-foot">
                <p className="complaints-warning">
                  ⚠️ Ложные жалобы могут повлечь блокировку вашего аккаунта.
                </p>
                <Button variant="primary" type="submit" disabled={!form.aboutId || !form.text.trim()}>
                  Отправить жалобу
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* My complaints history */}
        {myComplaints.length > 0 && (
          <div className="complaints-history">
            <h3>Мои жалобы</h3>
            <div className="complaints-history-list">
              {myComplaints.map((c) => {
                const about = users.find((u) => u.id === c.aboutId);
                const typeInfo = COMPLAINT_TYPES.find((t) => t.value === c.type);
                return (
                  <div key={c.id} className="complaints-history-item">
                    <div className="chi-left">
                      <span className="chi-type">{typeInfo?.icon} {typeInfo?.label}</span>
                      <span className="chi-about">на {about?.fullName || 'Пользователь'}</span>
                    </div>
                    <div className="chi-right">
                      <span className={`chi-status ${c.status}`}>
                        {c.status === 'resolved' ? '✅ Рассмотрена' : '⏳ На рассмотрении'}
                      </span>
                      <span className="chi-date">{new Date(c.createdAt).toLocaleDateString('ru')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
