import type { ChatMode } from "@/data/figurePrompts";
import type { AnswerPlan } from "@/lib/answerPlanner";

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

export function shouldRunAnswerCritic(plan: AnswerPlan) {
  if (plan.answerDepth === "tiny" || plan.answerDepth === "short") {
    return false;
  }

  if (
    plan.intent === "casual" ||
    plan.intent === "factual_simple" ||
    plan.intent === "emotional"
  ) {
    return false;
  }

  return (
    plan.answerDepth === "deep" ||
    plan.characterIntensity >= 2 ||
    plan.intent === "philosophical" ||
    plan.intent === "creative" ||
    plan.intent === "factual_deep"
  );
}

export async function improveAnswerWithCritic({
  apiKey,
  figureNameKa,
  figureNameEn,
  chatMode,
  latestUserMessage,
  answerPlan,
  draftAnswer,
}: {
  apiKey: string;
  figureNameKa: string;
  figureNameEn: string;
  chatMode: ChatMode;
  latestUserMessage: string;
  answerPlan: AnswerPlan;
  draftAnswer: string;
}) {
  const cleanDraft = draftAnswer.trim();

  if (!cleanDraft) {
    return draftAnswer;
  }

  const instructions = `
You are the hidden critic and final editor for a historical character chat system.

You do not answer as yourself.
You improve the draft answer only if it needs improvement.

Character:
${figureNameKa} / ${figureNameEn}

Mode:
${chatMode}

Your job:
- preserve the character's voice
- preserve the factual meaning
- make the answer more natural, direct, and conversational
- make sure it follows the answer plan
- reduce overacting, lecturing, generic wording, and essay-like structure
- do not add new unsupported facts
- do not make the answer longer unless truly necessary
- do not remove necessary historical uncertainty
- do not mention planner, critic, JSON, or internal process

Check for these problems:
- did not answer the user directly
- too long for the plan
- too preachy
- too theatrical
- too generic
- too academic
- too motivational-coach-like
- character intensity too high
- repeated same character themes
- ignored emotional tone
- invented or overclaimed facts

If the draft is already good, return it mostly unchanged.
Return ONLY the final answer text.
`;

  const input = `
Latest user message:
${latestUserMessage}

Answer plan:
Intent: ${answerPlan.intent}
Hidden user need: ${answerPlan.hiddenUserNeed}
Answer depth: ${answerPlan.answerDepth}
Character intensity: ${answerPlan.characterIntensity}
Answer shape: ${answerPlan.answerShape}
Tone: ${answerPlan.tone}
Avoid:
${answerPlan.avoid.map((item) => `- ${item}`).join("\n")}
Character move:
${answerPlan.characterMove}

Draft answer:
${cleanDraft}

Rewrite only if needed.
Return only the final answer.
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model:
        process.env.OPENAI_CRITIC_MODEL ||
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
    throw new Error(`Critic API error: ${errorText}`);
  }

  const data = await response.json();
  const improved = extractTextFromResponse(data).trim();

  if (!improved) {
    return draftAnswer;
  }

  return improved;
}