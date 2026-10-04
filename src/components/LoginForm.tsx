"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(params.get("error") ? "Sign-in failed. Please try again." : "");

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        router.push(next);
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) setMessage(error.message);
      else if (data.session) {
        router.push(next);
        router.refresh();
      } else setMessage("Check your inbox to confirm your email, then sign in.");
    }
    setBusy(false);
  }

  async function google() {
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setMessage(error.message);
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-muted">Sign in to save your cart and see your orders.</p>
      </div>

      <button type="button" onClick={google} className="btn w-full">
        Continue with Google
      </button>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" className="input" />
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-label="Password" className="input" />
        {message && <p className="text-sm text-muted" role="status">{message}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button className="text-accent underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </>
  );
}
