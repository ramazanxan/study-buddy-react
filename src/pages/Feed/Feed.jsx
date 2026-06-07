import { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import FilterPanel from './FilterPanel';
import UserCard from './UserCard';
import MatchModal from '../../components/common/MatchModal';
import { calculateSparkScore, SPARK_THRESHOLD } from '../../utils/spark';
import { pluralize } from '../../utils/helpers';
import './Feed.css';

export default function Feed() {
  const { currentUser, users } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [filters, setFilters] = useState({ faculty: '', direction: '', courses: [], ageFrom: '', ageTo: '', search: '', sparkOnly: false });
  const [match, setMatch] = useState(null);

  const list = useMemo(() => {
    return users
      .filter((u) => u.id !== currentUser.id && u.role !== 'admin' && !u.isBanned)
      .filter((u) => (filters.faculty ? u.faculty === filters.faculty : true))
      .filter((u) => (filters.direction ? u.direction === filters.direction : true))
      .filter((u) => (filters.courses.length ? filters.courses.includes(u.course) : true))
      .filter((u) => (filters.ageFrom ? u.age >= Number(filters.ageFrom) : true))
      .filter((u) => (filters.ageTo ? u.age <= Number(filters.ageTo) : true))
      .filter((u) => (filters.search ? u.fullName.toLowerCase().includes(filters.search.toLowerCase()) : true))
      .filter((u) => (filters.sparkOnly ? calculateSparkScore(currentUser, u) >= SPARK_THRESHOLD : true))
      .sort((a, b) => calculateSparkScore(currentUser, b) - calculateSparkScore(currentUser, a));
  }, [users, currentUser, filters]);

  return (
    <div className="page">
      <div className="container feed-layout">
        <FilterPanel filters={filters} setFilters={setFilters} />

        <div className="feed-main">
          <div className="feed-head">
            <h1>Лента 🔥</h1>
            <div className="feed-head-right">
              <span className="feed-count">
                {list.length} {pluralize(list.length, ['студент', 'студента', 'студентов'])}
              </span>
              {isAdmin && (
                <span className="feed-admin-badge">👁 Режим наблюдения</span>
              )}
            </div>
          </div>

          {list.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">🔍</div>
              <p>Никого не нашлось. Попробуй изменить фильтры.</p>
            </div>
          ) : (
            <div className="feed-grid">
              {list.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  readOnly={isAdmin}
                  onMatch={isAdmin ? null : (mu, mid) => setMatch({ user: mu, id: mid })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {match && (
        <MatchModal me={currentUser} other={match.user} matchId={match.id} onClose={() => setMatch(null)} />
      )}
    </div>
  );
}
