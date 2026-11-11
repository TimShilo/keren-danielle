-- Which videos appear on the home page, and in what order.
-- Safe to run more than once. Can be pasted into the Supabase SQL Editor.
alter table public.content_videos add column if not exists show_on_home boolean not null default false;
alter table public.content_videos add column if not exists home_order int not null default 0;
create index if not exists content_videos_home_idx on public.content_videos (home_order) where show_on_home;

-- home-page videos are public regardless of the draft state of the page they were added to
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'content_videos' and policyname = 'public read home videos') then
    create policy "public read home videos" on public.content_videos for select using (show_on_home = true);
  end if;
end $$;

-- the 5 videos chosen on the new site (main-video), in the same order
update public.content_videos v set show_on_home = true, home_order = m.ord
  from (values ('C5d4qMVGsNc',1),('cKdQrdQAzkU',2),('qFMVieY63Uo',3),('PXUAj7OGjjM',4),('uG7bDeYAZfU',5)) as m(vid, ord)
 where v.url like '%v=' || m.vid;

select count(*) filter (where show_on_home) as home_videos from public.content_videos;
