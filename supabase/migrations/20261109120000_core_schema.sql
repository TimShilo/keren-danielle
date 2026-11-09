-- Keren Danielle: core content schema + admin roles + storage
-- Review before applying. Nothing here deletes data.

-- ───────── Roles & profiles ─────────
create type public.app_role as enum ('admin', 'editor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id,'admin') or public.has_role(_user_id,'editor')
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────── Categories (hierarchy: top -> sub) ─────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  slug text not null,
  name_he text not null,
  name_en text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (slug)
);
alter table public.categories enable row level security;

-- ───────── Media library ─────────
create table public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,          -- path inside the 'media' bucket (mirrors wp uploads year/month/file)
  kind text not null default 'image' check (kind in ('image','pdf','video','audio','other')),
  alt_he text,
  alt_en text,
  width int, height int,
  old_url text,                               -- original URL on kerendanielle.org
  created_at timestamptz not null default now()
);
alter table public.media enable row level security;

-- ───────── Content (one table; type-specific fields live in `data`) ─────────
create type public.content_type as enum
  ('activity','news','event','book','press_article','friend_story','sentence','video');
create type public.content_status as enum ('draft','published');

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  type public.content_type not null,
  language text not null default 'he' check (language in ('he','en')),
  translation_group uuid not null default gen_random_uuid(),  -- links he/en versions
  title text not null,
  slug text,
  excerpt text,
  body_html text,
  item_date date,
  category_id uuid references public.categories(id) on delete set null,
  parent_id uuid references public.content_items(id) on delete set null,  -- news -> activity, sub-activity -> activity
  status public.content_status not null default 'draft',
  featured_media_id uuid references public.media(id) on delete set null,
  external_url text,
  data jsonb not null default '{}'::jsonb,   -- type-specific: sections/colors, book_url, source, newspaper, video urls...
  sort_order int not null default 0,
  old_id bigint, old_url text, old_type text,  -- migration traceability + 301 redirects
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, language, slug)
);
create index content_items_type_idx     on public.content_items (type, language, status);
create index content_items_category_idx on public.content_items (category_id);
create index content_items_date_idx     on public.content_items (item_date desc);
create index content_items_parent_idx   on public.content_items (parent_id);
alter table public.content_items enable row level security;

create table public.content_media (
  content_id uuid not null references public.content_items(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  role text not null default 'gallery' check (role in ('gallery','inline','page_scan','side','background')),
  sort_order int not null default 0,
  primary key (content_id, media_id, role)
);
alter table public.content_media enable row level security;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;
create trigger content_items_touch before update on public.content_items
  for each row execute function public.touch_updated_at();

-- ───────── RLS ─────────
-- public read of published content / taxonomy / media
create policy "public read categories"    on public.categories    for select using (true);
create policy "public read media"         on public.media         for select using (true);
create policy "public read published"     on public.content_items for select using (status = 'published');
create policy "public read content_media" on public.content_media for select using (
  exists (select 1 from public.content_items c where c.id = content_id and c.status = 'published'));
-- staff manage everything
create policy "staff all categories"    on public.categories    for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "staff all media"         on public.media         for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "staff all content"       on public.content_items for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "staff all content_media" on public.content_media for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
-- users / roles
create policy "own profile read"     on public.profiles   for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update"   on public.profiles   for update to authenticated using (id = auth.uid());
create policy "own roles read"       on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles"   on public.user_roles for all    to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ───────── Storage bucket for media ─────────
insert into storage.buckets (id, name, public) values ('media','media',true) on conflict (id) do nothing;
create policy "public read media bucket" on storage.objects for select using (bucket_id = 'media');
create policy "staff write media bucket" on storage.objects for all to authenticated
  using (bucket_id = 'media' and public.is_staff(auth.uid()))
  with check (bucket_id = 'media' and public.is_staff(auth.uid()));
