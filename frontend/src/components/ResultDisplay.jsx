import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Salad, Dumbbell, ChevronDown, ChevronUp, HeartPulse, Volume2, Pause, Crown, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { renderMarkdown, splitInterpretation } from "../utils/markdown";

// Strips Markdown to clean text for TTS reading
function stripMarkdown(md) {
  if (!md) return "";
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{2,}/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickProfessionalVoice(voiceLocale) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const all = window.speechSynthesis.getVoices() || [];
  if (!all.length) return null;
  const isArabic = voiceLocale.toLowerCase().startsWith("ar");
  const langPrefix = voiceLocale.split("-")[0].toLowerCase();
  const msaCodes = ["ar-sa", "ar-xa", "ar-001", "ar"];
  const dialectCodes = ["ar-eg", "ar-lb", "ar-ma", "ar-dz", "ar-tn"];

  const scored = all.map(v => {
    const lc = v.lang.toLowerCase();
    let score = 0;
    if (lc === voiceLocale.toLowerCase()) score += 100;
    if (isArabic && msaCodes.includes(lc)) score += 80;
    if (isArabic && dialectCodes.some(d => lc.startsWith(d))) score -= 50;
    if (lc.startsWith(langPrefix)) score += 30;
    // Prefer "natural" / professional sounding voices
    if (/neural|natural|google|microsoft/i.test(v.name)) score += 10;
    return { v, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0]?.v || all[0] || null;
}

export default function ResultDisplay({ interpretation, T, plan, onRequestUpgrade }) {
  const { main, recommendations } = useMemo(() => splitInterpretation(interpretation || ""), [interpretation]);
  const [open, setOpen] = useState(false);
  const [voiceState, setVoiceState] = useState("idle"); // idle | playing | paused
  const hasRecs = recommendations.length > 20;
  const isPremium = plan === "premium";
  const voiceLocale = T._voiceLocale || "en-US";
  const utteranceRef = useRef(null);

  // Clean up speech on unmount
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch (e) {} }, []);

  const startReading = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!isPremium) { onRequestUpgrade?.("voice"); return; }
    window.speechSynthesis.cancel();
    const fullText = stripMarkdown(`${main}\n\n${recommendations}`);
    const u = new SpeechSynthesisUtterance(fullText);
    const v = pickProfessionalVoice(voiceLocale);
    u.lang = voiceLocale;
    if (v) u.voice = v;
    u.rate = voiceLocale.startsWith("ar") ? 0.9 : 0.95;
    u.pitch = 1.0;
    u.onend = () => setVoiceState("idle");
    u.onerror = () => setVoiceState("idle");
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setVoiceState("playing");
  };
  const togglePause = () => {
    if (voiceState === "playing") {
      window.speechSynthesis.pause();
      setVoiceState("paused");
    } else if (voiceState === "paused") {
      window.speechSynthesis.resume();
      setVoiceState("playing");
    }
  };
  const stopReading = () => {
    try { window.speechSynthesis.cancel(); } catch (e) {}
    setVoiceState("idle");
  };

  return (
    <div data-testid="result-display">
      <div className="markdown-body bg-brand-50/30 border border-brand-100 rounded-2xl p-6"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(main) }}
        data-testid="result-main"
      />

      {/* Premium-only Voice Interpretation control */}
      <div className="mt-4">
        {voiceState === "idle" ? (
          <Button
            onClick={startReading}
            className={`w-full rounded-2xl h-auto py-3.5 px-5 transition-all relative
              ${isPremium
                ? "bg-gradient-to-br from-pomegranate-500 via-pomegranate-600 to-pomegranate-700 hover:from-pomegranate-600 hover:to-pomegranate-800 text-white shadow-xl shadow-pomegranate-500/30 hover:-translate-y-0.5"
                : "bg-white border-2 border-dashed border-pomegranate-300 text-pomegranate-700 hover:bg-pomegranate-50"}
            `}
            data-testid="voice-listen-btn"
          >
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-3 text-start">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isPremium ? "bg-white/20" : "bg-pomegranate-50"}`}>
                  <Volume2 className={`w-4 h-4 ${isPremium ? "text-white" : "text-pomegranate-600"}`} strokeWidth={2.2} />
                </div>
                <div className="leading-tight">
                  <div className="font-display font-bold text-sm flex items-center gap-2">
                    {T.analyzer.voiceListen}
                    {!isPremium && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        <Crown className="w-2.5 h-2.5" /> {T.pricing.premiumBadge}
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isPremium ? "text-white/85" : "text-pomegranate-600"}`}>
                    {isPremium ? T.analyzer.voiceLabel : T.analyzer.voicePremiumOnly}
                  </div>
                </div>
              </div>
            </div>
          </Button>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-pomegranate-500 via-pomegranate-600 to-pomegranate-700 text-white p-4 flex items-center gap-3" data-testid="voice-playing-bar">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-5 h-5 animate-pulse-soft" strokeWidth={2.2} />
            </div>
            <div className="flex-1 leading-tight">
              <div className="font-display font-bold text-sm">{T.analyzer.voicePlaying}</div>
              <div className="text-[11px] text-white/80 mt-0.5">{voiceLocale.startsWith("ar") ? "\u0635\u0648\u062a \u0641\u0635\u064a\u062d \u0627\u062d\u062a\u0631\u0627\u0641\u064a" : T.analyzer.voiceLabel}</div>
            </div>
            <Button onClick={togglePause} className="rounded-full bg-white/20 hover:bg-white/30 text-white h-9 px-3" data-testid="voice-toggle-pause">
              {voiceState === "paused" ? <Volume2 className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button onClick={stopReading} className="rounded-full bg-white/20 hover:bg-white/30 text-white h-9 px-3" data-testid="voice-stop">
              <Square className="w-4 h-4 fill-white" strokeWidth={0} />
            </Button>
          </div>
        )}
      </div>

      {/* Prominent "Health Recommendations" button */}
      <Button
        onClick={() => setOpen(o => !o)}
        disabled={!hasRecs}
        className={`mt-3 w-full rounded-2xl h-auto py-4 px-5 transition-all
          ${open
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "bg-gradient-to-br from-emerald-500 via-brand-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5"}
        `}
        data-testid="health-recommendations-btn"
      >
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-3 text-start">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base">{open ? T.analyzer.hideRecs : T.analyzer.healthRecs}</div>
              {!open && (
                <div className="text-[11px] text-white/80 mt-0.5">
                  {hasRecs ? T.analyzer.healthRecsHint : T.analyzer.noRecs}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-white/15 px-2.5 h-7 rounded-full">
              <Salad className="w-3 h-3" /> <Dumbbell className="w-3 h-3" />
            </span>
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </Button>

      <AnimatePresence>
        {open && hasRecs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="mt-4 markdown-body bg-gradient-to-br from-emerald-50/60 to-amber-50/40 border border-emerald-200 rounded-2xl p-6"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(recommendations) }}
              data-testid="health-recommendations-content"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
