"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  MonitorPlay,
  Tag,
  Eye,
  Pencil,
  X,
  StickyNote,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import GlassCard from "@/components/ui/GlassCard";
import ShimmerButton from "@/components/ui/ShimmerButton";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { track } from "@/lib/personalization";

type Tab = "note" | "voice" | "youtube";

interface Item {
  id: string;
  kind: Tab;
  title: string;
  content: string;
  tags: string[];
  summary?: string;
  videoId?: string;
  updatedAt: number;
}

function id() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function CapturePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("note");
  const [preview, setPreview] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // voice
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recognition, setRecognition] = useState<any>(null);

  // youtube
  const [ytUrl, setYtUrl] = useState("");

  const active = items.find((n) => n.id === activeId) || null;

  useEffect(() => {
    const s = localStorage.getItem("bm-capture");
    if (s) {
      try {
        const p: Item[] = JSON.parse(s);
        setItems(p);
        if (p.length > 0) setActiveId(p[0].id);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) localStorage.setItem("bm-capture", JSON.stringify(items));
  }, [items]);

  const createNote = () => {
    const n: Item = {
      id: id(),
      kind: "note",
      title: "Untitled note",
      content: "",
      tags: [],
      updatedAt: Date.now(),
    };
    setItems((p) => [n, ...p]);
    setActiveId(n.id);
    setPreview(false);
    setTab("note");
    track("note_created");
  };

  const createVoiceNote = () => {
    const n: Item = {
      id: id(),
      kind: "voice",
      title: "Voice note",
      content: "",
      tags: ["voice"],
      updatedAt: Date.now(),
    };
    setItems((p) => [n, ...p]);
    setActiveId(n.id);
    setTab("voice");
    track("note_created");
  };

  const captureYoutube = async () => {
    if (!ytUrl.trim()) {
      toast.error("Paste a YouTube URL or topic");
      return;
    }
    setSummarizing(true);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "youtube", content: ytUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const n: Item = {
        id: id(),
        kind: "youtube",
        title: ytUrl.slice(0, 60),
        content: ytUrl,
        summary: data.summary,
        videoId: data.videoId || undefined,
        tags: ["youtube"],
        updatedAt: Date.now(),
      };
      setItems((p) => [n, ...p]);
      setActiveId(n.id);
      setYtUrl("");
      setShowSummary(true);
      track("youtube_summarized");
      toast.success("YouTube summary captured!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSummarizing(false);
    }
  };

  const update = (patch: Partial<Item>) => {
    if (!activeId) return;
    setItems((p) =>
      p.map((n) => (n.id === activeId ? { ...n, ...patch, updatedAt: Date.now() } : n))
    );
  };

  const remove = (itemId: string) => {
    setItems((p) => {
      const filtered = p.filter((n) => n.id !== itemId);
      if (itemId === activeId) setActiveId(filtered[0]?.id || null);
      return filtered;
    });
    toast.success("Deleted");
  };

  const addTag = () => {
    if (!active || !tagInput.trim()) return;
    if (active.tags.includes(tagInput.trim())) return;
    update({ tags: [...active.tags, tagInput.trim()] });
    setTagInput("");
  };

  const removeTag = (t: string) => {
    if (!active) return;
    update({ tags: active.tags.filter((x) => x !== t) });
  };

  const startVoice = () => {
    type SR = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start: () => void;
      stop: () => void;
      onresult: (e: { results: { transcript: string }[][] }) => void;
      onerror: () => void;
      onend: () => void;
    };
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error("Voice not supported. Use Chrome/Edge.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + " ";
      if (active) update({ content: (active.content + " " + t).trim() });
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setRecognition(rec);
    setListening(true);
    track("doubt_voice");
  };

  const stopVoice = () => {
    recognition?.stop();
    setListening(false);
  };

  const summarize = async () => {
    if (!active) return;
    if ((active.content || "").length < 30) {
      toast.error("Add at least a paragraph first");
      return;
    }
    setSummarizing(true);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "summarize", content: active.content }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      update({ summary: data.summary });
      setShowSummary(true);
      track("note_summarized");
      toast.success("AI summary ready!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSummarizing(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (n) =>
        n.title.toLowerCase().includes(s) ||
        n.content.toLowerCase().includes(s) ||
        n.tags.some((t) => t.toLowerCase().includes(s))
    );
  }, [items, search]);

  const KindIcon = ({ kind }: { kind: Tab }) => {
    if (kind === "voice") return <Mic size={11} className="text-rose-300" />;
    if (kind === "youtube") return <MonitorPlay size={11} className="text-red-300" />;
    return <StickyNote size={11} className="text-emerald-300" />;
  };

  return (
    <AppLayout title="Capture Studio">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-9rem)]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-3 min-h-0">
          {/* Capture chooser */}
          <GlassCard className="p-2">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={createNote}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition ${
                  tab === "note" ? "bg-gradient-to-br from-emerald-500/30 to-green-600/20 text-emerald-200" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <StickyNote size={14} /> Note
              </button>
              <button
                onClick={createVoiceNote}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition ${
                  tab === "voice" ? "bg-gradient-to-br from-rose-500/30 to-pink-600/20 text-rose-200" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <Mic size={14} /> Voice
              </button>
              <button
                onClick={() => setTab("youtube")}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition ${
                  tab === "youtube" ? "bg-gradient-to-br from-red-500/30 to-rose-600/20 text-red-200" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <MonitorPlay size={14} /> YT
              </button>
            </div>
          </GlassCard>

          {/* YouTube input */}
          {tab === "youtube" && (
            <GlassCard className="p-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Paste YouTube URL or topic</p>
              <input
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && captureYoutube()}
                placeholder="youtube.com/watch?v=..."
                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-xs text-white outline-none"
              />
              <ShimmerButton onClick={captureYoutube} disabled={summarizing || !ytUrl.trim()} size="sm" className="w-full mt-2">
                {summarizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Capture
              </ShimmerButton>
            </GlassCard>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all captures..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-violet-500/40"
            />
          </div>

          {/* List */}
          <GlassCard className="p-2 flex-1 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-500 p-6 text-center">No captures yet</p>
            ) : (
              filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setActiveId(n.id);
                    setTab(n.kind);
                    setShowSummary(false);
                    setPreview(false);
                  }}
                  className={`group block w-full text-left px-3 py-2.5 rounded-lg mb-1 transition ${
                    n.id === activeId ? "bg-violet-600/20 text-white" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <KindIcon kind={n.kind} />
                        <div className="text-sm font-medium truncate">{n.title}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {n.content.slice(0, 50) || "(empty)"}
                      </div>
                    </div>
                    <Trash2
                      size={11}
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(n.id);
                      }}
                      className="opacity-0 group-hover:opacity-60 hover:opacity-100 hover:text-rose-400 cursor-pointer flex-shrink-0"
                    />
                  </div>
                  {n.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {n.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))
            )}
          </GlassCard>
        </aside>

        {/* Editor */}
        <div>
          {active ? (
            <GlassCard className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-white/10 gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <KindIcon kind={active.kind} />
                  <input
                    value={active.title}
                    onChange={(e) => update({ title: e.target.value })}
                    className="flex-1 bg-transparent text-lg font-semibold text-white placeholder-slate-500 outline-none min-w-0"
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {active.kind === "note" && (
                    <button
                      onClick={() => setPreview((p) => !p)}
                      className={`p-2 rounded-lg ${preview ? "bg-violet-600/20 text-violet-300" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                      title="Toggle preview"
                    >
                      {preview ? <Pencil size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                  {active.kind === "voice" && (
                    <button
                      onClick={listening ? stopVoice : startVoice}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs ${
                        listening ? "bg-rose-500/20 text-rose-300 animate-pulse" : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {listening ? <MicOff size={12} /> : <Mic size={12} />}
                      {listening ? "Stop" : "Record"}
                    </button>
                  )}
                  <ShimmerButton onClick={summarize} disabled={summarizing} size="sm">
                    {summarizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI Summary
                  </ShimmerButton>
                </div>
              </div>

              {/* Tags */}
              <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2 flex-wrap">
                <Tag size={12} className="text-slate-500" />
                {active.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs">
                    #{t}
                    <button onClick={() => removeTag(t)} className="hover:text-white">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag..."
                  className="bg-transparent text-xs text-white outline-none w-20 placeholder-slate-600"
                />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-0">
                {active.kind === "youtube" && active.videoId ? (
                  <div className="md:col-span-2 p-4 overflow-y-auto scrollbar-thin">
                    <div className="aspect-video w-full max-w-2xl rounded-xl overflow-hidden mb-4">
                      <iframe
                        src={`https://www.youtube.com/embed/${active.videoId}`}
                        title={active.title}
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                    <MarkdownRenderer content={active.summary || "Generating..."} />
                  </div>
                ) : (
                  <>
                    {!preview && (
                      <textarea
                        value={active.content}
                        onChange={(e) => update({ content: e.target.value })}
                        placeholder={
                          active.kind === "voice"
                            ? "Tap Record above to start dictating..."
                            : "Start writing... markdown is supported."
                        }
                        className="md:col-span-1 col-span-2 w-full h-full p-4 bg-transparent text-sm text-white placeholder-slate-600 outline-none resize-none scrollbar-thin font-mono leading-relaxed"
                      />
                    )}
                    {(preview || active.content) && (
                      <div className={`overflow-y-auto scrollbar-thin p-4 ${preview ? "" : "border-l border-white/10 hidden md:block"}`}>
                        {active.content ? <MarkdownRenderer content={active.content} /> : <p className="text-slate-500 text-sm italic">Preview...</p>}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* AI Summary */}
              <AnimatePresence>
                {showSummary && active.summary && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 overflow-hidden">
                    <div className="p-4 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 max-h-64 overflow-y-auto scrollbar-thin">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-violet-300 flex items-center gap-2">
                          <Brain size={12} /> AI Summary
                        </h3>
                        <button onClick={() => setShowSummary(false)} className="text-slate-400 hover:text-white">
                          <X size={14} />
                        </button>
                      </div>
                      <MarkdownRenderer content={active.summary} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ) : (
            <GlassCard className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Sparkles size={36} className="text-violet-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to <span className="animate-gradient-text">Capture Studio</span>
              </h2>
              <p className="text-sm text-slate-400 mb-6 max-w-md">
                One canvas for everything: type notes, dictate voice memos, or summarise YouTube videos.
                AI organises and analyses everything you capture.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <ShimmerButton onClick={createNote}>
                  <StickyNote size={14} /> Note
                </ShimmerButton>
                <ShimmerButton onClick={createVoiceNote} variant="secondary">
                  <Mic size={14} /> Voice
                </ShimmerButton>
                <ShimmerButton onClick={() => setTab("youtube")} variant="secondary">
                  <MonitorPlay size={14} /> YouTube
                </ShimmerButton>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
