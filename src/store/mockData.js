// ══════════════════════════════════════════════════════════════════
// StudyBuddy — Mock Database (localStorage)
// Структура БД описана в конце файла
// ══════════════════════════════════════════════════════════════════

const h = (p) => 'h$' + btoa(unescape(encodeURIComponent(p)));

// ── Справочники КГТУ им. И. Раззакова ──────────────────────────
// Единый справочник институтов КГТУ им. И. Раззакова
// Используется в Register.jsx, EditProfile.jsx, mockData
export const KGTU_FACULTIES = [
  {
    id: 'ИИТ',
    name: 'Институт информационных технологий (ИИТ)',
    directions: [
      'Программная инженерия (ПИ)',
      'Информационные системы (ИС)',
      'Бизнес-информатика (БИ)',
      'Информационная безопасность (ИБ)',
      'Прикладная математика (ПМ)',
      'Вычислительная техника (ВТ)',
      'Искусственный интеллект (ИИ)',
      'Автоматизация и управление (АУ)',
    ],
  },
  {
    id: 'ТИ',
    name: 'Технологический институт (ТИ)',
    directions: [
      'Технология продуктов питания (ТПП)',
      'Биотехнология (БТ)',
      'Лёгкая промышленность (ЛП)',
      'Стандартизация и метрология (СМ)',
      'Химическая технология (ХТ)',
    ],
  },
  {
    id: 'ЭИ',
    name: 'Энергетический институт (ЭИ)',
    directions: [
      'Электроэнергетика (ЭЭ)',
      'Теплоэнергетика и теплотехника (ТЭТ)',
      'Электропривод и автоматизация (ЭАП)',
      'Техносферная безопасность (ТБ)',
    ],
  },
  {
    id: 'ИТР',
    name: 'Институт транспорта и дорожного хозяйства (ИТР)',
    directions: [
      'Наземные транспортные технические средства (НТТС)',
      'Организация перевозок и управление на транспорте (ОПУТ)',
      'Техническая эксплуатация транспортных средств (ТЭТС)',
      'Технология транспортных процессов (ТТП)',
    ],
  },
  {
    id: 'ИАД',
    name: 'Институт архитектуры и дизайна (ИАД)',
    directions: [
      'Архитектура (АРХ)',
      'Дизайн среды (ДС)',
      'Дизайн (ДЗ)',
      'Градостроительство (ГС)',
      'Реставрация архитектурного наследия (РЕС)',
    ],
  },
  {
    id: 'КГМИ',
    name: 'Кыргызский горно-металлургический институт (КГМИ)',
    directions: [
      'Горное дело (ГД)',
      'Металлургия (МТ)',
      'Геология (ГЛ)',
      'Горная электромеханика (ГЭМ)',
    ],
  },
  {
    id: 'КГСИ',
    name: 'Кыргызский инженерно-строительный институт (КГСИ)',
    directions: [
      'Промышленное и гражданское строительство (ПГС)',
      'Землеустройство и кадастр (ЗК)',
      'Водоснабжение и водоотведение (ВВ)',
    ],
  },
  {
    id: 'КГТИ',
    name: 'Кыргызско-германский технический институт (КГТИ)',
    directions: [
      'Биомедицинская инженерия (БМИ)',
      'Прикладная механика (ПМех)',
      'Логистика (ЛГ)',
    ],
  },
  {
    id: 'ИЭТ',
    name: 'Институт электроники и телекоммуникаций (ИЭТ)',
    directions: [
      'Радиотехника (РТ)',
      'Инфокоммуникационные технологии (ИКТ)',
      'Защита информации (ЗИ)',
    ],
  },
  {
    id: 'МВШЛ',
    name: 'Международная высшая школа логистики (МВШЛ)',
    directions: [
      'Логистика и управление цепями поставок (ЛУЦП)',
      'Транспортная логистика (ТЛ)',
    ],
  },
  {
    id: 'ВШЭБ',
    name: 'Высшая школа экономики и бизнеса (ВШЭБ)',
    directions: [
      'Экономика (ЭК)',
      'Менеджмент (МНД)',
      'Маркетинг (МКТ)',
      'Финансы и кредит (ФК)',
      'Бухгалтерский учёт, анализ и аудит (БУА)',
      'Государственное и муниципальное управление (ГМУ)',
    ],
  },
];

// Для обратной совместимости
export const FACULTIES = KGTU_FACULTIES.map((f) => f.id);

