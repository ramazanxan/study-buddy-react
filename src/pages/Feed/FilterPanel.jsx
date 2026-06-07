import { useState } from 'react';
import { KGTU_FACULTIES } from '../../store/mockData';
import './FilterPanel.css';

const COURSES = [1, 2, 3, 4, 5];

export default function FilterPanel({ filters, setFilters }) {
  const [open, setOpen] = useState(false);

  const selectedFaculty = filters.faculty || '';
  const selectedDirection = filters.direction || '';
  const facultyData = KGTU_FACULTIES.find((f) => f.id === selectedFaculty);
  const directions = facultyData ? facultyData.directions : [];

  const setFaculty = (id) => setFilters((f) => ({ ...f, faculty: id, direction: '' }));
  const setDirection = (d) => setFilters((f) => ({ ...f, direction: d }));
  const toggleCourse = (c) =>
    setFilters((f) => ({ ...f, courses: f.courses.includes(c) ? f.courses.filter((x) => x !== c) : [...f.courses, c] }));

  const reset = () => setFilters({ faculty: '', direction: '', courses: [], ageFrom: '', ageTo: '', search: '', sparkOnly: false });

  return (
    <>
      <button className="filter-toggle" onClick={() => setOpen((o) => !o)}>
        🔍 Фильтры {open ? '▲' : '▼'}
      </button>
      <aside className={`filter-panel ${open ? 'open' : ''}`}>
        <div className="fp-section">
          <label className="fp-label">Поиск по имени</label>
          <input className="input" value={filters.search} placeholder="Имя студента..."
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        </div>

        <div className="fp-section">
          <label className="fp-label">Институт</label>
          <select className="input" value={selectedFaculty} onChange={(e) => setFaculty(e.target.value)}>
            <option value="">Все институты</option>
            {KGTU_FACULTIES.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {selectedFaculty && (
          <div className="fp-section">
            <label className="fp-label">Направление</label>
            <select className="input" value={selectedDirection} onChange={(e) => setDirection(e.target.value)}>
              <option value="">Все направления</option>
              {directions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        <div className="fp-section">
          <label className="fp-label">Курс</label>
          <div className="fp-chips">
            {COURSES.map((c) => (
              <button key={c} className={`chip ${filters.courses.includes(c) ? 'active' : ''}`} onClick={() => toggleCourse(c)}>{c}</button>
            ))}
          </div>
        </div>

        <div className="fp-section">
          <label className="fp-label">Возраст</label>
          <div className="fp-age">
            <input className="input" type="number" placeholder="от" value={filters.ageFrom}
              onChange={(e) => setFilters((f) => ({ ...f, ageFrom: e.target.value }))} />
            <span>—</span>
            <input className="input" type="number" placeholder="до" value={filters.ageTo}
              onChange={(e) => setFilters((f) => ({ ...f, ageTo: e.target.value }))} />
          </div>
        </div>

        <div className="fp-section fp-toggle-row">
          <span className="fp-label" style={{ margin: 0 }}>✦ Только Искра</span>
          <label className="switch">
            <input type="checkbox" checked={filters.sparkOnly}
              onChange={(e) => setFilters((f) => ({ ...f, sparkOnly: e.target.checked }))} />
            <span className="slider" />
          </label>
        </div>

        <button className="btn btn-ghost btn-block" onClick={reset}>Сбросить фильтры</button>
      </aside>
    </>
  );
}
