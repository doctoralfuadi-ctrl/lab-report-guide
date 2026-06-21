import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Monitor, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

let deferredPrompt = null;

export default function InstallPrompt({ T, lang = "en" }) {
  const isAr = lang === "ar";
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    setIsStandalone(!!standalone);
    if (standalone) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const handler = (e) => { e.preventDefault(); deferredPrompt = e; setShowBanner(true); };
    window.addEventListener("beforeinstallprompt", handler);

    // On iOS show banner after 5s
    let timer;
    if (ios) { timer = setTimeout(() => setShowBanner(true), 5000); }

    return () => { window.removeEventListener("beforeinstallprompt", handler); clearTimeout(timer); };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    deferredPrompt = null;
  }, []);

  const dismiss = () => {
    setShowBanner(false);
    try { sessionStorage.setItem("pwa_dismissed", "1"); } catch {}
  };

  useEffect(() => {
    try { if (sessionStorage.getItem("pwa_dismissed")) setShowBanner(false); } catch {}
  }, []);

  if (isStandalone || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 inset-x-4 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:max-w-md"
        data-testid="install-prompt"
      >
        <div className="rounded-2xl bg-slate-900/95 backdrop-blur-xl text-white p-5 shadow-2xl shadow-brand-900/30 ring-1 ring-brand-500/20">
          <button onClick={dismiss} className="absolute top-3 end-3 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition" data-testid="install-dismiss">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
              {isIOS ? <Smartphone className="w-6 h-6 text-white" /> : <Monitor className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-base leading-tight">
                {isAr ? "\u062b\u0628\u0651\u062a MidScope \u0639\u0644\u0649 \u062c\u0647\u0627\u0632\u0643" : "Install MidScope"}
              </h4>
              <p className="text-sm text-slate-300 mt-1 leading-snug">
                {isAr
                  ? "\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0648\u0635\u0648\u0644 \u0641\u0648\u0631\u064a \u0645\u0646 \u0634\u0627\u0634\u062a\u0643 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 \u2014 \u0628\u062f\u0648\u0646 \u0645\u062a\u062c\u0631."
                  : "Get instant access from your home screen \u2014 no app store needed."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {isIOS ? (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Share className="w-4 h-4" />
                <span>{isAr ? "\u0627\u0636\u063a\u0637 \u0645\u0634\u0627\u0631\u0643\u0629 \u062b\u0645 \u0623\u0636\u0641 \u0644\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629" : "Tap Share then \u2018Add to Home Screen\u2019"}</span>
              </div>
            ) : (
              <Button
                onClick={handleInstall}
                className="rounded-full bg-brand-500 hover:bg-brand-400 text-white px-5 h-10 text-sm font-semibold shadow-lg shadow-brand-500/30"
                data-testid="install-btn"
              >
                <Download className="w-4 h-4 me-2" />
                {isAr ? "\u062b\u0628\u0651\u062a \u0627\u0644\u0622\u0646" : "Install Now"}
              </Button>
            )}
            <button onClick={dismiss} className="text-sm text-slate-400 hover:text-white transition" data-testid="install-later">
              {isAr ? "\u0644\u0627\u062d\u0642\u0627\u064b" : "Later"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
