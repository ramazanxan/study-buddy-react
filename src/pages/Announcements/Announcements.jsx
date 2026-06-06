import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import './Announcements.css';

const LEVEL_CONFIG = {
  urgent:    { label: 'Срочно',  cls: 'urgent',    icon: '🚨' },
  important: { label: 'Важно',   cls: 'important', icon: '⚠️' },
  normal:    { label: 'Инфо',    cls: 'normal',    icon: 'ℹ️' },
};

export default function Announcements() {
  const { announcements } = useApp();
  const [filter, setFilter] = useState('all');

  const pinned = announcements.filter((a) => a.pinned);
  const list = announcements
    .filter((a) => !a.pinned)
    .filter((a) => filter === 'all' ? true : a.level === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="page ann-page">
      <div className="container">

        {/* Header */}
        <div className="ann-hero">
          <div>
            <h1 className="ann-title">Объявления 📢</h1>
            <p className="ann-subtitle">Актуальные новости и объявления КГТУ</p>
          </div>
        </div>

        {/* Pinned */}
        {pinned.length > 0 && (
          <div className="ann-pinned-section">
            <div className="ann-section-label">📌 Закреплённые</div>
            <div className="ann-pinned-list">
              {pinned.map((a) => <AnnouncementCard key={a.id} item={a} big />)}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="ann-filter-bar">
          {[['all','Все'],['urgent','Срочные'],['important','Важные'],['normal','Информационные']].map(([k, l]) => (
            <button key={k} className={`ann-filter-btn ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
              {k !== 'all' && LEVEL_CONFIG[k].icon} {l}
            </button>
          ))}
        </div>

        {/* List */}
        {list.length === 0 ? (
          <div className="empty-state"><div className="emoji">📭</div><p>Нет объявлений в этой категории.</p></div>
        ) : (
          <div className="ann-list">
            {list.map((a) => <AnnouncementCard key={a.id} item={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementCard({ item, big }) {
  const [expanded, setExpanded] = useState(big || false);
  const cfg = LEVEL_CONFIG[item.level] || LEVEL_CONFIG.normal;
  const isLong = item.text.length > 180;

  return (
    <div className={`ann-card ann-${cfg.cls} ${big ? 'ann-card-big' : ''}`}>
      <div className="ann-card-head">
        <div className="ann-card-meta">
          <span className={`ann-level-badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>
          <span className="ann-date">{new Date(item.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        {item.views !== undefined && (
          <span className="ann-views">👁 {item.views}</span>
        )}
      </div>
      <h3 className="ann-card-title">{item.title}</h3>
      <p className={`ann-card-text ${!expanded && isLong ? 'truncated' : ''}`}>
        {item.text}
      </p>
      {isLong && !big && (
        <button className="ann-expand-btn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Свернуть ↑' : 'Читать далее ↓'}
        </button>
      )}
    </div>
  );
}
