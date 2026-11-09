import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Field, PageTitle, PrimaryButton, inputClass } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const { session } = useAuth();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pw.length < 8) {
      toast.error("הסיסמה צריכה להכיל לפחות 8 תווים");
      return;
    }
    if (pw !== pw2) {
      toast.error("הסיסמאות אינן זהות");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("הסיסמה הוחלפה");
    setPw("");
    setPw2("");
  }

  return (
    <div className="max-w-xl">
      <PageTitle>הגדרות</PageTitle>
      <div className="mb-6 rounded-2xl bg-card p-6 shadow-sm">
        <div className="text-sm text-muted-foreground">מחובר כ-</div>
        <div className="font-bold" dir="ltr">
          {session?.user.email}
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="text-lg font-extrabold">החלפת סיסמה</h2>
        <Field label="סיסמה חדשה">
          <input
            type="password"
            dir="ltr"
            className={inputClass}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </Field>
        <Field label="אימות סיסמה">
          <input
            type="password"
            dir="ltr"
            className={inputClass}
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />
        </Field>
        <PrimaryButton disabled={busy}>עדכון סיסמה</PrimaryButton>
      </form>
    </div>
  );
}
