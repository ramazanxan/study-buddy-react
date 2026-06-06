import { Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Landing.css';

const FLOAT_ITEMS = [
  { text: 'КГТУ',                  x: 6,  delay: 0    },
  { text: 'КЛ-3-25',               x: 20, delay: 3.1  },
  { text: '✦ StudyBuddy',          x: 36, delay: 6.4  },
  { text: 'КГТУ им. Раззакова',    x: 55, delay: 1.7  },
  { text: '✦ StudyBuddy',          x: 72, delay: 8.2  },
  { text: 'ИИТ КГТУ',              x: 88, delay: 4.5  },
  { text: 'КЛ-3-25',               x: 12, delay: 11.3 },
  { text: 'Enactus KSTU',          x: 28, delay: 7.0  },
  { text: 'КГТУ',                  x: 45, delay: 2.3  },
  { text: '✦ StudyBuddy',          x: 62, delay: 9.8  },
  { text: 'КГТУ им. И. Раззакова', x: 80, delay: 5.6  },
  { text: 'ИИТ',                   x: 94, delay: 13.1 },
  { text: 'КЛ',                    x: 4,  delay: 14.4 },
  { text: 'КЛ-3-25',               x: 40, delay: 16.0 },
  { text: 'КГТУ',                  x: 58, delay: 12.5 },
  { text: '✦ StudyBuddy',          x: 16, delay: 17.3 },
];

const KSTU_LOGO = 'https://enactus.kg/wp-content/uploads/2022/04/kgtu-logo.png';

function KstuLogo3D({ size = 160, className = '' }) {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const stateRef = useRef({ rx: 0, ry: 0, hovering: false, idleT: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      stateRef.current.rx = dy * -22;
      stateRef.current.ry = dx * 22;
      stateRef.current.hovering = true;

      const shine = el.querySelector('.kstu-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${(dx + 1) * 50}% ${(dy + 1) * 50}%, rgba(255,255,255,0.28) 0%, transparent 65%)`;
      }
    };

    const onLeave = () => {
      stateRef.current.hovering = false;
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    let last = 0;
    const tick = (t) => {
      const dt = t - last; last = t;
      const s = stateRef.current;
      if (!s.hovering) {
        s.idleT += dt * 0.0006;
        s.rx += (Math.sin(s.idleT * 0.7) * 10 - s.rx) * 0.04;
        s.ry += (Math.sin(s.idleT) * 15 - s.ry) * 0.04;
      } else {
        s.idleT = 0;
      }
      const inner = el.querySelector('.kstu-logo-inner');
      if (inner) {
        inner.style.transform = `perspective(600px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) scale3d(${s.hovering ? 1.08 : 1}, ${s.hovering ? 1.08 : 1}, 1)`;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div ref={ref} className={`kstu-logo-3d ${className}`} style={{ width: size, height: size }}>
      <div className="kstu-logo-inner">
        <img src={KSTU_LOGO} alt="КГТУ логотип" className="kstu-logo-img" draggable={false} />
        <div className="kstu-shine" />
      </div>
    </div>
  );
}

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
          <div className="hero-shape hs6" />
          <div className="hero-shape hs7" />
        </div>

        {/* Floating background labels */}
        <div className="hero-float-bg" aria-hidden="true">
          {FLOAT_ITEMS.map((item, i) => (
            <span
              key={i}
              className="float-label"
              style={{
                '--fl-x': `${item.x}%`,
                '--fl-delay': `${-item.delay}s`,
                '--fl-dx': `${(i % 5 - 2) * 38}px`,
                '--fl-rot': `${(i % 7 - 3) * 6}deg`,
              }}
            >{item.text}</span>
          ))}
        </div>

        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Только для студентов КГТУ им. И. Раззакова
          </div>

          {/* KSTU 3D Logo */}
          <KstuLogo3D size={110} className="hero-kstu-logo" />

          <div className="hero-logo">
            <span className="hero-spark">✦</span> StudyBuddy
          </div>

          <h1 className="hero-title">
            <span className="hero-title-line1">Найди своих</span>
            <span className="hero-title-line2">по учёбе</span>
          </h1>

          <p className="hero-sub">
            Платформа для студентов КГТУ — находи напарников,
            наставников и достигай целей вместе.
          </p>

          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Регистрация</Link>
            <Link to="/login" className="hero-login">Войти →</Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">18 000+</div>
              <div className="hero-stat-label">Студентов КГТУ</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num">10</div>
              <div className="hero-stat-label">Институтов</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num">70+</div>
              <div className="hero-stat-label">Специальностей</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-num">1954</div>
              <div className="hero-stat-label">Год основания</div>
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
              <KstuLogo3D size={120} />
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
                <span className="kstu-org">KSTU-ИИТ-КЛ-3-25</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-left">
            <KstuLogo3D size={56} className="footer-kstu-logo" />
            <div>
              <div className="footer-logo"><span className="nav-spark">✦</span> StudyBuddy</div>
              <p className="text-muted">КГТУ им. И. Раззакова · Бишкек · 2026</p>
            </div>
          </div>
          <p className="text-muted footer-copy">Сделано студентами для студентов КГТУ ❤️</p>
        </div>
      </footer>

    </div>
  );
}
