import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Phone, Video, Mic, Image as ImageIcon, Send, Crown, Sparkles,
  Stethoscope, ArrowRight, Lock, X, PhoneOff, VideoOff, Square, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SPECIALTY_LABELS = {
  cardiology:        { en: "Cardiology",         ar: "أمراض القلب" },
  endocrinology:     { en: "Endocrinology",      ar: "الغدد الصمّاء" },
  hematology:        { en: "Hematology",         ar: "أمراض الدم" },
  nephrology:        { en: "Nephrology",         ar: "أمراض الكلى" },
  hepatology:        { en: "Hepatology",         ar: "أمراض الكبد" },
  rheumatology:      { en: "Rheumatology",       ar: "الروماتيزم" },
  gastroenterology:  { en: "Gastroenterology",   ar: "الجهاز الهضمي" },
  pulmonology:       { en: "Pulmonology",        ar: "الجهاز التنفسي" },
  neurology:         { en: "Neurology",          ar: "الأعصاب" },
  urology:           { en: "Urology",            ar: "المسالك البولية" },
  obgyn:             { en: "OB/GYN",             ar: "النشاء و التوليد" },
  dermatology:       { en: "Dermatology",        ar: "الجلدية" },
  oncology:          { en: "Oncology",           ar: "الأورام" },
  infectious_disease:{ en: "Infectious Disease", ar: "الأمراض المعدية" },
  ophthalmology:     { en: "Ophthalmology",      ar: "العيون" },
  ent:               { en: "ENT",                ar: "أنف و أذن و حنجرة" },
  psychiatry:        { en: "Psychiatry",         ar: "الطب النفسي" },
  general:           { en: "General Practice",   ar: "طب عام" },
};

