"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const KEY = "njordr-install-dismissed";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export default function InstallBanner() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [visible, setVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let snoozed = false;
    try {
      snoozed = Date.now() - Number(localStorage.getItem(KEY) ?? 0) < SNOOZE_MS;
    } catch {}
    if (standalone || snoozed) return;

    // Chrome, Edge and Android browsers fire this when the app can be installed.
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari has no install prompt, so we show manual steps instead.
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const frame = isIos
      ? requestAnimationFrame(() => {
          setIos(true);
          setVisible(true);
        })
      : 0;

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      cancelAnimationFrame(frame);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {}
  }

  async function install() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setVisible(false);
    } else if (ios) {
      setIosHelp((v) => !v);
    }
  }

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="fade-up pointer-events-auto w-full max-w-xl rounded-2xl border border-white/10 bg-[#161a1f] p-3 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Njörðr App</p>
            <p className="text-xs text-white/70">Install for instant access, smooth navigation &amp; quick checkout</p>
          </div>
          <button onClick={install} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#161a1f] hover:opacity-90">
            Install
          </button>
          <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
            ✕
          </button>
        </div>
        {iosHelp && (
          <p className="mt-3 rounded-xl bg-white/10 p-3 text-xs text-white/80">
            Tap the Share button in Safari, then choose <strong>Add to Home Screen</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