export const DIRECTIONS_BY_FACULTY = Object.fromEntries(
  KGTU_FACULTIES.map((f) => [f.id, f.directions])
);

// ── Таблица users ────────────────────────────────────────────────
export const users = [
  {
    id: 'u1', login: 'aizada_k', passwordHash: h('Admin123'),
    fullName: 'Айзада Кенжебаева', faculty: 'ИИТ', direction: 'Информационные системы (ИС)',
    groupName: 'ИС-21', course: 2, age: 20, photo: null,
    interests: ['программирование', 'дизайн', 'кино'],
    about: 'Люблю создавать красивые интерфейсы и пить кофе по ночам за кодом.',
    role: 'student', reputation: 45, badges: [], isBanned: false,
    createdAt: '2024-09-01', isMentor: false, lastSeen: new Date().toISOString(),
  },
  {
    id: 'u2', login: 'bekzat_t', passwordHash: h('Admin123'),
    fullName: 'Бекзат Турдубеков', faculty: 'ИИТ', direction: 'Программная инженерия (ПИ)',
    groupName: 'ПИ-22', course: 1, age: 18, photo: null,
    interests: ['программирование', 'разработка', 'спорт'],
    about: 'Начинающий бэкенд-разработчик. Ищу команду для пет-проектов.',
    role: 'student', reputation: 22, badges: [], isBanned: false,
    createdAt: '2024-09-10', isMentor: false, lastSeen: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'u3', login: 'cholpon_a', passwordHash: h('Admin123'),
    fullName: 'Чолпон Асанова', faculty: 'ИАД', direction: 'Дизайн (ДЗ)',
    groupName: 'ДЗ-23', course: 3, age: 21, photo: null,
    interests: ['дизайн', 'ux', 'фотография'],
    about: 'UX-дизайнер, обожаю минимализм и хорошую типографику.',
    role: 'mentor', reputation: 78, badges: ['eje', 'reliable_partner'], isBanned: false,
    createdAt: '2024-08-20', isMentor: true, lastSeen: new Date(Date.now() - 600000).toISOString(),
    mentorBio: 'Помогаю студентам освоить дизайн и UX. Работаю в Figma, Adobe XD.',
    mentorSubjects: ['UX/UI Design', 'Figma', 'Фотография'],
    maxMentees: 5,
  },
  {
    id: 'u4', login: 'daniyar_m', passwordHash: h('Admin123'),
    fullName: 'Данияр Маматов', faculty: 'ВШЭБ', direction: 'Экономика (ЭК)',
    groupName: 'ЭК-20', course: 4, age: 23, photo: null,
    interests: ['бизнес', 'инвестиции', 'спорт'],
    about: 'Хочу построить свой стартап. Интересуюсь финтехом.',
    role: 'mentor', reputation: 90, badges: ['agai', 'reliable_partner'], isBanned: false,
    createdAt: '2024-07-15', isMentor: true, lastSeen: new Date(Date.now() - 3600000).toISOString(),
    mentorBio: 'Помогу разобраться в экономике, бизнесе и стартапах. Опыт 3 года.',
    mentorSubjects: ['Экономика', 'Бизнес-планирование', 'Инвестиции'],
    maxMentees: 5,
  },
  {
    id: 'u5', login: 'elnura_s', passwordHash: h('Admin123'),
    fullName: 'Элнура Садыкова', faculty: 'ТИ', direction: 'Биотехнология (БТ)',
    groupName: 'ЛД-21', course: 2, age: 20, photo: null,
    interests: ['медицина', 'наука', 'чтение'],
    about: 'Будущий учёный. Люблю исследования.',
    role: 'student', reputation: 51, badges: [], isBanned: false,
    createdAt: '2024-09-05', isMentor: false, lastSeen: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'u6', login: 'farkhat_b', passwordHash: h('Admin123'),
    fullName: 'Фархат Бакиров', faculty: 'ВШЭБ', direction: 'Менеджмент (МНД)',
    groupName: 'ЮР-22', course: 3, age: 22, photo: null,
    interests: ['право', 'дебаты', 'история'],
    about: 'Будущий менеджер, увлекаюсь предпринимательством.',
    role: 'mentor', reputation: 60, badges: ['reliable_partner'], isBanned: false,
    createdAt: '2024-08-30', isMentor: true, lastSeen: new Date(Date.now() - 900000).toISOString(),
    mentorBio: 'Помогу с менеджментом и организационными навыками.',
    mentorSubjects: ['Менеджмент', 'Тайм-менеджмент', 'Лидерство'],
    maxMentees: 4,
  },
  {
    id: 'u7', login: 'gulnaz_o', passwordHash: h('Admin123'),
    fullName: 'Гулназ Орозбаева', faculty: 'ИАД', direction: 'Дизайн среды (ДС)',
    groupName: 'ДЗ-22', course: 2, age: 19, photo: null,
    interests: ['дизайн', 'ui', 'кино'],
    about: 'Графический дизайнер, люблю иллюстрации и анимацию.',
    role: 'student', reputation: 33, badges: [], isBanned: false,
    createdAt: '2024-09-12', isMentor: false, lastSeen: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'u8', login: 'islam_d', passwordHash: h('Admin123'),
    fullName: 'Ислам Джумабеков', faculty: 'ИИТ', direction: 'Вычислительная техника (ВТ)',
    groupName: 'ПИ-21', course: 2, age: 20, photo: null,
    interests: ['программирование', 'игры', 'музыка'],
    about: 'Геймдев-энтузиаст, делаю инди-игры на Unity.',
    role: 'student', reputation: 41, badges: [], isBanned: false,
    createdAt: '2024-09-08', isMentor: false, lastSeen: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'u9', login: 'jyldyz_k', passwordHash: h('Admin123'),
    fullName: 'Жылдыз Калыкова', faculty: 'МВШЛ', direction: 'Транспортная логистика (ТЛ)',
    groupName: 'ПД-23', course: 1, age: 18, photo: null,
    interests: ['чтение', 'психология', 'кино'],
    about: 'Хочу работать в международной логистике.',
    role: 'student', reputation: 18, badges: [], isBanned: false,
    createdAt: '2024-09-15', isMentor: false, lastSeen: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'u10', login: 'kanat_e', passwordHash: h('Admin123'),
    fullName: 'Канат Эрмеков', faculty: 'ИАД', direction: 'Градостроительство (ГС)',
    groupName: 'АР-20', course: 4, age: 24, photo: null,
    interests: ['архитектура', 'дизайн', 'фотография'],
    about: 'Проектирую устойчивые здания. Люблю урбанистику.',
    role: 'mentor', reputation: 72, badges: ['reliable_partner'], isBanned: false,
    createdAt: '2024-08-01', isMentor: true, lastSeen: new Date(Date.now() - 10800000).toISOString(),
    mentorBio: 'Архитектор с опытом. Помогу с проектированием и урбанистикой.',
    mentorSubjects: ['Архитектура', 'AutoCAD', 'Урбанистика'],
    maxMentees: 3,
  },
  {
    id: 'u11', login: 'lira_n', passwordHash: h('Admin123'),
    fullName: 'Лира Нурланова', faculty: 'ВШЭБ', direction: 'Маркетинг (МКТ)',
    groupName: 'ЭК-22', course: 2, age: 19, photo: null,
    interests: ['бизнес', 'дизайн', 'путешествия'],
    about: 'Маркетолог в душе. Веду свой блог про финансы.',
    role: 'student', reputation: 38, badges: [], isBanned: false,
    createdAt: '2024-09-03', isMentor: false, lastSeen: new Date(Date.now() - 2700000).toISOString(),
  },
  {
    id: 'u_admin', login: 'admin', passwordHash: h('Admin123'),
    fullName: 'Администратор', faculty: 'ИИТ', direction: 'Информационная безопасность (ИБ)',
    groupName: '—', course: 5, age: 30, photo: null,
    interests: ['модерация', 'безопасность'],
    about: 'Администратор платформы StudyBuddy КГТУ.',
    role: 'admin', reputation: 100, badges: ['admin'], isBanned: false,
    createdAt: '2024-06-01', isMentor: false, lastSeen: new Date().toISOString(),
  },
];

