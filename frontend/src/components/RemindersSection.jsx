import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, BellOff, CalendarClock, Check, Trash2, Plus, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const STORAGE_EMAIL_KEY = "medireader.reminders.email";
const STORAGE_NOTIFIED_KEY = "medireader.reminders.notified";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.7, ease: "easeOut" } };

function daysUntil(iso) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(iso); due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function formatDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA-u-ca-gregory" : (locale || "en"), {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function RemindersSection({ T, api, audience, language }) {
  const [email, setEmail] = useState(() => localStorage.getItem(STORAGE_EMAIL_KEY) || "");
  const [condition, setCondition] = useState("");
  const [frequency, setFrequency] = useState(6);
  const [lastDate, setLastDate] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [notifState, setNotifState] = useState(() => (typeof Notification !== "undefined" ? Notification.permission : "default"));

  const fetchReminders = useCallback(async () => {
    if (!email) { setItems([]); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${api}/reminders`, { params: { email } });
      setItems(res.data || []);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, [api, email]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  // Auto-suggest frequency when condition changes
  useEffect(() => {
    if (!condition.trim()) return;
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${api}/reminders/recommended-frequency`, { params: { condition } });
        if (res.data?.frequencyMonths) setFrequency(res.data.frequencyMonths);
      } catch (e) { /* ignore */ }
    }, 400);
    return () => clearTimeout(t);
  }, [condition, api]);

  // Persist email
  useEffect(() => {
    if (email) localStorage.setItem(STORAGE_EMAIL_KEY, email);
  }, [email]);

  // Fire notifications for reminders due (≤3 days or today). Avoid duplicates per day per reminder.
  useEffect(() => {
    if (!items.length) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    let notified = {};
    try { notified = JSON.parse(localStorage.getItem(STORAGE_NOTIFIED_KEY) || "{}"); } catch {}

    items.forEach((r) => {
      const d = daysUntil(r.nextDueDate);
      const fireFor = d === 0 ? "today" : d === 3 ? "3days" : null;
      if (!fireFor) return;
      const key = `${r.id}:${fireFor}:${todayKey}`;
      if (notified[key]) return;

      const title = d === 0 ? T.reminders.notifyToday : T.reminders.notify3days;
      const body = T.reminders.notifyBody(r.condition, formatDate(r.nextDueDate, language));
      // In-app toast
      toast(title, { description: body, icon: <BellRing className="w-4 h-4 text-brand-600" />, duration: 8000 });
      // Browser notification
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try { new Notification(title, { body, icon: "/favicon.ico", tag: key }); } catch {}
      }
      notified[key] = true;
    });
    // Cleanup old keys (>30 days)
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    Object.keys(notified).forEach(k => {
      const day = k.split(":").pop();
      if (day < cutoffStr) delete notified[k];
    });
    localStorage.setItem(STORAGE_NOTIFIED_KEY, JSON.stringify(notified));
  }, [items, T, language]);

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    try {
      const p = await Notification.requestPermission();
      setNotifState(p);
      if (p === "granted") toast.success(T.reminders.notificationsOn);
    } catch {}
  };

  const add = async (e) => {
    e?.preventDefault();
    if (!email) { toast.error(T.reminders.enterEmail); return; }
    if (!condition.trim()) return;
    setAdding(true);
    try {
      const res = await axios.post(`${api}/reminders`, {
        email,
        condition: condition.trim(),
        frequencyMonths: Number(frequency) || 6,
        lastTestDate: lastDate || null,
        language, audience,
      });
      setItems([res.data, ...items].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate)));
      setCondition("");
      setLastDate("");
      toast.success(T.reminders.reminderSaved);
    } catch (e) {
      toast.error(T.analyzer.error);
    } finally { setAdding(false); }
  };

  const markDone = async (id) => {
    try {
      const res = await axios.post(`${api}/reminders/${id}/mark-done`);
      setItems(items.map(it => it.id === id ? res.data : it).sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate)));
      toast.success(T.reminders.marked);
    } catch { toast.error(T.analyzer.error); }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`${api}/reminders/${id}`);
      setItems(items.filter(it => it.id !== id));
      toast.success(T.reminders.deleted);
    } catch { toast.error(T.analyzer.error); }
  };

  const renderDelta = (iso) => {
    const d = daysUntil(iso);
    if (d < 0) return { label: T.reminders.overdue, cls: "bg-rose-100 text-rose-700" };
    if (d === 0) return { label: T.reminders.today, cls: "bg-amber-100 text-amber-700 animate-pulse-soft" };
    if (d === 1) return { label: T.reminders.tomorrow, cls: "bg-amber-100 text-amber-700" };
    if (d <= 3) return { label: `${T.reminders.in} ${d} ${T.reminders.days}`, cls: "bg-amber-100 text-amber-700" };
    return { label: `${T.reminders.in} ${d} ${T.reminders.days}`, cls: "bg-brand-50 text-brand-700" };
  };

  return (
    <section id="reminders" className="py-24 lg:py-32" data-testid="reminders-section">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div {...fadeUp} className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-white border border-brand-200 text-xs font-medium text-brand-700 mb-5">
            <CalendarClock className="w-3.5 h-3.5" /> {T.reminders.nav}
          </div>
          <h2 className="font-display font-extrabold text-3xl lg:text-5xl tracking-tight text-slate-900">{T.reminders.title}</h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">{T.reminders.subtitle}</p>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-12 gap-6">
          {/* Form */}
          <motion.div {...fadeUp} className="lg:col-span-5">
            <Card className="rounded-3xl p-7 border-brand-100 bg-white" data-testid="reminders-form-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg text-slate-900">{T.reminders.add}</h3>
                <button
                  onClick={enableNotifications}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 h-8 rounded-full transition ${notifState === "granted" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : notifState === "denied" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100"}`}
                  data-testid="reminders-enable-notifications"
                >
                  {notifState === "granted" ? <><BellRing className="w-3 h-3" /> {T.reminders.notificationsOn}</> :
                   notifState === "denied" ? <><BellOff className="w-3 h-3" /> {T.reminders.notificationsBlocked}</> :
                   <><Bell className="w-3 h-3" /> {T.reminders.enableNotifications}</>}
                </button>
              </div>

              <form onSubmit={add} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{T.reminders.email}</label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={T.reminders.emailPh} className="mt-1 rounded-2xl bg-white h-11" data-testid="reminder-email" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{T.reminders.condition}</label>
                  <Input required value={condition} onChange={(e) => setCondition(e.target.value)} placeholder={T.reminders.conditionPh} className="mt-1 rounded-2xl bg-white h-11" data-testid="reminder-condition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{T.reminders.frequency}</label>
                    <Input type="number" min={1} max={36} required value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-1 rounded-2xl bg-white h-11" data-testid="reminder-frequency" />
                    <div className="text-[11px] text-brand-700 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {T.reminders.suggested}: {frequency}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{T.reminders.lastDate}</label>
                    <Input type="date" value={lastDate} onChange={(e) => setLastDate(e.target.value)} className="mt-1 rounded-2xl bg-white h-11" data-testid="reminder-last-date" />
                  </div>
                </div>
                <Button type="submit" disabled={adding} className="w-full rounded-full bg-brand-500 hover:bg-brand-600 text-white h-12 mt-2" data-testid="reminder-add-btn">
                  {adding ? <><Loader2 className="w-4 h-4 me-2 animate-spin" /> {T.reminders.adding}</> :
                            <><Plus className="w-4 h-4 me-2" /> {T.reminders.add}</>}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* List */}
          <motion.div {...fadeUp} className="lg:col-span-7">
            <Card className="rounded-3xl p-7 border-brand-100 bg-white min-h-[300px]" data-testid="reminders-list-card">
              <h3 className="font-display font-bold text-lg text-slate-900 mb-5">{T.reminders.yourReminders}</h3>
              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm" data-testid="reminders-empty">
                  <CalendarClock className="w-10 h-10 mx-auto mb-3 text-brand-300" />
                  {T.reminders.empty}
                </div>
              ) : (
                <ul className="space-y-3" data-testid="reminders-list">
                  <AnimatePresence>
                    {items.map((r) => {
                      const delta = renderDelta(r.nextDueDate);
                      return (
                        <motion.li key={r.id} layout
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="rounded-2xl border border-brand-100 p-4 bg-brand-50/30 flex flex-wrap items-center gap-3 justify-between"
                          data-testid={`reminder-item-${r.id}`}
                        >
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${delta.cls}`}>{delta.label}</span>
                              <span className="text-[11px] text-slate-500">{T.reminders.nextOn}: {formatDate(r.nextDueDate, language)}</span>
                            </div>
                            <div className="font-semibold text-slate-900 leading-tight">{r.condition}</div>
                            <div className="text-[11px] text-slate-500 mt-1">{r.frequencyMonths} {T.reminders.frequency.toLowerCase().includes("months") ? "months" : "أشهر"}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => markDone(r.id)} className="rounded-full text-xs h-9" data-testid={`reminder-mark-done-${r.id}`}>
                              <Check className="w-3.5 h-3.5 me-1" /> {T.reminders.markDone}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => remove(r.id)} className="rounded-full text-xs h-9 text-rose-700 hover:bg-rose-50 hover:border-rose-300" data-testid={`reminder-delete-${r.id}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}

              {notifState !== "granted" && (
                <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2 text-xs text-amber-800" data-testid="reminders-notif-warning">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Enable browser notifications above to get reminders 3 days before and on the day of each test.</span>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
