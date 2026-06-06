export const validateLogin = (login) => {
  if (!login) return 'Логин обязателен';
  if (!/^[a-zA-Z0-9_]+$/.test(login)) return 'Только латинские буквы, цифры и _';
  if (login.length < 3) return 'Минимум 3 символа';
  if (login.length > 32) return 'Максимум 32 символа';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Пароль обязателен';
  if (password.length < 8) return 'Минимум 8 символов';
  if (!/[A-Z]/.test(password)) return 'Нужна заглавная буква';
  if (!/[a-z]/.test(password)) return 'Нужна строчная буква';
  if (!/[0-9]/.test(password)) return 'Нужна цифра';
  return null;
};

export const passwordCriteria = (password = '') => ({
  length: password.length >= 8,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  digit: /[0-9]/.test(password),
});

export const getPasswordStrength = (password = '') => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) score = 4;
  const map = [
    { score: 0, label: 'Очень слабый', color: 'var(--danger)' },
    { score: 1, label: 'Слабый', color: 'var(--danger)' },
    { score: 2, label: 'Средний', color: 'var(--accent)' },
    { score: 3, label: 'Хороший', color: 'var(--spark)' },
    { score: 4, label: 'Отличный', color: 'var(--success)' },
  ];
  return map[Math.min(score, 4)];
};

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Имя обязательно';
  if (name.trim().length < 2) return 'Минимум 2 символа';
  return null;
};

export const validateAge = (age) => {
  const n = Number(age);
  if (!age) return 'Возраст обязателен';
  if (isNaN(n) || n < 14 || n > 80) return 'Введите корректный возраст (14–80)';
  return null;
};
