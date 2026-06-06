import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Button from '../../components/common/Button';
import { supabase } from '../../lib/supabase';
import './Auth.css';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmail = (v) => v.includes('@');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.identifier.trim() || !form.password) {
      setError('Заполните все поля');
      return;
    }
    setLoading(true);

    try {
      if (supabase) {
        let email = form.identifier.trim().toLowerCase();

        // Supabase requires email — if user typed a username, tell them
        if (!isEmail(email)) {
          const { data: foundEmail, error: rpcErr } = await supabase
            .rpc('get_email_by_login', { p_login: email });
          if (!rpcErr && foundEmail) {
            email = foundEmail;
          } else {
            setError('Введи email-адрес, с которым регистрировался(ась)');
            setLoading(false);
            return;
          }
        }

        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password: form.password,
        });

        if (authErr) {
          if (authErr.message.includes('Email not confirmed')) {
            setError('Email не подтверждён. Проверь почту и нажми на ссылку в письме.');
          } else if (authErr.message.includes('Invalid login credentials')) {
            setError('Неверный логин/email или пароль');
          } else {
            setError(authErr.message);
          }
          setLoading(false);
          return;
        }

        // Supabase auth OK — AppContext подхватит сессию через onAuthStateChange
        navigate('/feed');
        return;
      }

      // ── Fallback: local mock store ──
      const res = login(form.identifier.trim(), form.password);
      setLoading(false);
      if (res.error) setError(res.error);
      else navigate('/feed');

    } catch (err) {
      setError('Ошибка соединения. Попробуйте ещё раз.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="auth-logo"><span className="nav-spark">✦</span> StudyBuddy</Link>
        <h1 className="auth-title">Добро пожаловать</h1>
        <p className="auth-subtitle">Войди, чтобы продолжить</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label>Логин или Email</label>
          <input
            className="input"
            value={form.identifier}
            autoFocus
            autoComplete="username"
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            placeholder="aizada_k или example@gmail.com"
          />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input
            className="input"
            type="password"
            value={form.password}
            autoComplete="current-password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" variant="primary" className="btn-block" loading={loading}>Войти</Button>

        <p className="auth-foot">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
        <p className="auth-foot" style={{ marginTop: 8, fontSize: 12 }}>
          Демо-вход: <b>admin</b> / <b>Admin123</b>
        </p>
      </form>
    </div>
  );
}
