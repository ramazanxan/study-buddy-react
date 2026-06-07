import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Button from '../../components/common/Button';
import { supabase } from '../../lib/supabase';
import './Auth.css';

const isEmail = (v) => v.includes('@');

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.login.trim() || !form.password) {
      setError('Заполните все поля');
      return;
    }
    setLoading(true);

    try {
      if (supabase) {
        let email = form.login.trim().toLowerCase();

        // Use the get_email_by_login RPC if user typed a username (not email)
        if (!isEmail(email)) {
          const { data: foundEmail, error: rpcErr } = await supabase
            .rpc('get_email_by_login', { p_login: email });

          if (!rpcErr && foundEmail) {
            email = foundEmail;
          } else {
            // RPC returned nothing — might be mock/demo user, fall back to local store
            const res = login(form.login.trim(), form.password);
            setLoading(false);
            if (res.error) setError('Пользователь не найден');
            else navigate('/feed');
            return;
          }
        }

        const { error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password: form.password,
        });

        if (!authErr) {
          navigate('/feed');
          return;
        }

        if (authErr.message.includes('Email not confirmed')) {
          setError('Сначала отключи подтверждение email в Supabase Dashboard → Authentication → Providers → Email');
        } else if (authErr.message.includes('Invalid login credentials')) {
          setError('Неверный логин или пароль');
        } else {
          setError(authErr.message);
        }
        setLoading(false);
        return;
      }

      // No Supabase — mock store only
      const res = login(form.login.trim(), form.password);
      setLoading(false);
      if (res.error) setError(res.error);
      else navigate('/feed');

    } catch {
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
          <label>Логин</label>
          <input className="input" value={form.login} autoFocus autoComplete="username"
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            placeholder="aizada_k" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input className="input" type="password" value={form.password}
            autoComplete="current-password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••" />
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
