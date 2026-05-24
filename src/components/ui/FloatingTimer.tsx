"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, X, Coffee, Brain, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { track } from "@/lib/personalization";
import { celebrate } from "@/lib/confetti";

type Mode = "focus" | "shortBreak" | "longBreak";

const PRESETS: Record<Mode, { label: string; minutes: number; color: string }> = {
  focus: { label: "Focus", minutes: 25, color: "from-violet-500 to-fuchsia-600" },
  shortBreak: { label: "Short break", minutes: 5, color: "from-cyan-500 to-blue-600" },
  longBreak: { label: "Long break", minutes: 15, color: "from-emerald-500 to-teal-600" },
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function FloatingTimer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(PRESETS.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hide on landing & login — driven by Next.js routing, not window
  const hidden = pathname === "/" || pathname === "/login";

  const preset = PRESETS[mode];
  const total = preset.minutes * 60;
  const progress = ((total - secondsLeft) / total) * 100;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          if (mode === "focus") {
            track("pomodoro_completed", { minutes: preset.minutes });
            celebrate();
            toast.success("Focus done! Take a break. 🎉");
            playBell();
            setMode("shortBreak");
            return PRESETS.shortBreak.minutes * 60;
          } else {
            toast("Back to work! 💪");
            playBell();
            setMode("focus");
            return PRESETS.focus.minutes * 60;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  useEffect(() => {
    if (!running) setSecondsLeft(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const playBell = () => {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isRunning = running;

  if (hidden) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="open"
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-violet-900/30 p-3 w-[260px]"
          >
            {/* Mode tabs */}
            <div className="flex bg-white/5 rounded-lg p-0.5 mb-2 text-[11px]">
              {(Object.keys(PRESETS) as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    if (isRunning) {
                      toast.error("Pause first");
                      return;
                    }
                    setMode(m);
                  }}
                  className={`flex-1 py-1 rounded-md font-medium transition ${
                    mode === m
                      ? `bg-gradient-to-r ${PRESETS[m].color} text-white`
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "focus" ? "Focus" : m === "shortBreak" ? "Short" : "Long"}
                </button>
              ))}
            </div>

            {/* Timer display */}
            <div className="relative my-2 flex items-center justify-center h-24">
              <svg width="92" height="92" className="-rotate-90">
                <defs>
                  <linearGradient id="ftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <circle cx="46" cy="46" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle
                  cx="46"
                  cy="46"
                  r="40"
                  fill="none"
                  stroke="url(#ftGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 - (progress / 100) * 2 * Math.PI * 40}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-white tabular-nums">
                  {pad(mins)}:{pad(secs)}
                </div>
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">
                  {mode === "focus" ? <Brain size={9} /> : <Coffee size={9} />}
                  {preset.label}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setRunning((r) => !r)}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition ${
                  running
                    ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    : "bg-gradient-to-r from-violet-600 to-cyan-600 text-white"
                }`}
              >
                {running ? <Pause size={12} /> : <Play size={12} />}
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(total);
                }}
                className="flex items-center justify-center gap-1 py-1.5 rounded-md text-xs text-slate-300 bg-white/5 hover:bg-white/10"
              >
                <RotateCcw size={11} /> Reset
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center py-1.5 rounded-md text-xs text-slate-400 bg-white/5 hover:bg-white/10"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Collapsed pill */
          <motion.button
            key="closed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl border shadow-lg transition ${
              running
                ? `bg-gradient-to-r ${preset.color} text-white border-white/30 shadow-violet-500/40`
                : "bg-slate-900/80 text-slate-200 border-white/10 hover:bg-slate-800/80"
            }`}
            aria-label="Open focus timer"
          >
            <Timer size={14} className={running ? "animate-pulse" : ""} />
            <span className="text-xs font-medium tabular-nums">
              {running ? `${pad(mins)}:${pad(secs)}` : "Focus"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
