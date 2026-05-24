"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  RefreshCw,
  Loader2,
  BookOpen,
  Tag,
  ChevronDown,
  ChevronRight,
  Clock,
  Brain,
  Filter,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import GlassCard from "@/components/ui/GlassCard";
import ShimmerButton from "@/components/ui/ShimmerButton";
import { useProfile } from "@/lib/personalization";

interface Story {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  examRelevant: string[];
  readTime: number;
  publishedAt: string;
  sourceHint: string;
}

const INTERESTS = ["UPSC", "JEE", "NEET", "SSC", "Banking", "GATE", "CAT", "TNPSC", "Tech", "Sports", "Economy", "Science"];

const CATEGORY_COLORS: Record<string, string> = {
  national: "from-orange-500 to-red-600",
  international: "from-cyan-500 to-blue-600",
  "sci-tech": "from-violet-500 to-fuchsia-600",
  economy: "from-emerald-500 to-green-600",
  sports: "from-yellow-500 to-amber-600",
  education: "from-pink-500 to-rose-600",
  exams: "from-blue-500 to-indigo-600",
};

export default function NewsPage() {
  const profile = useProfile();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load saved interests
    const saved = localStorage.getItem("bm-news-interests");
    if (saved) {
      try {
        setInterests(JSON.parse(saved));
      } catch {}
    } else {
      setInterests(["UPSC", "Tech"]);
    }
    // Load cached stories (only if fresh ≤ 6 hours)
    const cached = localStorage.getItem("bm-news-cache");
    if (cached) {
      try {
        const { stories: s, ts } = JSON.parse(cached);
        if (Date.now() - ts < 6 * 60 * 60 * 1000) {
          setStories(s);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bm-news-interests", JSON.stringify(interests));
  }, [interests]);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests,
          language: profile.language,
          region: "India",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStories(data.stories || []);
      localStorage.setItem("bm-news-cache", JSON.stringify({ stories: data.stories, ts: Date.now() }));
      toast.success("News refreshed");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (i: string) => {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const toggleStory = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const categories = Array.from(new Set(stories.map((s) => s.category)));
  const filtered = filter === "all" ? stories : stories.filter((s) => s.category === filter);

  return (
    <AppLayout title="Daily News">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6" glow>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600">
                  <Newspaper size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    <span className="animate-gradient-text">Daily News</span>
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    AI-curated for your interests · {profile.language} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
              <ShimmerButton onClick={refresh} disabled={loading}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {stories.length === 0 ? "Get today's news" : "Refresh"}
              </ShimmerButton>
            </div>

            {/* Interests */}
            <div className="mt-5">
              <div className="text-xs uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                <Filter size={11} /> Your interests
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS.map((i) => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      interests.includes(i)
                        ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white"
                        : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            <button
              onClick={() => setFilter("all")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === "all" ? "bg-violet-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              All ({stories.length})
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                  filter === c
                    ? `bg-gradient-to-r ${CATEGORY_COLORS[c] || "from-slate-500 to-slate-600"} text-white`
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Stories */}
        {stories.length === 0 && !loading ? (
          <GlassCard className="p-10 text-center">
            <Newspaper size={36} className="text-violet-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Get your daily briefing</h2>
            <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
              Pick a few interests above and click <strong>Get today&apos;s news</strong> — the ML engine will curate stories for your exam prep.
            </p>
            <ShimmerButton onClick={refresh} disabled={loading} size="lg">
              <Sparkles size={14} /> Get today&apos;s news
            </ShimmerButton>
          </GlassCard>
        ) : loading ? (
          <GlassCard className="p-10 text-center">
            <Loader2 size={28} className="text-violet-400 mx-auto animate-spin mb-3" />
            <p className="text-sm text-slate-400">Curating your news...</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlassCard className="p-5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest bg-gradient-to-r ${
                        CATEGORY_COLORS[s.category] || "from-slate-500 to-slate-600"
                      } text-white`}
                    >
                      {s.category}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock size={10} /> {s.readTime || 2} min
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5 leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1">
                    {expanded.has(s.id) || s.summary.length < 180 ? s.summary : s.summary.slice(0, 180) + "..."}
                  </p>
                  {s.examRelevant?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      <BookOpen size={10} className="text-violet-400" />
                      {s.examRelevant.map((e) => (
                        <span key={e} className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                  {s.summary.length >= 180 && (
                    <button
                      onClick={() => toggleStory(s.id)}
                      className="text-xs text-violet-300 hover:text-violet-200 mt-3 flex items-center gap-1"
                    >
                      {expanded.has(s.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {expanded.has(s.id) ? "Less" : "Read more"}
                    </button>
                  )}
                  <div className="text-[9px] text-slate-500 mt-2">
                    {s.publishedAt} · {s.sourceHint || "Curated"}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center text-[10px] text-slate-500 pt-4 pb-2 flex items-center justify-center gap-1">
          <Brain size={10} /> News stays in your browser. ML engine adapts what you see based on what you click.
        </div>
      </div>
    </AppLayout>
  );
}
