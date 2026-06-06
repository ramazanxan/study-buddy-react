import { Link } from 'react-router-dom';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Landing.css';

const STEPS = [
  { n: 1, title: 'Создай профиль', text: 'Расскажи о себе, факультете и своей цели на учёбу.', icon: '📝' },
  { n: 2, title: 'Найди Искру', text: 'Алгоритм подберёт студентов с общими интересами и целями.', icon: '✦' },
  { n: 3, title: 'Достигайте вместе', text: 'Заключайте пакты, ставьте цели и празднуйте победы.', icon: '🚀' },
];

const FEATURES = [
  { icon: '✦', name: 'Искра', text: 'Умный подбор партнёров по интересам, целям и факультету.', color: 'var(--lp-violet)', accentVar: 'var(--lp-violet)' },
  { icon: '🤝', name: 'Пакт', text: 'Заключите договор с напарником и держите слово до дедлайна.', color: 'var(--lp-indigo)', accentVar: 'var(--lp-indigo-lt)' },
  { icon: '🧭', name: 'Агай / Эже', text: 'Старшекурсники становятся наставниками для младших.', color: '#7C3AED', accentVar: 'var(--lp-violet-lt)' },
  { icon: '🙋', name: 'Я тоже хочу это', text: 'Присоединяйся к чужим целям и иди к ним вместе.', color: '#0EA5E9', accentVar: '#38BDF8' },
  { icon: '🏆', name: 'Доска побед', text: 'Делитесь достижениями и вдохновляйте сообщество.', color: '#D97706', accentVar: '#FCD34D' },
  { icon: '🛍️', name: 'Маркетплейс', text: 'Покупайте и продавайте книги, технику и вещи студентам.', color: '#059669', accentVar: '#34D399' },
];

const PREVIEW_WINS = [
  { name: 'Данияр & Чолпон', text: 'Запустили MVP стартапа и получили первых 50 пользователей!', emoji: '🚀' },
  { name: 'Бекзат', text: 'Занял 2 место на университетском хакатоне', emoji: '🥈' },
  { name: 'Айзада', text: 'Выпустила первое мобильное приложение в сторе', emoji: '📱' },
];

export default function Landing() {
  useScrollReveal();

  return (
    <div className="landing">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-orbs">
          <div className="hero-orb o1" />
          <div className="hero-orb o2" />
          <div className="hero-orb o3" />
        </div>
        <div className="hero-shapes">
          <div className="hero-shape hs1" />
          <div className="hero-shape hs2" />
          <div className="hero-shape hs3" />
          <div className="hero-shape hs4" />
          <div className="hero-shape hs5" />
        </div>

        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Платформа для студентов Кыргызстана
          </div>

          <div className="hero-logo">
            <span className="hero-spark">✦</span> StudyBuddy
          </div>

          <h1 className="hero-title">
            <span className="hero-title-line1">Найди своих</span>
            <span className="hero-title-line2">по учёбе</span>
          </h1>

          <p className="hero-sub">
            Находи напарников, наставников и единомышленников.
            Ставьте цели вместе — и побеждайте.
          </p>

          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Регистрация</Link>
            <Link to="/login" className="hero-login">Войти →</Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">3 000+</div>
              <div className="hero-stat-label">Студентов</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num">12</div>
              <div className="hero-stat-label">Университетов</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num">850+</div>
              <div className="hero-stat-label">Пактов заключено</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="section steps-section">
        <div className="container">
          <h2 className="section-title reveal">Как это работает</h2>
          <p className="section-sub reveal">Три простых шага к продуктивной студенческой жизни</p>
          <div className="grid-3">
            {STEPS.map((s) => (
              <div key={s.n} className="step-card reveal">
                <div className="step-num">{s.n}</div>
                <span className="step-icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p className="text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="section features-section">
        <div className="container">
          <h2 className="section-title reveal">Возможности</h2>
          <p className="section-sub reveal">Всё, что нужно студенту — в одном месте</p>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div
                key={f.name}
                className="feature-card reveal"
                style={{ '--feature-accent': f.accentVar }}
              >
                <div className="feature-icon" style={{ background: f.color + '22', color: f.accentVar }}>
                  {f.icon}
                </div>
                <h3>{f.name}</h3>
                <p className="text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ──────────────────────────────────── */}
      <section className="section wins-section">
        <div className="container">
          <h2 className="section-title reveal">Истории успеха</h2>
          <p className="section-sub reveal">Реальные победы наших студентов</p>
          <div className="grid-3">
            {PREVIEW_WINS.map((w, i) => (
              <div key={i} className="win-preview reveal">
                <span className="win-emoji">{w.emoji}</span>
                <p className="win-text">{w.text}</p>
                <div className="win-author">{w.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container cta-inner reveal">
          <h2>Готов найти своих?</h2>
          <p>Присоединяйся к тысячам студентов уже сегодня</p>
          <Link to="/register" className="btn btn-primary btn-lg">Создать профиль</Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-logo">
            <span className="nav-spark">✦</span> StudyBuddy
          </div>
          <p className="text-muted">Сделано с ❤️ для студентов Кыргызстана · 2026</p>
        </div>
      </footer>

    </div>
  );
}
