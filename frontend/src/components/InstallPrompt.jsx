import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SEEN_FIRST_ANALYSIS = "tahalilek.first_analysis_done";
const DISMISSED_KEY = "tahalilek.install_prompt_dismissed_at";
const INSTALLED_KEY = "tahalilek.app_installed";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const isStandalone = () => (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || (typeof navigator !== "undefined" && navigator.standalone === true);

export default function InstallPrompt({ T }) {
  const C = (T && T.install) || {};
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [hasFirstAnalysis, setHasFirstAnalysis] = useState(false);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try { if (localStorage.getItem(INSTALLED_KEY) === "1") return; } catch (e) {}
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    const onInstalled = () => { try { localStorage.setItem(INSTALLED_KEY, "1"); } catch (e) {} setDeferredPrompt(null); setVisible(false); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", handler); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  useEffect(() => {
    try { if (localStorage.getItem(SEEN_FIRST_ANALYSIS) === "1") setHasFirstAnalysis(true); } catch (e) {}
    const onSuccess = () => { try { localStorage.setItem(SEEN_FIRST_ANALYSIS, "1"); } catch (e) {} setHasFirstAnalysis(true); };
    window.addEventListener("lab:analysis:success", onSuccess);
    return () => window.removeEventListener("lab:analysis:success", onSuccess);
  }, []);

  useEffect(() => {
    if (!hasFirstAnalysis || !deferredPrompt) return;
    let dismissedAt = 0;
    try { dismissedAt = parseInt(localStorage.getItem(DISMISSED_KEY) || "0", 10) || 0; } catch (e) {}
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [hasFirstAnalysis, deferredPrompt]);

  const dismiss = useCallback(() => { try { localStorage.setItem(DISMISSED_KEY, String(Date.now())); } catch (e) {} setVisible(false); }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === "accepted") { try { localStorage.setItem(INSTALLED_KEY, "1"); } catch (e) {} setVisible(false); } else { dismiss(); }
    } catch (e) { dismiss(); } finally { setDeferredPrompt(null); setInstalling(false); }
  }, [deferredPrompt, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div key="install-prompt" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ duration: 0.35, ease: "easeOut" }} className="fixed z-[60] bottom-5 inset-x-4 sm:inset-x-auto sm:end-5 sm:start-auto sm:bottom-6 sm:w-[380px]" data-testid="install-prompt" role="dialog" aria-live="polite">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pomegranate-500 via-pomegranate-600 to-pomegranate-700 text-white shadow-2xl shadow-pomegranate-900/40 ring-1 ring-pomegranate-300/30">
            <div aria-hidden="true" className="absolute -top-10 -end-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden="true" className="absolute -bottom-12 -start-6 w-28 h-28 rounded-full bg-pomegranate-300/15 blur-2xl" />
            <button onClick={dismiss} aria-label={C.dismiss || "Dismiss"} className="absolute top-2.5 end-2.5 w-8 h-8 rounded-full flex items-center justify-center text-pomegranate-100 hover:text-white hover:bg-white/15 transition" data-testid="install-prompt-dismiss"><X className="w-4 h-4" /></button>
            <div className="relative p-5 pe-12">
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20"><Smartphone className="w-5 h-5 text-white" strokeWidth={2.2} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-pomegranate-100/90"><Sparkles className="w-3 h-3" /><span>{C.eyebrow || "New"}</span></div>
                  <h3 className="mt-1 font-display font-extrabold text-lg leading-snug tracking-tight" data-testid="install-prompt-title">{C.title || "Install the app"}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-pomegranate-50/95" data-testid="install-prompt-body">{C.body || "Get instant access from your home screen. Faster, offline-ready, and no browser bar."}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={install} disabled={installing} className="flex-1 h-10 rounded-full bg-white text-pomegranate-700 hover:bg-pomegranate-50 hover:text-pomegranate-800 font-semibold tracking-tight transition disabled:opacity-70" data-testid="install-prompt-install"><Download className="w-4 h-4 me-2" strokeWidth={2.5} />{installing ? (C.installing || "Installing\u2026") : (C.cta || "Install app")}</Button>
                <Button variant="ghost" onClick={dismiss} className="h-10 rounded-full px-4 text-pomegranate-100 hover:text-white hover:bg-white/10 text-xs font-medium" data-testid="install-prompt-later">{C.later || "Later"}</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
