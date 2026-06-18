import React, { useState, useRef } from "react";
import axios from "axios";
import { UploadCloud, FileText, Image as ImageIcon, X, Sparkles, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { renderMarkdown } from "../utils/markdown";
import ResultDisplay from "./ResultDisplay";

export default function AnalyzerModal({ kind, T, audience, language, api, plan, onClose, onRequestUpgrade }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const PREMIUM_KINDS = ["microbiology", "semen", "histopathology", "cytology", "genetic", "karyotype", "immunology"];
  const IMAGING_KINDS = ["radiology", "ecg"];
  const isPremiumKind = PREMIUM_KINDS.includes(kind);
  const isImagingKind = IMAGING_KINDS.includes(kind);
  const accept = (isPremiumKind || isImagingKind) ? "image/*,application/pdf" : (kind === "image" ? "image/*" : "application/pdf");

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("audience", audience);
    fd.append("language", language);
    try {
      const res = await axios.post(`${api}/analyze/${kind}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      setResult(res.data);
      try { window.dispatchEvent(new CustomEvent("lab:analysis:success", { detail: { kind } })); } catch (e) {}
    } catch (e) {
      setError(e?.response?.data?.detail || T.analyzer.error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.interpretation], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medireader-${result.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto" data-testid={`analyzer-${kind}`}>
      {!result && (
        <>
          <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }} className="border-2 border-dashed border-brand-300 rounded-3xl p-10 text-center bg-brand-50/40 hover:bg-brand-50 cursor-pointer transition" data-testid="dropzone">
            <div className="w-16 h-16 rounded-2xl bg-white border border-brand-100 mx-auto mb-4 flex items-center justify-center shadow-sm">
              {(kind === "image" || isImagingKind || isPremiumKind) ? <ImageIcon className="w-7 h-7 text-brand-600" /> : <FileText className="w-7 h-7 text-brand-600" />}
            </div>
            <p className="text-slate-900 font-semibold">{file ? file.name : (kind === "image" ? T.inputs.imageBtn : (isImagingKind || isPremiumKind ? (T.analyzer?.uploadBtn || "Choose image or PDF") : T.inputs.pdfBtn))}</p>
            <p className="text-xs text-slate-500 mt-1">{file ? `${(file.size / 1024).toFixed(0)} KB` : "Drag & drop or click"}</p>
            <input ref={inputRef} type="file" accept={accept} onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" data-testid="file-input" />
          </div>
          {error && <p className="mt-4 text-sm text-rose-600" data-testid="analyzer-error">{error}</p>}
          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={onClose} className="rounded-full" data-testid="analyzer-cancel"><X className="w-4 h-4 me-1" /> Cancel</Button>
            <Button onClick={handleAnalyze} disabled={!file || loading} className="rounded-full bg-brand-500 hover:bg-brand-600 text-white px-6 h-11" data-testid="analyzer-submit">
              {loading ? (<><Loader2 className="w-4 h-4 me-2 animate-spin" /> {T.analyzer.analyzing}</>) : (<><Sparkles className="w-4 h-4 me-2" /> {T.nav.analyze}</>)}
            </Button>
          </div>
        </>
      )}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} data-testid="analyzer-result">
          <div className="flex items-center gap-2 mb-4"><div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center"><Sparkles className="w-4 h-4 text-brand-600" /></div><h4 className="font-bold text-lg text-slate-900">{T.analyzer.result}</h4></div>
          <ResultDisplay interpretation={result.interpretation} T={T} plan={plan} onRequestUpgrade={onRequestUpgrade} />
          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={reset} className="rounded-full" data-testid="analyzer-new">{T.analyzer.new}</Button>
            <Button onClick={download} className="rounded-full bg-slate-900 hover:bg-brand-600 text-white" data-testid="analyzer-download"><Download className="w-4 h-4 me-2" /> {T.analyzer.download}</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
