import type { ChatMode } from "@/data/figurePrompts";

export type ChatMessageForPlanning = {
  role: "user" | "assistant";
  text: string;
};

export type AnswerPlan = {
  intent:
    | "casual"
    | "factual_simple"
    | "factual_deep"
    | "emotional"
    | "practical"
    | "philosophical"
    | "creative"
    | "provocative"
    | "unclear";
  hiddenUserNeed: string;
  answerDepth: "tiny" | "short" | "normal" | "deep";
  characterIntensity: 0 | 1 | 2 | 3;
  answerShape:
    | "direct_answer"
    | "brief_reply_question_back"
    | "fact_then_context"
    | "emotion_then_guidance"
    | "practical_steps"
    | "philosophical_reflection"
    | "creative_monologue"
    | "careful_correction"
    | "clarifying_question";
  shouldUseRag: boolean;
  shouldUseWeb: boolean;
  tone: string;
  avoid: string[];
  characterMove: string;
};

export const fallbackAnswerPlan: AnswerPlan = {
  intent: "unclear",
  hiddenUserNeed: "The user likely wants a direct useful answer.",
  answerDepth: "normal",
  characterIntensity: 1,
  answerShape: "direct_answer",
  shouldUseRag: false,
  shouldUseWeb: false,
  tone: "clear, natural, restrained",
  avoid: ["overacting", "long lecture", "generic answer"],
  characterMove: "Answer the question directly and stay natural.",
};

function formatConversation(messages: ChatMessageForPlanning[]) {
  return messages
    .slice(-6)
    .map((message) => {
      const speaker = message.role === "user" ? "User" : "Assistant";
      return `${speaker}: ${message.text}`;
    })
    .join("\n\n");
}

function extractTextFromResponse(data: unknown) {
  const response = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  const textFromOutput = response.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter((text): text is string => typeof text === "string")
    .join("");

  return textFromOutput ?? "";
}

function extractJsonObject(text: string) {
  const cleaned = text.trim();

  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    return cleaned;
  }

  const match = cleaned.match(/\{[\s\S]*\}/);
  return match?.[0] ?? "";
}

function normalizePlan(value: Partial<AnswerPlan>): AnswerPlan {
  const intents: AnswerPlan["intent"][] = [
    "casual",
    "factual_simple",
    "factual_deep",
    "emotional",
    "practical",
    "philosophical",
    "creative",
    "provocative",
    "unclear",
  ];

  const depths: AnswerPlan["answerDepth"][] = [
    "tiny",
    "short",
    "normal",
    "deep",
  ];

  const shapes: AnswerPlan["answerShape"][] = [
    "direct_answer",
    "brief_reply_question_back",
    "fact_then_context",
    "emotion_then_guidance",
    "practical_steps",
    "philosophical_reflection",
    "creative_monologue",
    "careful_correction",
    "clarifying_question",
  ];

  const intensity =
    typeof value.characterIntensity === "number"
      ? Math.min(3, Math.max(0, Math.round(value.characterIntensity)))
      : fallbackAnswerPlan.characterIntensity;

  return {
    intent: value.intent && intents.includes(value.intent) ? value.intent : "unclear",
    hiddenUserNeed:
      typeof value.hiddenUserNeed === "string" && value.hiddenUserNeed.trim()
        ? value.hiddenUserNeed.trim()
        : fallbackAnswerPlan.hiddenUserNeed,
    answerDepth:
      value.answerDepth && depths.includes(value.answerDepth)
        ? value.answerDepth
        : fallbackAnswerPlan.answerDepth,
    characterIntensity: intensity as AnswerPlan["characterIntensity"],
    answerShape:
      value.answerShape && shapes.includes(value.answerShape)
        ? value.answerShape
        : fallbackAnswerPlan.answerShape,
    shouldUseRag: Boolean(value.shouldUseRag),
    shouldUseWeb: Boolean(value.shouldUseWeb),
    tone:
      typeof value.tone === "string" && value.tone.trim()
        ? value.tone.trim()
        : fallbackAnswerPlan.tone,
    avoid: Array.isArray(value.avoid)
      ? value.avoid.filter((item): item is string => typeof item === "string")
      : fallbackAnswerPlan.avoid,
    characterMove:
      typeof value.characterMove === "string" && value.characterMove.trim()
        ? value.characterMove.trim()
        : fallbackAnswerPlan.characterMove,
  };
}

