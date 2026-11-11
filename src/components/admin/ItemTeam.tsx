import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { GhostButton, inputClass } from "./ui";

export interface TeamRow {
  key: string;
  name: string;
  role: string;
}

interface Props {
  team: TeamRow[];
  onChange: (v: TeamRow[]) => void;
}

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j] as T, next[i] as T];
  return next;
}

export function ItemTeam({ team, onChange }: Props) {
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold">צוות ({team.length})</h3>
        <GhostButton
          type="button"
          onClick={() => onChange([...team, { key: crypto.randomUUID(), name: "", role: "" }])}
        >
          <Plus className="size-4" /> הוספת איש צוות
        </GhostButton>
      </div>
      {team.length === 0 && (
        <p className="text-sm text-muted-foreground">
          אין אנשי צוות. הוסף שם ותפקיד (אופציונלי) לכל אחד.
        </p>
      )}
      <div className="space-y-2">
        {team.map((m, i) => (
          <div key={m.key} className="flex items-center gap-2 rounded-xl border bg-background p-3">
            <input
              className={inputClass}
              placeholder="שם"
              value={m.name}
              onChange={(e) =>
                onChange(team.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))
              }
            />
            <input
              className={inputClass}
              placeholder="תפקיד (אופציונלי)"
              value={m.role}
              onChange={(e) =>
                onChange(team.map((x, k) => (k === i ? { ...x, role: e.target.value } : x)))
              }
            />
            <button
              type="button"
              aria-label="הזזה למעלה"
              disabled={i === 0}
              onClick={() => onChange(move(team, i, -1))}
              className="rounded-lg border p-1.5 hover:bg-accent disabled:opacity-30"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              aria-label="הזזה למטה"
              disabled={i === team.length - 1}
              onClick={() => onChange(move(team, i, 1))}
              className="rounded-lg border p-1.5 hover:bg-accent disabled:opacity-30"
            >
              <ArrowDown className="size-4" />
            </button>
            <button
              type="button"
              aria-label="הסרה"
              onClick={() => onChange(team.filter((_, k) => k !== i))}
              className="rounded-lg border p-1.5 text-destructive hover:bg-accent"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
