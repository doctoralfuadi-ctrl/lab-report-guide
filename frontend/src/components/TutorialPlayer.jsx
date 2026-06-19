import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, UserCircle2, Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function pickVoice(voiceLocale, targetGender) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const all = window.speechSynthesis.getVoices() || [];
  if (!all.length) return null;

  const isArabic = voiceLocale.toLowerCase().startsWith("ar");
  const langPrefix = voiceLocale.split("-")[0].toLowerCase();

  const dialectCodes = ["ar-eg", "ar-lb", "ar-ma", "ar-dz", "ar-tn", "ar-ly", "ar-sy", "ar-jo", "ar-iq", "ar-ye", "ar-kw", "ar-bh", "ar-qa", "ar-ae", "ar-om", "ar-sd"];
  const msaCodes = ["ar-sa", "ar-xa", "ar-001", "ar"];

  const scored = all.map(v => {
    const lc = v.lang.toLowerCase();
    let score = 0;
    if (lc === voiceLocale.toLowerCase()) score += 100;
    if (isArabic) {
      if (msaCodes.includes(lc)) score += 80;
      if (dialectCodes.some(d => lc.startsWith(d))) score -= 50;
    }
    if (lc.startsWith(langPrefix)) score += 30;
    return { v, score };
  }).filter(x => x.score > -50);

  const femalePatterns = /female|samantha|victoria|karen|moira|tessa|fiona|amira|laila|salma|hoda|zira|hazel|aria|jenny|nora|naayf|google.*\bfemale|microsoft.*\b(zira|hazel|aria|jenny|nora|amira|laila|salma|hoda)\b/i;
  const malePatterns   = /male|daniel|alex|fred|tom|aaron|hamed|tarik|naayf|google.*\bmale|microsoft.*\b(david|mark|guy|brian|hamed|tarik)\b/i;

  const genderFilter = (name) =>
    targetGender === "female"
      ? femalePatterns.test(name) && !malePatterns.test(name)
      : malePatterns.test(name) && !femalePatterns.test(name);

  const matching = scored.filter(x => genderFilter(x.v.name)).sort((a, b) => b.score - a.score);
  if (matching.length) return matching[0].v;

  const langOnly = scored.sort((a, b) => b.score - a.score);
  return langOnly[0]?.v || all[0] || null;
}

