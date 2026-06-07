import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import Avatar from '../../components/common/Avatar';
import { formatTime, truncate, formatRelativeTime } from '../../utils/helpers';
import './Chat.css';

const ONLINE_PING_MS = 60_000;

export default function Chat() {
  const {
    currentUser, users, conversations, messages,
    getUser, getOrCreateConversation, getConversationId,
    sendMessage, markRead,
    isOnline, getLastSeen, pingOnline,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeConvId, setActiveConvId] = useState(location.state?.convId || null);
  const [text, setText] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQ, setUserSearchQ] = useState('');
  const endRef = useRef(null);
  const fileRef = useRef(null);
  const textRef = useRef(null);

  // ping online every minute
  useEffect(() => {
    pingOnline();
    const t = setInterval(pingOnline, ONLINE_PING_MS);
    return () => clearInterval(t);
  }, [pingOnline]);

  // Fix: re-sync when user switches back to this browser tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && activeConvId) {
        markRead(activeConvId);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [activeConvId, markRead]);

  const myConvs = useMemo(() => {
    const list = conversations.filter((c) => c.participants.includes(currentUser.id));
    // Если активный чат не попал в список (race condition) — добавляем его
    if (activeConvId && !list.find((c) => c.id === activeConvId)) {
      const active = conversations.find((c) => c.id === activeConvId);
      if (active) return [active, ...list];
    }
    return list;
  }, [conversations, currentUser.id, activeConvId]);

  // set first conv as active if none selected
  useEffect(() => {
    if (!activeConvId && myConvs.length > 0) setActiveConvId(myConvs[0].id);
  }, [myConvs, activeConvId]);

  useEffect(() => {
    if (activeConvId) markRead(activeConvId);
  }, [activeConvId, markRead]);

  const threadLen = thread.length;
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [threadLen, activeConvId]);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId),
    [conversations, activeConvId]
  );
  const otherId = activeConv?.participants.find((p) => p !== currentUser.id);
  const other = otherId ? getUser(otherId) : null;
  const thread = activeConvId ? messages[activeConvId] || [] : [];

  const otherOnline = otherId ? isOnline(otherId) : false;
  const otherLastSeen = otherId ? getLastSeen(otherId) : null;

  const unreadFor = useCallback((convId) =>
    (messages[convId] || []).filter((m) => m.from !== currentUser.id && !m.read).length,
  [messages, currentUser.id]);

  const lastMsg = useCallback((convId) => {
    const t = messages[convId] || [];
    return t[t.length - 1];
  }, [messages]);

  const filteredConvs = useMemo(() => {
    if (!searchQ) return myConvs;
    return myConvs.filter((c) => {
      const oid = c.participants.find((p) => p !== currentUser.id);
      const ou = getUser(oid);
      return ou?.fullName.toLowerCase().includes(searchQ.toLowerCase());
    });
  }, [myConvs, searchQ, currentUser.id, getUser]);

  // Users available to chat — admin sees everyone; others see everyone incl. admin
  const availableUsers = useMemo(() => {
    return users.filter((u) => u.id !== currentUser.id && !u.isBanned);
  }, [users, currentUser.id]);

  const searchedUsers = useMemo(() => {
    if (!userSearchQ.trim()) return availableUsers;
    return availableUsers.filter((u) =>
      u.fullName.toLowerCase().includes(userSearchQ.toLowerCase()) ||
      u.login.toLowerCase().includes(userSearchQ.toLowerCase())
    );
  }, [availableUsers, userSearchQ]);

  const startConversation = (userId) => {
    const conv = getOrCreateConversation(userId);
    if (!conv) return;
    setActiveConvId(conv.id);
    setShowUserSearch(false);
    setUserSearchQ('');
  };

  const onPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoData(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearPhoto = () => { setPhotoPreview(null); setPhotoData(null); };

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() && !photoData) return;
    sendMessage(activeConvId, text, photoData);
    setText('');
    clearPhoto();
    textRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); }
  };

  return (
    <div className="chat-page page">
      <div className="chat-layout">

        {/* ── Sidebar ── */}
        <aside className={`chat-sidebar ${activeConvId ? 'hidden-mobile' : ''}`}>
          <div className="chat-sidebar-head">
            <h2>Чаты</h2>
            <button className="chat-new-btn" onClick={() => setShowUserSearch((v) => !v)} title="Новый чат">
              ✏️
            </button>
          </div>

          <div className="chat-search-wrap">
            <input
              className="chat-search-input"
              placeholder="Поиск..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
          </div>

          {/* User search for new chat */}
          {showUserSearch && (
            <div className="chat-user-search">
              <div className="cus-header">Новый чат</div>
              <input
                className="chat-search-input"
                placeholder="Найти пользователя..."
                value={userSearchQ}
                autoFocus
                onChange={(e) => setUserSearchQ(e.target.value)}
              />
              <div className="cus-list">
                {searchedUsers.map((u) => {
                  const convId = getConversationId(u.id);
                  return (
                    <button key={u.id} className="cus-item" onClick={() => startConversation(u.id)}>
                      <div className="cus-avatar-wrap">
                        <Avatar user={u} size="md" />
                        {isOnline(u.id) && <span className="online-dot" />}
                      </div>
                      <div className="cus-info">
                        <strong>{u.fullName}</strong>
                        <span>{u.faculty} · {u.course} курс</span>
                        {convId && <span className="cus-existing">Уже есть чат</span>}
                      </div>
                    </button>
                  );
                })}
                {searchedUsers.length === 0 && <div className="cus-empty">Никого не найдено</div>}
              </div>
            </div>
          )}

          {/* Conversation list */}
          <div className="chat-conv-list">
            {filteredConvs.length === 0 && (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">💬</div>
                <p>Нет чатов</p>
                <span>Нажми ✏️ чтобы начать</span>
              </div>
            )}
            {filteredConvs.map((c) => {
              const oid = c.participants.find((p) => p !== currentUser.id);
              const ou = getUser(oid);
              const last = lastMsg(c.id);
              const unread = unreadFor(c.id);
              const online = isOnline(oid);
              return (
                <button
                  key={c.id}
                  className={`conv-item ${c.id === activeConvId ? 'active' : ''}`}
                  onClick={() => setActiveConvId(c.id)}
                >
                  <div className="conv-avatar-wrap">
                    <Avatar user={ou} size="lg" />
                    {online && <span className="online-dot" />}
                  </div>
                  <div className="conv-body">
                    <div className="conv-top">
                      <span className="conv-name">{ou?.fullName || 'Пользователь'}</span>
                      {last && <span className="conv-time">{formatTime(last.at)}</span>}
                    </div>
                    <div className="conv-bottom">
                      <span className="conv-preview">
                        {last
                          ? (last.photo && !last.text ? '📷 Фото' : truncate(last.text, 30))
                          : 'Начните диалог'}
                      </span>
                      {unread > 0 && <span className="conv-unread">{unread}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Chat window ── */}
        <section className={`chat-window ${!activeConvId ? 'hidden-mobile' : ''}`}>
          {!activeConvId ? (
            <div className="chat-placeholder">
              <div className="chat-placeholder-icon">💬</div>
              <h3>Выбери чат</h3>
              <p>Или начни новый разговор</p>
              <button className="btn btn-primary" onClick={() => setShowUserSearch(true)}>
                Написать кому-нибудь
              </button>
            </div>
          ) : !other ? (
            <div className="chat-placeholder">
              <div className="chat-placeholder-icon">💬</div>
              <p>Открываем чат...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="chat-header">
                <button className="chat-back" onClick={() => setActiveConvId(null)}>←</button>
                <div className="chat-header-avatar">
                  <Avatar user={other} size="md" />
                  {otherOnline && <span className="online-dot" />}
                </div>
                <div className="chat-header-info">
                  <strong>{other.fullName}</strong>
                  <span className={`chat-status ${otherOnline ? 'online' : 'offline'}`}>
                    {otherOnline
                      ? 'В сети'
                      : otherLastSeen
                        ? `Был(а) ${formatRelativeTime(otherLastSeen)}`
                        : 'Не в сети'}
                  </span>
                </div>
                <button className="chat-profile-btn" onClick={() => navigate(`/profile/${other.id}`)}>
                  Профиль
                </button>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {thread.length === 0 && (
                  <div className="chat-thread-empty">
                    <Avatar user={other} size="xl" />
                    <p>{other.fullName}</p>
                    <span>Напишите первое сообщение 👋</span>
                  </div>
                )}
                {thread.map((msg, i) => {
                  const mine = msg.from === currentUser.id;
                  const sender = getUser(msg.from);
                  const isAdminMsg = !mine && sender?.role === 'admin';
                  const showAvatar = !mine && (i === 0 || thread[i - 1]?.from !== msg.from);
                  return (
                    <div key={msg.id} className={`bubble-row ${mine ? 'mine' : 'theirs'}`}>
                      {!mine && (
                        <div className={`bubble-avatar ${showAvatar ? '' : 'invisible'}`}>
                          <Avatar user={sender} size="sm" />
                        </div>
                      )}
                      <div className={`bubble ${isAdminMsg ? 'admin-bubble' : ''}`}>
                        {isAdminMsg && (
                          <span className="bubble-admin-badge">⚡ Администратор</span>
                        )}
                        {msg.photo && (
                          <img
                            src={msg.photo}
                            alt="фото"
                            className="bubble-photo"
                            onClick={() => window.open(msg.photo, '_blank')}
                          />
                        )}
                        {msg.text && <span className="bubble-text">{msg.text}</span>}
                        <div className="bubble-meta">
                          <span className="bubble-time">{formatTime(msg.at)}</span>
                          {mine && <span className="bubble-read">{msg.read ? '✓✓' : '✓'}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {/* Photo preview */}
              {photoPreview && (
                <div className="chat-photo-preview">
                  <img src={photoPreview} alt="preview" />
                  <button className="chat-photo-remove" onClick={clearPhoto}>✕</button>
                </div>
              )}

              {/* Input */}
              <form className="chat-input-area" onSubmit={send}>
                <button
                  type="button"
                  className="chat-attach-btn"
                  onClick={() => fileRef.current?.click()}
                  title="Прикрепить фото"
                >
                  📎
                </button>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileRef}
                  onChange={onPhotoSelect}
                />
                <textarea
                  ref={textRef}
                  className="chat-text-input"
                  value={text}
                  placeholder="Сообщение..."
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className="chat-send-btn"
                  type="submit"
                  disabled={!text.trim() && !photoData}
                >
                  ➤
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
