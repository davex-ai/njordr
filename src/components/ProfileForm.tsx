"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Profile = {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
};

const FIELDS: { key: keyof Profile; label: string; autoComplete: string; type?: string }[] = [
  { key: "full_name", label: "Full name", autoComplete: "name" },
  { key: "phone", label: "Phone number", autoComplete: "tel", type: "tel" },
  { key: "address_line", label: "Street address", autoComplete: "street-address" },
  { key: "city", label: "City", autoComplete: "address-level2" },
  { key: "state", label: "State", autoComplete: "address-level1" },
  { key: "country", label: "Country", autoComplete: "country-name" },
];

export default function ProfileForm({ initial, email }: { initial: Profile; email: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  const [form, setForm] = useState<Profile>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save(e: React.SyntheticEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?next=/account");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, ...form, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    setBusy(false);
    if (error) setMessage(error.message);
    else if (next) router.push(next);
    else setMessage("Saved.");
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <p className="text-sm text-muted">Signed in as {email}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className={`space-y-1.5 text-sm ${f.key === "address_line" ? "sm:col-span-2" : ""}`}>
            <span className="text-muted">{f.label}</span>
            <input
              className="input"
              type={f.type ?? "text"}
              autoComplete={f.autoComplete}
              required={f.key !== "country"}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {message && (
        <p className="text-sm text-muted" role="status">
          {message}
        </p>
      )}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : next ? "Save and continue" : "Save address"}
      </button>
    </form>
  );
}
