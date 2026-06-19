import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FlaskConical, ScanLine, HeartPulse, ArrowRight, Bell, Loader2, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MODULES = [
  {
    key: "lab",
    Icon: FlaskConical,
    status: "live",
    theme: "turquoise",
    targetAction: "openAnalyzer",
    tierGate: null,
  },
  {
    key: "radiology",
    Icon: ScanLine,
    status: "live",
    theme: "cacao",
    targetAction: "openAnalyzer",
    tierGate: "premium",
  },
  {
    key: "ecg",
    Icon: HeartPulse,
    status: "live",
    theme: "pomegranate",
    targetAction: "openAnalyzer",
    tierGate: "royal",
  },
];

export default function DiagnosticModules({ T, lang, onOpenLab, onOpenRadiology, onOpenEcg }) {
  const M = T.modules;
  const isAr = lang === "ar";

  const handlers = { lab: onOpenLab, radiology: onOpenRadiology, ecg: onOpenEcg };

  return (
    <section id="modules" className="relative py-20 lg:py-28 overflow-hidden" data-testid="modules-section">
      <div aria-hidden="true" className="ambient-pomegranate" style={{ top: "5%", insetInlineStart: "-12%" }} />
      <div aria-hidden="true" className="ambient-cyan" style={{ bottom: "-10%", insetInlineEnd: "-10%" }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 h-7 rounded-full bg-pomegranate-50 text-pomegranate-700 text-[10px] font-bold tracking-widest uppercase border border-pomegranate-200">
            <Sparkles className="w-3 h-3" /> {M.eyebrow}
          </div>
          <h2 className="mt-4 font-display font-extrabold text-3xl lg:text-5xl tracking-tight text-slate-900">
            {M.title}
          </h2>
          <p className="mt-3.5 text-slate-600 text-sm lg:text-base max-w-2xl mx-auto leading-relaxed">
            {M.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6" data-testid="modules-grid">
          {MODULES.map((mod, idx) => (
            <ModuleCard
              key={mod.key}
              T={T}
              lang={lang}
              isAr={isAr}
              mod={mod}
              M={M}
              index={idx}
              onOpen={handlers[mod.key] || onOpenLab}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleCard({ T, lang, isAr, mod, M, index, onOpen }) {
  const { Icon, key, status, theme, tierGate } = mod;
  const data = M[key];

  const themes = {
    turquoise: {
      iconBg: "bg-gradient-to-br from-teal-400 to-teal-600",
      ring: "ring-teal-200",
      hoverRing: "hover:ring-teal-400",
      glow: "glow-soft",
      cardBase: "glass-card",
      ctaBg: "bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800",
      ctaText: "text-white",
      statusBgLive: "bg-emerald-500 text-white",
      statusBgSoon: "bg-teal-50 text-teal-700 border border-teal-200",
    },
    pomegranate: {
      iconBg: "bg-gradient-to-br from-pomegranate-500 to-pomegranate-700",
      ring: "ring-pomegranate-200",
      hoverRing: "hover:ring-pomegranate-400",
      glow: "glow-pomegranate",
      cardBase: "glass-card-pomegranate",
      ctaBg: "bg-gradient-to-r from-pomegranate-600 to-pomegranate-800 hover:from-pomegranate-700 hover:to-pomegranate-900",
      ctaText: "text-white",
      statusBgLive: "bg-emerald-500 text-white",
      statusBgSoon: "bg-pomegranate-100 text-pomegranate-700 border border-pomegranate-200",
    },
    cacao: {
      iconBg: "bg-gradient-to-br from-cacao-400 to-cacao-600",
      ring: "ring-cacao-200",
      hoverRing: "hover:ring-cacao-400",
      glow: "glow-soft",
      cardBase: "glass-card",
      ctaBg: "bg-gradient-to-r from-cacao-500 to-cacao-700 hover:from-cacao-600 hover:to-cacao-800",
      ctaText: "text-white",
      statusBgLive: "bg-emerald-500 text-white",
      statusBgSoon: "bg-cacao-50 text-cacao-700 border border-cacao-200",
    },
  };
  const t = themes[theme];
  const tierLabel = tierGate === "royal"
    ? (isAr ? "\u0645\u062a\u0627\u062d \u0644\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u0644\u0643\u064a\u0629" : "Available on Royal")
    : tierGate === "premium"
      ? (isAr ? "\u0645\u062a\u0627\u062d \u0645\u0646 \u0628\u0631\u064a\u0645\u064a\u0648\u0645" : "Available on Premium+")
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative group"
      data-testid={`module-card-${key}`}
    >
      <div className={`relative h-full ${t.cardBase} p-7 ring-1 ${t.ring} ${t.hoverRing} transition-all duration-500 hover:-translate-y-1`}>
        <span aria-hidden="true" className={`opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${t.glow}`} />

        <div className="relative flex items-start justify-between mb-5">
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${t.iconBg} shadow-lg`}>
            <Icon className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 h-6 rounded-full ${t.statusBgLive} shadow-md shadow-emerald-500/25`} data-testid={`module-${key}-status`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {M.statusLive}
            </span>
            {tierLabel && (
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2 h-5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200" data-testid={`module-${key}-tier`}>
                {tierLabel}
              </span>
            )}
          </div>
        </div>

        <h3 className="relative font-display font-extrabold text-xl lg:text-2xl tracking-tight text-slate-900 mb-2" data-testid={`module-${key}-name`}>
          {data.name}
        </h3>
        <p className="relative text-sm text-slate-600 leading-relaxed mb-6 min-h-[60px]" data-testid={`module-${key}-desc`}>
          {data.desc}
        </p>

        <div className="relative">
          <Button
            onClick={onOpen}
            className={`w-full rounded-full ${t.ctaBg} ${t.ctaText} h-11 font-semibold tracking-tight shadow-lg`}
            data-testid={`module-${key}-open-btn`}
          >
            {M.open} {isAr ? <ArrowRight className="w-4 h-4 ms-2 rotate-180" /> : <ArrowRight className="w-4 h-4 ms-2" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function NotifyForm({ M, moduleKey, themeKey, t }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [open, setOpen] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setState("submitting");
    try {
      await axios.post(`${API}/newsletter`, { email, source: `module:${moduleKey}` });
      setState("done");
    } catch (err) {
      setState("done");
    }
  };

  if (state === "done") {
    return (
      <div className={`flex items-center justify-center gap-2 h-11 rounded-full ${themeKey === "pomegranate" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`} data-testid={`module-${moduleKey}-notify-done`}>
        <Check className="w-4 h-4" />
        <span className="text-sm font-semibold">{M.notifyDone}</span>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className={`w-full rounded-full h-11 font-semibold tracking-tight border-2 ${themeKey === "pomegranate" ? "border-pomegranate-200 text-pomegranate-700 hover:bg-pomegranate-50 hover:border-pomegranate-400" : "border-cacao-200 text-cacao-700 hover:bg-cacao-50 hover:border-cacao-400"}`}
        data-testid={`module-${moduleKey}-notify-btn`}
      >
        <Bell className="w-4 h-4 me-2" /> {M.notify}
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2" data-testid={`module-${moduleKey}-notify-form`}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={M.notifyAsk}
        className="h-11 rounded-full bg-white/80 backdrop-blur-sm flex-1 text-sm"
        autoFocus
        data-testid={`module-${moduleKey}-notify-input`}
      />
      <Button
        type="submit"
        disabled={state === "submitting"}
        className={`rounded-full h-11 px-4 ${t.ctaBg} ${t.ctaText}`}
        data-testid={`module-${moduleKey}-notify-submit`}
      >
        {state === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
      </Button>
    </form>
  );
}
