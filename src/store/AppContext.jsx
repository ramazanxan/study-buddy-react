import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { seedData } from './mockData';
import { uid } from '../utils/helpers';

const STORAGE_KEY = 'studybuddy_state_v2';
const SESSION_KEY = 'studybuddy_session_v2';

const hashPassword = (p) => 'h$' + btoa(unescape(encodeURIComponent(p)));

function loadState() {
  try {
    // Session is per-tab (sessionStorage) so two tabs can hold different accounts.
    const sessionId = sessionStorage.getItem(SESSION_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = raw ? JSON.parse(raw) : structuredClone(seedData);
    // ensure new collections exist on old saves
    if (!base.conversations) base.conversations = structuredClone(seedData.conversations);
    if (!base.deadlines) base.deadlines = structuredClone(seedData.deadlines);
    if (!base.tasks) base.tasks = structuredClone(seedData.tasks);
    if (!base.complaints) base.complaints = structuredClone(seedData.complaints);
    if (!base.announcements) base.announcements = structuredClone(seedData.announcements);
    const currentUser = sessionId ? base.users.find((u) => u.id === sessionId) || null : null;
    return { ...base, currentUser };
  } catch (e) {
    console.warn('Failed to load state', e);
  }
  return { ...structuredClone(seedData), currentUser: null };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.user };

    // Replace all shared data with a version written by another tab,
    // while keeping THIS tab's logged-in user (re-resolved with fresh data).
    case 'HYDRATE': {
      const data = action.data;
      const currentUser = state.currentUser
        ? data.users.find((u) => u.id === state.currentUser.id) || state.currentUser
        : null;
      return { ...data, currentUser };
    }

    case 'ADD_USER':
      return { ...state, users: [...state.users, action.user] };

    case 'UPDATE_USER': {
      const users = state.users.map((u) => (u.id === action.user.id ? action.user : u));
      const currentUser = state.currentUser?.id === action.user.id ? action.user : state.currentUser;
      return { ...state, users, currentUser };
    }

    case 'ADD_LIKE':
      return { ...state, likes: [...state.likes, action.like] };

    case 'ADD_MATCH':
      return { ...state, matches: [...state.matches, action.match] };

    // ── Conversations (прямые чаты) ──────────────────────────────
    case 'ADD_CONVERSATION':
      return { ...state, conversations: [...state.conversations, action.conversation] };

    case 'ADD_MESSAGE': {
      const list = state.messages[action.convId] || [];
      return { ...state, messages: { ...state.messages, [action.convId]: [...list, action.message] } };
    }

    case 'MARK_READ': {
      const list = (state.messages[action.convId] || []).map((m) =>
        m.from !== action.userId ? { ...m, read: true } : m
      );
      return { ...state, messages: { ...state.messages, [action.convId]: list } };
    }

    // ── Goals ────────────────────────────────────────────────────
    case 'ADD_GOAL':
      return { ...state, goals: [action.goal, ...state.goals] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map((g) => (g.id === action.goal.id ? action.goal : g)) };

    // ── Pacts ────────────────────────────────────────────────────
    case 'ADD_PACT':
      return { ...state, pacts: [action.pact, ...state.pacts] };
    case 'UPDATE_PACT':
      return { ...state, pacts: state.pacts.map((p) => (p.id === action.pact.id ? action.pact : p)) };

    // ── Checkins ─────────────────────────────────────────────────
    case 'ADD_CHECKIN':
      return { ...state, checkins: [action.checkin, ...state.checkins] };

    // ── CallMe ───────────────────────────────────────────────────
    case 'ADD_CALLME':
      return { ...state, callme: [action.item, ...state.callme] };
    case 'UPDATE_CALLME':
      return { ...state, callme: state.callme.map((c) => (c.id === action.item.id ? action.item : c)) };
    case 'REMOVE_CALLME':
      return { ...state, callme: state.callme.filter((c) => c.id !== action.id) };

    // ── Wins ─────────────────────────────────────────────────────
    case 'ADD_WIN':
      return { ...state, wins: [action.win, ...state.wins] };
    case 'UPDATE_WIN':
      return { ...state, wins: state.wins.map((w) => (w.id === action.win.id ? action.win : w)) };
    case 'REMOVE_WIN':
      return { ...state, wins: state.wins.filter((w) => w.id !== action.id) };

    // ── Listings ─────────────────────────────────────────────────
    case 'ADD_LISTING':
      return { ...state, listings: [action.listing, ...state.listings] };
    case 'UPDATE_LISTING':
      return { ...state, listings: state.listings.map((l) => (l.id === action.listing.id ? action.listing : l)) };
    case 'REMOVE_LISTING':
      return { ...state, listings: state.listings.filter((l) => l.id !== action.id) };

    // ── Mentorships ──────────────────────────────────────────────
    case 'ADD_MENTORSHIP':
      return { ...state, mentorships: [action.item, ...state.mentorships] };
    case 'UPDATE_MENTORSHIP':
      return { ...state, mentorships: state.mentorships.map((m) => (m.id === action.item.id ? action.item : m)) };

    // ── Deadlines ────────────────────────────────────────────────
    case 'ADD_DEADLINE':
      return { ...state, deadlines: [action.deadline, ...state.deadlines] };
    case 'UPDATE_DEADLINE':
      return { ...state, deadlines: state.deadlines.map((d) => (d.id === action.deadline.id ? action.deadline : d)) };
    case 'REMOVE_DEADLINE':
      return { ...state, deadlines: state.deadlines.filter((d) => d.id !== action.id) };

    // ── Tasks ────────────────────────────────────────────────────
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.task.id ? action.task : t)) };
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    // ── Complaints ───────────────────────────────────────────────
    case 'ADD_COMPLAINT':
      return { ...state, complaints: [action.complaint, ...state.complaints] };
    case 'UPDATE_COMPLAINT':
      return { ...state, complaints: state.complaints.map((c) => (c.id === action.complaint.id ? action.complaint : c)) };

    // ── Announcements ────────────────────────────────────────────
    case 'ADD_ANNOUNCEMENT':
      return { ...state, announcements: [action.item, ...state.announcements] };
    case 'UPDATE_ANNOUNCEMENT':
      return { ...state, announcements: state.announcements.map((a) => (a.id === action.item.id ? action.item : a)) };
    case 'REMOVE_ANNOUNCEMENT':
      return { ...state, announcements: state.announcements.filter((a) => a.id !== action.id) };

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    const { currentUser, ...persist } = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
      // Session is per-tab so different tabs can be logged in as different users.
      if (currentUser) sessionStorage.setItem(SESSION_KEY, currentUser.id);
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.warn('Persist failed', e);
    }
  }, [state]);

  // Live cross-tab sync: when another tab writes shared data (chat messages,
  // announcements, likes…), pull it into this tab without touching our session.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        dispatch({ type: 'HYDRATE', data: JSON.parse(e.newValue) });
      } catch (err) {
        console.warn('Cross-tab sync failed', err);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ── Auth ─────────────────────────────────────────────────────
  const register = useCallback((data) => {
    const exists = state.users.some((u) => u.login.toLowerCase() === data.login.toLowerCase());
    if (exists) return { error: 'Этот логин уже занят' };
    const user = {
      id: uid('u'),
      login: data.login,
      passwordHash: hashPassword(data.password),
      fullName: data.fullName,
      faculty: data.faculty,
      direction: data.direction || data.faculty,
      groupName: data.groupName || '—',
      course: Number(data.course) || 1,
      age: Number(data.age),
      photo: data.photo || null,
      interests: data.interests || [],
      about: data.about || '',
      goal: data.goal || '',
      role: data.role === 'mentor' ? 'mentor' : 'student',
      reputation: 0,
      badges: [],
      isBanned: false,
      createdAt: new Date().toISOString(),
      isMentor: data.role === 'mentor',
      lastSeen: new Date().toISOString(),
      mentorBio: data.mentorBio || '',
      mentorSubjects: data.mentorSubjects || [],
      maxMentees: 5,
    };
    dispatch({ type: 'ADD_USER', user });
    dispatch({ type: 'SET_CURRENT_USER', user });
    return { user };
  }, [state.users]);

  const login = useCallback((loginName, password) => {
    const user = state.users.find((u) => u.login.toLowerCase() === loginName.toLowerCase());
    if (!user) return { error: 'Пользователь не найден' };
    if (user.passwordHash !== hashPassword(password)) return { error: 'Неверный пароль' };
    if (user.isBanned) return { error: 'Аккаунт заблокирован' };
    const updated = { ...user, lastSeen: new Date().toISOString() };
    dispatch({ type: 'UPDATE_USER', user: updated });
    dispatch({ type: 'SET_CURRENT_USER', user: updated });
    return { user: updated };
  }, [state.users]);

  const logout = useCallback(() => {
    if (state.currentUser) {
      dispatch({ type: 'UPDATE_USER', user: { ...state.currentUser, lastSeen: new Date().toISOString() } });
    }
    dispatch({ type: 'SET_CURRENT_USER', user: null });
  }, [state.currentUser]);

  const editProfile = useCallback((updates) => {
    if (!state.currentUser) return;
    dispatch({ type: 'UPDATE_USER', user: { ...state.currentUser, ...updates } });
  }, [state.currentUser]);

  // ── Likes & Matches ─────────────────────────────────────────
  const isMatched = useCallback((aId, bId) =>
    state.matches.some((m) => m.users.includes(aId) && m.users.includes(bId)),
  [state.matches]);

  const hasLiked = useCallback((fromId, toId) =>
    state.likes.some((l) => l.from === fromId && l.to === toId),
  [state.likes]);

  const likeUser = useCallback((targetId) => {
    const me = state.currentUser;
    if (!me || hasLiked(me.id, targetId)) return { already: true };
    dispatch({ type: 'ADD_LIKE', like: { from: me.id, to: targetId, at: new Date().toISOString() } });
    const mutual = hasLiked(targetId, me.id);
    if (mutual && !isMatched(me.id, targetId)) {
      const match = { id: uid('m'), users: [me.id, targetId], at: new Date().toISOString() };
      dispatch({ type: 'ADD_MATCH', match });
      // ensure conversation exists
      const convExists = state.conversations.some(
        (c) => c.participants.includes(me.id) && c.participants.includes(targetId)
      );
      if (!convExists) {
        dispatch({ type: 'ADD_CONVERSATION', conversation: { id: uid('cv'), participants: [me.id, targetId], createdAt: new Date().toISOString() } });
      }
      return { match, matchedUser: state.users.find((u) => u.id === targetId) };
    }
    return {};
  }, [state.currentUser, state.users, state.conversations, hasLiked, isMatched]);

  const getMatchId = useCallback((otherId) => {
    const me = state.currentUser;
    const m = state.matches.find((x) => x.users.includes(me?.id) && x.users.includes(otherId));
    return m?.id;
  }, [state.currentUser, state.matches]);

  // ── Conversations (прямые чаты) ──────────────────────────────
  const getOrCreateConversation = useCallback((otherId) => {
    const me = state.currentUser;
    if (!me) return null;
    const existing = state.conversations.find(
      (c) => c.participants.includes(me.id) && c.participants.includes(otherId)
    );
    if (existing) return existing;
    const conv = { id: uid('cv'), participants: [me.id, otherId], createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_CONVERSATION', conversation: conv });
    return conv;
  }, [state.currentUser, state.conversations]);

  const getConversationId = useCallback((otherId) => {
    const me = state.currentUser;
    if (!me) return null;
    const conv = state.conversations.find(
      (c) => c.participants.includes(me.id) && c.participants.includes(otherId)
    );
    return conv?.id || null;
  }, [state.currentUser, state.conversations]);

  // ── Chat / Messages ─────────────────────────────────────────
  const sendMessage = useCallback((convId, text, photo = null) => {
    if ((!text || !text.trim()) && !photo) return;
    if (!state.currentUser) return;
    const message = {
      id: uid('msg'),
      from: state.currentUser.id,
      text: text ? text.trim() : '',
      photo: photo || null,
      at: new Date().toISOString(),
      read: false,
    };
    dispatch({ type: 'ADD_MESSAGE', convId, message });
    // update lastSeen
    dispatch({ type: 'UPDATE_USER', user: { ...state.currentUser, lastSeen: new Date().toISOString() } });
  }, [state.currentUser]);

  const markRead = useCallback((convId) => {
    if (!state.currentUser) return;
    dispatch({ type: 'MARK_READ', convId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const unreadCount = useCallback(() => {
    const me = state.currentUser;
    if (!me) return 0;
    const myConvIds = state.conversations
      .filter((c) => c.participants.includes(me.id))
      .map((c) => c.id);
    let count = 0;
    for (const id of myConvIds) {
      (state.messages[id] || []).forEach((msg) => { if (msg.from !== me.id && !msg.read) count++; });
    }
    return count;
  }, [state.currentUser, state.conversations, state.messages]);

  const getMyConversations = useCallback(() => {
    const me = state.currentUser;
    if (!me) return [];
    return state.conversations.filter((c) => c.participants.includes(me.id));
  }, [state.currentUser, state.conversations]);

  // ── Online status ────────────────────────────────────────────
  const isOnline = useCallback((userId) => {
    const user = state.users.find((u) => u.id === userId);
    if (!user || !user.lastSeen) return false;
    return Date.now() - new Date(user.lastSeen).getTime() < 5 * 60 * 1000;
  }, [state.users]);

  const getLastSeen = useCallback((userId) => {
    const user = state.users.find((u) => u.id === userId);
    return user?.lastSeen || null;
  }, [state.users]);

  const pingOnline = useCallback(() => {
    if (!state.currentUser) return;
    const now = new Date().toISOString();
    dispatch({ type: 'UPDATE_USER', user: { ...state.currentUser, lastSeen: now } });
  }, [state.currentUser]);

  // ── Goals ────────────────────────────────────────────────────
  const createGoal = useCallback((text) => {
    if (!state.currentUser) return;
    const goal = { id: uid('g'), userId: state.currentUser.id, text, progress: 0, status: 'active', wantToo: [], createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_GOAL', goal });
  }, [state.currentUser]);

  const updateGoalProgress = useCallback((goal, progress) => {
    dispatch({ type: 'UPDATE_GOAL', goal: { ...goal, progress, status: progress >= 100 ? 'done' : 'active' } });
  }, []);

  const completGoal = useCallback((goal) => {
    dispatch({ type: 'UPDATE_GOAL', goal: { ...goal, progress: 100, status: 'done' } });
    const owner = state.users.find((u) => u.id === goal.userId);
    if (owner) dispatch({ type: 'UPDATE_USER', user: { ...owner, reputation: owner.reputation + 10 } });
  }, [state.users]);

  const wantTooGoal = useCallback((goal) => {
    const me = state.currentUser;
    if (!me) return;
    const wantToo = goal.wantToo.includes(me.id) ? goal.wantToo.filter((i) => i !== me.id) : [...goal.wantToo, me.id];
    dispatch({ type: 'UPDATE_GOAL', goal: { ...goal, wantToo } });
  }, [state.currentUser]);

  // ── Pacts ────────────────────────────────────────────────────
  const createPact = useCallback((partnerId, text, deadline) => {
    if (!state.currentUser) return;
    const pact = { id: uid('p'), users: [state.currentUser.id, partnerId], text, deadline, status: 'active', createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_PACT', pact });
  }, [state.currentUser]);

  const updatePactStatus = useCallback((pact, status) => {
    dispatch({ type: 'UPDATE_PACT', pact: { ...pact, status } });
  }, []);

  // ── Checkins ─────────────────────────────────────────────────
  const addCheckin = useCallback((text, mood = 'good') => {
    if (!state.currentUser) return;
    const now = new Date();
    const checkin = { id: uid('c'), userId: state.currentUser.id, text, mood, week: `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`, at: now.toISOString() };
    dispatch({ type: 'ADD_CHECKIN', checkin });
  }, [state.currentUser]);

  // ── CallMe ───────────────────────────────────────────────────
  const createCallMe = useCallback((text) => {
    if (!state.currentUser) return;
    const item = { id: uid('cm'), userId: state.currentUser.id, text, responders: [], at: new Date().toISOString() };
    dispatch({ type: 'ADD_CALLME', item });
  }, [state.currentUser]);

  const respondCallMe = useCallback((item) => {
    const me = state.currentUser;
    if (!me) return;
    const responders = item.responders.includes(me.id) ? item.responders : [...item.responders, me.id];
    dispatch({ type: 'UPDATE_CALLME', item: { ...item, responders } });
  }, [state.currentUser]);

  const clearCallMe = useCallback((id) => dispatch({ type: 'REMOVE_CALLME', id }), []);

  // ── Wins ─────────────────────────────────────────────────────
  const addWin = useCallback((text, photo) => {
    if (!state.currentUser) return;
    const win = { id: uid('w'), users: [state.currentUser.id], text, photo: photo || null, reactions: [], at: new Date().toISOString() };
    dispatch({ type: 'ADD_WIN', win });
  }, [state.currentUser]);

  const reactToWin = useCallback((win) => {
    const me = state.currentUser;
    if (!me) return;
    const reactions = win.reactions.includes(me.id) ? win.reactions.filter((i) => i !== me.id) : [...win.reactions, me.id];
    dispatch({ type: 'UPDATE_WIN', win: { ...win, reactions } });
  }, [state.currentUser]);

  const removeWin = useCallback((id) => dispatch({ type: 'REMOVE_WIN', id }), []);

  // ── Listings ─────────────────────────────────────────────────
  const addListing = useCallback((data) => {
    if (!state.currentUser) return;
    const listing = { id: uid('l'), userId: state.currentUser.id, ...data, price: Number(data.price), photos: data.photos || [], at: new Date().toISOString() };
    dispatch({ type: 'ADD_LISTING', listing });
  }, [state.currentUser]);

  const removeListing = useCallback((id) => dispatch({ type: 'REMOVE_LISTING', id }), []);

  // ── Mentorship ───────────────────────────────────────────────
  const requestMentor = useCallback((mentorId) => {
    if (!state.currentUser) return;
    const alreadyRequested = state.mentorships.some(
      (m) => m.mentorId === mentorId && m.menteeId === state.currentUser.id
    );
    if (alreadyRequested) return;
    const item = { id: uid('me'), mentorId, menteeId: state.currentUser.id, status: 'pending', at: new Date().toISOString() };
    dispatch({ type: 'ADD_MENTORSHIP', item });
  }, [state.currentUser, state.mentorships]);

  const respondMentorship = useCallback((item, status) => {
    dispatch({ type: 'UPDATE_MENTORSHIP', item: { ...item, status } });
  }, []);

  const toggleMentor = useCallback(() => {
    if (!state.currentUser) return;
    dispatch({ type: 'UPDATE_USER', user: { ...state.currentUser, isMentor: !state.currentUser.isMentor } });
  }, [state.currentUser]);

  // ── Deadlines ────────────────────────────────────────────────
  const createDeadline = useCallback((studentId, title, description, dueDate) => {
    if (!state.currentUser) return;
    const deadline = {
      id: uid('dl'),
      mentorId: state.currentUser.id,
      studentId,
      title,
      description: description || '',
      dueDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_DEADLINE', deadline });
  }, [state.currentUser]);

  const updateDeadlineStatus = useCallback((deadline, status) => {
    dispatch({ type: 'UPDATE_DEADLINE', deadline: { ...deadline, status } });
  }, []);

  const removeDeadline = useCallback((id) => dispatch({ type: 'REMOVE_DEADLINE', id }), []);

  // ── Tasks ────────────────────────────────────────────────────
  const createTask = useCallback((studentId, title, description, priority = 'medium') => {
    if (!state.currentUser) return;
    const task = {
      id: uid('t'),
      mentorId: state.currentUser.id,
      studentId,
      title,
      description: description || '',
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', task });
  }, [state.currentUser]);

  const updateTaskStatus = useCallback((task, status) => {
    dispatch({ type: 'UPDATE_TASK', task: { ...task, status } });
  }, []);

  const removeTask = useCallback((id) => dispatch({ type: 'REMOVE_TASK', id }), []);

  // ── Complaints ───────────────────────────────────────────────
  const submitComplaint = useCallback((aboutId, type, text) => {
    if (!state.currentUser) return;
    const complaint = {
      id: uid('cp'),
      fromId: state.currentUser.id,
      aboutId,
      type,
      text,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COMPLAINT', complaint });
    return complaint;
  }, [state.currentUser]);

  const resolveComplaint = useCallback((complaint) => {
    dispatch({ type: 'UPDATE_COMPLAINT', complaint: { ...complaint, status: 'resolved' } });
  }, []);

  // ── Announcements ─────────────────────────────────────────────
  const addAnnouncement = useCallback((data) => {
    const item = { id: uid('an'), ...data, views: 0, createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_ANNOUNCEMENT', item });
  }, []);

  const updateAnnouncement = useCallback((item) => {
    dispatch({ type: 'UPDATE_ANNOUNCEMENT', item });
  }, []);

  const removeAnnouncement = useCallback((id) => dispatch({ type: 'REMOVE_ANNOUNCEMENT', id }), []);

  // ── Admin ────────────────────────────────────────────────────
  const grantBadge = useCallback((userId, badge) => {
    const u = state.users.find((x) => x.id === userId);
    if (!u) return;
    const has = u.badges.includes(badge);
    const badgesArr = has ? u.badges.filter((b) => b !== badge) : [...u.badges, badge];
    dispatch({ type: 'UPDATE_USER', user: { ...u, badges: badgesArr } });
  }, [state.users]);

  const banUser = useCallback((userId) => {
    const u = state.users.find((x) => x.id === userId);
    if (u) dispatch({ type: 'UPDATE_USER', user: { ...u, isBanned: true } });
  }, [state.users]);

  const unbanUser = useCallback((userId) => {
    const u = state.users.find((x) => x.id === userId);
    if (u) dispatch({ type: 'UPDATE_USER', user: { ...u, isBanned: false } });
  }, [state.users]);

  const getUser = useCallback((id) => state.users.find((u) => u.id === id), [state.users]);

  const value = {
    ...state,
    // auth
    register, login, logout, editProfile,
    // matching
    likeUser, hasLiked, isMatched, getMatchId,
    // conversations & chat
    getOrCreateConversation, getConversationId, getMyConversations,
    sendMessage, markRead, unreadCount,
    // online
    isOnline, getLastSeen, pingOnline,
    // goals
    createGoal, updateGoalProgress, completGoal, wantTooGoal,
    // pacts
    createPact, updatePactStatus,
    // checkins
    addCheckin,
    // callme
    createCallMe, respondCallMe, clearCallMe,
    // wins
    addWin, reactToWin, removeWin,
    // listings
    addListing, removeListing,
    // mentorship
    requestMentor, respondMentorship, toggleMentor,
    // deadlines
    createDeadline, updateDeadlineStatus, removeDeadline,
    // tasks
    createTask, updateTaskStatus, removeTask,
    // complaints
    submitComplaint, resolveComplaint,
    // announcements
    addAnnouncement, updateAnnouncement, removeAnnouncement,
    // admin
    grantBadge, banUser, unbanUser,
    getUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