// ── Таблица likes ────────────────────────────────────────────────
export const likes = [
  { from: 'u1', to: 'u8', at: '2024-09-20T10:00:00Z' },
  { from: 'u8', to: 'u1', at: '2024-09-20T11:00:00Z' },
  { from: 'u3', to: 'u4', at: '2024-09-21T10:00:00Z' },
  { from: 'u4', to: 'u3', at: '2024-09-21T12:00:00Z' },
  { from: 'u2', to: 'u7', at: '2024-09-22T10:00:00Z' },
  { from: 'u7', to: 'u2', at: '2024-09-22T15:00:00Z' },
];

// ── Таблица matches ──────────────────────────────────────────────
export const matches = [
  { id: 'm1', users: ['u1', 'u8'], at: '2024-09-20T11:00:00Z' },
  { id: 'm2', users: ['u3', 'u4'], at: '2024-09-21T12:00:00Z' },
  { id: 'm3', users: ['u2', 'u7'], at: '2024-09-22T15:00:00Z' },
];

// ── Таблица conversations (прямые сообщения, не зависят от match) ─
export const conversations = [
  { id: 'cv1', participants: ['u1', 'u8'], createdAt: '2024-09-20T11:00:00Z' },
  { id: 'cv2', participants: ['u3', 'u4'], createdAt: '2024-09-21T12:00:00Z' },
  { id: 'cv3', participants: ['u2', 'u7'], createdAt: '2024-09-22T15:00:00Z' },
  { id: 'cv4', participants: ['u3', 'u1'], createdAt: '2024-09-23T10:00:00Z' },
  { id: 'cv5', participants: ['u4', 'u11'], createdAt: '2024-09-24T09:00:00Z' },
];

