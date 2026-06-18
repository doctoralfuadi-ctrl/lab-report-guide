import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Beaker, Check, X, ChevronDown, ChevronUp } from "lucide-react";

export default function DemoTierSwitcher({ plan, setPlan, lang = "en", onClose }) {
  const isAr = lang === "ar";
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const p = (url.searchParams.get("plan") || "").toLowerCase();
      if (["standard", "premium", "royal"].includes(p) && p !== plan) { setPlan(p); }
    } catch {}
  }, []);

  const tiers = [
    { key: "standard", labelEn: "Standard", labelAr: "\u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629", priceEn: "$10 / year", priceAr: "10$ / \u0633\u0646\u0629", Icon: Beaker, accent: "from-teal-400 to-teal-600", ring: "ring-teal-300", text: "text-teal-700" },
    { key: "premium", labelEn: "Premium", labelAr: "\u0628\u0631\u064a\u0645\u064a\u0648\u0645", priceEn: "$25 / year", priceAr: "25$ / \u0633\u0646\u0629", Icon: Sparkles, accent: "from-amber-400 to-amber-600", ring: "ring-amber-300", text: "text-amber-700" },
    { key: "royal", labelEn: "Royal", labelAr: "\u0627\u0644\u0645\u0644\u0643\u064a\u0629", priceEn: "$100 / year", priceAr: "100$ / \u0633\u0646\u0629", Icon: Crown, accent: "from-cyan-500 to-cyan-700", ring: "ring-cyan-300", text: "text-cyan-700" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-5 end-5 z-50 max-w-[340px]" data-testid="demo-tier-switcher">
      <div className="rounded-2xl bg-slate-900/95 backdrop-blur-xl text-white shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-500/30 overflow-hidden">
        <button type="button" onClick={() => setOpen(v => !v)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition" data-testid="demo-switcher-toggle">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center"><Crown className="w-4 h-4 text-white" /></div>
          <div className="flex-1 text-start"><div className="text-[10px] font-bold tracking-widest uppercase text-cyan-300">{isAr ? "\u0648\u0636\u0639 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0645\u0627\u0644\u0643" : "Owner Demo Mode"}</div><div className="text-sm font-display font-bold">{isAr ? "\u062c\u0631\u0651\u0628 \u0623\u064a\u0651 \u0628\u0627\u0642\u0629 \u0628\u062f\u0648\u0646 \u062f\u0641\u0639" : "Try any tier \u2014 no payment"}</div></div>
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          {onClose && (<span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onClose(); } }} className="w-7 h-7 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition cursor-pointer" data-testid="demo-switcher-close" aria-label="Close demo switcher"><X className="w-3.5 h-3.5" /></span>)}
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="px-3 pb-3 space-y-2">
                {tiers.map((t) => { const active = plan === t.key; const Icon = t.Icon; return (<button key={t.key} type="button" onClick={() => setPlan(t.key)} className={`w-full text-start rounded-xl px-3 py-2.5 flex items-center gap-3 transition ${active ? `bg-gradient-to-br ${t.accent} text-white shadow-lg ring-1 ${t.ring}` : "bg-white/5 hover:bg-white/10 text-slate-200"}`} data-testid={`demo-tier-${t.key}`}><Icon className="w-4 h-4 flex-shrink-0" /><div className="flex-1 min-w-0"><div className="text-sm font-display font-bold leading-tight">{isAr ? t.labelAr : t.labelEn}</div><div className={`text-[11px] tabular-nums ${active ? "text-white/85" : "text-slate-400"}`}>{isAr ? t.priceAr : t.priceEn}</div></div>{active && <Check className="w-4 h-4 flex-shrink-0" />}</button>); })}
                <div className="text-[10px] text-slate-400 px-1 pt-1 leading-relaxed">{isAr ? "\u0627\u0636\u063a\u0637 \u0623\u064a\u0651 \u0628\u0627\u0642\u0629 \u2014 \u0643\u0644 \u0627\u0644\u0645\u0632\u0627\u064a\u0627 \u062a\u0646\u0641\u062a\u062d \u0641\u0648\u0631\u0627\u064b \u0628\u062f\u0648\u0646 \u0641\u062d\u0635 \u062f\u0641\u0639." : "Tap any tier \u2014 features unlock instantly, no payment check."}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
