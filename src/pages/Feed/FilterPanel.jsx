import { useState } from 'react';
import './FilterPanel.css';

const DIRECTIONS = ['IT', 'Дизайн', 'Экономика', 'Медицина', 'Право', 'Педагогика', 'Архитектура'];
const COURSES = [1, 2, 3, 4, 5, 6];

export default function FilterPanel({ filters, setFilters }) {
  const [open, setOpen] = useState(false);

  const toggleDir = (d) =>
    setFilters((f) => ({ ...f, directions: f.directions.includes(d) ? f.directions.filter((x) => x !== d) : [...f.directions, d] }));
  const toggleCourse = (c) =>
    setFilters((f) => ({ ...f, courses: f.courses.includes(c) ? f.courses.filter((x) => x !== c) : [...f.courses, c] }));

  const reset = () => setFilters({ directions: [], courses: [], ageFrom: '', ageTo: '', search: '', sparkOnly: false });

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
          <label className="fp-label">Направление</label>
          <div className="fp-chips">
            {DIRECTIONS.map((d) => (
              <button key={d} className={`chip ${filters.directions.includes(d) ? 'active' : ''}`} onClick={() => toggleDir(d)}>{d}</button>
            ))}
          </div>
        </div>

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
