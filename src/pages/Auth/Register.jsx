import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { KGTU_FACULTIES } from '../../store/mockData';
import Button from '../../components/common/Button';
import {
  validateLogin, validatePassword, validateName, validateAge,
  getPasswordStrength, passwordCriteria,
} from '../../utils/validators';
import './Auth.css';

const CRITERIA_LABELS = [
  ['length', '8+ символов'], ['upper', 'Заглавная'], ['lower', 'Строчная'], ['digit', 'Цифра'],
];

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    login: '', fullName: '', age: '', password: '', confirm: '',
    faculty: KGTU_FACULTIES[0].id, direction: KGTU_FACULTIES[0].directions[0], course: 1, about: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setFaculty = (id) => {
    setForm((f) => ({ ...f, faculty: id, direction: '' }));
  };

  const currentFaculty = KGTU_FACULTIES.find((f) => f.id === form.faculty) || KGTU_FACULTIES[0];
  const crit = passwordCriteria(form.password);
  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const e = {};
    e.login    = validateLogin(form.login);
    e.fullName = validateName(form.fullName);
    e.age      = validateAge(form.age);
    e.password = validatePassword(form.password);
    if (!e.password && form.confirm !== form.password) e.confirm = 'Пароли не совпадают';
    Object.keys(e).forEach((k) => { if (!e[k]) delete e[k]; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const data = {
        ...form,
        direction: form.direction || currentFaculty.directions[0],
        role: role === 'mentor' ? 'mentor' : 'student',
      };
      const res = register(data);
      setLoading(false);
      if (res.error) setServerError(res.error);
      else navigate('/feed');
    }, 350);
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card wide" onSubmit={submit}>
        <Link to="/" className="auth-logo"><span className="nav-spark">✦</span> StudyBuddy</Link>
        <h1 className="auth-title">Создай профиль</h1>
        <p className="auth-subtitle">Заполните данные для регистрации</p>

        {/* ROLE TABS */}
        <div className="role-tabs">
          <button type="button" className={`role-tab ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}>👨‍🎓 Студент</button>
          <button type="button" className={`role-tab ${role === 'mentor' ? 'active' : ''}`}
            onClick={() => setRole('mentor')}>🧭 Наставник</button>
        </div>

        {role === 'mentor' && (
          <div className="mentor-info-banner">
            Наставник — студент 3–5 курса, который помогает младшим. После регистрации вы получите бейдж Агай/Эже.
          </div>
        )}

        {serverError && <div className="auth-error">{serverError}</div>}

        <div className="reg-cols">
          {/* STEP 1 */}
          <div className="reg-col">
            <h3><span className="step-dot">1</span> Личные данные</h3>

            <div className="field">
              <label>Логин</label>
              <input className={`input ${errors.login ? 'has-error' : ''}`} value={form.login}
                onChange={(e) => set('login', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="latin_only" autoComplete="username" />
              {errors.login && <div className="field-error">{errors.login}</div>}
            </div>

            <div className="field">
              <label>Имя</label>
              <input className={`input ${errors.fullName ? 'has-error' : ''}`} value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)} placeholder="Айзада Кенжебаева" />
              {errors.fullName && <div className="field-error">{errors.fullName}</div>}
            </div>

            <div className="field">
              <label>Возраст</label>
              <input className={`input ${errors.age ? 'has-error' : ''}`} type="number" value={form.age}
                onChange={(e) => set('age', e.target.value)} placeholder="20" min="14" max="80" />
              {errors.age && <div className="field-error">{errors.age}</div>}
            </div>

            <div className="field">
              <label>Пароль</label>
              <input className={`input ${errors.password ? 'has-error' : ''}`} type="password" value={form.password}
                onChange={(e) => set('password', e.target.value)} placeholder="••••••••"
                autoComplete="new-password" />
              {form.password && (
                <>
                  <div className="strength-bar">
                    <div className="strength-fill" style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }} />
                  </div>
                  <div className="strength-label" style={{ color: strength.color }}>{strength.label}</div>
                </>
              )}
              <div className="criteria">
                {CRITERIA_LABELS.map(([key, label]) => (
                  <span key={key} className={`criterion ${crit[key] ? 'met' : ''}`}>
                    {crit[key] ? '✓' : '○'} {label}
                  </span>
                ))}
              </div>
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <div className="field">
              <label>Повтор пароля</label>
              <input className={`input ${errors.confirm ? 'has-error' : ''}`} type="password" value={form.confirm}
                onChange={(e) => set('confirm', e.target.value)} placeholder="••••••••"
                autoComplete="new-password" />
              {errors.confirm && <div className="field-error">{errors.confirm}</div>}
            </div>
          </div>

          {/* STEP 2 */}
          <div className="reg-col">
            <h3><span className="step-dot">2</span> Учёба</h3>

            <div className="field">
              <label>Институт</label>
              <select className="select" value={form.faculty} onChange={(e) => setFaculty(e.target.value)}>
                {KGTU_FACULTIES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Направление</label>
              <select className="select" value={form.direction} onChange={(e) => set('direction', e.target.value)}>
                <option value="">Выберите направление</option>
                {currentFaculty.directions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Курс</label>
              <div className="course-chips">
                {[1, 2, 3, 4, 5].map((c) => (
                  <button type="button" key={c} className={`course-chip ${form.course === c ? 'active' : ''}`}
                    onClick={() => set('course', c)}>{c}</button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>О себе</label>
              <textarea className="textarea" value={form.about}
                onChange={(e) => set('about', e.target.value)}
                placeholder="Расскажите о себе — интересы, цели, чем занимаетесь..." />
            </div>
          </div>
        </div>

        <Button type="submit" variant="primary" className="btn-block" loading={loading}>
          Зарегистрироваться
        </Button>
        <p className="auth-foot">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </form>
    </div>
  );
}
