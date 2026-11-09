import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, Video } from "lucide-react";
import { mediaUrl, youtubeId, type MediaRow } from "@/lib/media";
import { GhostButton, inputClass } from "./ui";
import { MediaPicker } from "./MediaPicker";

export interface FeaturedRef {
  id: string;
  storage_path: string;
}
export interface GalleryRow {
  media_id: string;
  storage_path: string;
  title: string;
  caption: string;
}
export interface VideoRow {
  key: string;
  url: string;
  title: string;
}

interface Props {
  featured: FeaturedRef | null;
  gallery: GalleryRow[];
  videos: VideoRow[];
  onFeatured: (v: FeaturedRef | null) => void;
  onGallery: (v: GalleryRow[]) => void;
  onVideos: (v: VideoRow[]) => void;
}

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j] as T, next[i] as T];
  return next;
}

const Section = ({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <section className="space-y-3 rounded-2xl border bg-card p-4">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-base font-extrabold">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

export function ItemMedia({ featured, gallery, videos, onFeatured, onGallery, onVideos }: Props) {
  const [picker, setPicker] = useState<null | "featured" | "gallery">(null);

  const addToGallery = (rows: MediaRow[]) => {
    const have = new Set(gallery.map((g) => g.media_id));
    const add = rows
      .filter((r) => !have.has(r.id))
      .map((r) => ({ media_id: r.id, storage_path: r.storage_path, title: "", caption: "" }));
    onGallery([...gallery, ...add]);
  };

  return (
    <div className="space-y-4">
      {/* 1. featured image */}
      <Section title="תמונה ראשית">
        {featured ? (
          <div className="flex items-center gap-4">
            <img
              src={mediaUrl(featured.storage_path)}
              alt=""
              className="h-28 w-40 rounded-xl object-cover"
            />
            <div className="flex gap-2">
              <GhostButton type="button" onClick={() => setPicker("featured")}>
                החלפה
              </GhostButton>
              <GhostButton
                type="button"
                className="text-destructive"
                onClick={() => onFeatured(null)}
              >
                הסרה
              </GhostButton>
            </div>
          </div>
        ) : (
          <GhostButton type="button" onClick={() => setPicker("featured")}>
            <ImagePlus className="size-4" /> בחירת תמונה ראשית
          </GhostButton>
        )}
      </Section>

      {/* 2. image gallery (unlimited, each with a title and text) */}
      <Section
        title={`גלריית תמונות (${gallery.length})`}
        action={
          <GhostButton type="button" onClick={() => setPicker("gallery")}>
            <Plus className="size-4" /> הוספת תמונות
          </GhostButton>
        }
      >
        {gallery.length === 0 && (
          <p className="text-sm text-muted-foreground">
            אין תמונות בגלריה. אפשר להוסיף כמה שרוצים.
          </p>
        )}
        <div className="space-y-3">
          {gallery.map((g, i) => (
            <div key={g.media_id} className="flex gap-3 rounded-xl border bg-background p-3">
              <img
                src={mediaUrl(g.storage_path)}
                alt=""
                className="size-24 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  className={inputClass}
                  placeholder="כותרת התמונה"
                  value={g.title}
                  onChange={(e) =>
                    onGallery(
                      gallery.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)),
                    )
                  }
                />
                <textarea
                  rows={2}
                  className={inputClass}
                  placeholder="טקסט / תיאור התמונה"
                  value={g.caption}
                  onChange={(e) =>
                    onGallery(
                      gallery.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)),
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  aria-label="הזזה למעלה"
                  disabled={i === 0}
                  onClick={() => onGallery(move(gallery, i, -1))}
                  className="rounded-lg border p-1.5 hover:bg-accent disabled:opacity-30"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="הזזה למטה"
                  disabled={i === gallery.length - 1}
                  onClick={() => onGallery(move(gallery, i, 1))}
                  className="rounded-lg border p-1.5 hover:bg-accent disabled:opacity-30"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="הסרה"
                  onClick={() => onGallery(gallery.filter((_, k) => k !== i))}
                  className="rounded-lg border p-1.5 text-destructive hover:bg-accent"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. video gallery (each with a title) */}
      <Section
        title={`גלריית וידאו (${videos.length})`}
        action={
          <GhostButton
            type="button"
            onClick={() => onVideos([...videos, { key: crypto.randomUUID(), url: "", title: "" }])}
          >
            <Video className="size-4" /> הוספת סרטון
          </GhostButton>
        }
      >
        {videos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            אין סרטונים. הדבק קישור YouTube וכותרת לכל סרטון.
          </p>
        )}
        <div className="space-y-3">
          {videos.map((v, i) => {
            const yt = youtubeId(v.url);
            return (
              <div key={v.key} className="flex gap-3 rounded-xl border bg-background p-3">
                {yt ? (
                  <img
                    src={`https://img.youtube.com/vi/${yt}/mqdefault.jpg`}
                    alt=""
                    className="h-20 w-32 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-32 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <Video className="size-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    className={inputClass}
                    placeholder="כותרת הסרטון"
                    value={v.title}
                    onChange={(e) =>
                      onVideos(
                        videos.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)),
                      )
                    }
                  />
                  <input
                    dir="ltr"
                    className={inputClass}
                    placeholder="https://www.youtube.com/watch?v=…"
                    value={v.url}
                    onChange={(e) =>
                      onVideos(videos.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    aria-label="הזזה למעלה"
                    disabled={i === 0}
                    onClick={() => onVideos(move(videos, i, -1))}
                    className="rounded-lg border p-1.5 hover:bg-accent disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="הזזה למטה"
                    disabled={i === videos.length - 1}
                    onClick={() => onVideos(move(videos, i, 1))}
                    className="rounded-lg border p-1.5 hover:bg-accent disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="הסרה"
                    onClick={() => onVideos(videos.filter((_, k) => k !== i))}
                    className="rounded-lg border p-1.5 text-destructive hover:bg-accent"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {picker && (
        <MediaPicker
          multiple={picker === "gallery"}
          onClose={() => setPicker(null)}
          onPick={(rows) => {
            if (picker === "featured") {
              const r = rows[0];
              if (r) onFeatured({ id: r.id, storage_path: r.storage_path });
            } else addToGallery(rows);
          }}
        />
      )}
    </div>
  );
}
