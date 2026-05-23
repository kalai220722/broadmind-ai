"use client";

import ModuleLayout from "@/components/modules/ModuleLayout";
import {
  Camera,
  Upload,
  Clock,
  CheckCircle,
  Send,
  Sparkles,
  Loader2,
  Bot,
  User,
  Smartphone,
  Globe,
  RefreshCw,
  X,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ── Types ───────────────────────────────────────────────────────────
interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  providerEmoji?: string;
  timestamp: Date;
  image?: string; // base64 data URL for uploaded images
}

interface ProviderInfo {
  name: string;
  emoji: string;
  model: string;
}

// ── Provider config (client-side) ───────────────────────────────────
const PROVIDER_COLORS: Record<string, string> = {
  gemini: "#34A853",
  chatgpt: "#F59E0B",
  claude: "#F97316",
  kimi: "#3B82F6",
};

const recentDoubts = [
  { q: "Kirchhoff's Current Law derivation", subject: "Electronics", time: "2h ago", solved: true },
  { q: "Thevenin's theorem step-by-step", subject: "Circuits", time: "1d ago", solved: true },
  { q: "Integration by parts formula", subject: "Maths", time: "2d ago", solved: true },
  { q: "Normalization in DBMS", subject: "CS", time: "3d ago", solved: true },
];

