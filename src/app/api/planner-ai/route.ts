import { NextRequest } from "next/server";

const PROMPT = `You are an AI study coach for Indian students. Generate a personalised daily/weekly study plan as JSON.

Consider:
- Student profile (level, pace, learning style, weak topics)
- Available time per day
- Upcoming exam (if any) and days until
- Target subjects

OUTPUT STRICT JSON ONLY:
{
  "title": "Day/Week label",
  "rationale": "1-2 sentence why this plan matches the student",
  "tasks": [
    {
      "title": "What to study",
      "subject": "Math | Physics | etc",
      "duration": 30,
      "type": "study | revise | practice | rest",
      "priority": "high | medium | low",
      "reason": "Brief why this is in the plan"
    }
  ],
  "tip": "One actionable tip for the day"
}

Rules:
- 4-7 tasks per day, 60-180 total minutes.
- Mix concept-learning + practice.
- Include short breaks between blocks.
- Prioritise weak topics where mastery < 50.
- Respect pace (slow → fewer/longer blocks, fast → more/shorter blocks).
- Match learning style to task type when possible.`;

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
    max_tokens: 2500,
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
    const body = await req.json();
    const {
      level = "intermediate",
      pace = "medium",
      style = "stepByStep",
      weakTopics = [],
      strongTopics = [],
      availableMinutes = 90,
      targetExam = "",
      daysUntilExam = null,
      subjects = ["General"],
      language = "English",
    } = body;

    const prompt = `Student profile:
- Level: ${level}
- Pace: ${pace}
- Dominant learning style: ${style}
- Weak topics (need attention): ${(weakTopics || []).join(", ") || "none yet"}
- Strong topics: ${(strongTopics || []).join(", ") || "none yet"}
- Subjects today: ${subjects.join(", ")}
- Available time: ${availableMinutes} minutes
- Target exam: ${targetExam || "general study"}
- Days until exam: ${daysUntilExam ?? "n/a"}
- Reply language: ${language}`;

    let raw = "";
    if (process.env.GROQ_API_KEY) raw = await callGroq(prompt);
    else if (process.env.GEMINI_API_KEY) raw = await callGemini(prompt);
    else return Response.json({ error: "No AI provider configured" }, { status: 503 });

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    return Response.json(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
