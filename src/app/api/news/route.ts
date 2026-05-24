import { NextRequest } from "next/server";

const PROMPT = `You are a news curator for Indian students. Generate today's top news in JSON, focused on the user's interests (exams / subjects / region).

OUTPUT STRICT JSON ONLY:
{
  "stories": [
    {
      "id": "unique-id",
      "title": "Headline",
      "summary": "2-3 sentence summary explaining what happened and why it matters",
      "category": "national | international | sci-tech | economy | sports | education | exams",
      "tags": ["tag1", "tag2"],
      "examRelevant": ["UPSC", "SSC", "Banking"],
      "readTime": 2,
      "publishedAt": "Today / Yesterday / 2 days ago",
      "sourceHint": "Likely source category"
    }
  ]
}

Rules:
- Generate 8-12 stories.
- Mix categories with a bias toward user's interests.
- Each story should be realistic, current-affairs flavoured (use evergreen topics if you're unsure of latest news).
- If user language is non-English, write summaries in that language.
- examRelevant should match common Indian competitive exams.`;

async function callGroq(prompt: string) {
  const Groq = (await import("groq-sdk")).default;
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  const result = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 3000,
  });
  return result.choices[0].message.content || "{}";
}

async function callGemini(prompt: string) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const { interests = [], language = "English", region = "India" } = await req.json();
    const interestStr = interests.length > 0 ? interests.join(", ") : "general current affairs";
    const userPrompt = `User interests: ${interestStr}\nLanguage: ${language}\nRegion: ${region}\nDate: ${new Date().toDateString()}`;

    let raw = "";
    if (process.env.GROQ_API_KEY) raw = await callGroq(userPrompt);
    else if (process.env.GEMINI_API_KEY) raw = await callGemini(userPrompt);
    else return Response.json({ error: "No AI provider configured" }, { status: 503 });

    let parsed: { stories?: unknown[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    return Response.json({ stories: parsed.stories || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
