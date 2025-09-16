# Piktram Dashboard

Piktram, ClickUp esintili modern bir proje ve görev yönetim platformudur. Bu depo, Next.js 14 (App Router), Tailwind CSS ve Supabase kullanılarak hazırlanmış üretime hazır SaaS tarzı MVP uygulamasını içerir.

## Özellikler

- 🔐 Supabase e-posta/parola kimlik doğrulaması
- 🧭 Yetkilendirilmiş dashboard, proje, görev, takvim ve ayarlar sayfaları
- 📊 Chart.js ile haftalık görev ve proje durumu grafikleri
- 🗂️ Supabase destekli proje kartları ve CRUD API uçları
<<<<<<< HEAD
- 🗃️ Animasyonlu sürükle-bırak görev panosu (Kanban) ve canlı durum güncellemesi
- 📅 Görev noktaları ve detay modalları ile aylık takvim görünümü
- ⚙️ Profil, bildirim ve tema tercihi yönetimi
- 📎 Görev dosya ekleri (Supabase Storage) ve inline başlık düzenleme
- 🛡️ Yönetici paneli ile kullanıcı/proje/görev istatistikleri ve sayfalama
=======
- 🗃️ Sürükle-bırak görev panosu (Kanban) ve canlı durum güncellemesi
- 📅 Görev noktaları ve detay modalları ile aylık takvim görünümü
- ⚙️ Profil, bildirim ve tema tercihi yönetimi
>>>>>>> codex-restore-ux
- 🌗 Açık/Koyu tema desteği, Inter yazı tipleri ve Piktram renk paleti

## Başlangıç

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. `.env.example` dosyasını `.env.local` olarak kopyalayın ve Supabase bilgilerinizi ekleyin:

```bash
cp .env.example .env.local
```

3. Geliştirme sunucusunu çalıştırın:

```bash
npm run dev
```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## Supabase Yapılandırması

Aşağıdaki SQL betiğini Supabase projenizde çalıştırarak tabloları ve örnek verileri oluşturabilirsiniz.

```sql
-- Profiller
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  theme text default 'light',
  email_notifications boolean default true,
  push_notifications boolean default false,
  weekly_summary boolean default true,
<<<<<<< HEAD
  role text default 'user',
=======
>>>>>>> codex-restore-ux
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
<<<<<<< HEAD
drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_modify" on profiles;
create policy "profiles_select" on profiles for select using (
  auth.uid() = id or exists(select 1 from profiles as p where p.id = auth.uid() and p.role = 'admin')
);
create policy "profiles_modify" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
=======
create policy "Kullanıcı profili" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
>>>>>>> codex-restore-ux

-- Projeler
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
<<<<<<< HEAD
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
=======
create policy "Kullanıcı projeleri" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
>>>>>>> codex-restore-ux

-- Görevler
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
<<<<<<< HEAD
  status text default 'yapiliyor',
=======
  status text default 'todo',
>>>>>>> codex-restore-ux
  priority text default 'medium',
  due_date date,
  project_id uuid references projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
<<<<<<< HEAD
  attachment_url text,
=======
>>>>>>> codex-restore-ux
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table tasks enable row level security;
<<<<<<< HEAD
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

-- Örnek veriler
insert into profiles (id, full_name, email, role)
values
  ('00000000-0000-0000-0000-000000000000', 'Demo Kullanıcı', 'demo@piktram.com', 'admin')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;
=======
create policy "Kullanıcı görevleri" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Örnek veriler
insert into profiles (id, full_name, email)
values
  ('00000000-0000-0000-0000-000000000000', 'Demo Kullanıcı', 'demo@piktram.com')
on conflict (id) do update set full_name = excluded.full_name;
>>>>>>> codex-restore-ux

insert into projects (id, title, description, progress, due_date, user_id)
values
  ('11111111-1111-1111-1111-111111111111', 'Yeni Lansman Hazırlığı', 'Ürün lansmanı için gerekli tüm aksiyonlar.', 65, current_date + interval '14 day', '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'Mobil Uygulama Güncellemesi', 'Yeni modül entegrasyonları ve test süreci.', 45, current_date + interval '30 day', '00000000-0000-0000-0000-000000000000');

<<<<<<< HEAD
insert into tasks (title, description, status, priority, due_date, project_id, user_id, attachment_url)
values
  ('Pazarlama stratejisi', 'Sosyal medya kampanyalarını planla.', 'onay_surecinde', 'high', current_date + interval '2 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', null),
  ('Tasarım onayı', 'Yeni ana sayfa tasarımını gözden geçir.', 'yapiliyor', 'medium', current_date + interval '1 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'https://storage.googleapis.com/piktram-demo/brifing.pdf'),
  ('Test senaryoları', 'Mobil uygulama için hata testlerini tamamla.', 'onaylandi', 'high', current_date - interval '1 day', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', null);

-- Görev ekleri için genel bucket
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('task-attachments', 'task-attachments', true);
exception when unique_violation then
  update storage.buckets set public = true where id = 'task-attachments';
end $$;
=======
insert into tasks (title, description, status, priority, due_date, project_id, user_id)
values
  ('Pazarlama stratejisi', 'Sosyal medya kampanyalarını planla.', 'in_progress', 'high', current_date + interval '2 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'),
  ('Tasarım onayı', 'Yeni ana sayfa tasarımını gözden geçir.', 'todo', 'medium', current_date + interval '1 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'),
  ('Test senaryoları', 'Mobil uygulama için hata testlerini tamamla.', 'done', 'high', current_date - interval '1 day', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000');
>>>>>>> codex-restore-ux
```

> Not: `auth.users` tablosuna manuel kullanıcı eklemek yerine Supabase panelinden yeni kullanıcı oluşturabilir veya uygulama içi kayıt formunu kullanabilirsiniz.

## Komutlar

- `npm run dev` – Geliştirme sunucusunu başlatır
- `npm run build` – Üretim derlemesi oluşturur
- `npm run start` – Üretim modunda başlatır
- `npm run lint` – Next.js ESLint denetimini çalıştırır

## Lisans

Bu proje Piktram için hazırlanmış örnek bir MVP uygulamasıdır.
