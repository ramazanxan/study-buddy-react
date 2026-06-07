import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import { calculateSparkScore, SPARK_THRESHOLD } from '../../utils/spark';
import { truncate } from '../../utils/helpers';
import './UserCard.css';

export default function UserCard({ user, onMatch, readOnly = false }) {
  const { currentUser, likeUser, hasLiked, isMatched, getOrCreateConversation } = useApp();
  const navigate = useNavigate();
  const [beat, setBeat] = useState(false);

  const liked = hasLiked(currentUser.id, user.id);
  const matched = isMatched(currentUser.id, user.id);
  const spark = calculateSparkScore(currentUser, user);
  const isSpark = spark >= SPARK_THRESHOLD;

  const handleLike = () => {
    if (liked || readOnly) return;
    setBeat(true);
    setTimeout(() => setBeat(false), 500);
    const res = likeUser(user.id);
    if (res.match && onMatch) onMatch(res.matchedUser, res.match.id);
  };

  const handleMessage = () => {
    const conv = getOrCreateConversation(user.id);
    if (!conv) return;
    navigate('/chat', { state: { convId: conv.id } });
  };

  return (
    <div className="user-card">
      {isSpark && <div className="spark-badge">✦ Искра</div>}
      <div className="uc-top">
        <Avatar user={user} size="xl" />
        <h3 className="uc-name" onClick={() => navigate(`/profile/${user.id}`)}>{user.fullName}</h3>
        <div className="uc-meta">
          <span className="tag">{user.faculty}</span>
          <span className="tag">{user.course} курс</span>
        </div>
      </div>

      <p className="uc-goal">🎯 {truncate(user.about || user.goal || '', 70)}</p>

      <div className="uc-interests">
        {user.interests.slice(0, 3).map((i) => <span key={i} className="tag tag-interest">{i}</span>)}
        {user.interests.length > 3 && <span className="tag">+{user.interests.length - 3}</span>}
      </div>

      <div className="uc-foot">
        <span className="uc-rep">⭐ {user.reputation}</span>
        {readOnly ? (
          <button className="uc-msg-btn" onClick={() => navigate(`/profile/${user.id}`)}>👁 Профиль</button>
        ) : matched ? (
          <button className="uc-msg-btn" onClick={handleMessage}>💬 Написать</button>
        ) : (
          <button className={`uc-like-btn ${liked ? 'liked' : ''} ${beat ? 'heartbeat' : ''}`} onClick={handleLike} disabled={liked}>
            {liked ? '❤️' : '🤍'}
          </button>
        )}
      </div>
    </div>
  );
}
