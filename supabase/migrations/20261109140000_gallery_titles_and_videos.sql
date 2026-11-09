alter table public.content_media add column if not exists title text;
alter table public.content_media add column if not exists caption text;

create table if not exists public.content_videos (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  url text not null,
  title text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists content_videos_content_idx on public.content_videos (content_id, sort_order);
alter table public.content_videos enable row level security;

create policy "public read videos" on public.content_videos for select using (
  exists (select 1 from public.content_items c where c.id = content_id and c.status = 'published'));
create policy "staff all videos" on public.content_videos for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
