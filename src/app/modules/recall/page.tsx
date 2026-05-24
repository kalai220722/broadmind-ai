"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Layers,
  HelpCircle,
  Sparkles,
  Loader2,
  Check,
  X,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import GlassCard from "@/components/ui/GlassCard";
import ShimmerButton from "@/components/ui/ShimmerButton";
import { track, useProfile } from "@/lib/personalization";
import { celebrate, smallConfetti } from "@/lib/confetti";

type Tab = "quiz" | "cards";

interface QuizQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Card {
  id: string;
  front: string;
  back: string;
  easy: number;
  hard: number;
}
interface Deck {
  id: string;
  name: string;
  cards: Card[];
  createdAt: number;
}

function id() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function RecallPage() {
  const [tab, setTab] = useState<Tab>("quiz");
  const profile = useProfile();

  return (
    <AppLayout title="Recall Arena">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6 mb-5" glow>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600">
                <Zap size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  <span className="animate-gradient-text">Recall Arena</span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Active recall (MCQs) + spaced repetition (flashcards) in one place. AI tunes
                  difficulty to your level — currently <span className="text-violet-300">{profile.level}</span>.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30">
                <Brain size={12} className="text-violet-300" />
                <span className="text-xs text-violet-200">ML-personalised</span>
              </div>
            </div>

            <div className="flex gap-2 mt-5 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setTab("quiz")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
                  tab === "quiz"
                    ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <HelpCircle size={14} /> Quiz Mode
              </button>
              <button
                onClick={() => setTab("cards")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
                  tab === "cards"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Layers size={14} /> Flashcards
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {tab === "quiz" ? <QuizMode profileLevel={profile.level} /> : <CardsMode />}
      </div>
    </AppLayout>
  );
}

// ── Quiz mode ──────────────────────────────────────────────────────────
function QuizMode({ profileLevel }: { profileLevel: string }) {
  type Stage = "setup" | "playing" | "results";
  const [stage, setStage] = useState<Stage>("setup");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    profileLevel === "beginner" ? "easy" : profileLevel === "advanced" ? "hard" : "medium"
  );
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "quiz", topic, count, difficulty }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.questions?.length) throw new Error("No questions returned");
      setQuestions(data.questions);
      setIdx(0);
      setSelected(null);
      setShowResult(false);
      setAnswers([]);
      setStage("playing");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (selected === null) return;
    setShowResult(true);
    const ok = selected === questions[idx].correctIndex;
    setAnswers((a) => [...a, { correct: ok }]);
    track("quiz_answered", { topic, correct: ok, difficulty });
    if (ok) toast.success("Correct!");
  };

  const next = () => {
    if (idx >= questions.length - 1) {
      const score = answers.filter((a) => a.correct).length;
      if (score >= Math.ceil(questions.length * 0.7)) celebrate();
      setStage("results");
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setShowResult(false);
  };

  const score = answers.filter((a) => a.correct).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <AnimatePresence mode="wait">
      {stage === "setup" && (
        <motion.div key="setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <GlassCard className="p-6" glow>
            <h3 className="text-lg font-bold text-white mb-4">Quick Quiz</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Topic</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Newton's laws, French Revolution"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Questions: {count}</label>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={count}
                  onChange={(e) => setCount(+e.target.value)}
                  className="w-full accent-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-2 rounded-lg text-sm capitalize transition ${
                        difficulty === d
                          ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-center">
              <ShimmerButton onClick={generate} disabled={loading || !topic.trim()} size="lg">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loading ? "Generating..." : "Generate Quiz"}
              </ShimmerButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {stage === "playing" && questions[idx] && (
        <motion.div key="play" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">
              Q {idx + 1} / {questions.length}
            </span>
            <div className="flex-1 mx-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                animate={{ width: `${((idx + (showResult ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-emerald-400 font-medium">{score} ✓</span>
          </div>

          <GlassCard className="p-6" glow>
            <h3 className="text-lg font-semibold text-white mb-5">{questions[idx].question}</h3>
            <div className="space-y-2">
              {questions[idx].options.map((opt, i) => {
                const isSel = selected === i;
                const isCorr = i === questions[idx].correctIndex;
                const wrong = showResult && isSel && !isCorr;
                const right = showResult && isCorr;
                return (
                  <motion.button
                    key={i}
                    whileHover={!showResult ? { x: 4 } : {}}
                    onClick={() => !showResult && setSelected(i)}
                    disabled={showResult}
                    className={`w-full text-left p-3.5 rounded-xl border transition ${
                      right
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200"
                        : wrong
                        ? "bg-rose-500/20 border-rose-500/50 text-rose-200"
                        : isSel
                        ? "bg-violet-600/20 border-violet-500/50 text-white"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                          right
                            ? "bg-emerald-500 text-white"
                            : wrong
                            ? "bg-rose-500 text-white"
                            : isSel
                            ? "bg-violet-500 text-white"
                            : "bg-white/10"
                        }`}
                      >
                        {right ? <Check size={11} /> : wrong ? <X size={11} /> : String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm leading-relaxed">{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30"
              >
                <p className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Explanation</p>
                <p className="text-sm text-slate-200">{questions[idx].explanation}</p>
              </motion.div>
            )}

            <div className="mt-5 flex justify-end">
              {!showResult ? (
                <ShimmerButton onClick={submit} disabled={selected === null}>
                  Submit
                </ShimmerButton>
              ) : (
                <ShimmerButton onClick={next}>
                  {idx < questions.length - 1 ? "Next" : "Finish"} <ChevronRight size={14} />
                </ShimmerButton>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {stage === "results" && (
        <motion.div key="res" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <GlassCard className="p-10 text-center" glow>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="inline-flex p-4 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 mb-4"
            >
              <Trophy size={28} className="text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
            <p className="text-sm text-slate-400 mb-5">{topic}</p>
            <div className="text-6xl font-bold animate-gradient-text mb-2">{pct}%</div>
            <p className="text-slate-300 mb-6">
              {score} / {questions.length} correct
            </p>
            <div className="flex gap-3 justify-center">
              <ShimmerButton onClick={() => setStage("setup")} variant="secondary">
                <RotateCcw size={14} /> New Quiz
              </ShimmerButton>
              <ShimmerButton
                onClick={() => {
                  setStage("playing");
                  setIdx(0);
                  setSelected(null);
                  setShowResult(false);
                  setAnswers([]);
                }}
              >
                Retry
              </ShimmerButton>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Cards mode ─────────────────────────────────────────────────────────
function CardsMode() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [study, setStudy] = useState(false);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);

  const active = decks.find((d) => d.id === activeId);
  const card = active?.cards[idx];

  useEffect(() => {
    const s = localStorage.getItem("bm-decks");
    if (s) {
      try {
        const p: Deck[] = JSON.parse(s);
        setDecks(p);
        if (p.length > 0) setActiveId(p[0].id);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (decks.length > 0) localStorage.setItem("bm-decks", JSON.stringify(decks));
  }, [decks]);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "cards", topic, count }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.cards?.length) throw new Error("No cards returned");
      const d: Deck = {
        id: id(),
        name: topic,
        cards: data.cards.map((c: { front: string; back: string }) => ({
          id: id(),
          front: c.front,
          back: c.back,
          easy: 0,
          hard: 0,
        })),
        createdAt: Date.now(),
      };
      setDecks((p) => [d, ...p]);
      setActiveId(d.id);
      setShowCreate(false);
      setTopic("");
      smallConfetti();
      toast.success(`Created "${d.name}" with ${d.cards.length} cards`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const rate = (easy: boolean) => {
    if (!active || !card) return;
    setDecks((p) =>
      p.map((d) =>
        d.id === active.id
          ? {
              ...d,
              cards: d.cards.map((c, i) =>
                i === idx
                  ? { ...c, easy: easy ? c.easy + 1 : c.easy, hard: !easy ? c.hard + 1 : c.hard }
                  : c
              ),
            }
          : d
      )
    );
    track(easy ? "flashcard_easy" : "flashcard_hard", { deck: active.name });
    if (idx >= active.cards.length - 1) {
      smallConfetti();
      toast.success("Deck completed!");
      setStudy(false);
      return;
    }
    setIdx((i) => i + 1);
    setFlipped(false);
  };

  const deleteDeck = (deckId: string) => {
    setDecks((p) => p.filter((d) => d.id !== deckId));
    if (deckId === activeId) setActiveId(decks[0]?.id || null);
  };

  if (study && active) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setStudy(false)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
            <ChevronLeft size={14} /> Exit
          </button>
          <span className="text-sm text-slate-400">
            {idx + 1} / {active.cards.length}
          </span>
        </div>
        <div className="flex justify-center mb-6">
          <div
            className={`flip-card ${flipped ? "flipped" : ""}`}
            style={{ width: "min(550px, 90vw)", height: "320px" }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="flip-card-inner cursor-pointer">
              <div className="flip-card-front">
                <GlassCard glow className="h-full flex flex-col items-center justify-center p-8">
                  <span className="text-xs uppercase tracking-widest text-violet-400 mb-3">Question</span>
                  <p className="text-2xl font-semibold text-white text-center">{card?.front}</p>
                  <span className="text-xs text-slate-500 mt-6">Tap to reveal</span>
                </GlassCard>
              </div>
              <div className="flip-card-back">
                <GlassCard glow className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-violet-900/40 to-cyan-900/40">
                  <span className="text-xs uppercase tracking-widest text-cyan-400 mb-3">Answer</span>
                  <p className="text-lg text-white text-center leading-relaxed">{card?.back}</p>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          {flipped ? (
            <>
              <ShimmerButton onClick={() => rate(false)} variant="secondary">
                <ThumbsDown size={14} /> Hard
              </ShimmerButton>
              <ShimmerButton onClick={() => rate(true)}>
                <ThumbsUp size={14} /> Easy
              </ShimmerButton>
            </>
          ) : (
            <ShimmerButton onClick={() => setFlipped(true)}>Reveal Answer</ShimmerButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <aside className="space-y-3">
        <ShimmerButton onClick={() => setShowCreate(true)} className="w-full">
          <Plus size={14} /> New Deck
        </ShimmerButton>
        <GlassCard className="p-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {decks.length === 0 ? (
            <p className="text-xs text-slate-500 p-4 text-center">No decks yet</p>
          ) : (
            decks.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveId(d.id)}
                className={`group w-full text-left px-3 py-2 rounded-lg flex items-center justify-between mb-1 transition ${
                  d.id === activeId ? "bg-violet-600/20 text-white" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-[10px] text-slate-500">{d.cards.length} cards</div>
                </div>
                <Trash2
                  size={12}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDeck(d.id);
                  }}
                  className="opacity-0 group-hover:opacity-60 hover:opacity-100 hover:text-rose-400 cursor-pointer"
                />
              </button>
            ))
          )}
        </GlassCard>
      </aside>

      <div>
        {active ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{active.name}</h2>
                <p className="text-sm text-slate-400">{active.cards.length} cards</p>
              </div>
              <ShimmerButton onClick={() => { setStudy(true); setIdx(0); setFlipped(false); }} disabled={active.cards.length === 0}>
                <Sparkles size={14} /> Study Now
              </ShimmerButton>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {active.cards.map((c) => (
                <GlassCard key={c.id} className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-1.5">{c.front}</h4>
                  <p className="text-xs text-slate-400">{c.back}</p>
                  {(c.easy > 0 || c.hard > 0) && (
                    <div className="flex gap-3 mt-2 text-[10px]">
                      <span className="text-emerald-400">✓ {c.easy}</span>
                      <span className="text-rose-400">✗ {c.hard}</span>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </>
        ) : (
          <GlassCard className="p-12 text-center">
            <Layers size={36} className="mx-auto text-violet-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No deck selected</h2>
            <p className="text-sm text-slate-400 mb-6">Create your first AI-generated deck</p>
            <ShimmerButton onClick={() => setShowCreate(true)}>
              <Plus size={14} /> Create Deck
            </ShimmerButton>
          </GlassCard>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => !loading && setShowCreate(false)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
              <GlassCard glow className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-violet-400" /> Generate Flashcards
                </h2>
                <div className="space-y-3 mb-5">
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Photosynthesis, French verbs"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                  />
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Cards: {count}</label>
                    <input type="range" min={4} max={20} value={count} onChange={(e) => setCount(+e.target.value)} className="w-full accent-violet-500" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowCreate(false)} disabled={loading} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">
                    Cancel
                  </button>
                  <ShimmerButton onClick={generate} disabled={loading || !topic.trim()}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Generate
                  </ShimmerButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