// ── Таблица messages (привязаны к conversationId) ────────────────
export const messages = {
  cv1: [
    { id: 'msg1', from: 'u8', text: 'Привет! Видел, ты делаешь приложения 🚀', photo: null, at: '2024-09-20T11:05:00Z', read: true },
    { id: 'msg2', from: 'u1', text: 'Привет! Да, сейчас как раз учу React Native', photo: null, at: '2024-09-20T11:08:00Z', read: true },
    { id: 'msg3', from: 'u8', text: 'Огонь! Давай запилим что-то вместе?', photo: null, at: '2024-09-20T11:10:00Z', read: false },
  ],
  cv2: [
    { id: 'msg4', from: 'u4', text: 'Чолпон, мне нужен дизайнер в стартап', photo: null, at: '2024-09-21T12:05:00Z', read: true },
    { id: 'msg5', from: 'u3', text: 'Интересно! Расскажи подробнее', photo: null, at: '2024-09-21T12:20:00Z', read: true },
  ],
  cv3: [
    { id: 'msg6', from: 'u2', text: 'Гулназ, нужна обложка для проекта на хакатон', photo: null, at: '2024-09-22T15:05:00Z', read: false },
  ],
  cv4: [
    { id: 'msg7', from: 'u3', text: 'Привет! Могу помочь с дизайном', photo: null, at: '2024-09-23T10:05:00Z', read: true },
    { id: 'msg8', from: 'u1', text: 'Спасибо, буду иметь в виду! 🙏', photo: null, at: '2024-09-23T10:10:00Z', read: true },
  ],
  cv5: [
    { id: 'msg9', from: 'u4', text: 'Лира, как продвигается маркетинговый проект?', photo: null, at: '2024-09-24T09:05:00Z', read: false },
  ],
};

// ── Таблица goals ────────────────────────────────────────────────
export const goals = [
  { id: 'g1', userId: 'u1', text: 'Закончить курс по React', progress: 60, status: 'active', wantToo: ['u2', 'u8'], createdAt: '2024-09-18' },
  { id: 'g2', userId: 'u1', text: 'Сделать портфолио', progress: 100, status: 'done', wantToo: [], createdAt: '2024-09-01' },
  { id: 'g3', userId: 'u4', text: 'Найти ко-фаундера', progress: 40, status: 'active', wantToo: ['u11'], createdAt: '2024-09-10' },
  { id: 'g4', userId: 'u2', text: 'Решить 100 задач на LeetCode', progress: 25, status: 'active', wantToo: [], createdAt: '2024-09-20' },
];

// ── Таблица pacts ────────────────────────────────────────────────
export const pacts = [
  { id: 'p1', users: ['u1', 'u8'], text: 'Каждый день кодить минимум 1 час', deadline: '2025-08-01', status: 'active', createdAt: '2024-09-21' },
  { id: 'p2', users: ['u3', 'u4'], text: 'Запустить MVP стартапа', deadline: '2025-06-01', status: 'active', createdAt: '2024-09-22' },
];

// ── Таблица checkins ─────────────────────────────────────────────
export const checkins = [
  { id: 'c1', userId: 'u1', text: 'Прошла 3 урока по React, сделала первый компонент', mood: 'good', week: '2024-W38', at: '2024-09-22T18:00:00Z' },
];

// ── Таблица callme ───────────────────────────────────────────────
export const callme = [
  { id: 'cm1', userId: 'u2', text: 'Ищу напарника на хакатон в эти выходные!', responders: ['u8'], at: '2024-09-23T09:00:00Z' },
];

