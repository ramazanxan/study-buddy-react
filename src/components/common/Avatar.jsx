import { getInitials, getAvatarColor } from '../../utils/helpers';

const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80, xxl: 120 };

export default function Avatar({ user, size = 'md', online = false, photo, name, id }) {
  const px = SIZES[size] || 40;
  const _photo = photo ?? user?.photo;
  const _name = name ?? user?.fullName ?? '';
  const _id = id ?? user?.id ?? _name;
  const color = getAvatarColor(_id);
  const fontSize = px * 0.38;

  return (
    <div style={{ position: 'relative', width: px, height: px, flexShrink: 0 }}>
      {_photo ? (
        <img
          src={_photo}
          alt={_name}
          style={{ width: px, height: px, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: px, height: px, borderRadius: '50%', background: color,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontFamily: 'var(--font-display)', fontSize,
          }}
        >
          {getInitials(_name)}
        </div>
      )}
      {online && (
        <span style={{
          position: 'absolute', bottom: 0, right: 0, width: px * 0.26, height: px * 0.26,
          background: 'var(--success)', border: '2px solid #fff', borderRadius: '50%',
        }} />
      )}
    </div>
  );
}
