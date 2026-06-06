import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import './Marketplace.css';

const CATEGORIES = ['Все', 'Книги', 'Электроника', 'Одежда', 'Услуги', 'Другое'];
const CAT_EMOJI = { Книги: '📚', Электроника: '💻', Одежда: '👕', Услуги: '🛠️', Другое: '📦' };
const CAT_COLOR = {
  Книги: '#5B5EA6',
  Электроника: '#3A86FF',
  Одежда: '#FF5F57',
  Услуги: '#06D6A0',
  Другое: '#FF9F1C',
};

function PhotoUploader({ photos, onAdd, onRemove }) {
  const inputRef = useRef(null);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.slice(0, 6 - photos.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => onAdd(reader.result);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <div className="photo-uploader">
      <div className="photo-grid">
        {photos.map((p, i) => (
          <div key={i} className="photo-thumb">
            <img src={p} alt={`фото ${i + 1}`} />
            <button type="button" className="photo-remove" onClick={() => onRemove(i)}>✕</button>
            {i === 0 && <span className="photo-main-badge">Главное</span>}
          </div>
        ))}
        {photos.length < 6 && (
          <button type="button" className="photo-add-btn" onClick={() => inputRef.current?.click()}>
            <span>📷</span>
            <span>{photos.length === 0 ? 'Добавить фото' : '+'}</span>
          </button>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        ref={inputRef}
        onChange={handleFiles}
      />
      {photos.length > 0 && (
        <p className="photo-hint">Первое фото — главное. До 6 фотографий.</p>
      )}
    </div>
  );
}

function ListingCard({ listing, seller, currentUser, onContact }) {
  const [imgIdx, setImgIdx] = useState(0);
  const photos = listing.photos || [];
  const mainPhoto = photos[imgIdx] || null;

  return (
    <div className="listing-card">
      <div className="listing-photo-wrap">
        {mainPhoto ? (
          <img src={mainPhoto} alt={listing.title} className="listing-photo" />
        ) : (
          <div className="listing-photo listing-photo-placeholder" style={{ background: CAT_COLOR[listing.category] + '20' }}>
            <span style={{ fontSize: 40, color: CAT_COLOR[listing.category] }}>
              {CAT_EMOJI[listing.category]}
            </span>
          </div>
        )}
        <span className="listing-cat-badge" style={{ background: CAT_COLOR[listing.category] }}>
          {listing.category}
        </span>
        {photos.length > 1 && (
          <div className="listing-photo-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`photo-dot ${i === imgIdx ? 'active' : ''}`}
                onClick={() => setImgIdx(i)}
              />
            ))}
          </div>
        )}
        {photos.length > 1 && (
          <>
            <button className="listing-photo-nav prev" onClick={() => setImgIdx((v) => Math.max(0, v - 1))}>‹</button>
            <button className="listing-photo-nav next" onClick={() => setImgIdx((v) => Math.min(photos.length - 1, v + 1))}>›</button>
          </>
        )}
      </div>

      <div className="listing-body">
        <h3 className="listing-title">{listing.title}</h3>
        <div className="listing-price">{listing.price.toLocaleString()} сом</div>
        {listing.description && <p className="listing-desc">{listing.description}</p>}

        <div className="listing-seller">
          <Avatar user={seller} size="sm" />
          <span className="listing-seller-name">{seller?.fullName}</span>
          <span className="listing-date">{new Date(listing.at).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</span>
        </div>

        {listing.userId !== currentUser.id && (
          <button className="listing-contact-btn" onClick={onContact}>
            💬 Написать продавцу
          </button>
        )}
        {listing.userId === currentUser.id && (
          <div className="listing-own-badge">Ваше объявление</div>
        )}
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { currentUser, listings, getUser, addListing, removeListing, getOrCreateConversation } = useApp();
  const navigate = useNavigate();

  const [cat, setCat] = useState('Все');
  const [sort, setSort] = useState('new');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ title: '', price: '', category: 'Книги', description: '', photos: [] });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const addPhoto = (data) => set('photos', [...form.photos, data]);
  const removePhoto = (idx) => set('photos', form.photos.filter((_, i) => i !== idx));

  const openModal = () => {
    setForm({ title: '', price: '', category: 'Книги', description: '', photos: [] });
    setModal(true);
  };

  const create = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) return;
    addListing(form);
    setModal(false);
    showToast('Объявление размещено!');
  };

  const contact = (listing) => {
    const conv = getOrCreateConversation(listing.userId);
    navigate('/chat', { state: { convId: conv.id } });
  };

  const list = listings
    .filter((l) => (cat === 'Все' ? true : l.category === cat))
    .filter((l) => !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'new' ? new Date(b.at) - new Date(a.at) : Number(a.price) - Number(b.price));

  return (
    <div className="page market-page">
      <div className="container">
        {/* Hero */}
        <div className="market-hero">
          <div className="market-hero-text">
            <h1>Маркетплейс</h1>
            <p>Покупай и продавай среди студентов КГТУ</p>
          </div>
          <Button variant="primary" size="lg" onClick={openModal}>+ Разместить объявление</Button>
        </div>

        {/* Filters */}
        <div className="market-toolbar">
          <div className="market-cats">
            {CATEGORIES.map((c) => (
              <button key={c} className={`market-cat-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
                {c !== 'Все' && <span>{CAT_EMOJI[c]}</span>} {c}
              </button>
            ))}
          </div>
          <div className="market-tools">
            <input
              className="input market-search"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select market-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="new">Сначала новые</option>
              <option value="price">По цене</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="market-meta">
          {list.length > 0 && (
            <span className="market-count">{list.length} объявлений</span>
          )}
          {listings.filter((l) => l.userId === currentUser.id).length > 0 && (
            <button className="market-my-btn" onClick={() => setCat('Все')}>
              Мои объявления ({listings.filter((l) => l.userId === currentUser.id).length})
            </button>
          )}
        </div>

        {/* Grid */}
        {list.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🛍️</div>
            <p>Нет объявлений{search ? ` по запросу "${search}"` : ` в категории "${cat}"`}.</p>
            <Button variant="primary" onClick={openModal}>Разместить первым</Button>
          </div>
        ) : (
          <div className="market-grid">
            {list.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                seller={getUser(l.userId)}
                currentUser={currentUser}
                onContact={() => contact(l)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <form className="modal-wrap" onClick={(e) => e.stopPropagation()} onSubmit={create}>
            <div className="modal-header">
              <h2>Новое объявление</h2>
              <button type="button" className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Photos */}
              <div className="field">
                <label className="label">Фотографии</label>
                <PhotoUploader
                  photos={form.photos}
                  onAdd={addPhoto}
                  onRemove={removePhoto}
                />
              </div>

              <div className="field">
                <label className="label">Название *</label>
                <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Учебник по матанализу" required />
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="label">Цена (сом) *</label>
                  <input className="input" type="number" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="500" required />
                </div>
                <div className="field">
                  <label className="label">Категория</label>
                  <select className="select" value={form.category} onChange={(e) => set('category', e.target.value)}>
                    {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label">Описание</label>
                <textarea className="textarea" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Состояние, особенности, причина продажи..." />
              </div>
            </div>

            <div className="modal-footer">
              <Button variant="primary" type="submit" disabled={!form.title.trim() || !form.price}>
                Разместить объявление
              </Button>
              <Button variant="ghost" type="button" onClick={() => setModal(false)}>Отмена</Button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
