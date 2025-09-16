create extension if not exists "pgcrypto";

create type if not exists user_role as enum ('user', 'admin');

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

alter table profiles
  alter column role type user_role using role::user_role;

alter table profiles enable row level security;
drop policy if exists "profiles_policy" on profiles;
drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_modify" on profiles;
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
drop policy if exists "projects_policy" on projects;
drop policy if exists "projects_select" on projects;
drop policy if exists "projects_modify" on projects;
create policy "projects_select" on projects for select using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);
create policy "projects_modify" on projects for all using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'yapiliyor',
  priority text default 'medium',
  due_date date,
  project_id uuid references projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  attachment_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table tasks enable row level security;
drop policy if exists "tasks_policy" on tasks;
drop policy if exists "tasks_select" on tasks;
drop policy if exists "tasks_modify" on tasks;
create policy "tasks_select" on tasks for select using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);
create policy "tasks_modify" on tasks for all using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

insert into profiles (id, full_name, email, role)
values ('00000000-0000-0000-0000-000000000000', 'Demo Kullanıcı', 'demo@piktram.com', 'admin')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into projects (id, title, description, progress, due_date, user_id) values
  ('11111111-1111-1111-1111-111111111111', 'Yeni Lansman Hazırlığı', 'Ürün lansmanı için gerekli tüm aksiyonların planlanması.', 65, current_date + interval '14 day', '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'Mobil Uygulama Güncellemesi', 'Yeni modül entegrasyonu ve performans testleri.', 45, current_date + interval '30 day', '00000000-0000-0000-0000-000000000000')
on conflict (id) do update set title = excluded.title;

insert into tasks (title, description, status, priority, due_date, project_id, user_id, attachment_url) values
  ('Pazarlama Stratejisi', 'Sosyal medya kampanyalarını detaylandır ve onaya sun.', 'onay_surecinde', 'high', current_date + interval '2 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', null),
  ('Tasarım Onayı', 'Yeni ana sayfa tasarımını ekip ile değerlendir.', 'yapiliyor', 'medium', current_date + interval '1 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'https://storage.googleapis.com/piktram-demo/brifing.pdf'),
  ('Test Senaryoları', 'Mobil uygulama için hata testlerini tamamla.', 'onaylandi', 'high', current_date - interval '1 day', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', null)
on conflict do nothing;

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamp with time zone not null,
  event_type text not null,
  related text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table events enable row level security;
drop policy if exists "events_select" on events;
drop policy if exists "events_modify" on events;
create policy "events_select" on events for select using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);
create policy "events_modify" on events for all using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

insert into events (title, description, event_date, event_type, related, user_id) values
  ('Instagram İçerik Yayını', 'Story ve carousel tasarımlarını paylaş.', current_timestamp + interval '1 day', 'icerik', 'Yeni Lansman Hazırlığı', '00000000-0000-0000-0000-000000000000'),
  ('Müşteri Strateji Toplantısı', 'Haziran performansını değerlendirme oturumu.', current_timestamp + interval '3 day', 'toplanti', 'Zoom', '00000000-0000-0000-0000-000000000000'),
  ('Fatura Ödeme Hatırlatması', 'Piktram Premium plan ödemesi.', current_timestamp + interval '5 day', 'odeme', 'Piktram Finans', '00000000-0000-0000-0000-000000000000'),
  ('Aylık Rapor Teslimi', 'Haziran performans raporunu paylaş.', current_timestamp + interval '7 day', 'rapor', 'Haziran Raporu', '00000000-0000-0000-0000-000000000000')
on conflict do nothing;

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  period text not null,
  period_label text,
  followers int not null,
  likes int not null,
  posts int not null,
  engagement_rate numeric,
  summary text,
  file_url text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table reports enable row level security;
drop policy if exists "reports_select" on reports;
drop policy if exists "reports_modify" on reports;
create policy "reports_select" on reports for select using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);
create policy "reports_modify" on reports for all using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

insert into reports (title, period, period_label, followers, likes, posts, engagement_rate, summary, file_url, user_id, created_at) values
  ('Hafta 27 Performans Özeti', 'weekly', 'Hafta 27', 1850, 12400, 18, 4.2, 'Topluluk etkileşimi önceki haftaya göre %12 arttı.', 'https://storage.googleapis.com/piktram-demo/hafta-27-raporu.pdf', '00000000-0000-0000-0000-000000000000', current_timestamp - interval '2 day'),
  ('Hafta 28 Sosyal Medya Analizi', 'weekly', 'Hafta 28', 1940, 13150, 20, 4.6, 'Reels performansı yüksek. Haftalık hedefler aşıldı.', 'https://storage.googleapis.com/piktram-demo/hafta-28-raporu.pdf', '00000000-0000-0000-0000-000000000000', current_timestamp - interval '1 day'),
  ('Haziran Ayı Kampanya Özeti', 'monthly', 'Haziran 2024', 7420, 56890, 74, 5.1, 'Haziran kampanyaları hedeflenen etkileşimi %8 aştı.', 'https://storage.googleapis.com/piktram-demo/haziran-raporu.pdf', '00000000-0000-0000-0000-000000000000', current_timestamp - interval '15 day'),
  ('Mayıs Ayı Kanal Performansı', 'monthly', 'Mayıs 2024', 7010, 49820, 68, 4.7, 'Video içerikleri Mayıs ayında en yüksek dönüşümü sağladı.', 'https://storage.googleapis.com/piktram-demo/mayis-raporu.pdf', '00000000-0000-0000-0000-000000000000', current_timestamp - interval '45 day')
on conflict do nothing;

-- Görev ekleri için genel bucket oluştur
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('task-attachments', 'task-attachments', true);
exception when unique_violation then
  update storage.buckets set public = true where id = 'task-attachments';
end $$;

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  plan_name text not null,
  price numeric not null,
  currency text default 'TRY',
  renewal_date date,
  status text default 'aktif',
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table subscriptions enable row level security;
drop policy if exists "subscriptions_select" on subscriptions;
drop policy if exists "subscriptions_modify" on subscriptions;
create policy "subscriptions_select" on subscriptions for select using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);
create policy "subscriptions_modify" on subscriptions for all using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

