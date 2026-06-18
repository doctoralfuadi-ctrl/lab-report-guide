import React, { useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, RefreshCw, ShieldCheck, AlertTriangle, CreditCard, UserCog } from "lucide-react";
import { t as getT, LANGUAGES } from "../i18n";

const AR_BODY = {
  intro: "\u062a\u0646\u0638\u0651\u0645 \u0647\u0630\u0647 \u0627\u0644\u0628\u0646\u0648\u062f \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0644\u062e\u062f\u0645\u0629 MidScope. \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0644\u0644\u062e\u062f\u0645\u0629 \u0641\u0625\u0646\u0643 \u062a\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0645\u0627 \u064a\u0644\u064a:",
  sections: [
    { icon: ShieldCheck, title: "\u0661. \u0637\u0628\u064a\u0639\u0629 \u0627\u0644\u062e\u062f\u0645\u0629", text: "MidScope \u0623\u062f\u0627\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062a\u064a\u0629 \u0644\u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0639\u0644\u0649 \u0641\u0647\u0645 \u0646\u062a\u0627\u0626\u062c \u0627\u0644\u062a\u062d\u0627\u0644\u064a\u0644 \u0627\u0644\u0645\u062e\u062a\u0628\u0631\u064a\u0629. \u0627\u0644\u062e\u062f\u0645\u0629 \u0644\u064a\u0633\u062a \u0628\u062f\u064a\u0644\u0627\u064b \u0639\u0646 \u0627\u0633\u062a\u0634\u0627\u0631\u0629 \u0637\u0628\u064a\u0628 \u0645\u0631\u062e\u0651\u0635\u060c \u0648 \u0627\u0644\u0642\u0631\u0627\u0631\u0627\u062a \u0627\u0644\u0637\u0628\u064a\u0629 \u062a\u0628\u0642\u0649 \u062f\u0627\u0626\u0645\u0627\u064b \u0645\u0633\u0624\u0648\u0644\u064a\u0629 \u0637\u0628\u064a\u0628\u0643 \u0627\u0644\u0645\u0639\u0627\u0644\u062c." },
    { icon: RefreshCw, title: "\u0662. \u0627\u0644\u062a\u062c\u062f\u064a\u062f \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a", text: "\u0633\u064a\u062a\u0645 \u062a\u062c\u062f\u064a\u062f \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0643\u0644 \u0633\u0646\u0629 \u0645\u0627 \u0644\u0645 \u064a\u062a\u0645 \u0625\u0644\u063a\u0627\u0624\u0647 \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645.", highlight: true },
    { icon: UserCog, title: "\u0663. \u0627\u0644\u0625\u0644\u063a\u0627\u0621 \u0648 \u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u062a\u062c\u062f\u064a\u062f", text: "\u064a\u0645\u0643\u0646\u0643 \u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u062a\u062c\u062f\u064a\u062f \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a \u0641\u064a \u0623\u064a \u0648\u0642\u062a \u0645\u0646 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u062d\u0633\u0627\u0628\u0643 \u0623\u0648 \u0628\u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062f\u0639\u0645." },
    { icon: CreditCard, title: "\u0664. \u0627\u0644\u062f\u0641\u0639 \u0648 \u0627\u0644\u0639\u0645\u0644\u0629", text: "\u062a\u064f\u0639\u0631\u0636 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0628\u0627\u0644\u062f\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064a\u0643\u064a (USD) \u0623\u0648 \u0627\u0644\u062f\u064a\u0646\u0627\u0631 \u0627\u0644\u0639\u0631\u0627\u0642\u064a (IQD) \u062d\u0633\u0628 \u0627\u062e\u062a\u064a\u0627\u0631\u0643." },
    { icon: AlertTriangle, title: "\u0665. \u062d\u062f\u0648\u062f \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064a\u0629", text: "\u064a\u0628\u0630\u0644 MidScope \u0642\u0635\u0627\u0631\u0649 \u062c\u0647\u062f\u0647 \u0644\u062a\u0642\u062f\u064a\u0645 \u062a\u0641\u0633\u064a\u0631\u0627\u062a \u062f\u0642\u064a\u0642\u0629\u060c \u0625\u0644\u0627 \u0623\u0646\u0647 \u0644\u0627 \u064a\u064f\u0639\u062f\u0651 \u062a\u0634\u062e\u064a\u0635\u0627\u064b \u0637\u0628\u064a\u0627\u064b \u0631\u0633\u0645\u064a\u0627\u064b." },
    { icon: ShieldCheck, title: "\u0666. \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629 \u0648 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a", text: "\u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0645\u0634\u0641\u0631\u0629 \u0645\u0646 \u0637\u0631\u0641 \u0625\u0644\u0649 \u0637\u0631\u0641\u060c \u0648 \u0644\u0627 \u062a\u064f\u0628\u0627\u0639 \u0623\u0648 \u062a\u064f\u0634\u0627\u0631\u0643 \u0645\u0639 \u0623\u064a \u0637\u0631\u0641 \u062b\u0627\u0644\u062b." }
  ]
};