export function formatAnswerPlanForPrompt(plan: AnswerPlan) {
  return `
ANSWER PLAN:
Intent: ${plan.intent}
Hidden user need: ${plan.hiddenUserNeed}
Answer depth: ${plan.answerDepth}
Character intensity: ${plan.characterIntensity}
Answer shape: ${plan.answerShape}
Use internal RAG: ${plan.shouldUseRag ? "yes" : "no"}
Use web search: ${plan.shouldUseWeb ? "yes" : "no"}
Tone: ${plan.tone}
Avoid:
${plan.avoid.map((item) => `- ${item}`).join("\n")}
Character move:
${plan.characterMove}

Follow this plan strictly.
If character intensity is 0 or 1, do not overperform the character.
If answer depth is tiny or short, keep the answer compact.
If the plan says to avoid lectures, do not lecture.
If the plan says to answer directly, answer directly first.
`;
}

export async function createAnswerPlan({
  apiKey,
  figureNameKa,
  figureNameEn,
  chatMode,
  webSearchEnabled,
  messages,
}: {
  apiKey: string;
  figureNameKa: string;
  figureNameEn: string;
  chatMode: ChatMode;
  webSearchEnabled: boolean;
  messages: ChatMessageForPlanning[];
}) {
  const conversation = formatConversation(messages);
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.text ??
    "";

  const instructions = `
You are the hidden planning brain for a character conversation system.

You do not answer the user.
You analyze the latest user message and return ONLY valid JSON.

Your job:
- understand what the user really wants
- choose answer depth
- choose character intensity
- decide whether internal RAG is needed
- decide whether web search is needed
- prevent overacting, lecturing, and generic answers

Character:
${figureNameKa} / ${figureNameEn}

Mode:
${chatMode}

Character intensity scale:
0 = mostly plain human answer
1 = light character flavor
2 = clear character worldview
3 = full immersive character expression

Use intensity 0–1 for:
- greetings
- small talk
- simple questions
- "how are you?"
- short requests

Use intensity 2 for:
- advice
- emotional struggle
- meaningful personal questions
- social/moral questions

Use intensity 3 for:
- speeches
- poems
- letters
- deep philosophy
- explicitly immersive requests
- big worldview questions

RAG rules:
Use internal RAG for factual or historical questions, names, dates, events, verification, and source-sensitive claims.
Do not use RAG for greetings, small talk, emotional support, or purely creative requests unless factual accuracy is needed.

Web rules:
If webSearchEnabled is false, shouldUseWeb must be false.
If webSearchEnabled is true, shouldUseWeb can be true for current/source-backed/advanced factual questions.
Live web search may not be connected yet, but still mark intent correctly.

Return exactly this JSON shape:
{
  "intent": "casual | factual_simple | factual_deep | emotional | practical | philosophical | creative | provocative | unclear",
  "hiddenUserNeed": "short explanation",
  "answerDepth": "tiny | short | normal | deep",
  "characterIntensity": 0,
  "answerShape": "direct_answer | brief_reply_question_back | fact_then_context | emotion_then_guidance | practical_steps | philosophical_reflection | creative_monologue | careful_correction | clarifying_question",
  "shouldUseRag": false,
  "shouldUseWeb": false,
  "tone": "short tone description",
  "avoid": ["things to avoid"],
  "characterMove": "what the final answer should do"
}
`;

  const input = `
Recent conversation:
${conversation}

Latest user message:
${latestUserMessage}

webSearchEnabled: ${webSearchEnabled ? "true" : "false"}
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model:
        process.env.OPENAI_PLANNER_MODEL ||
        process.env.OPENAI_MODEL ||
        "gpt-5.4",
      instructions,
      input,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Planner API error: ${errorText}`);
  }

  const data = await response.json();
  const text = extractTextFromResponse(data);
  const jsonText = extractJsonObject(text);

  if (!jsonText) {
    throw new Error("Planner did not return JSON.");
  }

  const parsed = JSON.parse(jsonText) as Partial<AnswerPlan>;
  return normalizePlan(parsed);
}