import { supabase } from "@/integrations/supabase/client";

export interface MediaRow {
  id: string;
  storage_path: string;
  kind: string;
  alt_he?: string | null;
  created_at?: string;
}

export const mediaUrl = (path: string) =>
  supabase.storage.from("media").getPublicUrl(path).data.publicUrl;

/** Uploads files to the public `media` bucket and registers them in the `media` table. */
export async function uploadFiles(files: File[]): Promise<{ rows: MediaRow[]; errors: string[] }> {
  const now = new Date();
  const prefix = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rows: MediaRow[] = [];
  const errors: string[] = [];
  for (const f of files) {
    const safe = f.name.replace(/[^\w.-]+/g, "-");
    const path = `${prefix}/${Date.now()}-${safe}`;
    const up = await supabase.storage.from("media").upload(path, f, { contentType: f.type });
    if (up.error) {
      errors.push(`${f.name}: ${up.error.message}`);
      continue;
    }
    const kind = f.type.startsWith("image/")
      ? "image"
      : f.type === "application/pdf"
        ? "pdf"
        : f.type.startsWith("video/")
          ? "video"
          : "other";
    const ins = await supabase
      .from("media")
      .insert({ storage_path: path, kind })
      .select("id,storage_path,kind,created_at")
      .single();
    if (ins.error) errors.push(`${f.name}: ${ins.error.message}`);
    else rows.push(ins.data as MediaRow);
  }
  return { rows, errors };
}

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
}
