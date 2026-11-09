-- team members of a sub-activity page (only some activities have a team)
create table if not exists public.content_team (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  name text not null,
  role text,
  media_id uuid references public.media(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists content_team_content_idx on public.content_team (content_id, sort_order);
alter table public.content_team enable row level security;
create policy "public read team" on public.content_team for select using (
  exists (select 1 from public.content_items c where c.id = content_id and c.status = 'published'));
create policy "staff all team" on public.content_team for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- content kinds that belong to other pages of the new site
alter type public.content_type add value if not exists 'creation';
alter type public.content_type add value if not exists 'moment';
alter type public.content_type add value if not exists 'publication';
