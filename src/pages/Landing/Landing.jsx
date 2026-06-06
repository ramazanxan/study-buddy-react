import { Link } from 'react-router-dom';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Landing.css';

const FLOAT_ITEMS = [
  'КГТУ', 'Enactus', 'AIESEC', 'IEEE', '✦ StudyBuddy', 'КГТУ', 'Enactus',
  'AIESEC', 'IEEE Student Branch', 'КГТУ им. И. Раззакова', '✦ StudyBuddy',
  'Enactus KSTU', 'КГТУ', 'AIESEC KG', 'IEEE', '✦ StudyBuddy', 'КГТУ',
];

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

        {/* Floating background labels */}
        <div className="hero-float-bg" aria-hidden="true">
          {FLOAT_ITEMS.map((item, i) => (
            <span key={i} className="float-label" style={{ '--fi': i }}>{item}</span>
          ))}
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

      {/* ── UNIVERSITY PARTNER ───────────────────────────────── */}
      <section className="section partner-section">
        <div className="container">
          <h2 className="section-title reveal">Наш университет</h2>
          <p className="section-sub reveal">StudyBuddy создан студентами КГТУ им. И. Раззакова</p>
          <div className="kstu-card reveal">
            <div className="kstu-emblem">
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="kstu-svg">
                {/* Shield */}
                <path d="M60 8 L104 28 L104 68 Q104 95 60 112 Q16 95 16 68 L16 28 Z" fill="none" stroke="rgba(106,191,48,0.7)" strokeWidth="2"/>
                {/* Tunduk (юрта) center circle */}
                <circle cx="60" cy="60" r="22" fill="none" stroke="rgba(106,191,48,0.6)" strokeWidth="1.5"/>
                {/* Tunduk rays */}
                {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => {
                  const rad = angle * Math.PI / 180;
                  return <line key={i}
                    x1={60 + 10 * Math.cos(rad)} y1={60 + 10 * Math.sin(rad)}
                    x2={60 + 22 * Math.cos(rad)} y2={60 + 22 * Math.sin(rad)}
                    stroke="rgba(106,191,48,0.5)" strokeWidth="1.5"/>;
                })}
                {/* Inner dot */}
                <circle cx="60" cy="60" r="6" fill="rgba(106,191,48,0.8)"/>
                {/* Corner ornaments */}
                <path d="M28 40 Q36 36 40 28" stroke="rgba(106,191,48,0.4)" strokeWidth="1.5" fill="none"/>
                <path d="M92 40 Q84 36 80 28" stroke="rgba(106,191,48,0.4)" strokeWidth="1.5" fill="none"/>
                <path d="M28 80 Q36 84 40 92" stroke="rgba(106,191,48,0.4)" strokeWidth="1.5" fill="none"/>
                <path d="M92 80 Q84 84 80 92" stroke="rgba(106,191,48,0.4)" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div className="kstu-info">
              <div className="kstu-name">КГТУ им. И. Раззакова</div>
              <div className="kstu-full">Кыргызский государственный технический университет</div>
              <div className="kstu-tags">
                <span className="kstu-tag">🎓 Основан в 1954</span>
                <span className="kstu-tag">🏛️ г. Бишкек</span>
                <span className="kstu-tag">⚙️ Технический университет</span>
              </div>
              <div className="kstu-orgs">
                <span className="kstu-org">Enactus KSTU</span>
                <span className="kstu-org">IEEE Student Branch</span>
                <span className="kstu-org">AIESEC KG</span>
              </div>
            </div>
          </div>
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
