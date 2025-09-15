# Piktram Dashboard

Piktram, ClickUp esintili modern bir proje ve görev yönetim platformudur. Bu depo, Next.js 14 (App Router), Tailwind CSS ve Supabase kullanılarak hazırlanmış üretime hazır SaaS tarzı MVP uygulamasını içerir.

## Özellikler

- 🔐 Supabase e-posta/parola kimlik doğrulaması
- 🧭 Yetkilendirilmiş dashboard, proje, görev, takvim ve ayarlar sayfaları
- 📊 Chart.js ile haftalık görev ve proje durumu grafikleri
- 🗂️ Supabase destekli proje kartları ve CRUD API uçları
- 🗃️ Sürükle-bırak görev panosu (Kanban) ve canlı durum güncellemesi
- 📅 Görev noktaları ve detay modalları ile aylık takvim görünümü
- ⚙️ Profil, bildirim ve tema tercihi yönetimi
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
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
create policy "Kullanıcı profili" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

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
create policy "Kullanıcı projeleri" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Görevler
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
create policy "Kullanıcı görevleri" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Örnek veriler
insert into profiles (id, full_name, email)
values
  ('00000000-0000-0000-0000-000000000000', 'Demo Kullanıcı', 'demo@piktram.com')
on conflict (id) do update set full_name = excluded.full_name;

insert into projects (id, title, description, progress, due_date, user_id)
values
  ('11111111-1111-1111-1111-111111111111', 'Yeni Lansman Hazırlığı', 'Ürün lansmanı için gerekli tüm aksiyonlar.', 65, current_date + interval '14 day', '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'Mobil Uygulama Güncellemesi', 'Yeni modül entegrasyonları ve test süreci.', 45, current_date + interval '30 day', '00000000-0000-0000-0000-000000000000');

insert into tasks (title, description, status, priority, due_date, project_id, user_id)
values
  ('Pazarlama stratejisi', 'Sosyal medya kampanyalarını planla.', 'in_progress', 'high', current_date + interval '2 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'),
  ('Tasarım onayı', 'Yeni ana sayfa tasarımını gözden geçir.', 'todo', 'medium', current_date + interval '1 day', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'),
  ('Test senaryoları', 'Mobil uygulama için hata testlerini tamamla.', 'done', 'high', current_date - interval '1 day', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000');
```

> Not: `auth.users` tablosuna manuel kullanıcı eklemek yerine Supabase panelinden yeni kullanıcı oluşturabilir veya uygulama içi kayıt formunu kullanabilirsiniz.

## Komutlar

- `npm run dev` – Geliştirme sunucusunu başlatır
- `npm run build` – Üretim derlemesi oluşturur
- `npm run start` – Üretim modunda başlatır
- `npm run lint` – Next.js ESLint denetimini çalıştırır

## Lisans

Bu proje Piktram için hazırlanmış örnek bir MVP uygulamasıdır.
