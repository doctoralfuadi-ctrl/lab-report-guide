import React, { useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Sparkles, Beaker, CreditCard, Loader2, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TIER_META = {
  standard: { Icon: Beaker, label: "Standard", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200", gradient: "from-teal-400 to-teal-600" },
  premium:  { Icon: Sparkles, label: "Premium",  color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", gradient: "from-amber-400 to-amber-600" },
  royal:    { Icon: Crown, label: "Royal",    color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", gradient: "from-cyan-500 to-cyan-700" },
};

export default function ManageSubscription({ plan, T, lang = "en" }) {
  const isAr = lang === "ar";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [portalUrl, setPortalUrl] = useState(null);
  const [error, setError] = useState(null);

  const tier = TIER_META[plan] || TIER_META.standard;
  const TierIcon = tier.Icon;

  const handleManage = async () => {
    if (!email.trim()) return;
    setLoading(true); setError(null); setPortalUrl(null);
    try {
      const res = await axios.post(`${API}/stripe/portal`, { email: email.trim() });
      if (res.data?.url) { setPortalUrl(res.data.url); }
      else { setError(isAr ? "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0634\u062a\u0631\u0627\u0643 \u0644\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064a\u062f" : "No subscription found for this email."); }
    } catch (e) {
      setError(e?.response?.data?.detail || (isAr ? "\u062d\u062f\u062b \u062e\u0637\u0623" : "Something went wrong."));
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6" data-testid="manage-subscription">
      <Card className="rounded-3xl border-brand-100 p-6 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg`}>
            <TierIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-slate-900">{isAr ? "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643" : "Manage Subscription"}</div>
            <div className={`text-xs font-semibold ${tier.color}`}>{tier.label} Plan</div>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          {isAr ? "\u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0644\u0644\u0648\u0635\u0648\u0644 \u0644\u0628\u0648\u0627\u0628\u0629 Stripe" : "Enter your email to access your Stripe billing portal."}
        </p>

        <div className="flex gap-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isAr ? "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" : "your@email.com"}
            className="flex-1 rounded-xl"
            data-testid="manage-email-input"
          />
          <Button
            onClick={handleManage}
            disabled={!email.trim() || loading}
            className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-5"
            data-testid="manage-submit"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          </Button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-center gap-2 text-sm text-rose-600">
            <AlertTriangle className="w-4 h-4" /> {error}
          </motion.div>
        )}

        {portalUrl && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-2">
              <CheckCircle className="w-4 h-4" /> {isAr ? "\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0634\u062a\u0631\u0627\u0643\u0643" : "Subscription found!"}
            </div>
            <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-800 hover:text-emerald-600 font-medium underline underline-offset-2" data-testid="manage-portal-link">
              <ExternalLink className="w-3.5 h-3.5" /> {isAr ? "\u0627\u0641\u062a\u062d \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631" : "Open Billing Portal"}
            </a>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
