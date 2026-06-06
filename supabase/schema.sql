-- ================================================================
-- StudyBuddy — Supabase schema (полный, безопасный для повторного запуска)
-- Вставь всё это в SQL Editor на supabase.com и нажми RUN
-- ================================================================

-- ── Таблицы ─────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  login       text unique not null,
  full_name   text not null,
  faculty     text,
  direction   text,
  group_name  text,
  course      int default 1,
  age         int,
  photo       text,
  interests   text[] default '{}',
  about       text default '',
  goal        text default '',
  role        text default 'student' check (role in ('student','mentor','moderator','admin')),
  is_mentor   boolean default false,
  is_moderator boolean default false,
  reputation  int default 0,
  badges      text[] default '{}',
  is_banned   boolean default false,
  last_seen   timestamptz default now(),
  created_at  timestamptz default now()
);

create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  from_id    uuid references public.profiles(id) on delete cascade,
  to_id      uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (from_id, to_id)
);

create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid references public.profiles(id) on delete cascade,
  user_b     uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  participant_a uuid references public.profiles(id) on delete cascade,
  participant_b uuid references public.profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  unique (participant_a, participant_b)
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  from_id         uuid references public.profiles(id) on delete cascade,
  text            text default '',
  photo           text,
  read            boolean default false,
  created_at      timestamptz default now()
);

create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  text       text not null,
  level      text default 'normal' check (level in ('normal','important','urgent')),
  audience   text,
  pinned     boolean default false,
  views      int default 0,
  date       date default current_date,
  created_at timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.likes         enable row level security;
alter table public.matches       enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.announcements enable row level security;

-- ── Удаляем старые политики (безопасно при повторном запуске) ───

drop policy if exists "profiles readable by auth"     on public.profiles;
drop policy if exists "profiles public login lookup"  on public.profiles;
drop policy if exists "profiles self-insert"          on public.profiles;
drop policy if exists "profiles self-update"          on public.profiles;
drop policy if exists "likes readable"                on public.likes;
drop policy if exists "likes insert own"              on public.likes;
drop policy if exists "matches readable"              on public.matches;
drop policy if exists "matches insert"                on public.matches;
drop policy if exists "conv readable"                 on public.conversations;
drop policy if exists "conv insert"                   on public.conversations;
drop policy if exists "msg readable"                  on public.messages;
drop policy if exists "msg insert own"                on public.messages;
drop policy if exists "msg update read"               on public.messages;
drop policy if exists "ann readable"                  on public.announcements;
drop policy if exists "ann admin write"               on public.announcements;

-- ── Создаём политики заново ──────────────────────────────────────

-- Profiles: все авторизованные читают; каждый пишет только свою строку
create policy "profiles readable by auth"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles self-insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles self-update"
  on public.profiles for update
  using (auth.uid() = id);

-- Likes
create policy "likes readable"
  on public.likes for select
  using (auth.role() = 'authenticated');

create policy "likes insert own"
  on public.likes for insert
  with check (auth.uid() = from_id);

-- Matches
create policy "matches readable"
  on public.matches for select
  using (auth.role() = 'authenticated');

create policy "matches insert"
  on public.matches for insert
  with check (auth.role() = 'authenticated');

-- Conversations: только участники
create policy "conv readable"
  on public.conversations for select
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "conv insert"
  on public.conversations for insert
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

-- Messages: только участники диалога
create policy "msg readable"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

create policy "msg insert own"
  on public.messages for insert
  with check (auth.uid() = from_id);

create policy "msg update read"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- Announcements: все читают; только admin пишет
create policy "ann readable"
  on public.announcements for select
  using (true);

create policy "ann admin write"
  on public.announcements for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── RPC: найти email по логину ───────────────────────────────────

create or replace function public.get_email_by_login(p_login text)
returns text language sql security definer as $$
  select u.email
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(p.login) = lower(p_login)
  limit 1;
$$;

grant execute on function public.get_email_by_login(text) to anon, authenticated;

-- ── Realtime (безопасно при повторном запуске) ───────────────────

do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when others then null; end;

  begin
    alter publication supabase_realtime add table public.conversations;
  exception when others then null; end;

  begin
    alter publication supabase_realtime add table public.announcements;
  exception when others then null; end;
end $$;
