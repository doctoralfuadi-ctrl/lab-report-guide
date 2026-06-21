import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ClipboardList, Sparkles, Loader2, ArrowUpRight, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { renderMarkdown } from "../utils/markdown";
import ResultDisplay from "./ResultDisplay";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.7, ease: "easeOut" } };

export default function TestsGuide({ T, audience, language, api, plan, onRequestUpgrade }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (text) => {
    const condition = (text || query).trim();
    if (!condition) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${api}/recommend-tests`, {
        condition, audience, language,
      }, { timeout: 120000 });
      setResult(res.data);
      // smooth-scroll to result
      setTimeout(() => {
        document.getElementById("guide-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) {
      setError(e?.response?.data?.detail || T.analyzer.error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setQuery("");
  };

  return (
    <section id="guide" className="py-24 lg:py-32 bg-gradient-to-b from-white to-brand-50/30" data-testid="guide-section">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div {...fadeUp} className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-white border border-brand-200 text-xs font-medium text-brand-700 mb-5">
            <ClipboardList className="w-3.5 h-3.5" /> {T.guide.nav}
          </div>
          <h2 className="font-display font-extrabold text-3xl lg:text-5xl tracking-tight text-slate-900">
            {T.guide.title}
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">{T.guide.subtitle}</p>
        </motion.div>

        <motion.div {...fadeUp} className="mt-10">
          <div className="relative">
            <Search className="w-5 h-5 text-brand-600 absolute top-1/2 -translate-y-1/2 start-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder={T.guide.placeholder}
              className="h-16 ps-14 pe-44 rounded-full bg-white border-brand-200 text-base shadow-sm"
              data-testid="guide-input"
            />
            <Button
              onClick={() => submit()}
              disabled={loading || !query.trim()}
              className="absolute top-1/2 -translate-y-1/2 end-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white h-12 px-5"
              data-testid="guide-submit"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 me-2 animate-spin" /> {T.guide.suggesting}</>
              ) : (
                <><Sparkles className="w-4 h-4 me-2" /> {T.guide.submit}</>
              )}
            </Button>
          </div>

          <div className="mt-7">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{T.guide.or}</p>
            <div className="flex flex-wrap gap-2">
              {T.guide.categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => { setQuery(c.q); submit(c.q); }}
                  disabled={loading}
                  className="px-4 h-10 rounded-full bg-white border border-brand-100 text-sm font-medium text-slate-700 hover:border-brand-400 hover:text-brand-700 hover:-translate-y-0.5 transition shadow-sm disabled:opacity-50 disabled:hover:translate-y-0"
                  data-testid={`guide-chip-${c.key}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Curated structured catalog */}
        <motion.div {...fadeUp} className="mt-16" data-testid="guide-catalog">
          <div className="max-w-2xl mb-8">
            <h3 className="font-display font-bold text-2xl lg:text-3xl tracking-tight text-slate-900">{T.guide.catalogTitle}</h3>
            <p className="mt-3 text-slate-600 text-sm lg:text-base leading-relaxed">{T.guide.catalogSub}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {T.guide.catalog.map((c) => (
              <Card key={c.key} className="rounded-3xl p-7 border-brand-100 bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col" data-testid={`catalog-card-${c.key}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-brand-600" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg text-slate-900 leading-tight">{c.title}</h4>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{c.summary}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {c.tests.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => { setQuery(c.q); submit(c.q); }}
                  disabled={loading}
                  variant="outline"
                  className="rounded-full border-brand-300 text-brand-700 hover:bg-brand-500 hover:text-white hover:border-brand-500 mt-auto h-10"
                  data-testid={`catalog-cta-${c.key}`}
                >
                  <Sparkles className="w-4 h-4 me-2" /> {T.guide.catalogCta}
                </Button>
              </Card>
            ))}
          </div>
        </motion.div>

        {error && <p className="mt-6 text-sm text-rose-600" data-testid="guide-error">{error}</p>}

        {loading && (
          <Card className="mt-10 rounded-3xl border-brand-100 p-8 bg-white" data-testid="guide-loading">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              <span className="font-medium">{T.guide.suggesting}</span>
            </div>
            <div className="mt-5 space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-4 rounded-full bg-brand-50 animate-pulse-soft" style={{ width: `${90 - i*10}%` }} />
              ))}
            </div>
          </Card>
        )}

        {result && (
          <motion.div
            id="guide-result"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mt-10"
            data-testid="guide-result"
          >
            <Card className="rounded-3xl border-brand-100 p-8 lg:p-10 bg-white shadow-xl shadow-brand-500/5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-brand-600" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900">{T.guide.result}</h3>
                </div>
                <Button onClick={reset} variant="outline" className="rounded-full" data-testid="guide-reset">
                  <RotateCcw className="w-4 h-4 me-2" /> {T.guide.new}
                </Button>
              </div>
              <div data-testid="guide-result-body">
                <ResultDisplay interpretation={result.interpretation} T={T} plan={plan} onRequestUpgrade={onRequestUpgrade} />
              </div>
              <div className="mt-6 pt-6 border-t border-brand-100 flex items-center gap-2 text-sm text-slate-600">
                <ArrowUpRight className="w-4 h-4 text-brand-600" />
                <a href="#inputs" className="font-medium text-brand-700 hover:text-brand-600" data-testid="guide-link-analyze">
                  Got your results? Analyze them now →
                </a>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
}
