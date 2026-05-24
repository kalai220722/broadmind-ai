import { NextRequest } from "next/server";

const QUIZ_PROMPT = `You are a quiz generator. Generate exactly the requested number of multiple-choice questions on the topic at the given difficulty.

OUTPUT STRICT JSON ONLY:
{ "questions": [
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Brief why."
  }
] }

Rules:
- Always 4 options, exactly one correct, vary correct position.
- 1-2 sentence explanation.
- easy = recall, medium = application, hard = reasoning.
- Generate in topic's language.`;

const CARDS_PROMPT = `You are a flashcard generator. Generate exactly the requested number of high-quality flashcards on the topic.

OUTPUT STRICT JSON ONLY:
{ "cards": [ { "front": "Question or term (<= 12 words)", "back": "Concise answer (1-3 sentences)" } ] }

Rules:
- No duplicates, mix difficulty.
- Generate in topic's language.`;

async function callGroq(systemPrompt: string, userPrompt: string) {
  const Groq = (await import("groq-sdk")).default;
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  const result = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 3500,
  });
  return result.choices[0].message.content || "{}";
}

async function callGemini(systemPrompt: string, userPrompt: string) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

function safeParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mode, topic, count = 5, difficulty = "medium" } = await req.json();
    if (!topic) return Response.json({ error: "Topic required" }, { status: 400 });

    if (mode === "quiz") {
      const userPrompt = `Topic: ${topic}\nDifficulty: ${difficulty}\nCount: ${count}`;
      let raw = "";
      if (process.env.GROQ_API_KEY) raw = await callGroq(QUIZ_PROMPT, userPrompt);
      else if (process.env.GEMINI_API_KEY) raw = await callGemini(QUIZ_PROMPT, userPrompt);
      else return Response.json({ error: "No AI provider configured" }, { status: 503 });
      const parsed = safeParse(raw);
      return Response.json({ questions: parsed.questions || [] });
    } else {
      // mode === "cards"
      const userPrompt = `Topic: ${topic}\nCount: ${count}`;
      let raw = "";
      if (process.env.GROQ_API_KEY) raw = await callGroq(CARDS_PROMPT, userPrompt);
      else if (process.env.GEMINI_API_KEY) raw = await callGemini(CARDS_PROMPT, userPrompt);
      else return Response.json({ error: "No AI provider configured" }, { status: 503 });
      const parsed = safeParse(raw);
      return Response.json({ cards: parsed.cards || [] });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
