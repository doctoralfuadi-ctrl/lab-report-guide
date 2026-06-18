import React, { useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RotateCw, Search, ShieldCheck, XCircle, Calendar, Mail, Loader2, Crown } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fmtDate = (iso, locale) => {
  try { return new Date(iso).toLocaleDateString(locale || "en"); } catch { return iso; }
};

export default function ManageSubscription({ T, lang }) {
  const M = (T && T.manage) || {};
  const [email, setEmail] = useState("");
  const [sub, setSub] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const locale = lang === "ar" ? "ar" : "en";

  const lookup = async (e) => {
    if (e) e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error(M.invalidEmail || "Please enter a valid email");
      return;
    }
    setLoading(true);
    setNotFound(false);
    setSub(null);
    try {
      const res = await axios.get(`${API}/subscriptions/by-email/${encodeURIComponent(email)}`);
      if (res.data.found) setSub(res.data.subscription);
      else setNotFound(true);
    } catch {
      toast.error(M.error || "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const cancelAutoRenew = async () => {
    setCancelling(true);
    try {
      const res = await axios.post(`${API}/subscriptions/cancel-by-email`, { email });
      setSub(res.data.subscription);
      toast.success(M.cancelSuccess || "Auto-renewal disabled");
    } catch (err) {
      toast.error(err?.response?.data?.detail || M.error || "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <section id="manage" className="py-20 lg:py-24 bg-white" data-testid="manage-section">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-8">
          <span className="accent-line mx-auto" />
          <h2 className="font-display font-extrabold text-2xl lg:text-4xl tracking-tight text-slate-900">
            {M.title || "Manage your subscription"}
          </h2>
          <p className="mt-3 text-slate-600 text-sm lg:text-base leading-relaxed max-w-xl mx-auto">
            {M.subtitle || "Look up your subscription by email to view status, next renewal date, and cancel auto-renewal at any time."}
          </p>
        </div>

        <Card className="rounded-3xl p-6 lg:p-8 border-brand-100" data-testid="manage-card">
          <form onSubmit={lookup} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={M.emailPlaceholder || "you@example.com"}
                className="h-12 rounded-full ps-10 border-brand-200 focus:border-brand-500"
                data-testid="manage-email-input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-slate-900 hover:bg-brand-600 text-white h-12 px-6"
              data-testid="manage-lookup-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 me-2" />}
              {M.lookup || "Look up"}
            </Button>
          </form>

          {notFound && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700" data-testid="manage-not-found">
              {M.notFound || "No subscription found for this email."}
            </div>
          )}

          {sub && (
            <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/30 p-6" data-testid="manage-result">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-700 font-bold mb-1">
                    {sub.plan === "premium" ? T.pricing.premium.name : T.pricing.standard.name}
                    {sub.plan === "premium" && <Crown className="inline w-3 h-3 ms-1.5 text-amber-500" />}
                  </div>
                  <div className="font-display font-bold text-lg text-slate-900" data-testid="manage-status">
                    {sub.status === "active" ? (M.statusActive || "Active") : (M.statusCancelled || "Cancelled")}
                  </div>
                  <div className="mt-1 text-xs text-slate-500" data-testid="manage-email">{sub.email}</div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 h-7 rounded-full ${
                    sub.autoRenew
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                  data-testid="manage-autorenew-badge"
                >
                  <RotateCw className="w-3 h-3" />
                  {sub.autoRenew ? (M.autoRenewOn || "Auto-renew ON") : (M.autoRenewOff || "Auto-renew OFF")}
                </span>
              </div>

              <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
                <Row
                  icon={<Calendar className="w-4 h-4 text-brand-600" />}
                  k={M.startedAt || "Started on"}
                  v={fmtDate(sub.startedAt, locale)}
                  testid="manage-started"
                />
                <Row
                  icon={<RotateCw className="w-4 h-4 text-brand-600" />}
                  k={sub.autoRenew ? (M.nextRenewal || "Next auto-renewal") : (M.accessUntil || "Access until")}
                  v={fmtDate(sub.nextRenewalAt, locale)}
                  testid="manage-next"
                />
              </div>

              {sub.status === "active" && sub.autoRenew && (
                <div className="mt-6 pt-5 border-t border-brand-100">
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {M.cancelInfo || "Disabling auto-renewal keeps your premium access until the end of your paid period — no fees, no questions asked."}
                  </p>
                  <Button
                    onClick={cancelAutoRenew}
                    disabled={cancelling}
                    variant="outline"
                    className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300"
                    data-testid="manage-cancel-btn"
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <XCircle className="w-4 h-4 me-2" />}
                    {M.cancelCta || "Cancel auto-renewal"}
                  </Button>
                </div>
              )}

              {sub.status === "active" && !sub.autoRenew && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900" data-testid="manage-cancelled-notice">
                  <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                  <span>{(M.cancelConfirmed || "Auto-renewal is disabled. You retain full access until")} <strong>{fmtDate(sub.nextRenewalAt, locale)}</strong>.</span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

function Row({ icon, k, v, testid }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white border border-brand-100 px-4 py-3" data-testid={testid}>
      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{k}</div>
        <div className="text-sm font-semibold text-slate-900 truncate">{v}</div>
      </div>
    </div>
  );
}
