import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { KGTU_FACULTIES, DIRECTIONS_BY_FACULTY } from '../../store/mockData';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import './EditProfile.css';

export default function EditProfile({ onClose }) {
  const { currentUser, editProfile } = useApp();
  const isMentor = currentUser.role === 'mentor' || currentUser.isMentor;

  const [form, setForm] = useState({
    fullName: currentUser.fullName,
    faculty: currentUser.faculty,
    direction: currentUser.direction,
    groupName: currentUser.groupName,
    course: currentUser.course,
    age: currentUser.age,
    about: currentUser.about,
    goal: currentUser.goal || '',
    photo: currentUser.photo,
    interests: [...(currentUser.interests || [])],
    mentorBio: currentUser.mentorBio || '',
    mentorSubjects: currentUser.mentorSubjects ? [...currentUser.mentorSubjects] : [],
    maxMentees: currentUser.maxMentees || 5,
  });

  const [tagInput, setTagInput] = useState('');
  const [subjInput, setSubjInput] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFacultyChange = (faculty) => {
    const directions = DIRECTIONS_BY_FACULTY[faculty] || [];
    set('faculty', faculty);
    set('direction', directions[0] || '');
  };

  const currentDirections = DIRECTIONS_BY_FACULTY[form.faculty] || [];

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.interests.includes(t)) set('interests', [...form.interests, t]);
    setTagInput('');
  };
  const removeTag = (t) => set('interests', form.interests.filter((i) => i !== t));

  const addSubject = () => {
    const s = subjInput.trim();
    if (s && !form.mentorSubjects.includes(s)) set('mentorSubjects', [...form.mentorSubjects, s]);
    setSubjInput('');
  };
  const removeSubject = (s) => set('mentorSubjects', form.mentorSubjects.filter((x) => x !== s));

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('photo', reader.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    editProfile({
      ...form,
      age: Number(form.age),
      course: Number(form.course),
      maxMentees: Number(form.maxMentees),
    });
    onClose();
  };

  return (
    <div className="ep-overlay">
      <div className="ep-wrap">
        <div className="ep-header">
          <h2>Редактировать профиль</h2>
          <button className="ep-close" onClick={onClose}>✕</button>
        </div>

        <div className="ep-body">
          {/* Photo */}
          <div className="ep-photo-row">
            <Avatar photo={form.photo} name={form.fullName} id={currentUser.id} size="xxl" />
            <div className="ep-photo-actions">
              <label className="btn btn-secondary btn-sm ep-upload-btn">
                📷 Загрузить фото
                <input type="file" accept="image/*" hidden onChange={onPhoto} />
              </label>
              {form.photo && (
                <button className="btn btn-ghost btn-sm" onClick={() => set('photo', null)}>Убрать</button>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="ep-field">
            <label className="ep-label">Имя и фамилия</label>
            <input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
          </div>

          {/* Faculty + Direction */}
          <div className="ep-grid-2">
            <div className="ep-field">
              <label className="ep-label">Институт</label>
              <select className="select" value={form.faculty} onChange={(e) => handleFacultyChange(e.target.value)}>
                {KGTU_FACULTIES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="ep-field">
              <label className="ep-label">Направление</label>
              <select className="select" value={form.direction} onChange={(e) => set('direction', e.target.value)}>
                {currentDirections.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Group + Course */}
          <div className="ep-grid-2">
            <div className="ep-field">
              <label className="ep-label">Группа</label>
              <input className="input" value={form.groupName} onChange={(e) => set('groupName', e.target.value)} placeholder="ИС-21" />
            </div>
            <div className="ep-field">
              <label className="ep-label">Курс</label>
              <select className="select" value={form.course} onChange={(e) => set('course', e.target.value)}>
                {[1,2,3,4,5,6].map((c) => <option key={c} value={c}>{c} курс</option>)}
              </select>
            </div>
          </div>

          {/* Age */}
          <div className="ep-field" style={{ maxWidth: 180 }}>
            <label className="ep-label">Возраст</label>
            <input className="input" type="number" min={16} max={60} value={form.age} onChange={(e) => set('age', e.target.value)} />
          </div>

          {/* About */}
          <div className="ep-field">
            <label className="ep-label">О себе</label>
            <textarea className="textarea" rows={3} value={form.about} onChange={(e) => set('about', e.target.value)} placeholder="Расскажи о себе..." />
          </div>

          {/* Goal (only for students) */}
          {!isMentor && (
            <div className="ep-field">
              <label className="ep-label">Цель обучения</label>
              <textarea className="textarea" rows={2} value={form.goal} onChange={(e) => set('goal', e.target.value)} placeholder="Чего хочешь достичь?" />
            </div>
          )}

          {/* Mentor-specific fields */}
          {isMentor && (
            <>
              <div className="ep-divider">Настройки наставника</div>

              <div className="ep-field">
                <label className="ep-label">О себе как наставник</label>
                <textarea className="textarea" rows={3} value={form.mentorBio}
                  onChange={(e) => set('mentorBio', e.target.value)}
                  placeholder="Расскажи, чем можешь помочь студентам..." />
              </div>

              <div className="ep-field">
                <label className="ep-label">Предметы / Темы</label>
                <div className="ep-tag-input">
                  {form.mentorSubjects.map((s) => (
                    <span key={s} className="ep-tag ep-tag-mentor">
                      {s}<button onClick={() => removeSubject(s)}>×</button>
                    </span>
                  ))}
                  <input
                    value={subjInput}
                    placeholder="Добавить тему и Enter"
                    onChange={(e) => setSubjInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
                  />
                </div>
              </div>

              <div className="ep-field" style={{ maxWidth: 200 }}>
                <label className="ep-label">Макс. подопечных</label>
                <input className="input" type="number" min={1} max={20} value={form.maxMentees}
                  onChange={(e) => set('maxMentees', e.target.value)} />
              </div>
            </>
          )}

          {/* Interests */}
          <div className="ep-field">
            <label className="ep-label">Интересы</label>
            <div className="ep-tag-input">
              {form.interests.map((t) => (
                <span key={t} className="ep-tag">
                  {t}<button onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
              <input
                value={tagInput}
                placeholder="Добавить и Enter"
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
            </div>
          </div>
        </div>

        <div className="ep-footer">
          <Button variant="primary" onClick={save}>Сохранить изменения</Button>
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    </div>
  );
}