// ── Таблица wins ─────────────────────────────────────────────────
export const wins = [
  { id: 'w1', users: ['u4', 'u3'], text: 'Мы запустили MVP нашего стартапа и получили первых 50 пользователей! 🚀', photo: null, reactions: ['u1', 'u8', 'u11'], at: '2024-09-19T14:00:00Z' },
  { id: 'w2', users: ['u2'], text: 'Занял 2 место на университетском хакатоне 🥈', photo: null, reactions: ['u1', 'u7'], at: '2024-09-17T20:00:00Z' },
  { id: 'w3', users: ['u11'], text: 'Получила оффер на стажировку в крутую компанию! 🎉', photo: null, reactions: ['u1', 'u3', 'u4'], at: '2024-09-16T12:00:00Z' },
];

// ── Таблица listings (Маркетплейс) ───────────────────────────────
export const listings = [
  { id: 'l1', userId: 'u3', title: 'Учебник по UX-дизайну', price: 800, category: 'Книги', description: 'Don\'t Make Me Think, отличное состояние. Куплено год назад, читал один раз.', photos: [], at: '2024-09-15' },
  { id: 'l2', userId: 'u8', title: 'Графический планшет Wacom', price: 4500, category: 'Электроника', description: 'Wacom Intuos, почти новый, с пером и подставкой. Использовал пару месяцев.', photos: [], at: '2024-09-16' },
  { id: 'l3', userId: 'u11', title: 'Куртка осенняя M', price: 1200, category: 'Одежда', description: 'Тёплая, размер M, носила пару раз. Отличное состояние, без дефектов.', photos: [], at: '2024-09-18' },
  { id: 'l4', userId: 'u1', title: 'Конспекты по программированию', price: 300, category: 'Книги', description: 'Полный курс 1 семестра, аккуратные записи. Все темы покрыты.', photos: [], at: '2024-09-20' },
];

// ── Таблица mentorships ──────────────────────────────────────────
export const mentorships = [
  { id: 'me1', mentorId: 'u4', menteeId: 'u11', status: 'active', at: '2024-09-20' },
  { id: 'me2', mentorId: 'u3', menteeId: 'u7', status: 'pending', at: '2024-09-23' },
  { id: 'me3', mentorId: 'u4', menteeId: 'u1', status: 'active', at: '2024-09-15' },
];

// ── Таблица deadlines (от наставника к студенту) ─────────────────
export const deadlines = [
  {
    id: 'dl1', mentorId: 'u4', studentId: 'u11',
    title: 'Написать бизнес-план', description: 'Составь подробный бизнес-план своего проекта с финансовой моделью.',
    dueDate: '2026-06-20', status: 'pending', createdAt: '2024-09-25',
  },
  {
    id: 'dl2', mentorId: 'u4', studentId: 'u1',
    title: 'Анализ рынка конкурентов', description: 'Проанализируй 5 конкурентов в своей нише и сделай SWOT-анализ.',
    dueDate: '2026-06-15', status: 'done', createdAt: '2024-09-20',
  },
  {
    id: 'dl3', mentorId: 'u4', studentId: 'u11',
    title: 'Питч-дек на 10 слайдов', description: 'Создай презентацию для инвесторов.',
    dueDate: '2026-07-01', status: 'pending', createdAt: '2024-09-28',
  },
];

// ── Таблица tasks (задания от наставника) ─────────────────────────
export const tasks = [
  {
    id: 't1', mentorId: 'u4', studentId: 'u11',
    title: 'Прочитать книгу "Lean Startup"',
    description: 'Прочитай книгу и напиши краткий конспект (2-3 страницы).',
    status: 'done', priority: 'high', createdAt: '2024-09-18',
  },
  {
    id: 't2', mentorId: 'u4', studentId: 'u11',
    title: 'Найти 3 потенциальных клиента',
    description: 'Проведи интервью с потенциальными клиентами и запиши их боли.',
    status: 'pending', priority: 'high', createdAt: '2024-09-22',
  },
  {
    id: 't3', mentorId: 'u4', studentId: 'u1',
    title: 'Изучить основы Excel для финанс. моделей',
    description: 'Пройди базовый курс по Excel (формулы, сводные таблицы).',
    status: 'pending', priority: 'medium', createdAt: '2024-09-25',
  },
];

// ── Таблица complaints (жалобы) ──────────────────────────────────
export const complaints = [
  {
    id: 'cp1', fromId: 'u1', aboutId: 'u8',
    type: 'spam', text: 'Присылает спам-сообщения в чат',
    status: 'open', createdAt: '2024-09-23T10:00:00Z',
  },
];

