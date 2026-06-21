import React, { useState } from "react";
import axios from "axios";
import { ClipboardPaste, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResultDisplay from "./ResultDisplay";

export default function ManualForm({ T, audience, language, api, plan, onRequestUpgrade }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${api}/analyze/manual`, { text: text.trim(), audience, language }, { timeout: 120000 });
      setResult(res.data);
      try { window.dispatchEvent(new CustomEvent("lab:analysis:success", { detail: { kind: "manual" } })); } catch {}
    } catch (e) { setError(e?.response?.data?.detail || T.analyzer.error); } finally { setLoading(false); }
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setText(clip);
    } catch {}
  };

  return (
    <div className="space-y-5" data-testid="manual-form">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={T.inputs.manualPlaceholder || "Paste your lab report text here..."}
          className="w-full min-h-[200px] rounded-2xl border border-brand-200 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none resize-y transition"
          data-testid="manual-textarea"
        />
        <button
          type="button"
          onClick={handlePaste}
          className="absolute top-3 end-3 p-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 transition"
          title="Paste from clipboard"
          data-testid="manual-paste-btn"
        >
          <ClipboardPaste className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-sm text-rose-600" data-testid="manual-error">{error}</p>}

      {!result && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="rounded-full bg-brand-500 hover:bg-brand-600 text-white px-6 h-11"
            data-testid="manual-submit"
          >
            {loading ? (<><Loader2 className="w-4 h-4 me-2 animate-spin" /> {T.analyzer.analyzing}</>) : (<><Sparkles className="w-4 h-4 me-2" /> {T.nav.analyze}</>)}
          </Button>
        </div>
      )}

      {result && (
        <div data-testid="manual-result">
          <ResultDisplay interpretation={result.interpretation} T={T} plan={plan} onRequestUpgrade={onRequestUpgrade} />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => { setResult(null); setText(""); }} className="rounded-full" data-testid="manual-new">{T.analyzer.new || "New Analysis"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
