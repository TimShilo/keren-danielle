import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, PrimaryButton, inputClass } from "@/components/admin/ui";
import { MediaThumb } from "@/components/admin/MediaThumb";

export const Route = createFileRoute("/admin/media")({ component: MediaPage });

interface MediaRow {
  id: string;
  storage_path: string;
  kind: string;
  alt_he: string | null;
  created_at: string;
}

const publicUrl = (path: string) =>
  supabase.storage.from("media").getPublicUrl(path).data.publicUrl;

function MediaPage() {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE = 48;

  const media = useQuery({
    queryKey: ["media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select("id,storage_path,kind,alt_he,created_at")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data as MediaRow[];
    },
  });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const stamp = new Date();
    const prefix = `${stamp.getFullYear()}/${String(stamp.getMonth() + 1).padStart(2, "0")}`;
    for (const f of Array.from(files)) {
      const safe = f.name.replace(/[^\w.-]+/g, "-");
      const path = `${prefix}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, f, { contentType: f.type });
      if (error) {
        toast.error(`${f.name}: ${error.message}`);
        continue;
      }
      const kind = f.type.startsWith("image/")
        ? "image"
        : f.type === "application/pdf"
          ? "pdf"
          : f.type.startsWith("video/")
            ? "video"
            : "other";
      const { error: e2 } = await supabase.from("media").insert({ storage_path: path, kind });
      if (e2) toast.error(e2.message);
    }
    setBusy(false);
    if (input.current) input.current.value = "";
    qc.invalidateQueries({ queryKey: ["media"] });
    qc.invalidateQueries({ queryKey: ["media-count"] });
    toast.success("הועלה");
  }

  const all = (media.data ?? []).filter((m) => !search || m.storage_path.includes(search));
  const pages = Math.max(1, Math.ceil(all.length / PAGE));
  const rows = all.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <div>
      <PageTitle
        actions={
          <PrimaryButton onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}{" "}
            העלאת קבצים
          </PrimaryButton>
        }
      >
        מדיה
      </PageTitle>
      <input ref={input} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
      <div className="mb-4 flex items-center gap-3">
        <input
          className={`${inputClass} max-w-sm`}
          placeholder="חיפוש לפי שם קובץ"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <span className="text-sm text-muted-foreground">{all.length} קבצים</span>
      </div>
      {media.isLoading ? (
        <div className="text-muted-foreground">טוען…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground">
          אין קבצי מדיה עדיין
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
          {rows.map((m) => (
            <a
              key={m.id}
              href={publicUrl(m.storage_path)}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden rounded-xl border bg-card"
            >
              {m.kind === "image" ? (
                <MediaThumb
                  src={publicUrl(m.storage_path)}
                  alt={m.alt_he ?? ""}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="grid aspect-square place-items-center bg-muted text-sm font-bold uppercase text-muted-foreground">
                  {m.kind}
                </div>
              )}
              <div className="truncate px-2 py-1.5 text-xs text-muted-foreground" dir="ltr">
                {m.storage_path.split("/").pop()}
              </div>
            </a>
          ))}
        </div>
      )}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border bg-card px-4 py-2 font-medium hover:bg-accent disabled:opacity-40"
          >
            הקודם
          </button>
          <span className="tabular-nums text-muted-foreground">
            עמוד {page + 1} מתוך {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border bg-card px-4 py-2 font-medium hover:bg-accent disabled:opacity-40"
          >
            הבא
          </button>
        </div>
      )}
    </div>
  );
}
