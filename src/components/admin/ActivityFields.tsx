import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl, type MediaRow } from "@/lib/media";
import { Field, GhostButton, inputClass } from "./ui";
import { MediaPicker } from "./MediaPicker";

type Data = Record<string, unknown>;
interface Props {
  data: Data;
  onChange: (next: Data) => void;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const isOn = (layout: Data, key: string) => layout[key] === "true" || layout[key] === true;

function Switch({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3">
      <input
        type="checkbox"
        className="mt-1 size-4"
        checked={on}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-bold">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

function ImageField({
  label,
  mediaId,
  onPick,
}: {
  label: string;
  mediaId: string;
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const img = useQuery({
    queryKey: ["media-by-id", mediaId],
    enabled: !!mediaId,
    queryFn: async () => {
      const { data } = await supabase
        .from("media")
        .select("storage_path")
        .eq("id", mediaId)
        .single();
      return data?.storage_path as string | undefined;
    },
  });
  return (
    <div className="space-y-2 rounded-xl border bg-background p-3">
      <div className="text-sm font-bold">{label}</div>
      {mediaId && img.data ? (
        <img src={mediaUrl(img.data)} alt="" className="h-24 w-full rounded-lg object-cover" />
      ) : (
        <div className="grid h-24 place-items-center rounded-lg bg-muted text-xs text-muted-foreground">
          אין תמונה
        </div>
      )}
      <div className="flex gap-2">
        <GhostButton type="button" className="!px-3 !py-1.5" onClick={() => setOpen(true)}>
          <ImagePlus className="size-4" /> {mediaId ? "החלפה" : "בחירה"}
        </GhostButton>
        {mediaId && (
          <GhostButton
            type="button"
            className="!px-3 !py-1.5 text-destructive"
            onClick={() => onPick("")}
          >
            הסרה
          </GhostButton>
        )}
      </div>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={(rows: MediaRow[]) => rows[0] && onPick(rows[0].id)}
        />
      )}
    </div>
  );
}

export function ActivityFields({ data, onChange }: Props) {
  const layout = (data["layout"] as Data | undefined) ?? {};
  const set = (patch: Data) => onChange({ ...data, ...patch });
  const setSwitch = (key: string, v: boolean) =>
    set({ layout: { ...layout, [key]: v ? "true" : "false" } });
  const more = isOn(layout, "more_switcher");

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <h3 className="text-base font-extrabold">מבנה עמוד הפעילות</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="כותרת האזור הראשון">
          <input
            className={inputClass}
            value={str(data["section_title"])}
            onChange={(e) => set({ section_title: e.target.value })}
          />
        </Field>
        <Field label="כותרת בכתב יד">
          <input
            className={inputClass}
            value={str(data["handwriting_title"])}
            onChange={(e) => set({ handwriting_title: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ImageField
          label="תמונת כותרת (Hero)"
          mediaId={str(data["header_media_id"])}
          onPick={(id) => set({ header_media_id: id || null })}
        />
        <ImageField
          label="תמונה לצד הכותרות"
          mediaId={str(data["side_media_id"])}
          onPick={(id) => set({ side_media_id: id || null })}
        />
        <ImageField
          label="תמונת רקע לאזור החדשות"
          mediaId={str(data["background_media_id"])}
          onPick={(id) => set({ background_media_id: id || null })}
        />
      </div>

      <div>
        <div className="mb-2 text-sm font-bold">אזורים שיופיעו בעמוד זה</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Switch
            label="אזור המשך (טקסט נוסף)"
            hint="כותרת, כתב יד ותוכן נוספים מתחת לפתיחה"
            on={more}
            onToggle={(v) => setSwitch("more_switcher", v)}
          />
          <Switch label="צוות" on={isOn(layout, "team")} onToggle={(v) => setSwitch("team", v)} />
          <Switch
            label="גלריית תמונות"
            on={isOn(layout, "gallery_switcher")}
            onToggle={(v) => setSwitch("gallery_switcher", v)}
          />
          <Switch
            label="גלריית וידאו"
            on={isOn(layout, "video_switcher")}
            onToggle={(v) => setSwitch("video_switcher", v)}
          />
          <Switch
            label="כתבות (חדשות ועדכונים)"
            hint="מציג את הכתבות המשויכות לפעילות"
            on={isOn(layout, "posts_switcher")}
            onToggle={(v) => setSwitch("posts_switcher", v)}
          />
        </div>
      </div>

      {more && (
        <div className="space-y-4 rounded-xl border border-dashed p-3">
          <div className="text-sm font-bold">אזור ההמשך</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="כותרת אזור המשך">
              <input
                className={inputClass}
                value={str(data["section_title_more"])}
                onChange={(e) => set({ section_title_more: e.target.value })}
              />
            </Field>
            <Field label="כותרת כתב יד (המשך)">
              <input
                className={inputClass}
                value={str(data["handwriting_title_more"])}
                onChange={(e) => set({ handwriting_title_more: e.target.value })}
              />
            </Field>
          </div>
          <Field label="תוכן ההמשך (HTML)">
            <textarea
              rows={6}
              className={`${inputClass} font-mono`}
              value={str(data["intro_more_html"])}
              onChange={(e) => set({ intro_more_html: e.target.value })}
            />
          </Field>
        </div>
      )}
    </section>
  );
}
