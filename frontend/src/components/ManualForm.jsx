import React, { useState } from "react";
import axios from "axios";
import { Plus, Trash2, Sparkles, X, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { renderMarkdown } from "../utils/markdown";
import ResultDisplay from "./ResultDisplay";

const emptyRow = () => ({ name: "", value: "", unit: "", ref_range: "" });

export default function ManualForm({ T, audience, language, api, plan, onClose, onRequestUpgrade }) {
  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const update = (i, field, val) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: val };
    setRows(next);
  };

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const submit = async () => {
    const filled = rows.filter(r => r.name.trim() && String(r.value).trim());
    if (!filled.length) {
      setError("Please add at least one test");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${api}/analyze/manual`, {
        tests: filled,
        audience,
        language,
        notes: notes || null,
      }, { timeout: 120000 });
      setResult(res.data);
      try { window.dispatchEvent(new CustomEvent("lab:analysis:success", { detail: { kind: "manual" } })); } catch (e) {}
    } catch (e) {
      setError(e?.response?.data?.detail || T.analyzer.error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setNotes("");
  };

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
    <div className="p-6 max-h-[80vh] overflow-y-auto" data-testid="manual-form">
      {!result && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="text-start p-2">{T.manual.name}</th>
                  <th className="text-start p-2">{T.manual.value}</th>
                  <th className="text-start p-2">{T.manual.unit}</th>
                  <th className="text-start p-2">{T.manual.range}</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="align-top" data-testid={`manual-row-${i}`}>
                    <td className="p-1.5"><Input value={r.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Hemoglobin" className="rounded-xl bg-white" data-testid={`manual-name-${i}`} /></td>
                    <td className="p-1.5"><Input value={r.value} onChange={(e) => update(i, "value", e.target.value)} placeholder="13.5" className="rounded-xl bg-white" data-testid={`manual-value-${i}`} /></td>
                    <td className="p-1.5"><Input value={r.unit} onChange={(e) => update(i, "unit", e.target.value)} placeholder="g/dL" className="rounded-xl bg-white" data-testid={`manual-unit-${i}`} /></td>
                    <td className="p-1.5"><Input value={r.ref_range} onChange={(e) => update(i, "ref_range", e.target.value)} placeholder="12-16" className="rounded-xl bg-white" data-testid={`manual-range-${i}`} /></td>
                    <td className="p-1.5">
                      {rows.length > 1 && (
                        <button onClick={() => removeRow(i)} className="text-slate-400 hover:text-rose-500 p-2" data-testid={`manual-remove-${i}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={addRow} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-600" data-testid="manual-add-row">
            <Plus className="w-4 h-4" /> {T.manual.addRow}
          </button>

          <div className="mt-5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{T.manual.notes}</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1.5 rounded-2xl bg-white" data-testid="manual-notes" />
          </div>

          {error && <p className="mt-4 text-sm text-rose-600" data-testid="manual-error">{error}</p>}

          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={onClose} className="rounded-full" data-testid="manual-cancel">
              <X className="w-4 h-4 me-1" /> Cancel
            </Button>
            <Button onClick={submit} disabled={loading} className="rounded-full bg-brand-500 hover:bg-brand-600 text-white px-6 h-11" data-testid="manual-submit">
              {loading ? (
                <><Loader2 className="w-4 h-4 me-2 animate-spin" /> {T.analyzer.analyzing}</>
              ) : (
                <><Sparkles className="w-4 h-4 me-2" /> {T.manual.submit}</>
              )}
            </Button>
          </div>
        </>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} data-testid="manual-result">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-600" />
            </div>
            <h4 className="font-bold text-lg text-slate-900">{T.analyzer.result}</h4>
          </div>
          <ResultDisplay interpretation={result.interpretation} T={T} plan={plan} onRequestUpgrade={onRequestUpgrade} />
          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={reset} className="rounded-full" data-testid="manual-new">{T.analyzer.new}</Button>
            <Button onClick={download} className="rounded-full bg-slate-900 hover:bg-brand-600 text-white" data-testid="manual-download">
              <Download className="w-4 h-4 me-2" /> {T.analyzer.download}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
