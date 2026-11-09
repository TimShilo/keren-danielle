-- regular (static) pages such as "השירים של דניאלי", with their own text, images and video gallery
alter type public.content_type add value if not exists 'page';
