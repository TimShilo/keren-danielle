import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl, uploadFiles, type MediaRow } from "@/lib/media";
import { PrimaryButton, inputClass } from "./ui";

interface Props {
  multiple?: boolean;
  onClose: () => void;
  onPick: (rows: MediaRow[]) => void;
}

export function MediaPicker({ multiple, onClose, onPick }: Props) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [chosen, setChosen] = useState<MediaRow[]>([]);
  const [busy, setBusy] = useState(false);

  const media = useQuery({
    queryKey: ["media-picker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select("id,storage_path,kind,created_at")
        .eq("kind", "image")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as MediaRow[];
    },
  });

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const { rows, errors } = await uploadFiles(Array.from(files));
    setBusy(false);
    errors.forEach((e) => toast.error(e));
    if (rows.length) {
      qc.invalidateQueries({ queryKey: ["media-picker"] });
      qc.invalidateQueries({ queryKey: ["media"] });
      qc.invalidateQueries({ queryKey: ["media-count"] });
      setChosen((c) => (multiple ? [...c, ...rows] : rows.slice(0, 1)));
    }
  }

  const list = (media.data ?? []).filter((m) => !search || m.storage_path.includes(search));
  const isChosen = (m: MediaRow) => chosen.some((c) => c.id === m.id);
  const toggle = (m: MediaRow) => {
    if (!multiple) return setChosen([m]);
    setChosen((c) => (c.some((x) => x.id === m.id) ? c.filter((x) => x.id !== m.id) : [...c, m]));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="admin-theme max-h-[90vh] max-w-4xl overflow-hidden bg-background"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">בחירת תמונה מהספרייה</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <input
            className={`${inputClass} max-w-xs`}
            placeholder="חיפוש לפי שם קובץ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => onUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}{" "}
            העלאת תמונות חדשות
          </button>
          <span className="ms-auto text-sm text-muted-foreground">{list.length} תמונות</span>
        </div>
        <div className="grid max-h-[55vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4 md:grid-cols-6">
          {media.isLoading && <div className="col-span-full text-muted-foreground">טוען…</div>}
          {list.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => toggle(m)}
              className={`relative overflow-hidden rounded-lg border-2 ${isChosen(m) ? "border-primary" : "border-transparent"}`}
            >
              <img
                src={mediaUrl(m.storage_path)}
                alt=""
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              {isChosen(m) && (
                <span className="absolute end-1 top-1 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" />
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{chosen.length} נבחרו</span>
          <PrimaryButton
            type="button"
            disabled={!chosen.length}
            onClick={() => {
              onPick(chosen);
              onClose();
            }}
          >
            {multiple ? "הוספה לגלריה" : "בחירה"}
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
