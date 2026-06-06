import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import Button from './Button';
import Confetti from './Confetti';
import './MatchModal.css';

export default function MatchModal({ me, other, matchId, onClose }) {
  const navigate = useNavigate();
  if (!other) return null;

  return (
    <div className="match-overlay" onClick={onClose}>
      <Confetti active />
      <div className="match-card" onClick={(e) => e.stopPropagation()}>
        <div className="match-heading">Это мэтч! 🎉</div>
        <p className="match-sub">Вы понравились друг другу</p>
        <div className="match-avatars">
          <div className="match-ava"><Avatar user={me} size="xxl" /></div>
          <div className="match-spark">✦</div>
          <div className="match-ava"><Avatar user={other} size="xxl" /></div>
        </div>
        <p className="match-names">{me?.fullName?.split(' ')[0]} & {other.fullName?.split(' ')[0]}</p>
        <div className="match-actions">
          <Button variant="primary" onClick={() => { onClose(); navigate('/chat', { state: { matchId } }); }}>
            Написать
          </Button>
          <Button variant="ghost" onClick={onClose}>Продолжить</Button>
        </div>
      </div>
    </div>
  );
}