insert into subscriptions (plan_name, price, currency, renewal_date, status, user_id)
values ('Piktram Büyüme', 8750, 'TRY', current_date + interval '30 day', 'aktif', '00000000-0000-0000-0000-000000000000')
on conflict do nothing;

create type if not exists file_category as enum ('invoice', 'contract', 'logo', 'post', 'reel', 'visual');

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bucket text not null,
  path text not null,
  url text,
  category file_category not null,
  description text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table files enable row level security;
drop policy if exists "files_select" on files;
drop policy if exists "files_modify" on files;
create policy "files_select" on files for select using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);
create policy "files_modify" on files for all using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

insert into files (name, bucket, path, url, category, description, user_id)
values
  ('2024-02 Faturası.pdf', 'brand-assets', 'faturalar/2024-02-faturasi.pdf', 'https://storage.googleapis.com/piktram-demo/faturalar/2024-02-faturasi.pdf', 'invoice', 'Şubat 2024 faturası', '00000000-0000-0000-0000-000000000000'),
  ('Hizmet Sozlesmesi.pdf', 'brand-assets', 'sozlesmeler/hizmet-sozlesmesi.pdf', 'https://storage.googleapis.com/piktram-demo/sozlesmeler/hizmet-sozlesmesi.pdf', 'contract', 'Güncel hizmet sözleşmesi', '00000000-0000-0000-0000-000000000000'),
  ('Piktram Logo.png', 'brand-assets', 'logolar/piktram-logo.png', 'https://storage.googleapis.com/piktram-demo/logolar/piktram-logo.png', 'logo', 'Marka logotype', '00000000-0000-0000-0000-000000000000'),
  ('Mart Kampanya Postu.png', 'brand-assets', 'postlar/mart-kampanya.png', 'https://storage.googleapis.com/piktram-demo/postlar/mart-kampanya.png', 'post', 'Sosyal medya şablonu', '00000000-0000-0000-0000-000000000000'),
  ('Reels Tanitim.mp4', 'brand-assets', 'reels/reels-tanitim.mp4', 'https://storage.googleapis.com/piktram-demo/reels/reels-tanitim.mp4', 'reel', 'Ürün tanıtım videosu', '00000000-0000-0000-0000-000000000000'),
  ('Stüdyo Çekimi.jpg', 'brand-assets', 'gorseller/studyo-cekimi.jpg', 'https://storage.googleapis.com/piktram-demo/gorseller/studyo-cekimi.jpg', 'visual', 'Ürün görseli', '00000000-0000-0000-0000-000000000000')
on conflict do nothing;

do $$
begin
  insert into storage.buckets (id, name, public)
  values ('brand-assets', 'brand-assets', true);
exception when unique_violation then
  update storage.buckets set public = true where id = 'brand-assets';
end $$;

create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  agenda text,
  preferred_date timestamp with time zone,
  meeting_url text,
  status text default 'beklemede',
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table meetings enable row level security;
drop policy if exists "meetings_select" on meetings;
drop policy if exists "meetings_modify" on meetings;
create policy "meetings_select" on meetings for select using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);
create policy "meetings_modify" on meetings for all using (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
) with check (
  user_id = auth.uid() or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

insert into meetings (title, agenda, preferred_date, status, user_id)
values
  ('Aylık Performans Değerlendirmesi', 'Şubat performansının üzerinden geçelim.', current_timestamp + interval '2 day', 'planlandi', '00000000-0000-0000-0000-000000000000'),
  ('İçerik Üretim Çalıştayı', 'Fin ekibinin sorularını toplayalım.', current_timestamp + interval '5 day', 'beklemede', '00000000-0000-0000-0000-000000000000')
on conflict do nothing;

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
drop policy if exists "notifications_select" on notifications;
drop policy if exists "notifications_modify" on notifications;
create policy "notifications_select" on notifications for select using (
  user_id = auth.uid()
);
create policy "notifications_modify" on notifications for update using (
  user_id = auth.uid()
) with check (
  user_id = auth.uid()
);
create policy "notifications_insert" on notifications for insert with check (
  auth.uid() = user_id or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);

insert into notifications (title, description, type, user_id)
values
  ('Hoş geldiniz!', 'Pano bildirimlerinizi buradan takip edebilirsiniz.', 'general', '00000000-0000-0000-0000-000000000000')
on conflict do nothing;
