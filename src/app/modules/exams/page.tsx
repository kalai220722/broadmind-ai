"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  MapPin,
  Filter,
  Search,
  ExternalLink,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Brain,
  X,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import GlassCard from "@/components/ui/GlassCard";
import { EXAMS, CATEGORIES, REGIONS, nextOccurrence, daysUntil, type ExamCategory, type Exam } from "@/lib/exams-data";

export default function ExamsPage() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>("national");
  const [cats, setCats] = useState<Set<ExamCategory>>(new Set());
  const [starred, setStarred] = useState<Set<string>>(new Set());

  useEffect(() => {
    const s = localStorage.getItem("bm-starred-exams");
    if (s) {
      try {
        setStarred(new Set(JSON.parse(s)));
      } catch {}
    }
    const c = localStorage.getItem("bm-exam-interests");
    if (c) {
      try {
        setCats(new Set(JSON.parse(c)));
      } catch {}
    }
    const r = localStorage.getItem("bm-exam-region");
    if (r) setRegion(r);
  }, []);

  useEffect(() => {
    localStorage.setItem("bm-starred-exams", JSON.stringify(Array.from(starred)));
  }, [starred]);

  useEffect(() => {
    localStorage.setItem("bm-exam-interests", JSON.stringify(Array.from(cats)));
  }, [cats]);

  useEffect(() => {
    localStorage.setItem("bm-exam-region", region);
  }, [region]);

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCat = (c: ExamCategory) => {
    setCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return EXAMS.filter((e) => {
      // Region: national exams always shown, otherwise must match
      if (region !== "national" && e.region !== "national" && e.region !== region) return false;
      // Category filter
      if (cats.size > 0 && !cats.has(e.category)) return false;
      // Search
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        if (!e.name.toLowerCase().includes(s) && !e.fullForm.toLowerCase().includes(s) &&
            !e.tags.some((t) => t.toLowerCase().includes(s))) return false;
      }
      return true;
    }).map((e) => {
      const date = nextOccurrence(e.recurringMonth, e.recurringDay);
      const days = daysUntil(date);
      return { ...e, date, days };
    }).sort((a, b) => {
      // Starred first
      if (starred.has(a.id) && !starred.has(b.id)) return -1;
      if (!starred.has(a.id) && starred.has(b.id)) return 1;
      // Then by days until
      if (a.days === null && b.days === null) return 0;
      if (a.days === null) return 1;
      if (b.days === null) return -1;
      return a.days - b.days;
    });
  }, [region, cats, search, starred]);

  const starredExams = filtered.filter((e) => starred.has(e.id));
  const upcomingExams = filtered.filter((e) => !starred.has(e.id));

  return (
    <AppLayout title="Upcoming Exams">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6" glow>
            <div className="flex items-start gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <CalendarClock size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  <span className="animate-gradient-text">Upcoming Exams</span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  All major Indian competitive exams in one calendar. Star the ones you care about — the ML engine prioritises them.
                </p>
              </div>
            </div>

            {/* Filters row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search exams (e.g., JEE, NEET, TNPSC)..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-violet-500/40"
                />
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer"
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-900">{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category chips */}
            <div className="mt-4">
              <div className="text-xs uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                <Filter size={11} /> Interests
                {cats.size > 0 && (
                  <button onClick={() => setCats(new Set())} className="ml-auto text-slate-400 hover:text-white flex items-center gap-1 text-[10px]">
                    <X size={9} /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleCat(c.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                      cats.has(c.id)
                        ? `bg-gradient-to-r ${c.color} text-white`
                        : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Starred section */}
        {starredExams.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
              <Star size={14} fill="currentColor" /> Your Watchlist ({starredExams.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {starredExams.map((e) => (
                <ExamCard key={e.id} exam={e} starred onToggleStar={() => toggleStar(e.id)} />
              ))}
            </div>
          </div>
        )}

        {/* All */}
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-violet-400" /> {starredExams.length > 0 ? "All other exams" : "All exams"} ({upcomingExams.length})
          </h2>
          {upcomingExams.length === 0 ? (
            <GlassCard className="p-10 text-center">
              <AlertCircle size={28} className="text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No exams match your filters. Try widening your selection.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence>
                {upcomingExams.map((e, i) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.3, i * 0.03) }}
                  >
                    <ExamCard exam={e} starred={false} onToggleStar={() => toggleStar(e.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-slate-500 pt-4 flex items-center justify-center gap-1">
          <Brain size={10} /> Watchlist persists locally. Dates are typical recurrence windows — check official sites for exact dates.
        </div>
      </div>
    </AppLayout>
  );
}

function ExamCard({
  exam,
  starred,
  onToggleStar,
}: {
  exam: Exam & { date: Date | null; days: number | null };
  starred: boolean;
  onToggleStar: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === exam.category)!;
  const urgent = exam.days !== null && exam.days <= 30;
  const soon = exam.days !== null && exam.days <= 90;

  return (
    <GlassCard className="p-5 h-full flex flex-col" glow={urgent && starred}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest bg-gradient-to-r ${cat.color} text-white`}
          >
            {cat.emoji} {cat.label}
          </span>
          {urgent && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
              <AlertCircle size={9} /> Soon
            </span>
          )}
        </div>
        <button
          onClick={onToggleStar}
          className={`flex-shrink-0 ${starred ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}
          title={starred ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Star size={14} fill={starred ? "currentColor" : "none"} />
        </button>
      </div>
      <h3 className="text-base font-semibold text-white">{exam.name}</h3>
      <p className="text-xs text-slate-500 mb-2">{exam.fullForm}</p>
      <p className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">{exam.description}</p>

      {/* Date + countdown */}
      {exam.date && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Next typical date</div>
            <div className="text-sm font-semibold text-white">
              {exam.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">In</div>
            <div
              className={`text-2xl font-bold ${
                urgent ? "text-rose-300" : soon ? "text-amber-300" : "animate-gradient-text"
              }`}
            >
              {exam.days}d
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-wrap gap-1">
          {exam.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
              {t}
            </span>
          ))}
        </div>
        <a
          href={`https://${exam.websiteHint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-violet-300 hover:text-violet-200"
        >
          {exam.websiteHint} <ExternalLink size={9} />
        </a>
      </div>

      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
        <CheckCircle2 size={9} className="text-emerald-400" />
        Conducted by {exam.conductingBody}
      </div>
    </GlassCard>
  );
}
