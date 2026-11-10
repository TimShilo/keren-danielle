-- an item can be linked to several (secondary) activities in addition to its primary category
create table if not exists public.content_category_links (
  content_id uuid not null references public.content_items(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  source text not null default 'manual' check (source in ('manual','auto')),
  primary key (content_id, category_id)
);
create index if not exists content_category_links_cat_idx on public.content_category_links (category_id);
alter table public.content_category_links enable row level security;
create policy "public read category links" on public.content_category_links for select using (
  exists (select 1 from public.content_items c where c.id = content_id and c.status = 'published'));
create policy "staff all category links" on public.content_category_links for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