// ── Таблица announcements (объявления от администрации) ──────────
export const announcements = [
  {
    id: 'an1', title: 'Экзаменационная сессия',
    text: 'Экзаменационная сессия начинается 16 июня 2026 года. Расписание опубликовано на сайте деканата. Просьба ознакомиться заранее.',
    level: 'urgent', date: '2026-06-06', pinned: true, views: 234,
  },
  {
    id: 'an2', title: 'Хакатон KSTU Hack 2026',
    text: 'Приглашаем студентов принять участие в ежегодном хакатоне. Призовой фонд — 150 000 сом. Регистрация открыта до 9 июня.',
    level: 'important', date: '2026-06-04', pinned: true, views: 189,
  },
  {
    id: 'an3', title: 'Стипендиальная программа Huawei',
    text: 'Компания Huawei объявила о стипендиальной программе для студентов IT-специальностей КГТУ. Подать заявку можно до 30 июня.',
    level: 'normal', date: '2026-06-05', pinned: false, views: 102,
  },
  {
    id: 'an4', title: 'Столовая корпуса №3',
    text: 'Столовая корпуса №3 временно закрыта на ремонт до 15 июня. Приносим извинения за неудобства.',
    level: 'normal', date: '2026-06-04', pinned: false, views: 78,
  },
  {
    id: 'an5', title: 'Перевод между группами',
    text: 'Приём заявлений на перевод между группами — до 20 июня. Обратитесь в деканат с заявлением установленного образца.',
    level: 'important', date: '2026-06-03', pinned: false, views: 65,
  },
];

export const badges = [];

// ══════════════════════════════════════════════════════════════════
// SEED DATA (начальное состояние БД)
// ══════════════════════════════════════════════════════════════════
export const seedData = {
  users,
  likes,
  matches,
  conversations,
  messages,
  goals,
  pacts,
  checkins,
  callme,
  wins,
  listings,
  mentorships,
  deadlines,
  tasks,
  complaints,
  announcements,
  badges,
};

/*
 * ══════════════════════════════════════════════════════════════════
 * СТРУКТУРА БАЗЫ ДАННЫХ StudyBuddy
 * (localStorage / JSON — при подключении к backend переносится 1:1)
 * ══════════════════════════════════════════════════════════════════
 *
 * users[]           — аккаунты (student | mentor | admin)
 *   id, login, passwordHash, fullName, faculty, direction,
 *   groupName, course, age, photo, interests, about, goal,
 *   role, reputation, badges, isBanned, isMentor, lastSeen,
 *   mentorBio, mentorSubjects, maxMentees
 *
 * conversations[]   — диалоги (прямые, между любыми двумя юзерами)
 *   id, participants[userId, userId], createdAt
 *
 * messages{}        — ключ: conversationId, значение: Message[]
 *   id, from(userId), text, photo(base64|null), at, read
 *
 * goals[]           — цели студентов
 *   id, userId, text, progress(0-100), status, wantToo[], createdAt
 *
 * pacts[]           — взаимные пакты между студентами
 *   id, users[userId,userId], text, deadline, status, createdAt
 *
 * checkins[]        — еженедельные чек-ины
 *   id, userId, text, mood, week, at
 *
 * callme[]          — призывы найти напарника
 *   id, userId, text, responders[], at
 *
 * wins[]            — доска побед
 *   id, users[], text, photo, reactions[], at
 *
 * listings[]        — объявления маркетплейса
 *   id, userId, title, price, category, description, photos[], at
 *
 * mentorships[]     — связь наставник-студент
 *   id, mentorId, menteeId, status(pending|active|declined), at
 *
 * deadlines[]       — дедлайны от наставника студенту
 *   id, mentorId, studentId, title, description, dueDate,
 *   status(pending|done|overdue), createdAt
 *
 * tasks[]           — задания от наставника студенту
 *   id, mentorId, studentId, title, description,
 *   status(pending|done), priority(high|medium|low), createdAt
 *
 * complaints[]      — жалобы
 *   id, fromId, aboutId, type, text, status(open|resolved), createdAt
 *
 * announcements[]   — объявления от администрации
 *   id, title, text, level(normal|important|urgent),
 *   date, pinned, views
 *
 * likes[]           — лайки в ленте
 *   from, to, at
 *
 * matches[]         — взаимные мэтчи
 *   id, users[userId,userId], at
 * ══════════════════════════════════════════════════════════════════
 */
