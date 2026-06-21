import React, { useMemo, useState } from "react";
import { Globe, Check, Search, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LANGUAGES, LANGUAGE_GROUPS, LANG_BY_CODE } from "../data/languages";

export default function LanguageSelector({ value, onChange, loading, progress }) {
  const [query, setQuery] = useState("");
  const current = LANG_BY_CODE[value] || LANG_BY_CODE.en;

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const seen = new Set();
      return LANGUAGE_GROUPS.map(g => ({ label: g.label, items: g.codes.map(c => LANG_BY_CODE[c]).filter(l => l && (g.label === "Suggested" || !seen.has(l.code))).map(l => { if (g.label !== "Suggested") seen.add(l.code); return l; }) })).filter(g => g.items.length > 0);
    }
    const items = LANGUAGES.filter(l => l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
    return [{ label: "Results", items }];
  }, [query]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 backdrop-blur-sm px-3 h-10 text-sm font-medium text-slate-800 hover:bg-white/90 hover:border-brand-400 transition shadow-sm" data-testid="language-selector-trigger">
        {loading ? <Loader2 className="w-4 h-4 text-brand-700 animate-spin" /> : <Globe className="w-4 h-4 text-brand-700" />}
        <span className="hidden sm:inline" data-testid="language-selector-current">{current.label}</span>
        <span className="sm:hidden font-bold uppercase text-xs tracking-wider">{current.code.split("-")[0]}</span>
        {loading && <span className="hidden md:inline text-[10px] text-brand-700 tabular-nums">{progress?.done}/{progress?.total}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-80 max-h-[480px] rounded-2xl border border-brand-100 bg-white/95 backdrop-blur-xl shadow-2xl shadow-brand-900/10 p-0 overflow-hidden" data-testid="language-selector-content">
        <div className="px-3 pt-3 pb-2 border-b border-brand-50 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="relative"><Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" /><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search 70+ languages..." className="w-full h-9 rounded-full bg-slate-50 ps-9 pe-3 text-sm border border-transparent focus:border-brand-300 focus:bg-white focus:outline-none transition" data-testid="language-selector-search" /></div>
        </div>
        <div className="max-h-[400px] overflow-y-auto px-2 py-2">
          {grouped.length === 0 && <div className="text-center text-xs text-slate-500 py-6">No language matches "{query}".</div>}
          {grouped.map((g) => (<div key={g.label} className="mb-2"><div className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-brand-700/70">{g.label}</div><div className="grid grid-cols-2 gap-0.5">{g.items.map((l) => { const active = l.code === value; return (<button key={l.code + "_" + g.label} onClick={() => onChange(l.code)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-start transition ${active ? "bg-brand-50 text-brand-800 font-semibold ring-1 ring-brand-200" : "hover:bg-slate-50 text-slate-800"}`} data-testid={`language-option-${l.code}`}><span className={`text-[10px] uppercase tabular-nums font-mono ${active ? "text-brand-700" : "text-slate-400"}`}>{l.code.split("-")[0]}</span><span className="flex-1 truncate">{l.label}</span>{active && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />}</button>); })}</div></div>))}
        </div>
        {loading && <div className="border-t border-brand-50 bg-brand-50/50 px-4 py-2.5 flex items-center gap-2 text-xs text-brand-800"><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Translating UI... {progress?.done}/{progress?.total}</span></div>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
