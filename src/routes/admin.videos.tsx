import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { youtubeId } from "@/lib/media";
import { GhostButton, PageTitle, inputClass } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/videos")({ component: VideoLibrary });

interface VideoRowData {
  id: string;
  url: string;
  title: string | null;
  sort_order: number;
  content_id: string;
  content_items: { title: string; type: string } | null;
}

function VideoLibrary() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [pageFilter, setPageFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dest, setDest] = useState("");

  const videos = useQuery({
    queryKey: ["video-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_videos")
        .select("id,url,title,sort_order,content_id,content_items(title,type)")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as unknown as VideoRowData[];
    },
  });
  const destinations = useQuery({
    queryKey: ["move-destinations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("content_items")
        .select("id,title,type")
        .in("type", ["activity", "page"])
        .eq("language", "he")
        .order("title");
      return (data ?? []) as { id: string; title: string; type: string }[];
    },
  });

  const rows = useMemo(() => {
    let r = videos.data ?? [];
    const q = search.trim();
    if (q) r = r.filter((v) => (v.title ?? "").includes(q) || v.url.includes(q));
    if (pageFilter) r = r.filter((v) => v.content_id === pageFilter);
    return r;
  }, [videos.data, search, pageFilter]);
  const visibleSelected = rows.filter((r) => selected.has(r.id)).map((r) => r.id);

  const pagesWithVideos = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of videos.data ?? []) m.set(v.content_id, v.content_items?.title ?? "—");
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1], "he"));
  }, [videos.data]);

  const move = useMutation({
    mutationFn: async ({ ids, to }: { ids: string[]; to: string }) => {
      const { error } = await supabase
        .from("content_videos")
        .update({ content_id: to })
        .in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (n) => {
      toast.success(`הועברו ${n} סרטונים`);
      setSelected(new Set());
      setDest("");
      qc.invalidateQueries({ queryKey: ["video-library"] });
      qc.invalidateQueries({ queryKey: ["item-media"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rename = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("content_videos")
        .update({ title: title.trim() || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["video-library"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageTitle>גלריות וידאו</PageTitle>
      <div className="mb-6 rounded-2xl bg-secondary px-5 py-4 text-sm">
        כל סרטוני היוטיוב שמופיעים בגלריות של העמודים. אפשר לערוך כותרת, ולהעביר סרטון (או כמה
        סרטונים מסומנים) לעמוד אחר.
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי כותרת או קישור"
            className={`${inputClass} ps-9`}
          />
        </div>
        <select
          value={pageFilter}
          onChange={(e) => setPageFilter(e.target.value)}
          className={`${inputClass} !w-auto`}
        >
          <option value="">כל העמודים</option>
          {pagesWithVideos.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">{rows.length} סרטונים</span>
      </div>

      {visibleSelected.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-sidebar px-4 py-3 text-sidebar-foreground">
          <span className="font-bold">{visibleSelected.length} נבחרו</span>
          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className={`${inputClass} !w-auto !py-1.5 text-foreground`}
          >
            <option value="">העברה לעמוד…</option>
            {(destinations.data ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
          <GhostButton
            className="!py-1.5 !text-foreground"
            disabled={!dest || move.isPending}
            onClick={() =>
              window.confirm(`להעביר ${visibleSelected.length} סרטונים לעמוד שנבחר?`) &&
              move.mutate({ ids: visibleSelected, to: dest })
            }
          >
            העבר
          </GhostButton>
          <button className="ms-auto text-sm underline" onClick={() => setSelected(new Set())}>
            ביטול בחירה
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="בחר הכול"
                  checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())
                  }
                />
              </th>
              <th className="w-28 px-2 py-3" />
              <th className="px-4 py-3 text-start font-semibold">כותרת</th>
              <th className="px-4 py-3 text-start font-semibold">עמוד</th>
              <th className="px-4 py-3 text-start font-semibold">העברה</th>
            </tr>
          </thead>
          <tbody>
            {videos.isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  טוען…
                </td>
              </tr>
            )}
            {rows.map((v) => {
              const yt = youtubeId(v.url);
              return (
                <tr key={v.id} className="border-t align-middle hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="בחר סרטון"
                      checked={selected.has(v.id)}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(v.id);
                        else next.delete(v.id);
                        setSelected(next);
                      }}
                    />
                  </td>
                  <td className="px-2 py-2">
                    {yt ? (
                      <a href={v.url} target="_blank" rel="noreferrer">
                        <img
                          src={`https://img.youtube.com/vi/${yt}/default.jpg`}
                          alt=""
                          className="h-14 w-24 rounded-lg object-cover"
                        />
                      </a>
                    ) : (
                      <div className="grid h-14 w-24 place-items-center rounded-lg bg-muted">
                        <VideoIcon className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={v.title ?? ""}
                      placeholder="ללא כותרת"
                      onBlur={(e) => {
                        if (e.target.value !== (v.title ?? ""))
                          rename.mutate({ id: v.id, title: e.target.value });
                      }}
                      className={`${inputClass} !py-1.5`}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {v.content_items?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label="העבר לעמוד"
                      value=""
                      onChange={(e) => {
                        const to = e.target.value;
                        const d = (destinations.data ?? []).find((x) => x.id === to);
                        if (d && window.confirm(`להעביר את הסרטון לעמוד "${d.title}"?`))
                          move.mutate({ ids: [v.id], to });
                      }}
                      className="max-w-44 rounded-lg border bg-card px-2 py-1.5 text-xs"
                    >
                      <option value="">העבר לעמוד…</option>
                      {(destinations.data ?? [])
                        .filter((d) => d.id !== v.content_id)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
