create extension if not exists "pgcrypto";

-- Kullanıcı rolleri enum
create type if not exists user_role as enum ('user', 'admin');

-- Profiller tablosu
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  theme text default 'light',
  email_notifications boolean default true,
  push_notifications boolean default false,
  weekly_summary boolean default true,
  role user_role default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;

create policy "profiles_select" on profiles for select using (
  auth.uid() = id or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);

create policy "profiles_update" on profiles for update using (
  auth.uid() = id or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  auth.uid() = id or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

-- Yeni kullanıcı tetikleyicisi
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.email, 'user')
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Projeler tablosu
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  progress int default 0,
  due_date date,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table projects enable row level security;

create policy "projects_select" on projects for select using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

create policy "projects_modify" on projects for all using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

-- Görevler tablosu (tek status alanı!)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'todo', -- sadece 1 tane status
  priority text default 'medium',
  due_date date,
  project_id uuid references projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  attachment_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table tasks enable row level security;

create policy "tasks_select" on tasks for select using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

create policy "tasks_modify" on tasks for all using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

-- Yorumlar
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table comments enable row level security;
create policy if not exists "comments_policy" on comments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Revizyonlar
create table if not exists revisions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  comment_id uuid references comments(id) on delete set null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table revisions enable row level security;
create policy if not exists "revisions_policy" on revisions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Hedefler
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_completed boolean default false,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table goals enable row level security;
create policy if not exists "goals_policy" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bildirimler
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null,
  meta jsonb,
  read_at timestamp with time zone,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table notifications enable row level security;

create policy "notifications_select" on notifications for select using (auth.uid() = user_id);
create policy "notifications_modify" on notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_insert" on notifications for insert with check (
  auth.uid() = user_id or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

-- Demo admin
insert into profiles (id, full_name, email, role)
values ('00000000-0000-0000-0000-000000000000', 'Demo Kullanıcı', 'demo@piktram.com', 'admin')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;
