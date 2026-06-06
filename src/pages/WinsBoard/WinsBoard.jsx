import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Confetti from '../../components/common/Confetti';
import { formatRelativeTime } from '../../utils/helpers';
import './WinsBoard.css';

export default function WinsBoard() {
  const { currentUser, wins, getUser, addWin, reactToWin, removeWin } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [filter, setFilter] = useState('all');
  const [confetti, setConfetti] = useState(false);

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setPhoto(r.result);
    r.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addWin(text.trim(), photo);
    setText(''); setPhoto(null); setShowForm(false);
    setConfetti(false); requestAnimationFrame(() => setConfetti(true));
    setTimeout(() => setConfetti(false), 3200);
  };

  const list = wins.filter((w) => (filter === 'my' ? w.users.includes(currentUser.id) : true));

  return (
    <div className="page">
      <Confetti active={confetti} />
      <div className="container wins-container">
        <div className="wins-head">
          <div>
            <h1>Доска побед 🏆</h1>
            <p className="text-muted">Делись достижениями и вдохновляй других</p>
          </div>
          {!isAdmin && (
            <Button variant="primary" onClick={() => setShowForm((s) => !s)}>
              Поделиться победой
            </Button>
          )}
          {isAdmin && (
            <span className="wins-admin-badge">👁 Режим наблюдения</span>
          )}
        </div>

        {showForm && !isAdmin && (
          <form className="card win-form" onSubmit={submit}>
            <textarea className="textarea" value={text} placeholder="Чего ты достиг? Расскажи!" onChange={(e) => setText(e.target.value)} />
            {photo && <img className="win-form-preview" src={photo} alt="preview" />}
            <div className="win-form-actions">
              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                📷 Фото<input type="file" accept="image/*" hidden onChange={onPhoto} />
              </label>
              <Button variant="primary" type="submit" disabled={!text.trim()}>Опубликовать</Button>
            </div>
          </form>
        )}

        <div className="wins-filter">
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все</button>
          {!isAdmin && (
            <button className={`chip ${filter === 'my' ? 'active' : ''}`} onClick={() => setFilter('my')}>Мои победы</button>
          )}
        </div>

        {list.length === 0 ? (
          <div className="empty-state"><div className="emoji">🏆</div><p>Здесь пока нет побед. Стань первым!</p></div>
        ) : (
          <div className="wins-grid">
            {list.map((w) => {
              const authors = w.users.map((id) => getUser(id)).filter(Boolean);
              const reacted = w.reactions.includes(currentUser.id);
              return (
                <div key={w.id} className="win-card card">
                  <div className="win-card-head">
                    <div className="win-avatars">{authors.map((a) => <Avatar key={a.id} user={a} size="md" />)}</div>
                    <div>
                      <strong>{authors.map((a) => a.fullName.split(' ')[0]).join(' & ')}</strong>
                      <div className="text-muted win-time">{formatRelativeTime(w.at)}</div>
                    </div>
                  </div>
                  <p className="win-card-text">{w.text}</p>
                  {w.photo && <img className="win-card-photo" src={w.photo} alt="win" />}
                  <div className="win-card-foot">
                    <button
                      className={`win-react ${reacted ? 'reacted' : ''}`}
                      onClick={() => !isAdmin && reactToWin(w)}
                      disabled={isAdmin}
                    >
                      {reacted ? '❤️' : '🤍'} {w.reactions.length}
                    </button>
                    {isAdmin && (
                      <button className="win-admin-remove" onClick={() => removeWin(w.id)} title="Удалить">
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
