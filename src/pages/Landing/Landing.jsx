import { Link } from 'react-router-dom';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Landing.css';

const STEPS = [
  { n: 1, title: 'Создай профиль', text: 'Расскажи о себе, факультете и своей цели на учёбу.', icon: '📝' },
  { n: 2, title: 'Найди Искру', text: 'Алгоритм подберёт студентов с общими интересами и целями.', icon: '✦' },
  { n: 3, title: 'Достигайте вместе', text: 'Заключайте пакты, ставьте цели и празднуйте победы.', icon: '🚀' },
];

const FEATURES = [
  { icon: '✦', name: 'Искра', text: 'Умный подбор партнёров по интересам, целям и факультету.', color: 'var(--spark)' },
  { icon: '🤝', name: 'Пакт', text: 'Заключите договор с напарником и держите слово до дедлайна.', color: 'var(--secondary)' },
  { icon: '🧭', name: 'Агай / Эже', text: 'Старшекурсники становятся наставниками для младших.', color: 'var(--primary)' },
  { icon: '🙋', name: 'Я тоже хочу это', text: 'Присоединяйся к чужим целям и иди к ним вместе.', color: 'var(--success)' },
  { icon: '🏆', name: 'Доска побед', text: 'Делитесь достижениями и вдохновляйте сообщество.', color: 'var(--accent)' },
  { icon: '🛍️', name: 'Маркетплейс', text: 'Покупайте и продавайте книги, технику и вещи студентам.', color: 'var(--primary-dark)' },
];

const PREVIEW_WINS = [
  { name: 'Данияр & Чолпон', text: 'Запустили MVP стартапа и получили первых 50 пользователей! 🚀', emoji: '🚀' },
  { name: 'Бекзат', text: 'Занял 2 место на университетском хакатоне 🥈', emoji: '🥈' },
  { name: 'Айзада', text: 'Выпустила первое мобильное приложение в сторе 📱', emoji: '📱' },
];

export default function Landing() {
  useScrollReveal();

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero kg-pattern">
        <div className="hero-shapes">
          <div className="shape s1 float" />
          <div className="shape s2 float" style={{ animationDelay: '1s' }} />
          <div className="shape s3 float" style={{ animationDelay: '2s' }} />
          <div className="shape s4 float" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="container hero-inner">
          <div className="hero-logo"><span className="nav-spark">✦</span> StudyBuddy</div>
          <h1 className="hero-title">Найди своих<br />по учёбе</h1>
          <p className="hero-sub">
            Платформа знакомств для студентов Кыргызстана. Находи напарников,
            наставников и единомышленников — и достигайте целей вместе.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Регистрация</Link>
            <Link to="/login" className="hero-login">Войти →</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section container">
        <h2 className="section-title reveal">Как это работает</h2>
        <p className="section-sub reveal">Три простых шага к продуктивной студенческой жизни</p>
        <div className="grid-3">
          {STEPS.map((s) => (
            <div key={s.n} className="step-card reveal">
              <div className="step-num">{s.n}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p className="text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section features-section">
        <div className="container">
          <h2 className="section-title reveal">Возможности</h2>
          <p className="section-sub reveal">Всё, что нужно студенту в одном месте</p>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div key={f.name} className="feature-card reveal">
                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3>{f.name}</h3>
                <p className="text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WINS PREVIEW */}
      <section className="section container">
        <h2 className="section-title reveal">Истории успеха</h2>
        <p className="section-sub reveal">Реальные победы наших студентов</p>
        <div className="grid-3">
          {PREVIEW_WINS.map((w, i) => (
            <div key={i} className="win-preview reveal">
              <div className="win-emoji">{w.emoji}</div>
              <p className="win-text">{w.text}</p>
              <div className="win-author">{w.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container reveal">
          <h2>Готов найти своих?</h2>
          <p>Присоединяйся к тысячам студентов уже сегодня</p>
          <Link to="/register" className="btn btn-primary btn-lg">Создать профиль</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container">
          <div className="nav-logo"><span className="nav-spark">✦</span> StudyBuddy</div>
          <p className="text-muted">Сделано с ❤️ для студентов Кыргызстана · 2026</p>
        </div>
      </footer>
    </div>
  );
}