export default function DoubtSolverPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [providers, setProviders] = useState<Record<string, ProviderInfo>>({});
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showProviderPicker, setShowProviderPicker] = useState(false);
  const [doubtCount, setDoubtCount] = useState(156);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available providers on mount
  useEffect(() => {
    fetch("/api/doubt-solver")
      .then((res) => res.json())
      .then((data) => {
        setProviders(data.providers);
        setAvailableProviders(data.available);
        if (data.defaultProvider) setProvider(data.defaultProvider);
      })
      .catch(() => {
        // Fallback — show all providers as options
        setProviders({
          gemini: { name: "Google Gemini", emoji: "🟢", model: "gemini-1.5-flash" },
          chatgpt: { name: "ChatGPT", emoji: "🟡", model: "gpt-4o-mini" },
          claude: { name: "BroadMind AI", emoji: "🟠", model: "claude-sonnet-4-20250514" },
          kimi: { name: "Kimi", emoji: "🔵", model: "moonshot-v1-8k" },
        });
      });
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Send message to API
  const handleSend = async () => {
    const text = input.trim();
    if (!text && !uploadedImage) return;

    const userContent = uploadedImage
      ? `[Image uploaded]\n${text || "Solve this problem from the image"}`
      : text;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
      image: uploadedImage || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setUploadedImage(null);
    setIsLoading(true);

    try {
      // Build conversation history (last 10 messages for context)
      const history = [...messages.slice(-10), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/doubt-solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, provider }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: `❌ ${data.error}`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: data.response,
            provider: data.providerInfo?.name,
            providerEmoji: data.providerInfo?.emoji,
            timestamp: new Date(),
          },
        ]);
        setDoubtCount((c) => c + 1);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "❌ Could not connect to the AI service. Make sure you've added an API key in `.env.local` and restarted the server.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
  };

  const currentProviderInfo = providers[provider];

  return (
    <ModuleLayout moduleId="doubt-solver">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Chat Area ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Provider selector bar */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowProviderPicker(!showProviderPicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  <span className="text-lg">{currentProviderInfo?.emoji || "🤖"}</span>
                  <span className="text-sm text-white font-medium">
                    {currentProviderInfo?.name || "Select Model"}
                  </span>
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Provider dropdown */}
                {showProviderPicker && (
                  <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl z-50 overflow-hidden">
                    {Object.entries(providers).map(([key, info]) => {
                      const isAvailable = availableProviders.includes(key);
                      const isActive = provider === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            if (isAvailable) {
                              setProvider(key);
                              setShowProviderPicker(false);
                            }
                          }}
                          disabled={!isAvailable}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isActive
                              ? "bg-emerald-600/10 border-l-2 border-emerald-500"
                              : isAvailable
                              ? "hover:bg-slate-800 border-l-2 border-transparent"
                              : "opacity-40 cursor-not-allowed border-l-2 border-transparent"
                          }`}
                        >
                          <span className="text-lg">{info.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">{info.name}</p>
                            <p className="text-[10px] text-slate-500">{info.model}</p>
                          </div>
                          {isActive && <CheckCircle size={14} className="text-emerald-400" />}
                          {!isAvailable && (
                            <span className="text-[10px] text-red-400">No key</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="h-5 w-px bg-slate-700" />

              <div className="flex items-center gap-1.5">
                <Smartphone size={13} className="text-emerald-400" />
                <span className="text-[11px] text-slate-400">
                  Also on <span className="text-emerald-400 font-medium">WhatsApp</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw size={12} />
                Reset
              </button>
            </div>
          </div>

          {/* Chat container */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col h-[560px]">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-emerald-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    Ask Any Doubt
                  </h3>
                  <p className="text-sm text-slate-400 mb-6 max-w-md">
                    Type your question, upload a photo of a problem, or pick a suggestion below.
                    Powered by {currentProviderInfo?.name || "AI"}.
                  </p>

                  {/* Suggestion chips */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {[
                      "Solve: ∫ x²·sin(x) dx",
                      "Explain Kirchhoff's law",
                      "Write binary search in Python",
                      "What is mitosis vs meiosis?",
                      "Derive quadratic formula",
                      "Explain TCP/IP in Tamil",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="text-xs px-3 py-2 rounded-full border border-slate-700 text-slate-300 hover:bg-emerald-600/10 hover:border-emerald-600/30 hover:text-emerald-300 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* WhatsApp connection banner */}
                  <div className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600/5 border border-emerald-600/20 max-w-md">
                    <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={18} className="text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-emerald-300 font-medium">WhatsApp Doubt Solver</p>
                      <p className="text-[11px] text-slate-400">
                        Same AI on WhatsApp — message your doubts 24/7 with /model switching
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        {/* Avatar */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === "user"
                              ? "bg-violet-600"
                              : "bg-emerald-600/20"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <User size={14} className="text-white" />
                          ) : (
                            <Bot size={14} className="text-emerald-400" />
                          )}
                        </div>

                        {/* Message bubble */}
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm ${
                            msg.role === "user"
                              ? "bg-emerald-600 text-white rounded-br-md"
                              : "bg-slate-800 text-slate-200 rounded-bl-md"
                          }`}
                        >
                          {/* Provider badge for assistant */}
                          {msg.role === "assistant" && msg.provider && (
                            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-700">
                              <span className="text-xs">{msg.providerEmoji}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{msg.provider}</span>
                            </div>
                          )}

                          {/* Uploaded image preview */}
                          {msg.image && (
                            <div className="mb-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={msg.image}
                                alt="Uploaded problem"
                                className="rounded-lg max-h-48 object-contain"
                              />
                            </div>
                          )}

                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                          <p className={`text-[10px] mt-1.5 ${
                            msg.role === "user" ? "text-emerald-200" : "text-slate-500"
                          }`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-2 max-w-[85%]">
                        <div className="w-7 h-7 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                          <Bot size={14} className="text-emerald-400" />
                        </div>
                        <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="text-emerald-400 animate-spin" />
                            <span className="text-xs text-slate-400">
                              {currentProviderInfo?.emoji} {currentProviderInfo?.name || "AI"} is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Image preview bar */}
            {uploadedImage && (
              <div className="border-t border-slate-800 px-4 py-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedImage}
                  alt="Upload preview"
                  className="h-12 rounded-lg object-contain border border-slate-700"
                />
                <span className="text-xs text-slate-400 flex-1">Image attached</span>
                <button
                  onClick={() => setUploadedImage(null)}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input area */}
            <div className="border-t border-slate-800 p-3">
              <div className="flex items-center gap-2">
                {/* Image upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Upload image"
                >
                  <ImageIcon size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Camera button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Take photo"
                >
                  <Camera size={18} />
                </button>

                {/* Text input */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your doubt here..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-4 py-2.5 outline-none placeholder-slate-500 border border-slate-700 focus:border-emerald-500 transition-colors disabled:opacity-50"
                />

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={isLoading || (!input.trim() && !uploadedImage)}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* WhatsApp Connection Card */}
          <div className="rounded-xl border border-emerald-600/20 bg-emerald-600/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                <Smartphone size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">WhatsApp Bot</h3>
                <p className="text-[11px] text-emerald-400">Connected & Active</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Same AI doubt solver on WhatsApp. Switch AI models with <code className="text-emerald-400 bg-slate-800 px-1 rounded">/model</code> command.
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-emerald-400">✓</span> Multi-model: Gemini, ChatGPT, BroadMind AI, Kimi
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-emerald-400">✓</span> Photo doubt solving
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-emerald-400">✓</span> 22+ language support
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-emerald-400">✓</span> Conversation memory
              </div>
            </div>
          </div>

          {/* AI Model Status */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Globe size={14} className="text-slate-400" />
              AI Models
            </h3>
            <div className="space-y-2">
              {Object.entries(providers).map(([key, info]) => {
                const isAvailable = availableProviders.includes(key);
                const isActive = provider === key;
                return (
                  <button
                    key={key}
                    onClick={() => isAvailable && setProvider(key)}
                    disabled={!isAvailable}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                      isActive
                        ? "bg-slate-800"
                        : isAvailable
                        ? "hover:bg-slate-800/50"
                        : "opacity-40 cursor-not-allowed"
                    }`}
                    style={isActive ? { boxShadow: `0 0 0 1px ${PROVIDER_COLORS[key]}` } : {}}
                  >
                    <span>{info.emoji}</span>
                    <span className="text-sm text-white flex-1">{info.name}</span>
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400">
                        active
                      </span>
                    )}
                    {!isAvailable && (
                      <span className="text-[10px] text-red-400">
                        no key
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{doubtCount}</p>
                <p className="text-[11px] text-slate-400">Doubts Solved</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-cyan-400">92%</p>
                <p className="text-[11px] text-slate-400">Accuracy</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-violet-400">&lt;2s</p>
                <p className="text-[11px] text-slate-400">Avg Response</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{availableProviders.length || 4}</p>
                <p className="text-[11px] text-slate-400">AI Models</p>
              </div>
            </div>
          </div>

          {/* Recent Doubts */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <h3 className="text-white font-semibold mb-4">Recent Doubts</h3>
            <div className="space-y-2">
              {recentDoubts.map((d) => (
                <div
                  key={d.q}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{d.q}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{d.subject}</span>
                      <span>·</span>
                      <Clock size={10} />
                      <span>{d.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