const fadeSlide = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export default function TutorialPlayer({ T, lang, onClose }) {
  const [userGender, setUserGender] = useState(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const [voiceUsed, setVoiceUsed] = useState("");
  const utteranceRef = useRef(null);

  const steps = T.tutorial.steps;
  const voiceLocale = T._voiceLocale || "en-US";
  const isArabic = voiceLocale.startsWith("ar");
  const targetVoiceGender = userGender === "male" ? "female" : userGender === "female" ? "male" : null;

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const refresh = () => setVoicesReady(window.speechSynthesis.getVoices().length > 0);
    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
    return () => { try { window.speechSynthesis.onvoiceschanged = null; } catch (e) {} };
  }, []);

  useEffect(() => {
    return () => {
      try { window.speechSynthesis?.cancel(); } catch (e) {}
    };
  }, []);

  const speakCurrent = (idx) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const s = steps[idx];
    if (!s) return;
    const u = new SpeechSynthesisUtterance(`${s.title}. ${s.text}`);
    const v = pickVoice(voiceLocale, targetVoiceGender);
    u.lang = voiceLocale;
    if (v) {
      u.voice = v;
      setVoiceUsed(v.name);
    } else {
      setVoiceUsed("(default)");
    }
    u.pitch = targetVoiceGender === "female" ? 1.2 : 0.85;
    u.rate = isArabic ? 0.9 : 0.95;
    u.onend = () => {
      if (idx < steps.length - 1) {
        setStep(idx + 1);
      } else {
        setPlaying(false);
        setFinished(true);
      }
    };
    u.onerror = () => { setPlaying(false); };
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (playing) speakCurrent(step);
  }, [step, playing]);

  const start = () => {
    setFinished(false);
    setStep(0);
    setPlaying(true);
  };
  const pause = () => {
    try { window.speechSynthesis.cancel(); } catch (e) {}
    setPlaying(false);
  };
  const resume = () => {
    setPlaying(true);
  };
  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      pause();
      setFinished(true);
    }
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };
  const replay = () => {
    setFinished(false);
    setStep(0);
    setPlaying(true);
  };

  if (!userGender) {
    return (
      <div className="p-8" data-testid="tutorial-gender-select">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 mx-auto flex items-center justify-center mb-5">
            <UserCircle2 className="w-8 h-8 text-brand-600" strokeWidth={1.8} />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900">{T.tutorial.selectGender}</h3>
          <p className="text-sm text-slate-600 mt-2">{T.tutorial.selectGenderHint}</p>
          <div className="grid grid-cols-2 gap-4 mt-7">
            <button
              onClick={() => setUserGender("male")}
              className="group rounded-3xl border-2 border-brand-100 bg-white p-6 hover:border-brand-500 hover:-translate-y-1 transition"
              data-testid="tutorial-gender-male"
            >
              <div className="text-3xl mb-2">\u2642</div>
              <div className="font-semibold text-slate-900">{T.tutorial.male}</div>
              <div className="text-[11px] text-slate-500 mt-1">\u2192 {T.tutorial.female} voice</div>
            </button>
            <button
              onClick={() => setUserGender("female")}
              className="group rounded-3xl border-2 border-brand-100 bg-white p-6 hover:border-brand-500 hover:-translate-y-1 transition"
              data-testid="tutorial-gender-female"
            >
              <div className="text-3xl mb-2">\u2640</div>
              <div className="font-semibold text-slate-900">{T.tutorial.female}</div>
              <div className="text-[11px] text-slate-500 mt-1">\u2192 {T.tutorial.male} voice</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = steps[step];

  return (
    <div className="bg-slate-900 text-white" data-testid="tutorial-player">
      <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-brand-900/40 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute top-4 start-4 inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white/10 backdrop-blur text-[11px] font-medium">
          <Mic className="w-3 h-3" />
          <span data-testid="tutorial-voice-label">
            {T.tutorial.voiceUsed}: {targetVoiceGender === "female" ? T.tutorial.female : T.tutorial.male}
            {isArabic && " \u00b7 \u0641\u0635\u062d\u0649"}
            {voiceUsed ? ` \u00b7 ${voiceUsed}` : ""}
          </span>
        </div>
        <div className="absolute top-4 end-4 px-3 h-7 rounded-full bg-white/10 backdrop-blur text-[11px] font-medium" data-testid="tutorial-step-counter">
          {T.tutorial.step} {step + 1} {T.tutorial.of} {steps.length}
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-10">
          <AnimatePresence mode="wait">
            <motion.div key={step} {...fadeSlide} className="text-center max-w-2xl" data-testid={`tutorial-step-${step + 1}`}>
              <h2 className="font-display font-extrabold text-3xl lg:text-5xl tracking-tight text-white">
                {current.title}
              </h2>
              <p className="mt-6 text-base lg:text-lg text-slate-200 leading-relaxed">
                {current.text}
              </p>
              {playing && (
                <div className="mt-8 inline-flex items-center gap-2 px-4 h-9 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-brand-300 animate-pulse-soft" />
                  Voiceover playing\u2026
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "bg-brand-400 w-8" : i < step ? "bg-brand-700 w-4" : "bg-white/20 w-4"}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-slate-950 p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={prev} disabled={step === 0} variant="outline" size="sm" className="rounded-full border-slate-700 bg-transparent text-white hover:bg-slate-800" data-testid="tutorial-prev">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {!playing ? (
            <Button onClick={finished ? replay : (step === 0 ? start : resume)} className="rounded-full bg-brand-500 hover:bg-brand-400 text-white px-6 h-10" data-testid="tutorial-play">
              {finished ? <><RotateCcw className="w-4 h-4 me-2" /> {T.tutorial.replay}</> :
                step === 0 ? <><Play className="w-4 h-4 me-2 fill-white" strokeWidth={0} /> {T.tutorial.start}</> :
                <><Play className="w-4 h-4 me-2 fill-white" strokeWidth={0} /> {T.tutorial.resume}</>}
            </Button>
          ) : (
            <Button onClick={pause} className="rounded-full bg-white hover:bg-slate-200 text-slate-900 px-6 h-10" data-testid="tutorial-pause">
              <Pause className="w-4 h-4 me-2 fill-slate-900" strokeWidth={0} /> {T.tutorial.pause}
            </Button>
          )}
          <Button onClick={next} disabled={step === steps.length - 1 && finished} variant="outline" size="sm" className="rounded-full border-slate-700 bg-transparent text-white hover:bg-slate-800" data-testid="tutorial-next">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <button
          onClick={() => { pause(); setUserGender(null); setFinished(false); setStep(0); }}
          className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1"
          data-testid="tutorial-change-voice"
        >
          <ArrowRight className="w-3 h-3" /> {T.tutorial.changeVoice}
        </button>
      </div>

      {!voicesReady && (
        <div className="bg-amber-100 text-amber-800 text-xs text-center py-2 px-4" data-testid="tutorial-voice-warning">
          Loading voices\u2026 If audio doesn't play, your browser may not support speech for this language.
        </div>
      )}
    </div>
  );
}
