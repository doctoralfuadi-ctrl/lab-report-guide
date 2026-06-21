import React, { useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, RefreshCw, ShieldCheck, AlertTriangle, CreditCard, UserCog } from "lucide-react";
import { t as getT, LANGUAGES } from "../i18n";

const AR_BODY = {
  intro: "تنظّم هذه البنود استخدامك لخدمة MidScope. باستخدامك للخدمة فإنك توافق على ما يلي:",
  sections: [
    {
      icon: ShieldCheck,
      title: "١. طبيعة الخدمة",
      text: "MidScope أداة معلوماتية لمساعدتك على فهم نتائج التحاليل المختبرية. الخدمة ليست بديلاً عن استشارة طبيب مرخّص، و القرارات الطبية تبقى دائماً مسؤولية طبيبك المعالج."
    },
    {
      icon: RefreshCw,
      title: "٢. التجديد التلقائي",
      text: "سيتم تجديد الاشتراك تلقائياً كل سنة ما لم يتم إلغاؤه من قبل المستخدم. يتم خصم قيمة الاشتراك السنوي ($5 / 5,000 د.ع للأساسية أو $10 / 10,000 د.ع لبريميوم) من وسيلة الدفع المسجّلة في تاريخ التجديد، إلا إذا قمت بإيقاف التجديد قبل ذلك التاريخ.",
      highlight: true
    },
    {
      icon: UserCog,
      title: "٣. الإلغاء و إيقاف التجديد",
      text: "يمكنك إيقاف التجديد التلقائي في أي وقت من إعدادات حسابك أو بالتواصل مع الدعم. عند الإلغاء، تبقى ميزات الاشتراك متاحة لك حتى نهاية الفترة المدفوعة الحالية، و لا يتم تجديد الاشتراك بعدها."
    },
    {
      icon: CreditCard,
      title: "٤. الدفع و العملة",
      text: "تُعرض الأسعار بالدولار الأمريكي (USD) أو الدينار العراقي (IQD) حسب اختيارك. تُحتسب جميع المعاملات وفق الأسعار المعلنة وقت بدء الاشتراك أو وقت التجديد."
    },
    {
      icon: AlertTriangle,
      title: "٥. حدود المسؤولية",
      text: "يبذل MidScope قصارى جهده لتقديم تفسيرات دقيقة، إلا أنه لا يُعدّ تشخيصاً طبياً رسمياً. لا تتحمّل الشركة أي مسؤولية عن قرارات طبية تُتّخذ بناءً على المحتوى دون استشارة طبيب."
    },
    {
      icon: ShieldCheck,
      title: "٦. الخصوصية و البيانات",
      text: "بياناتك مشفّرة من طرف إلى طرف، و لا تُباع أو تُشارك مع أي طرف ثالث. ميزة \"مشاركة الملف الصحي\" تنشئ روابط مؤقتة (٣٠ يوماً) لا يفتحها إلا من تعطيه الرابط."
    }
  ]
};

const EN_BODY = {
  intro: "These terms govern your use of MidScope. By using the service, you agree to the following:",
  sections: [
    {
      icon: ShieldCheck,
      title: "1. Nature of the Service",
      text: "MidScope is an informational tool designed to help you understand laboratory test results. It is not a substitute for a licensed physician, and clinical decisions remain the responsibility of your treating doctor."
    },
    {
      icon: RefreshCw,
      title: "2. Automatic Renewal",
      text: "The subscription will renew automatically every year unless cancelled by the user. The annual fee ($5 / 5,000 IQD for Standard, or $10 / 10,000 IQD for Premium) will be charged to your stored payment method on the renewal date, unless you turn off automatic renewal before that date.",
      highlight: true
    },
    {
      icon: UserCog,
      title: "3. Cancellation",
      text: "You can disable automatic renewal at any time from your account settings or by contacting support. Upon cancellation, subscription features remain available until the end of your current paid period; the subscription will not renew after that date."
    },
    {
      icon: CreditCard,
      title: "4. Payment & Currency",
      text: "Prices are displayed in US Dollars (USD) or Iraqi Dinars (IQD) according to your selection. All charges are processed at the rates shown at the time of subscription start or renewal."
    },
    {
      icon: AlertTriangle,
      title: "5. Limitation of Liability",
      text: "MidScope strives to provide accurate interpretations, but the service does not constitute a formal medical diagnosis. The company is not liable for clinical decisions taken based on the content without consulting a physician."
    },
    {
      icon: ShieldCheck,
      title: "6. Privacy & Data",
      text: "Your data is encrypted end-to-end and never sold or shared with third parties. The \"Share Health File\" feature creates time-limited links (30 days) accessible only to recipients you choose."
    }
  ]
};

export default function TermsOfUse() {
  const [searchParams] = useSearchParams();
  const langParam = searchParams.get("lang") || "ar";
  const T = useMemo(() => getT(langParam), [langParam]);
  const dir = LANGUAGES.find(l => l.code === langParam)?.dir || "ltr";
  const isAr = (T._locale || "ar") === "ar";
  const body = isAr ? AR_BODY : EN_BODY;
  const heading = isAr ? "بنود الاستخدام" : "Terms of Use";
  const updated = isAr ? "آخر تحديث" : "Last updated";

  useEffect(() => {
    document.documentElement.lang = langParam;
    document.documentElement.dir = dir;
  }, [langParam, dir]);

  return (
    <div className="min-h-screen bg-[#FDFBF6] py-12 px-6" data-testid="terms-page" dir={dir}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-600 mb-6" data-testid="terms-back">
          <ArrowLeft className="w-4 h-4" /> {isAr ? "العودة إلى الصفحة الرئيسية" : "Back to home"}
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-pomegranate-500 flex items-center justify-center shadow-lg shadow-pomegranate-500/30">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-3xl">{heading}</h1>
            <div className="text-xs text-slate-500">{updated}: {new Date().toLocaleDateString(isAr ? "ar-SA-u-ca-gregory" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>
        <hr className="accent-line-thin" />
        <p className="text-slate-700 leading-relaxed mb-8 text-base">{body.intro}</p>

        <div className="space-y-4">
          {body.sections.map((s, i) => (
            <section
              key={i}
              className={`rounded-3xl p-6 lg:p-7 border ${s.highlight ? "border-2 border-pomegranate-300 bg-gradient-to-br from-pomegranate-50 via-white to-amber-50/40" : "border-brand-100 bg-white"}`}
              data-testid={`terms-section-${i + 1}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.highlight ? "bg-pomegranate-500 text-white shadow-lg shadow-pomegranate-500/30" : "bg-brand-50 text-brand-700"}`}>
                  <s.icon className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-700 leading-relaxed text-sm lg:text-base">{s.text}</p>
                  {s.highlight && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-pomegranate-500 text-white text-[11px] font-bold tracking-widest uppercase">
                      <RefreshCw className="w-3 h-3" /> {isAr ? "ميزة مهمّة" : "Important policy"}
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-[11px] text-slate-500 text-center">
          © {new Date().getFullYear()} MidScope
        </p>
      </div>
    </div>
  );
}