export default function CommunicationHub({ T, lang, plan = "standard", audience = "patient", onUpgrade }) {
  const isAr = lang === "ar";
  const tier = (plan || "standard").toLowerCase();
  const isPremiumOrUp = tier === "premium" || tier === "royal";
  const isRoyal = tier === "royal";

  const labels = {
    eyebrow: isAr ? "مركز التواصل و الإحالات" : "Communication & Referral Hub",
    title:   isAr ? "تواصل مع طبيبك — Talk مكالمات، رسائل، إحالات" : "Talk to your doctor — calls, messages, referrals",
    subtitle: isAr
      ? "محادثة ذكاء اصطناعي للجميع، محادثة طبيب لأصحاب بريميوم، و مكالمات صوت و فيديو للباقة الملكية."
      : "AI chat for everyone, doctor chat for Premium, and full voice + video calls for Royal.",
    yourPlan: isAr ? "باقتك الحالية" : "Your plan",
    upgrade:  isAr ? "ترقية الباقة" : "Upgrade plan",
    chatTitle: isAr ? "محادثة" : "Chat",
    chatHint: isAr ? "اكتب سؤالك الطبي…" : "Type a medical question…",
    send: isAr ? "إرسال" : "Send",
    aiThinking: isAr ? "المساعد الذكي يكتب…" : "AI is thinking…",
    aiChat: isAr ? "محادثة ذكاء اصطناعي" : "AI Chat",
    doctorChat: isAr ? "محادثة طبيب" : "Doctor Chat",
    photoShare: isAr ? "إرسال صورة" : "Send photo",
    voiceNote: isAr ? "رسالة صوتية" : "Voice note",
    voiceCall: isAr ? "مكالمة صوتية" : "Voice call",
    videoCall: isAr ? "مكالمة فيديو" : "Video call",
    videoShare: isAr ? "إرسال فيديو/صورة" : "Send video/photo",
    referral: isAr ? "إحالة لأخصائي" : "Specialist referral",
    requiresPremium: isAr ? "يتطلب بريميوم" : "Requires Premium",
    requiresRoyal: isAr ? "حصري للباقة الملكية" : "Royal exclusive",
    callInProgress: isAr ? "المكالمة جارية" : "Call in progress",
    endCall: isAr ? "إنهاء" : "End",
    recording: isAr ? "جاري التسجيل…" : "Recording…",
    stop: isAr ? "إيقاف" : "Stop",
    referralFound: isAr ? "نوصي بمراجعة:" : "We recommend consulting:",
    bookSpecialist: isAr ? "حجز موعد" : "Book a specialist",
    startingChat: isAr ? "ابدأ بسؤال طبي — Talk مثلاً 'عندي ألم في الصدر مع تعب'." : "Ask a medical question — e.g. 'I have chest pain and fatigue'.",
  };

  // ---- Chat state ----
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [referral, setReferral] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setDraft("");
    setSending(true);
    try {
      const res = await axios.post(`${API}/chat`, {
        messages: next.map(m => ({ role: m.role, text: m.text })),
        language: lang,
        audience,
        plan: tier,
      }, { timeout: 60000 });
      setMessages(m => [...m, { role: "assistant", text: res.data.reply }]);
      if (res.data.referral) setReferral(res.data.referral);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: isAr ? "تعذّر الاتصال بالمساعد. حاول مجدداً." : "Couldn't reach the assistant. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  // ---- Photo / image share (Premium+) ----
  const photoRef = useRef(null);
  const onPhotoPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMessages(m => [...m, { role: "user", text: `[📷 ${f.name}] (${(f.size / 1024).toFixed(0)} KB)` }]);
    e.target.value = "";
  };

  // ---- Voice note recording (Royal) ----
  const [recording, setRecording] = useState(false);
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);
  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => chunksRef.current.push(ev)data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const seconds = Math.round(blob.size / 12000); // rough estimate
        setMessages(m => [...m, { role: "user", text: `[🎉️ ${isAr ? "رسالة صوتية" : "voice note"} · ~${seconds}s]` }]);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecRef.current = mr;
      setRecording(true);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: isAr ? "تعذر الوصول للميكروفون." : "Could not access microphone." }]);
    }
  };
  const stopRecord = () => {
    if (mediaRecRef.current && recording) {
      mediaRecRef.current.stop();
      setRecording(false);
    }
  };

  // ---- Voice / video call simulation (Royal) ----
  const [call, setCall] = useState(null); // null | { kind: "voice"|"video", startedAt }
  const [callSecs, setCallSecs] = useState(0);
  useEffect(() => {
    if (!call) return;
    const i = setInterval(() => setCallSecs(s => s + 1), 1000);
    return () => clearInterval(i);
  }, [call]);
  const startCall = (kind) => { setCallSecs(0); setCall({ kind, startedAt: Date.now() }); };
  const endCall = () => {
    if (call) setMessages(m => [...m, { role: "user", text: `[${call.kind === "video" ? "🎥" : "📞"} ${isAr ? "انتهت المكالمة" : "call ended"} · ${formatSecs(callSecs)}]` }]);
    setCall(null);
  };

  // ---- Tier gating helper ----
  const upgradeTo = (target) => () => onUpgrade?.(target);

  // Stable handlers (avoid creating closures during render that capture refs)
  const handlePhotoOpen = () => { if (isPremiumOrUp) photoRef.current?.click(); else onUpgrade?.("premium"); };
  const handleVideoShareOpen = () => { if (isRoyal) photoRef.current?.click(); else onUpgrade?.("royal"); };
  const handleVoiceNoteToggle = () => {
    if (!isRoyal) { onUpgrade?.("royal"); return; }
    if (recording) stopRecord(); else startRecord();
  };
  const handleVoiceCall = () => { if (isRoyal) startCall("voice"); else onUpgrade?.("royal"); };
  const handleVideoCall = () => { if (isRoyal) startCall("video"); else onUpgrade?.("royal"); };
  const handleDoctorChatLocked = () => { if (!isPremiumOrUp) onUpgrade?.("premium"); };

  return (
    <section id="comm-hub" className="relative py-20 lg:py-28 overflow-hidden" data-testid="comm-hub-section">
      <div aria-hidden="true" className="ambient-pomegranate" style={{ top: "5%", insetInlineEnd: "-12%" }} />
      <div aria-hidden="true" className="ambient-cyan" style={{ bottom: "-10%", insetInlineStart: "-10%" }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 h-7 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bold tracking-widest uppercase border border-cyan-200">
            <Sparkles className="w-3 h-3" /> {labels.eyebrow}
          </div>
          <h2 className="mt-4 font-display font-extrabold text-3xl lg:text-5xl tracking-tight text-slate-900">
            {labels.title}
          </h2>
          <p className="mt-3.5 text-slate-600 text-sm lg:text-base max-w-2xl mx-auto leading-relaxed">
            {labels.subtitle}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-4 h-9 rounded-full bg-white border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">{labels.yourPlan}:</span>
            <span className={`font-bold uppercase tracking-wider ${tier === "royal" ? "text-cyan-700" : tier === "premium" ? "text-amber-700" : "text-teal-700"}`} data-testid="comm-hub-plan-badge">
              {tier}
            </span>
            {!isRoyal && (
              <button onClick={() => onUpgrade?.(isPremiumOrUp ? "royal" : "premium")} className="ms-2 text-cyan-700 font-semibold underline-offset-2 hover:underline" data-testid="comm-hub-upgrade-btn">
                {labels.upgrade} <ArrowRight className={`inline-block w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tier matrix strip — clear summary of what each plan unlocks */}
          <div className="lg:col-span-3 mb-2 grid sm:grid-cols-3 gap-3" data-testid="comm-hub-tier-matrix">
            <div className="rounded-2xl p-4 bg-white/80 backdrop-blur-sm ring-1 ring-teal-100" data-testid="comm-tier-standard">
              <div className="text-[10px] font-bold uppercase tracking-widest text-teal-700">{isAr ? "الباقة الأساسية" : "Standard"}</div>
              <div className="font-display font-bold text-slate-900 mt-1.5 text-sm">
                {isAr ? "محادثة ذكاء اصطناعي فقط" : "AI Chat only"}
              </div>
            </div>
            <div className="rounded-2xl p-4 bg-white/80 backdrop-blur-sm ring-1 ring-amber-200" data-testid="comm-tier-premium">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">{isAr ? "بريميوم" : "Premium"}</div>
              <div className="font-display font-bold text-slate-900 mt-1.5 text-sm">
                {isAr ? "محادثة + إرسال صور" : "Chat + Photo sharing"}
              </div>
            </div>
            <div className="rounded-2xl p-4 bg-gradient-to-br from-cyan-50 to-white ring-1 ring-cyan-200" data-testid="comm-tier-royal">
              <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">{isAr ? "الباقة الملكية" : "Royal"}</div>
              <div className="font-display font-bold text-slate-900 mt-1.5 text-sm">
                {isAr ? "مكالمات صوت/فيديو + كل ما سبق" : "Voice / Video calls + all lower tiers"}
              </div>
            </div>
          </div>

          {/* LEFT — Tier-gated feature controls */}
          <div className="lg:col-span-1 space-y-3" data-testid="comm-hub-features">
            <FeatureRow
              testid="comm-feature-ai-chat"
              Icon={MessageCircle}
              theme="teal"
              label={labels.aiChat}
              available
              caption={isAr ? "متاحة لكل الباقات" : "Available on all plans"}
            />
            <FeatureRow
              testid="comm-feature-photo"
              Icon={ImageIcon}
              theme="amber"
              label={labels.photoShare}
              available={isPremiumOrUp}
              gateLabel={labels.requiresPremium}
              onAction={handlePhotoOpen}
              onLocked={upgradeTo("premium")}
            />
            <FeatureRow
              testid="comm-feature-voice-call"
              Icon={Phone}
              theme="cyan"
              label={labels.voiceCall}
              available={isRoyal}
              gateLabel={labels.requiresRoyal}
              onAction={handleVoiceCall}
              onLocked={upgradeTo("royal")}
            />
            <FeatureRow
              testid="comm-feature-video-call"
              Icon={Video}
              theme="cyan"
              label={labels.videoCall}
              available={isRoyal}
              gateLabel={labels.requiresRoyal}
              onAction={handleVideoCall}
              onLocked={upgradeTo("royal")}
            />
            <FeatureRow
              testid="comm-feature-voice-note"
              Icon={Mic}
              theme="cyan"
              label={labels.voiceNote}
              available={isRoyal}
              gateLabel={labels.requiresRoyal}
              onAction={handleVoiceNoteToggle}
              onLocked={upgradeTo("royal")}
              activeLabel={recording ? labels.recording : null}
            />
            <input ref={photoRef} type="file" accept="image/*,video/*" className="hidden" onChange={onPhotoPick} data-testid="comm-hub-photo-input" />
          </div>

          {/* RIGHT — Chat panel */}
          <div className="lg:col-span-2 rounded-3xl glass-card overflow-hidden" data-testid="comm-hub-chat-panel">
            <div className="px-5 py-4 border-b border-slate-100 bg-white/60 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/30">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="font-display font-bold text-slate-900">{labels.chatTitle}</div>
              {recording && (
                <span className="ms-auto inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600" data-testid="comm-hub-recording">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {labels.recording}
                </span>
              )}
            </div>

            <div ref={scrollRef} className="px-5 py-4 h-[360px] overflow-y-auto space-y-3 bg-white/40" data-testid="comm-hub-messages">
              {messages.length === 0 && (
                <div className="text-center text-sm text-slate-500 italic mt-12">{labels.startingChat}</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md shadow-teal-500/20"
                      : "bg-white border border-slate-200 text-slate-800"
                  }`} data-testid={`comm-hub-msg-${m.role}-${i}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start" data-testid="comm-hub-thinking">
                  <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-500 inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> {labels.aiThinking}
                  </div>
                </div>
              )}
              {referral && (
                <div className="rounded-2xl bg-cyan-50 border border-cyan-200 p-4 mt-2" data-testid="comm-hub-referral-card">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">{labels.referral}</div>
                  <div className="font-display font-bold text-slate-900 mt-1">
                    {labels.referralFound} {SPECIALTY_LABELS[referral.specialty]?.[isAr ? "ar" : "en"] || referral.specialty}
                  </div>
                  <Button onClick={() => onUpgrade?.("premium")} className="mt-3 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white h-9 px-4 text-xs" data-testid="comm-hub-referral-cta">
                    <Stethoscope className="w-3.5 h-3.5 me-1.5" /> {labels.bookSpecialist}
                  </Button>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-white/70 flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={labels.chatHint}
                className="flex-1 h-11 rounded-full border-slate-200 bg-white"
                disabled={sending}
                data-testid="comm-hub-input"
              />
              <Button
                onClick={send}
                disabled={sending || !draft.trim()}
                className="rounded-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white h-11 px-5"
                data-testid="comm-hub-send-btn"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline ms-2">{labels.send}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Call modal (Royal) */}
      <AnimatePresence>
        {call && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6"
            data-testid="comm-hub-call-modal"
          >
            <div className="w-full max-w-md rounded-3xl bg-slate-900 text-white p-8 text-center border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shadow-2xl shadow-cyan-500/40 mb-5">
                {call.kind === "video" ? <Video className="w-9 h-9" /> : <Phone className="w-9 h-9" />}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                {call.kind === "video" ? labels.videoCall : labels.voiceCall}
              </div>
              <div className="font-display font-extrabold text-2xl mt-1">{labels.callInProgress}</div>
              <div className="mt-3 font-mono text-3xl" data-testid="comm-hub-call-timer">{formatSecs(callSecs)}</div>
              <Button
                onClick={endCall}
                className="mt-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white h-12 px-6"
                data-testid="comm-hub-end-call"
              >
                {call.kind === "video" ? <VideoOff className="w-5 h-5 me-2" /> : <PhoneOff className="w-5 h-5 me-2" />}
                {labels.endCall}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function formatSecs(s) {
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function FeatureRow({ Icon, label, theme, available, gateLabel, caption, activeLabel, onAction, onLocked, testid }) {
  const themes = {
    teal:  { bg: "bg-gradient-to-br from-teal-400 to-teal-600",  ring: "ring-teal-100",  badge: "bg-teal-50 text-teal-700" },
    amber: { bg: "bg-gradient-to-br from-amber-500 to-amber-700", ring: "ring-amber-100", badge: "bg-amber-50 text-amber-700" },
    cyan:  { bg: "bg-gradient-to-br from-cyan-500 to-cyan-700",   ring: "ring-cyan-100",  badge: "bg-cyan-50 text-cyan-700" },
  };
  const t = themes[theme] || themes.teal;
  const locked = !available;
  return (
    <button
      onClick={locked ? onLocked : onAction}
      disabled={!locked && !onAction}
      className={`w-full text-start rounded-2xl bg-white/80 backdrop-blur-sm ring-1 ${t.ring} p-4 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-lg transition disabled:opacity-90 disabled:cursor-default`}
      data-testid={testid}
    >
      <div className={`w-11 h-11 rounded-xl ${t.bg} text-white flex items-center justify-center shadow-md ${locked ? "opacity-40" : ""}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
          {label}
          {locked && <Lock className="w-3 h-3 text-slate-400" />}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
          {locked ? gateLabel : (activeLabel || caption || "")}
        </div>
      </div>
      {locked && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
    </button>
  );
}
