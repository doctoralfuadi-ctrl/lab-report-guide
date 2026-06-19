import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Gem, Droplet, Stethoscope, Brain, MessageCircle, FileText, Activity,
  Users, ShieldCheck, ChevronDown, Sparkles, FlaskConical, ScanLine, HeartPulse,
  Microscope, Dna, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAN_DETAILS = {
  standard: {
    eyebrowEn: "STANDARD PLAN",
    eyebrowAr: "الباقة الأساسية",
    titleEn: "Everything you need to interpret your lab results",
    titleAr: "كل ما تحتاجه لفهم نتائج تحاليلك",
    icon: Droplet,
    iconStyle: "bg-gradient-to-br from-pomegranate-500 to-pomegranate-700 text-white shadow-lg shadow-pomegranate-500/30",
    accent: "pomegranate",
    features: [
      { Icon: FlaskConical, en: "Unlimited lab analyses", ar: "تحاليل غير محدودة", descEn: "Upload as many CBC, chemistry, hormone reports as you need.", descAr: "ارفع أي عدد من تقارير CBC و الكيمياء و الهرمونات." },
      { Icon: ScanLine, en: "Image, PDF, manual entry", ar: "صور، PDF، إدخال يدوي", descEn: "Accept any input format from the lab.", descAr: "يقبل أي صيغة إدخال من المختبر." },
      { Icon: Sparkles, en: "Multi-language interpretation", ar: "تفسير متعدد اللغات", descEn: "Full clinical insight in 40+ languages.", descAr: "تفسير سريري متكامل بأكثر من 40 لغة." },
      { Icon: ShieldCheck, en: "Tests Guide & reminders", ar: "دليل التحاليل و التذكيرات", descEn: "Periodic reminders curated by clinical guidelines.", descAr: "تذكيرات دورية وفق الإرشادات السريرية." },
    ],
  },
  premium: {
    eyebrowEn: "PREMIUM PLAN",
    eyebrowAr: "الباقة بريميوم",
    titleEn: "Specialty-grade analyses + radiology",
    titleAr: "تحاليل متخصّصة + الأشعّة",
    icon: Droplet,
    iconStyle: "bg-gradient-to-br from-pomegranate-500 to-pomegranate-700 text-white shadow-lg shadow-pomegranate-500/40 ring-2 ring-amber-300",
    accent: "pomegranate",
    features: [
      { Icon: Microscope, en: "Microbiology & antibiotic sensitivity", ar: "الزرع و الحساسية للمضادات", descEn: "Targeted antibiotic suggestions per culture report.", descAr: "اقتراح المضاد الحيوي المستهدف حسب الزرع." },
      { Icon: Dna, en: "Genetics & Karyotype", ar: "التحاليل الجينية و الكروموسومات", descEn: "Cytogenetic analysis of chromosomal patterns.", descAr: "تحليل وراثي خلوي للأنماط الكروموسومية." },
      { Icon: ScanLine, en: "Radiology & Sonar", ar: "الأشعّة و السونار", descEn: "Ultrasound, X-ray, MRI, CT image interpretation.", descAr: "تفسير صور السونار و الأشعّة و الرنين." },
      { Icon: FileText, en: "Histopathology & Cytology", ar: "الباثولوجي و الخلايا", descEn: "Tissue and cellular pathology reports.", descAr: "تفسير تقارير علم الأنسجة و الخلايا." },
      { Icon: Activity, en: "Immunology & serology", ar: "المناعة و المصلية", descEn: "ANA, CRP, RF, antibody panels.", descAr: "ANA, CRP, RF، لوحات الأجسام المضادة." },
    ],
  },
  royal: {
    eyebrowEn: "ROYAL PLAN \u00b7 FOR DOCTORS",
    eyebrowAr: "الباقة الملكية \u00b7 للأطباء",
    titleEn: "A complete clinical platform for doctors & clinics",
    titleAr: "منصّة سريرية متكاملة للأطباء و العيادات",
    icon: Gem,
    iconStyle: "bg-gradient-to-br from-white via-cyan-50 to-cyan-200 text-cyan-700 ring-2 ring-cyan-300 shadow-2xl shadow-cyan-500/30",
    accent: "cyan",
    features: [
      { Icon: Users, en: "Clinic & patient records management", ar: "إدارة العيادة و ملفات المرضى", descEn: "Centralized profiles, visit history, vitals, and shared lab archives for every patient under your care.", descAr: "ملفات مركزية، سجل الزيارات، العلامات الحيوية، و أرشيف تحاليل مشترك لكل مريض تتابعه." },
      { Icon: Brain, en: "Clinical AI assistant", ar: "المساعد السريري الذكي", descEn: "Drug interactions, side-effect mapping, dose adjustments by kidney/liver function, and differential diagnosis suggestions \u2014 all backed by clinical literature.", descAr: "تفاعلات الأدوية، رسم الآثار الجانبية، تعديل الجرعات حسب وظائف الكلى/الكبد، و اقتراح التشخيص التفريقي \u2014 مدعومة بالأدبيات السريرية." },
      { Icon: MessageCircle, en: "In-app doctor\u2013patient chat", ar: "محادثة طبيب\u2014مريض داخل التطبيق", descEn: "Secure encrypted messaging, attach lab/imaging, write prescriptions, and follow up between visits.", descAr: "مراسلة مشفّرة آمنة، إرفاق تحاليل/أشعّة، كتابة وصفات، و متابعة بين الزيارات." },
      { Icon: FileText, en: "Professional clinical reports", ar: "تقارير سريرية احترافية", descEn: "Printable, branded reports with your clinic letterhead \u2014 share with referring physicians or insurance.", descAr: "تقارير قابلة للطباعة بعلامة عيادتك \u2014 للمشاركة مع الزملاء أو شركات التأمين." },
      { Icon: HeartPulse, en: "Full Radiology, Sonar & ECG access", ar: "وصول كامل لـ الأشعّة و السونار و ECG", descEn: "Every diagnostic module unlocked at the highest tier.", descAr: "كل الوحدات التشخيصية مفتوحة في أعلى مستوى." },
      { Icon: ShieldCheck, en: "Doctor API & integrations", ar: "API للأطباء و التكاملات", descEn: "Connect your EMR, lab system, or scheduling tool via REST API with HIPAA-grade audit logs.", descAr: "اربط نظام EMR أو المختبر أو الجدولة عبر REST API مع سجلات تدقيق طبية." },
    ],
  },
};

