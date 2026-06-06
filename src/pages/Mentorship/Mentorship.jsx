import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import './Mentorship.css';

export default function Mentorship() {
  const { currentUser, users, mentorships, requestMentor, getOrCreateConversation } = useApp();
  const navigate = useNavigate();
  const isMentor = currentUser.role === 'mentor' || currentUser.isMentor;

  const mentors = users.filter((u) => (u.isMentor || u.role === 'mentor') && u.id !== currentUser.id && !u.isBanned);
  const myRequests = mentorships.filter((m) => m.menteeId === currentUser.id);
  const myActive = myRequests.find((m) => m.status === 'active');
  const pendingIds = myRequests.filter((m) => m.status === 'pending').map((m) => m.mentorId);

  const handleMessage = (mentorId) => {
    const conv = getOrCreateConversation(mentorId);
    navigate('/chat', { state: { convId: conv.id } });
  };

  return (
    <div className="page">
      <div className="container mentor-container">
        <div className="mentor-hero">
          <h1 className="mentor-title">Найди наставника 🧭</h1>
          <p className="text-muted mentor-intro">
            Старшекурсники Агай и Эже помогут тебе с учёбой и карьерой.
            {isMentor && <> · <a onClick={() => navigate('/mentor-panel')} className="mentor-panel-link">Открыть панель наставника →</a></>}
          </p>
        </div>

        {/* My active mentor */}
        {myActive && (
          <div className="card active-mentor-card">
            <span className="active-mentor-label">✨ Твой наставник</span>
            <div className="mentor-card-head">
              <Avatar user={users.find(u => u.id === myActive.mentorId)} size="lg" />
              <div>
                <strong>{users.find(u => u.id === myActive.mentorId)?.fullName}</strong>
                <div className="text-muted">{users.find(u => u.id === myActive.mentorId)?.direction}</div>
                <div className="profile-badges">
                  {users.find(u => u.id === myActive.mentorId)?.badges.map((b) => <Badge key={b} type={b} />)}
                </div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm mt-8" onClick={() => handleMessage(myActive.mentorId)}>
              💬 Написать наставнику
            </button>
          </div>
        )}

        {/* Mentors grid */}
        <h3 className="section-h">Доступные наставники ({mentors.length})</h3>
        {mentors.length === 0 ? (
          <div className="empty-state"><div className="emoji">🧭</div><p>Наставников пока нет.</p></div>
        ) : (
          <div className="mentor-grid">
            {mentors.map((u) => {
              const pending = pendingIds.includes(u.id);
              const isMyMentor = myActive?.mentorId === u.id;
              const menteeCount = mentorships.filter((m) => m.mentorId === u.id && m.status === 'active').length;
              const spotsLeft = (u.maxMentees || 5) - menteeCount;
              return (
                <div key={u.id} className="mentor-card card">
                  <div className="mentor-card-head">
                    <Avatar user={u} size="lg" />
                    <div>
                      <strong>{u.fullName}</strong>
                      <div className="text-muted">{u.faculty} · {u.course} курс</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>{u.direction}</div>
                    </div>
                  </div>

                  {u.badges.length > 0 && (
                    <div className="profile-badges">{u.badges.map((b) => <Badge key={b} type={b} />)}</div>
                  )}

                  {u.mentorBio && (
                    <p className="mentor-bio">{u.mentorBio}</p>
                  )}

                  {u.mentorSubjects?.length > 0 && (
                    <div className="mentor-subjects">
                      {u.mentorSubjects.map((s) => (
                        <span key={s} className="mentor-subject-tag">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="mentor-card-foot">
                    <span className="mentor-spots">
                      {spotsLeft > 0 ? `${spotsLeft} мест` : 'Мест нет'}
                    </span>
                    <div className="mentor-card-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleMessage(u.id)}>
                        💬
                      </button>
                      <Button
                        size="sm"
                        variant={pending || isMyMentor ? 'ghost' : spotsLeft > 0 ? 'secondary' : 'ghost'}
                        disabled={pending || isMyMentor || spotsLeft <= 0}
                        onClick={() => requestMentor(u.id)}
                      >
                        {isMyMentor ? 'Ваш наставник' : pending ? 'Запрос отправлен' : spotsLeft > 0 ? 'Запросить' : 'Нет мест'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
