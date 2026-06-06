import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import MatchModal from '../../components/common/MatchModal';
import EditProfile from './EditProfile';
import { calculateSparkScore, SPARK_THRESHOLD, sharedInterests } from '../../utils/spark';
import './Profile.css';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentUser, getUser, matches, goals, pacts,
    likeUser, hasLiked, isMatched, wantTooGoal, toggleMentor,
    getOrCreateConversation,
  } = useApp();

  const messageUser = () => {
    const conv = getOrCreateConversation(user.id);
    navigate('/chat', { state: { convId: conv?.id } });
  };

  const [editing, setEditing] = useState(false);
  const [match, setMatch] = useState(null);

  const user = id ? getUser(id) : currentUser;
  const isOwn = !id || id === currentUser.id;

  if (!user) return <div className="page container"><div className="empty-state"><div className="emoji">🤷</div>Пользователь не найден</div></div>;
  if (editing && isOwn) return <EditProfile onClose={() => setEditing(false)} />;

  const matched = !isOwn && isMatched(currentUser.id, user.id);
  const liked = !isOwn && hasLiked(currentUser.id, user.id);
  const spark = !isOwn ? calculateSparkScore(currentUser, user) : 0;
  const shared = !isOwn ? sharedInterests(currentUser, user) : [];

  const userMatches = matches.filter((m) => m.users.includes(user.id)).length;
  const userGoals = goals.filter((g) => g.userId === user.id);
  const goalsDone = userGoals.filter((g) => g.status === 'done').length;
  const userPacts = pacts.filter((p) => p.users.includes(user.id) && p.status === 'active');

  const handleLike = () => {
    const res = likeUser(user.id);
    if (res.match) setMatch({ user: res.matchedUser, id: res.match.id });
  };

  // find this user's main goal object
  const mainGoal = userGoals.find((g) => g.status === 'active') || userGoals[0];

  return (
    <div className="page">
      <div className="container profile-container">
        <div className="profile-hero card">
          {spark >= SPARK_THRESHOLD && <div className="profile-spark">✦ Искра {spark}</div>}
          <Avatar user={user} size="xxl" />
          <h1 className="profile-name">{user.fullName}</h1>
          <span className="profile-login">@{user.login}</span>

          {user.badges.length > 0 && (
            <div className="profile-badges">{user.badges.map((b) => <Badge key={b} type={b} />)}</div>
          )}

          {matched && <div className="match-banner">Вы совпали! 🎉</div>}

          <div className="profile-stats">
            <div className="stat"><strong>{user.reputation}</strong><span>репутация</span></div>
            <div className="stat"><strong>{userMatches}</strong><span>мэтчей</span></div>
            <div className="stat"><strong>{goalsDone}</strong><span>целей</span></div>
          </div>

          <div className="profile-pills">
            <span className="info-pill">🎓 {user.faculty}</span>
            <span className="info-pill">📚 {user.course} курс</span>
            <span className="info-pill">👥 {user.groupName}</span>
            <span className="info-pill">🎂 {user.age} лет</span>
          </div>

          <div className="profile-actions">
            {isOwn ? (
              <>
                <Button variant="primary" onClick={() => setEditing(true)} icon="✏️">Редактировать</Button>
                {user.course >= 3 && (
                  <Button variant={user.isMentor ? 'ghost' : 'secondary'} onClick={toggleMentor}>
                    {user.isMentor ? '✓ Вы наставник' : '🧭 Стать наставником'}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="primary" icon="💬" onClick={messageUser}>Написать</Button>
                {!matched && (
                  <Button variant={liked ? 'ghost' : 'secondary'} icon={liked ? '✅' : '❤️'} onClick={handleLike} disabled={liked}>
                    {liked ? 'Вы лайкнули' : 'Лайк'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="profile-cols">
          <div className="profile-block card">
            <h3>О себе</h3>
            <p>{user.about || 'Пока ничего не рассказал о себе.'}</p>
          </div>

          <div className="profile-block card">
            <h3>🎯 Цель</h3>
            <p>{user.goal || user.about || '—'}</p>
            {!isOwn && mainGoal && (
              <Button size="sm" variant={mainGoal.wantToo.includes(currentUser.id) ? 'ghost' : 'secondary'}
                className="mt-16" onClick={() => wantTooGoal(mainGoal)}>
                🤝 {mainGoal.wantToo.includes(currentUser.id) ? 'Вы присоединились' : 'Я тоже хочу это'}
              </Button>
            )}
            {mainGoal && mainGoal.wantToo.length > 0 && (
              <p className="text-muted mt-8" style={{ fontSize: 13 }}>{mainGoal.wantToo.length} человек(а) хотят так же</p>
            )}
          </div>

          <div className="profile-block card">
            <h3>Интересы</h3>
            <div className="profile-interests">
              {user.interests.map((i) => (
                <span key={i} className={`tag tag-interest ${shared.includes(i) ? 'shared' : ''}`}>{i}</span>
              ))}
            </div>
          </div>

          {userPacts.length > 0 && (
            <div className="profile-block card">
              <h3>🤝 Активные пакты</h3>
              {userPacts.map((p) => (
                <div key={p.id} className="mini-pact">
                  <span>{p.text}</span>
                  <span className="text-muted">до {p.deadline}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {match && <MatchModal me={currentUser} other={match.user} matchId={match.id} onClose={() => setMatch(null)} />}
    </div>
  );
}
