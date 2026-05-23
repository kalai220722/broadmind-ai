import { NextRequest } from "next/server";

// ── System prompt (same as WhatsApp bot) ────────────────────────────
const SYSTEM_PROMPT = `You are BroadMind AI Doubt Solver — a brilliant, patient tutor who helps students from Class 8 to PhD level across ALL subjects.

RULES:
1. DETECT the language the student is using and REPLY in that SAME language (Tamil, Hindi, Telugu, English, etc.)
2. If the student mixes languages (e.g., Tamil + English), reply in the same mix.
3. Always provide step-by-step solutions.
4. Use analogies that relate to everyday Indian life to explain concepts.
5. For math/physics/chemistry: show the full working with formulas.
6. For coding questions: provide clean, commented code.
7. Keep answers concise but complete.
8. Use emojis sparingly to make it friendly: ✅ for correct steps, 📝 for notes, 💡 for tips.
9. At the end of each answer, ask a quick follow-up question to check understanding.
10. If you don't know something, say so honestly — never make up answers.

SUBJECTS YOU COVER:
- Mathematics (all levels), Physics, Chemistry, Biology
- Computer Science, Engineering (all branches)
- Medicine, Law, Commerce, Management, Arts
- Competitive exams: JEE, NEET, UPSC, GATE, CAT
- 100+ college disciplines

TONE: Friendly, encouraging, like a smart senior student helping a junior. Never condescending.

FORMAT:
- Use **bold** for headings and key terms
- Use numbered lists for steps
- Keep paragraphs short (2-3 lines max)
- Use line breaks between sections`;

// ── Provider info ───────────────────────────────────────────────────
const PROVIDERS: Record<
  string,
  { name: string; emoji: string; model: string }
> = {
  gemini: { name: "Google Gemini", emoji: "🟢", model: "gemini-2.0-flash" },
  chatgpt: { name: "ChatGPT", emoji: "🟡", model: "gpt-4o-mini" },
  claude: { name: "BroadMind AI", emoji: "🟠", model: "claude-sonnet-4-20250514" },
  kimi: { name: "Kimi", emoji: "🔵", model: "moonshot-v1-8k" },
};

// ── Gemini handler ──────────────────────────────────────────────────
async function callGemini(
  messages: { role: string; content: string }[]
) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "user" ? "user" : ("model" as const),
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history: history.length > 0 ? history : undefined,
  });

  const lastMsg = messages[messages.length - 1].content;
  const result = await chat.sendMessage(lastMsg);
  return result.response.text();
}

// ── ChatGPT handler ─────────────────────────────────────────────────
async function callChatGPT(
  messages: { role: string; content: string }[]
) {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const result = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    max_tokens: 2000,
  });

  return result.choices[0].message.content || "";
}

// ── Claude handler ──────────────────────────────────────────────────
async function callClaude(
  messages: { role: string; content: string }[]
) {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });

  const result = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  return result.content[0].type === "text" ? result.content[0].text : "";
}

// ── Kimi handler ────────────────────────────────────────────────────
async function callKimi(
  messages: { role: string; content: string }[]
) {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({
    apiKey: process.env.KIMI_API_KEY!,
    baseURL: process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1",
  });

  const result = await client.chat.completions.create({
    model: "moonshot-v1-8k",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    max_tokens: 2000,
  });

  return result.choices[0].message.content || "";
}

// ── Available providers ─────────────────────────────────────────────
function getAvailableProviders(): string[] {
  const available: string[] = [];
  if (process.env.GEMINI_API_KEY) available.push("gemini");
  if (process.env.OPENAI_API_KEY) available.push("chatgpt");
  if (process.env.CLAUDE_API_KEY) available.push("claude");
  if (process.env.KIMI_API_KEY) available.push("kimi");
  return available;
}

// ── GET: return available providers ─────────────────────────────────
export async function GET() {
  const available = getAvailableProviders();
  const defaultProvider = process.env.DEFAULT_AI_PROVIDER || "gemini";
  return Response.json({
    providers: PROVIDERS,
    available,
    defaultProvider: available.includes(defaultProvider)
      ? defaultProvider
      : available[0] || "gemini",
  });
}

// ── POST: solve a doubt ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      provider: requestedProvider,
    }: {
      messages: { role: string; content: string }[];
      provider: string;
    } = body;

    if (!messages || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const available = getAvailableProviders();
    const provider = available.includes(requestedProvider)
      ? requestedProvider
      : available[0];

    if (!provider) {
      return Response.json(
        {
          error:
            "No AI provider configured. Add at least one API key to .env.local",
        },
        { status: 503 }
      );
    }

    let response: string;

    switch (provider) {
      case "gemini":
        response = await callGemini(messages);
        break;
      case "chatgpt":
        response = await callChatGPT(messages);
        break;
      case "claude":
        response = await callClaude(messages);
        break;
      case "kimi":
        response = await callKimi(messages);
        break;
      default:
        response = await callGemini(messages);
    }

    return Response.json({
      response,
      provider,
      providerInfo: PROVIDERS[provider],
    });
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Doubt solver error:", errMsg);

    // Friendly error messages
    let userMessage = errMsg;
    if (errMsg.includes("quota") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
      userMessage = "⏳ API rate limit reached. The free Gemini tier has a daily quota — please wait a minute and try again, or add a paid API key for unlimited access.";
    } else if (errMsg.includes("API key") || errMsg.includes("401") || errMsg.includes("403")) {
      userMessage = "🔑 Invalid API key. Please check your API key in .env.local and restart the server.";
    } else if (errMsg.includes("network") || errMsg.includes("ENOTFOUND")) {
      userMessage = "🌐 Network error. Please check your internet connection and try again.";
    }

    return Response.json({ error: userMessage }, { status: 500 });
  }
}
