import { NextRequest } from "next/server";

const SUMMARIZE_PROMPT = `You are a study notes assistant. Given raw input — typed notes, voice-transcribed text, or a YouTube link/topic — produce a beautifully structured markdown summary.

Format:
- Start with **TL;DR** (1 sentence).
- Then **## Key Points** (4-7 bullets).
- Then **## Important Concepts** (with bold terms).
- Then **## Quick Quiz** (3 self-check questions).
- If LaTeX math is present, preserve it.
- If the input is in Tamil/Hindi/etc., reply in that language.`;

const YT_PROMPT = `You are a YouTube content summarizer. Given a URL or topic, produce a study summary based on what the video likely covers.

OUTPUT MARKDOWN:
**TL;DR:** 1-sentence summary.

## Key Points
- 5 main takeaways

## Concepts
- Bolded **terms** with brief definitions.

## Quick Quiz
1. Question — Answer
2. Question — Answer
3. Question — Answer

Be honest about uncertainty.`;

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  return m ? m[1] : null;
}

async function callGroq(systemPrompt: string, content: string) {
  const Groq = (await import("groq-sdk")).default;
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  const result = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
    max_tokens: 2500,
  });
  return result.choices[0].message.content || "";
}

async function callGemini(systemPrompt: string, content: string) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: systemPrompt });
  const result = await model.generateContent(content);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const { mode, content } = await req.json();
    if (!content || content.length < 5) return Response.json({ error: "Content too short" }, { status: 400 });

    let systemPrompt = SUMMARIZE_PROMPT;
    let userContent = content;

    if (mode === "youtube") {
      systemPrompt = YT_PROMPT;
      const vid = extractVideoId(content);
      userContent = vid ? `YouTube URL: ${content}\nVideo ID: ${vid}` : `Topic/Title: ${content}`;
    }

    let summary = "";
    if (process.env.GROQ_API_KEY) summary = await callGroq(systemPrompt, userContent);
    else if (process.env.GEMINI_API_KEY) summary = await callGemini(systemPrompt, userContent);
    else return Response.json({ error: "No AI provider configured" }, { status: 503 });

    return Response.json({ summary, videoId: mode === "youtube" ? extractVideoId(content) : null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
