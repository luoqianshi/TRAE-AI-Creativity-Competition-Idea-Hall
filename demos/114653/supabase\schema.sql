create extension if not exists "pgcrypto";

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  name text not null,
  category text not null,
  amount text,
  expires_at date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists medicines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  name text not null,
  stock integer not null default 0 check (stock >= 0),
  dosage text,
  next_dose_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  name text not null,
  category text not null,
  location text,
  is_essential boolean not null default false,
  is_checked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  title text not null default '家庭购物清单',
  items jsonb not null default '[]'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table user_profiles enable row level security;
alter table ingredients enable row level security;
alter table medicines enable row level security;
alter table checklist_items enable row level security;
alter table shopping_lists enable row level security;

create policy "users manage own profile" on user_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "users manage own ingredients" on ingredients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own medicines" on medicines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own checklist" on checklist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own shopping lists" on shopping_lists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
