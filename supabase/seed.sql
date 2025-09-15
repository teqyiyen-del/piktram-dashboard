-- Piktram Supabase şeması ve örnek verileri
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  theme text default 'light',
  email_notifications boolean default true,
  push_notifications boolean default false,
  weekly_summary boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
create policy if not exists "profiles_policy" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

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
create policy if not exists "projects_policy" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  due_date date,
  project_id uuid references projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table tasks enable row level security;
create policy if not exists "tasks_policy" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into profiles (id, full_name, email)
values ('00000000-0000-0000-0000-000000000000', 'Demo Kullanıcı', 'demo@piktram.com')
on conflict (id) do update set full_name = excluded.full_name;

insert into projects (id, title, description, progress, due_date, user_id) values
  ('11111111-1111-1111-1111-111111111111', 'Yeni Lansman Hazırlığı', 'Ürün lansmanı için gerekli tüm aksiyonların planlanması.', 65, current_date + interval '14 day', '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'Mobil Uygulama Güncellemesi', 'Yeni modül entegrasyonu ve performans testleri.', 45, current_date + interval '30 day', '00000000-0000-0000-0000-000000000000')
on conflict (id) do update set title = excluded.title;

insert into tasks (title, description, status, priority, due_date, project_id, user_id) values
  ('Pazarlama Stratejisi', 'Sosyal medya kampanyalarını detaylandır ve onaya sun.', 'in_progress', 'high', current_date + interval '2 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'),
  ('Tasarım Onayı', 'Yeni ana sayfa tasarımını ekip ile değerlendir.', 'todo', 'medium', current_date + interval '1 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'),
  ('Test Senaryoları', 'Mobil uygulama için hata testlerini tamamla.', 'done', 'high', current_date - interval '1 day', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000')
on conflict do nothing;