const EN_BODY = {
  intro: "These terms govern your use of MidScope. By using the service, you agree to the following:",
  sections: [
    { icon: ShieldCheck, title: "1. Nature of the Service", text: "MidScope is an informational tool designed to help you understand laboratory test results. It is not a substitute for a licensed physician." },
    { icon: RefreshCw, title: "2. Automatic Renewal", text: "The subscription will renew automatically every year unless cancelled by the user.", highlight: true },
    { icon: UserCog, title: "3. Cancellation", text: "You can disable automatic renewal at any time from your account settings or by contacting support." },
    { icon: CreditCard, title: "4. Payment & Currency", text: "Prices are displayed in US Dollars (USD) or Iraqi Dinars (IQD) according to your selection." },
    { icon: AlertTriangle, title: "5. Limitation of Liability", text: "MidScope strives to provide accurate interpretations, but the service does not constitute a formal medical diagnosis." },
    { icon: ShieldCheck, title: "6. Privacy & Data", text: "Your data is encrypted end-to-end and never sold or shared with third parties." }
  ]
};

export default function TermsOfUse() {
  const [searchParams] = useSearchParams();
  const langParam = searchParams.get("lang") || "ar";
  const T = useMemo(() => getT(langParam), [langParam]);
  const dir = LANGUAGES.find(l => l.code === langParam)?.dir || "ltr";
  const isAr = (T._locale || "ar") === "ar";
  const body = isAr ? AR_BODY : EN_BODY;
  const heading = isAr ? "\u0628\u0646\u0648\u062f \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645" : "Terms of Use";
  const updated = isAr ? "\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b" : "Last updated";

  useEffect(() => { document.documentElement.lang = langParam; document.documentElement.dir = dir; }, [langParam, dir]);

  return (
    <div className="min-h-screen bg-[#FDFBF6] py-12 px-6" data-testid="terms-page" dir={dir}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-600 mb-6" data-testid="terms-back"><ArrowLeft className="w-4 h-4" /> {isAr ? "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629" : "Back to home"}</Link>
        <div className="flex items-center gap-3 mb-2"><div className="w-12 h-12 rounded-2xl bg-pomegranate-500 flex items-center justify-center shadow-lg shadow-pomegranate-500/30"><FileText className="w-6 h-6 text-white" /></div><div><h1 className="font-display font-extrabold text-3xl">{heading}</h1><div className="text-xs text-slate-500">{updated}: {new Date().toLocaleDateString(isAr ? "ar-SA-u-ca-gregory" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</div></div></div>
        <hr className="accent-line-thin" />
        <p className="text-slate-700 leading-relaxed mb-8 text-base">{body.intro}</p>
        <div className="space-y-4">{body.sections.map((s, i) => (<section key={i} className={`rounded-3xl p-6 lg:p-7 border ${s.highlight ? "border-2 border-pomegranate-300 bg-gradient-to-br from-pomegranate-50 via-white to-amber-50/40" : "border-brand-100 bg-white"}`} data-testid={`terms-section-${i + 1}`}><div className="flex items-start gap-4"><div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.highlight ? "bg-pomegranate-500 text-white shadow-lg shadow-pomegranate-500/30" : "bg-brand-50 text-brand-700"}`}><s.icon className="w-5 h-5" strokeWidth={2.2} /></div><div><h3 className="font-display font-bold text-lg text-slate-900 mb-2">{s.title}</h3><p className="text-slate-700 leading-relaxed text-sm lg:text-base">{s.text}</p>{s.highlight && (<div className="mt-3 inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-pomegranate-500 text-white text-[11px] font-bold tracking-widest uppercase"><RefreshCw className="w-3 h-3" /> {isAr ? "\u0645\u064a\u0632\u0629 \u0645\u0647\u0645\u0651\u0629" : "Important policy"}</div>)}</div></div></section>))}</div>
        <p className="mt-12 text-[11px] text-slate-500 text-center">\u00a9 {new Date().getFullYear()} MidScope</p>
      </div>
    </div>
  );
}