export default function PlanShowcase({ T, lang, onSubscribe }) {
  const isAr = lang === "ar";

  const heading = isAr ? "تفاصيل كل باقة" : "Plan details & specifications";
  const sub = isAr
    ? "اكتشف ما يقدمه كل مستوى \u2014 بياناتك، عيادتك، و سير عملك كلها مغطّة."
    : "See what each tier unlocks \u2014 your data, your clinic, your workflow \u2014 all covered.";

  return (
    <section id="plan-showcase" className="relative py-20 lg:py-28 overflow-hidden" data-testid="plan-showcase-section">
      <div aria-hidden="true" className="ambient-pomegranate" style={{ top: "-10%", insetInlineStart: "-15%" }} />
      <div aria-hidden="true" className="ambient-cyan" style={{ bottom: "-10%", insetInlineEnd: "-15%" }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 h-7 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bold tracking-widest uppercase border border-cyan-200">
            <Sparkles className="w-3 h-3" /> {isAr ? "المواصفات الكاملة" : "Full specifications"}
          </div>
          <h2 className="mt-4 font-display font-extrabold text-3xl lg:text-5xl tracking-tight text-slate-900">
            {heading}
          </h2>
          <p className="mt-3.5 text-slate-600 text-sm lg:text-base max-w-2xl mx-auto leading-relaxed">
            {sub}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6" data-testid="plan-grid">
          {["standard", "premium", "royal"].map((key) => {
            const plan = PLAN_DETAILS[key];
            const isRoyal = key === "royal";
            return (
              <div
                key={key}
                className={`rounded-3xl border overflow-hidden flex flex-col ${
                  isRoyal
                    ? "bg-gradient-to-br from-white via-cyan-50/30 to-cyan-100/40 border-cyan-200 shadow-xl shadow-cyan-500/10 ring-1 ring-white/70 backdrop-blur-md"
                    : "bg-white border-pomegranate-100"
                }`}
                data-testid={`plan-row-${key}`}
                id={`plan-${key}`}
              >
                <div className="p-6 lg:p-7 flex flex-col items-center text-center border-b border-slate-100">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img
                      src={
                        key === "royal"
                          ? "https://static.prod-images.emergentagent.com/jobs/69c0dde6-05eb-4a75-a010-678f647e99fd/images/020e5dd86fa7b2ed621cfd52308b83ffe7fac2dd5574e37270c95179e6bf3b93.png"
                          : key === "premium"
                            ? "https://static.prod-images.emergentagent.com/jobs/69c0dde6-05eb-4a75-a010-678f647e99fd/images/9c72654fc8b7e45c13ea08361191d37531bd253034687be102c2ef6ea728190b.png"
                            : "https://customer-assets.emergentagent.com/wingman/69c0dde6-05eb-4a75-a010-678f647e99fd/attachments/836702af3a4447eca15a8f7a0dbdde6e_image.bin"
                      }
                      alt={`${key} tier crystalline icon`}
                      className="w-20 h-20 object-contain drop-shadow-lg"
                      draggable={false}
                    />
                  </div>
                  <div className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${isRoyal ? "text-cyan-700" : "text-pomegranate-700"}`}>
                    {isAr ? plan.eyebrowAr : plan.eyebrowEn}
                  </div>
                  <h3 className="font-display font-extrabold text-lg lg:text-xl tracking-tight text-slate-900 mt-1.5">
                    {isAr ? plan.titleAr : plan.titleEn}
                  </h3>
                  <div className={`mt-4 ${isRoyal ? "text-cyan-900" : "text-slate-900"}`}>
                    <span className="font-display font-extrabold text-4xl num">${T.pricing[key].priceYearly}</span>
                    <span className="text-sm text-slate-500 ms-1">{isAr ? "/ \u0633\u0646\u0629" : "/ year"}</span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full bg-emerald-50 border border-emerald-200">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase">{isAr ? "\u0633\u0646\u0648\u064a" : "YEARLY"}</span>
                  </div>
                </div>

                <div className="p-6 lg:p-7 flex-1" data-testid={`plan-content-${key}`}>
                  <div className="space-y-3">
                    {plan.features.map((f, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 p-3 rounded-xl ${isRoyal ? "bg-white/70 border border-cyan-100" : "bg-pomegranate-50/40 border border-pomegranate-100"}`}
                        data-testid={`plan-feature-${key}-${i}`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isRoyal ? "bg-cyan-100 text-cyan-700" : "bg-pomegranate-100 text-pomegranate-700"}`}>
                          <f.Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display font-bold text-[13px] text-slate-900 leading-tight">
                            {isAr ? f.ar : f.en}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                            {isAr ? f.descAr : f.descEn}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex justify-center">
                    <Button
                      onClick={() => {
                        const el = document.getElementById("pricing");
                        el?.scrollIntoView({ behavior: "smooth" });
                        onSubscribe && onSubscribe(key);
                      }}
                      className={`rounded-full h-11 px-6 w-full ${isRoyal ? "bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-700 hover:to-cyan-900 text-white shadow-lg shadow-cyan-500/30" : "bg-gradient-to-r from-pomegranate-600 to-pomegranate-800 hover:from-pomegranate-700 hover:to-pomegranate-900 text-white shadow-lg shadow-pomegranate-500/30"}`}
                      data-testid={`plan-subscribe-${key}`}
                    >
                      {isRoyal && <Crown className="w-4 h-4 me-2" />}
                      {T.pricing[key].cta}
                      <ArrowRight className={`w-4 h-4 ms-2 ${isAr ? "rotate-180" : ""}`} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
