const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTime = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export const pluralize = (n, forms) => {
  // forms = ['минута', 'минуты', 'минут']
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
};

export const formatRelativeTime = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return 'только что';
  if (min < 60) return `${min} ${pluralize(min, ['минуту', 'минуты', 'минут'])} назад`;
  if (hr < 24) return `${hr} ${pluralize(hr, ['час', 'часа', 'часов'])} назад`;
  if (day === 1) return 'вчера';
  if (day < 7) return `${day} ${pluralize(day, ['день', 'дня', 'дней'])} назад`;
  return formatDate(date);
};

export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const AVATAR_COLORS = [
  '#FF5F57', '#5B5EA6', '#FF9F1C', '#06D6A0', '#EF233C',
  '#FFD166', '#8338EC', '#3A86FF', '#FB5607', '#118AB2',
];

export const getAvatarColor = (id = '') => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const truncate = (text = '', len = 100) =>
  text.length > len ? text.slice(0, len).trimEnd() + '…' : text;

export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
