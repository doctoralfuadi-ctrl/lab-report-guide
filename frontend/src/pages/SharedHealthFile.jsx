import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import MidScopeIcon from "../components/MidScopeIcon";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function fmtDate(iso) { try { return new Date(iso).toLocaleDateString(); } catch { return iso; } }

export default function SharedHealthFile() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/health-file/shared/${token}`);
        setData(res.data);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load");
      } finally { setLoading(false); }
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FDFBF6] py-12 px-6" data-testid="shared-health-page">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-600 mb-6" data-testid="shared-back">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <MidScopeIcon className="w-7 h-7" color="white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-display font-extrabold text-2xl">MidScope — Shared Health File</div>
            {data?.expiresAt && <div className="text-xs text-slate-500">Valid until {fmtDate(data.expiresAt)}</div>}
          </div>
        </div>
        <hr className="accent-line-thin" />
        {loading && <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>}
        {error && (<div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 flex items-start gap-3 text-rose-800" data-testid="shared-error"><AlertTriangle className="w-5 h-5 mt-0.5" /> <span>{error}</span></div>)}
        {data && (
          <div className="space-y-5" data-testid="shared-labels">
            {(!data.labels || data.labels.length === 0) && <p className="text-slate-500">No entries shared.</p>}
            {data.labels?.map((l) => (
              <div key={l.label} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm" data-testid={`shared-label-${l.label}`}>
                <div className="flex items-end justify-between flex-wrap gap-3 mb-3">
                  <div><div className="font-display font-bold text-lg text-slate-900">{l.label}</div><div className="text-[11px] text-slate-500">{l.count} entries {l.unit ? `· ${l.unit}` : ""}</div></div>
                  {l.latest && (<div className="text-end"><div className="text-[10px] text-slate-500 uppercase tracking-wider">Latest</div><div className="font-display font-bold text-xl text-slate-900">{l.latest.value} <span className="text-xs text-slate-500">{l.unit || ""}</span></div></div>)}
                </div>
                <table className="w-full text-sm"><thead><tr className="text-start text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-brand-100"><th className="text-start py-2">Date</th><th className="text-start py-2">Value</th><th className="text-start py-2">Ref Range</th></tr></thead><tbody>{l.series.slice().reverse().map((s, i) => (<tr key={i} className="border-b border-brand-50 last:border-0"><td className="py-2 text-slate-600">{s.date}</td><td className="py-2 font-semibold text-slate-900">{s.value} {l.unit || ""}</td><td className="py-2 text-slate-500 text-xs">{s.refLow ?? ""}{s.refHigh != null ? ` – ${s.refHigh}` : ""}</td></tr>))}</tbody></table>
              </div>
            ))}
          </div>
        )}
        <p className="mt-12 text-[11px] text-slate-500 text-center">This view is read-only and was shared by the patient. Not a substitute for clinical evaluation.</p>
      </div>
    </div>
  );
}
