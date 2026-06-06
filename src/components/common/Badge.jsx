const BADGE_MAP = {
  agai: { icon: '🧑‍🏫', label: 'Агай', bg: 'rgba(91,94,166,0.12)', color: 'var(--secondary)' },
  eje: { icon: '👩‍🏫', label: 'Эже', bg: 'rgba(255,95,87,0.12)', color: 'var(--primary-dark)' },
  reliable_partner: { icon: '🤝', label: 'Надёжный партнёр', bg: 'rgba(6,214,160,0.14)', color: '#05a87e' },
  admin: { icon: '⚡', label: 'Админ', bg: 'rgba(255,159,28,0.16)', color: 'var(--spark)' },
};

export default function Badge({ type }) {
  const b = BADGE_MAP[type];
  if (!b) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 11px', borderRadius: 'var(--radius-full)',
      fontSize: 12, fontWeight: 600, background: b.bg, color: b.color, whiteSpace: 'nowrap',
    }}>
      <span>{b.icon}</span>{b.label}
    </span>
  );
}

export { BADGE_MAP };
