-- Main (parent) activities are the top-level categories; give them their own content.
alter table public.categories add column if not exists description_html text;
alter table public.categories add column if not exists featured_media_id uuid references public.media(id) on delete set null;
alter table public.categories add column if not exists data jsonb not null default '{}'::jsonb;
create index if not exists categories_parent_sort_idx on public.categories (parent_id, sort_order);
