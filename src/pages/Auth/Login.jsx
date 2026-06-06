import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Button from '../../components/common/Button';
import './Auth.css';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = login(form.login.trim(), form.password);
      setLoading(false);
      if (res.error) setError(res.error);
      else navigate('/feed');
    }, 300);
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="auth-logo"><span className="nav-spark">✦</span> StudyBuddy</Link>
        <h1 className="auth-title">Добро пожаловать</h1>
        <p className="auth-subtitle">Войди, чтобы продолжить</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label>Логин</label>
          <input className="input" value={form.login} autoFocus
            onChange={(e) => setForm({ ...form, login: e.target.value })} placeholder="aizada_k" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input className="input" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>

        <Button type="submit" variant="primary" className="btn-block" loading={loading}>Войти</Button>

        <p className="auth-foot">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
        <p className="auth-foot" style={{ marginTop: 8, fontSize: 12 }}>Демо-вход: <b>admin</b> / <b>Admin123</b></p>
      </form>
    </div>
  );
}
