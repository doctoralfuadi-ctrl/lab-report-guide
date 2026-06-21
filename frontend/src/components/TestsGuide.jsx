import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ClipboardList, Sparkles, Loader2, ArrowUpRight, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renderMarkdown } from "../utils/markdown";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COMMON_TESTS = [
  { key: "cbc", labelEn: "CBC (Complete Blood Count)", labelAr: "\u0641\u062d\u0635 \u0627\u0644\u062f\u0645 \u0627\u0644\u0634\u0627\u0645\u0644" },
  { key: "lipid", labelEn: "Lipid Panel", labelAr: "\u0641\u062d\u0635 \u0627\u0644\u062f\u0647\u0648\u0646" },
  { key: "thyroid", labelEn: "Thyroid Panel (TSH, T3, T4)", labelAr: "\u0641\u062d\u0635 \u0627\u0644\u063a\u062f\u0629 \u0627\u0644\u062f\u0631\u0642\u064a\u0629" },
  { key: "hba1c", labelEn: "HbA1c (Diabetes)", labelAr: "\u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u062a\u0631\u0627\u0643\u0645\u064a" },
  { key: "liver", labelEn: "Liver Function (LFT)", labelAr: "\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0643\u0628\u062f" },
  { key: "kidney", labelEn: "Kidney Function (RFT)", labelAr: "\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0643\u0644\u0649" },
  { key: "iron", labelEn: "Iron Studies", labelAr: "\u062f\u0631\u0627\u0633\u0627\u062a \u0627\u0644\u062d\u062f\u064a\u062f" },
  { key: "vitd", labelEn: "Vitamin D", labelAr: "\u0641\u064a\u062a\u0627\u0645\u064a\u0646 \u062f" },
  { key: "crp", labelEn: "CRP (Inflammation)", labelAr: "\u0628\u0631\u0648\u062a\u064a\u0646 \u0627\u0644\u062a\u0641\u0627\u0639\u0644 C" },
  { key: "urine", labelEn: "Urinalysis", labelAr: "\u0641\u062d\u0635 \u0627\u0644\u0628\u0648\u0644" },
];

export default function TestsGuide({ T, lang = "en" }) {
  const isAr = lang === "ar";
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (testName) => {
    const q = testName || query.trim();
    if (!q) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await axios.post(`${API}/tests/guide`, { test_name: q, language: lang });
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || (isAr ? "\u062d\u062f\u062b \u062e\u0637\u0623" : "Something went wrong."));
    } finally { setLoading(false); }
  };

  const reset = () => { setQuery(""); setResult(null); setError(null); };

  return (
    <div className="space-y-6" data-testid="tests-guide">
      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder={isAr ? "\u0627\u0628\u062d\u062b \u0639\u0646 \u0641\u062d\u0635..." : "Search for a test..."}
            className="ps-10 rounded-xl h-11"
            data-testid="tests-search-input"
          />
        </div>
        <Button
          onClick={() => handleSearch()}
          disabled={!query.trim() || loading}
          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-5 h-11"
          data-testid="tests-search-btn"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </Button>
      </div>

      {/* Quick picks */}
      {!result && (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {isAr ? "\u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a \u0633\u0631\u064a\u0639\u0629" : "Common Tests"}
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_TESTS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setQuery(isAr ? t.labelAr : t.labelEn); handleSearch(isAr ? t.labelAr : t.labelEn); }}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-brand-50 hover:border-brand-300 transition"
                data-testid={`tests-quick-${t.key}`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-brand-500" />
                {isAr ? t.labelAr : t.labelEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-600" data-testid="tests-error">{error}</p>}

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm" data-testid="tests-result">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-brand-600" />
            </div>
            <h4 className="font-display font-bold text-lg text-slate-900">{result.test_name || query}</h4>
          </div>
          <div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(result.guide) }} />
          <div className="mt-5 flex gap-3">
            <Button variant="outline" onClick={reset} className="rounded-full" data-testid="tests-new">
              <RotateCcw className="w-4 h-4 me-1" /> {isAr ? "\u0628\u062d\u062b \u062c\u062f\u064a\u062f" : "New Search"}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
