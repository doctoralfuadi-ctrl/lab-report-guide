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
    accent: "pomegranate",
    features: [
      { Icon: FlaskConical, en: "Unlimited lab analyses", ar: "تحاليل غير محدودة" },
      { Icon: ScanLine, en: "Image, PDF, manual entry", ar: "صور، PDF، إدخال يدوي" },
      { Icon: Sparkles, en: "Multi-language interpretation", ar: "تفسير متعدد اللغات" },
      { Icon: ShieldCheck, en: "Tests Guide & reminders", ar: "دليل التحاليل و التذكيرات" },
    ],
  },
  premium: {
    eyebrowEn: "PREMIUM PLAN",
    eyebrowAr: "الباقة بريميوم",
    titleEn: "Specialty-grade analyses + radiology",
    titleAr: "تحاليل متخصّصة + الأشعّة",
    icon: Droplet,
    accent: "pomegranate",
    features: [
      { Icon: Microscope, en: "Microbiology & antibiotic sensitivity", ar: "الزرع و الحساسية للمضادات" },
      { Icon: Dna, en: "Genetics & Karyotype", ar: "التحاليل الجينية و الكروموسومات" },
      { Icon: ScanLine, en: "Radiology & Sonar", ar: "الأشعّة و السونار" },
      { Icon: FileText, en: "Histopathology & Cytology", ar: "الباثولوجي و الخلايا" },
      { Icon: Activity, en: "Immunology & serology", ar: "المناعة و المصلية" },
    ],
  },
  royal: {
    eyebrowEn: "ROYAL PLAN · FOR DOCTORS",
    eyebrowAr: "الباقة الملكية · للأطباء",
    titleEn: "A complete clinical platform for doctors & clinics",
    titleAr: "منصّة سريرية متكاملة للأطباء و العيادات",
    icon: Gem,
    accent: "cyan",
    features: [
      { Icon: Users, en: "Clinic & patient records management", ar: "إدارة العيادة و ملفات المرضى" },
      { Icon: Brain, en: "Clinical AI assistant", ar: "المساعد السريري الذكي" },
      { Icon: MessageCircle, en: "In-app doctor\u2013patient chat", ar: "محادثة طبيب\u2014مريض داخل التطبيق" },
      { Icon: FileText, en: "Professional clinical reports", ar: "تقارير سريرية احترافية" },
      { Icon: HeartPulse, en: "Full Radiology, Sonar & ECG access", ar: "وصول كامل لـ الأشعّة و السونار و ECG" },
      { Icon: ShieldCheck, en: "Doctor API & integrations", ar: "API للأطباء و التكاملات" },
    ],
  },
};

export default function PlanShowcase({ T, lang, onSubscribe }) {
  const isAr = lang === "ar";
  const heading = isAr ? "تفاصيل كل باقة" : "Plan details & specifications";
  const sub = isAr ? "اكتشف ما يقدمه كل مستوى." : "See what each tier unlocks.";
  return (
    <section id="plan-showcase" className="relative py-20 lg:py-28 overflow-hidden" data-testid="plan-showcase-section">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="mt-4 font-display font-extrabold text-3xl lg:text-5xl tracking-tight text-slate-900">{heading}</h2>
          <p className="mt-3.5 text-slate-600 text-sm lg:text-base max-w-2xl mx-auto">{sub}</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6" data-testid="plan-grid">
          {["standard","premium","royal"].map(key => {
            const plan = PLAN_DETAILS[key];
            const isRoyal = key === "royal";
            return (
              <div key={key} className={`rounded-3xl border overflow-hidden flex flex-col ${isRoyal ? "bg-gradient-to-br from-white via-cyan-50/30 to-cyan-100/40 border-cyan-200" : "bg-white border-pomegranate-100"}`} data-testid={`plan-row-${key}`}>
                <div className="p-6 lg:p-7 flex flex-col items-center text-center border-b border-slate-100">
                  <div className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${isRoyal ? "text-cyan-700" : "text-pomegranate-700"}`}>{isAr ? plan.eyebrowAr : plan.eyebrowEn}</div>
                  <h3 className="font-display font-extrabold text-lg lg:text-xl text-slate-900 mt-1.5">{isAr ? plan.titleAr : plan.titleEn}</h3>
                </div>
                <div className="p-6 lg:p-7 flex-1">
                  <div className="space-y-3">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl bg-pomegranate-50/40 border border-pomegranate-100">
                        <f.Icon className="w-4 h-4" />
                        <span className="font-bold text-[13px] text-slate-900">{isAr ? f.ar : f.en}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => onSubscribe && onSubscribe(key)} className="rounded-full h-11 px-6 w-full mt-5">
                    {T.pricing[key].cta}
                    <ArrowRight className={`w-4 h-4 ms-2 ${isAr ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
