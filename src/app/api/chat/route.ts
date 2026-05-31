import { buildAnswerVariationInstruction } from "@/data/answerVariation";
import {
  buildFigureSystemPrompt,
  type ChatMode,
} from "@/data/figurePrompts";
import { getFigureBySlug } from "@/data/figures";
import {
  createAnswerPlan,
  fallbackAnswerPlan,
  formatAnswerPlanForPrompt,
} from "@/lib/answerPlanner";
import {
  improveAnswerWithCritic,
  shouldRunAnswerCritic,
} from "@/lib/answerCritic";
import {
  formatRetrievedKnowledgeBlock,
  retrieveRelevantKnowledge,
} from "@/lib/retrieveKnowledge";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type UserPlan = "guest" | "free" | "premium" | "unlimited";

const FREE_DAILY_LIMIT = 15;
const MAX_USER_MESSAGE_LENGTH = 1200;
const MAX_CONTEXT_CHARACTERS = 6000;


function normalizeTextForIntent(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function isFastCasualMessage(text: string) {
  const normalized = normalizeTextForIntent(text);

  if (normalized.length > 80) {
    return false;
  }

  const casualPatterns = [
    "გამარჯობა",
    "სალამი",
    "როგორ ხარ",
    "როგორხარ",
    "რა ხდება",
    "რას შვები",
    "hello",
    "hi",
    "hey",
    "how are you",
  ];

  return casualPatterns.some((pattern) => normalized.includes(pattern));
}

function createFastCasualAnswerPlan() {
  return {
    intent: "casual" as const,
    hiddenUserNeed: "The user is making a casual opening or small-talk message.",
    answerDepth: "tiny" as const,
    characterIntensity: 1 as const,
    answerShape: "brief_reply_question_back" as const,
    shouldUseRag: false,
    shouldUseWeb: false,
    tone: "natural, brief, human, lightly character-colored",
    avoid: ["lecture", "long answer", "national theme", "overacting"],
    characterMove:
      "Reply briefly and naturally. Do not lecture. Ask a small question back if it fits.",
  };
}


function formatConversation(messages: ChatMessage[]) {
  return messages
    .map((message) => {
      const speaker = message.role === "user" ? "User" : "Assistant";
      return `${speaker}: ${message.text}`;
    })
    .join("\n\n");
}


function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown server error.";
}

function getTodayStartIso() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

function trimContextToLimit(messages: ChatMessage[]) {
  const trimmedMessages: ChatMessage[] = [];
  let totalLength = 0;

  for (const message of [...messages].reverse()) {
    const messageLength = message.text.length;

    if (totalLength + messageLength > MAX_CONTEXT_CHARACTERS) {
      break;
    }

    trimmedMessages.unshift(message);
    totalLength += messageLength;
  }

  return trimmedMessages;
}

function normalizePlan(value: unknown): UserPlan {
  if (value === "premium" || value === "unlimited" || value === "free") {
    return value;
  }

  return "free";
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

async function getUserPlanAndUsage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      plan: "guest" as UserPlan,
      todayUsageCount: 0,
      supabase,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  const plan = normalizePlan(profile?.plan);

  const { count } = await supabase
    .from("usage_events")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("event_type", "chat_message")
    .gte("created_at", getTodayStartIso());

  return {
    user,
    plan,
    todayUsageCount: count ?? 0,
    supabase,
  };
}

function getStreamDelay(chunk: string) {
  const trimmed = chunk.trim();

  if (!trimmed) return 10;

  if (
    trimmed.endsWith(".") ||
    trimmed.endsWith("?") ||
    trimmed.endsWith("!") ||
    trimmed.endsWith("…")
  ) {
    return 90;
  }

  if (trimmed.endsWith(",") || trimmed.endsWith(";") || trimmed.endsWith(":")) {
    return 55;
  }

  return 28;
}

function getCharacterDelay(character: string) {
  if (character === "\n") return 140;

  if (character === "." || character === "?" || character === "!" || character === "…") {
    return 120;
  }

  if (character === "," || character === ";" || character === ":") {
    return 65;
  }

  if (character === " ") {
    return 12;
  }

  return 8;
}

function createManualTextStream(text: string) {
  const encoder = new TextEncoder();
  const characters = Array.from(text);

  return new ReadableStream({
    async start(controller) {
      let pendingChunk = "";

      for (const character of characters) {
        pendingChunk += character;

        controller.enqueue(encoder.encode(pendingChunk));
        pendingChunk = "";

        await new Promise((resolve) =>
          setTimeout(resolve, getCharacterDelay(character))
        );
      }

      controller.close();
    },
  });
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing OPENAI_API_KEY. Add it to .env.local and restart the dev server.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const slug = body.slug as string | undefined;
    const messages = body.messages as ChatMessage[] | undefined;
    const conversationId = body.conversationId as string | undefined;

    const chatMode: ChatMode =
      body.chatMode === "living" || body.chatMode === "factual"
        ? body.chatMode
        : "factual";

    const webSearchEnabled = body.webSearchEnabled === true;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing figure slug." },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing chat messages." },
        { status: 400 }
      );
    }

    const figure = getFigureBySlug(slug);

    if (!figure) {
      return NextResponse.json(
        { error: "Figure not found." },
        { status: 404 }
      );
    }

    const { user, plan, todayUsageCount, supabase } =
      await getUserPlanAndUsage();

    const latestUserMessageForValidation = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!latestUserMessageForValidation?.text?.trim()) {
      return NextResponse.json(
        {
          code: "EMPTY_MESSAGE",
          error: "Empty message.",
          message: "შეკითხვის ველი ცარიელია. გთხოვ, ჯერ შეკითხვა ჩაწერე.",
        },
        { status: 400 }
      );
    }

    if (latestUserMessageForValidation.text.length > MAX_USER_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          code: "MESSAGE_TOO_LONG",
          error: "Message is too long.",
          message:
            "შეტყობინება ძალიან ვრცელია. გთხოვ, ტექსტი 1200 სიმბოლომდე შეამცირე და თავიდან სცადე.",
          limit: MAX_USER_MESSAGE_LENGTH,
        },
        { status: 413 }
      );
    }

    const isFreeRegisteredUser = Boolean(user && plan === "free");
    const isUnlimitedUser = Boolean(user && plan === "unlimited");

    if (
      isFreeRegisteredUser &&
      !isUnlimitedUser &&
      todayUsageCount >= FREE_DAILY_LIMIT
    ) {
      return NextResponse.json(
        {
          code: "FREE_DAILY_LIMIT_REACHED",
          error: "Daily free question limit reached.",
          message:
            "დღიური უფასო ლიმიტი ამოიწურა. Premium გეგმით მიიღებ მეტ კითხვას.",
          limit: FREE_DAILY_LIMIT,
          used: todayUsageCount,
          plan,
        },
        { status: 429 }
      );
    }

    let verifiedConversationId: string | null = null;

    if (user && conversationId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .select("id, figure_slug")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single();

      if (conversation && conversation.figure_slug === slug) {
        verifiedConversationId = conversation.id;
      }
    }

    if (user) {
      await supabase.from("usage_events").insert({
        user_id: user.id,
        event_type: "chat_message",
      });
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (user && verifiedConversationId && latestUserMessage) {
      await supabase.from("messages").insert({
        conversation_id: verifiedConversationId,
        user_id: user.id,
        role: "user",
        content: latestUserMessage.text,
      });

      await supabase
        .from("conversations")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", verifiedConversationId)
        .eq("user_id", user.id);
    }

    const safeMessagesBeforeContextLimit = messages
      .filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") &&
          typeof message.text === "string" &&
          message.text.trim().length > 0
      )
      .slice(-8);

    const safeMessages = trimContextToLimit(safeMessagesBeforeContextLimit);

    const latestQuestionForPlanning = latestUserMessage?.text?.trim() ?? "";
const shouldUseFastCasualPath = isFastCasualMessage(latestQuestionForPlanning);

let answerPlan = shouldUseFastCasualPath
  ? createFastCasualAnswerPlan()
  : fallbackAnswerPlan;

if (!shouldUseFastCasualPath) {
  try {
    answerPlan = await createAnswerPlan({
      apiKey,
      figureNameKa: figure.nameKa,
      figureNameEn: figure.nameEn,
      chatMode,
      webSearchEnabled,
      messages: safeMessages,
    });
  } catch (error) {
    console.warn("Answer planner failed, using fallback plan:", error);
  }
}

    let retrievedKnowledgeBlock =
      "No internal knowledge retrieval was performed for this answer.";

    const shouldRetrieveKnowledge =
      answerPlan.shouldUseRag ||
      webSearchEnabled ||
      answerPlan.intent === "factual_simple" ||
      answerPlan.intent === "factual_deep";

    try {
      const latestQuestion = latestUserMessage?.text?.trim() ?? "";

      if (latestQuestion.length > 0 && shouldRetrieveKnowledge) {
        const retrievedKnowledge = await retrieveRelevantKnowledge({
          figureSlug: figure.slug,
          query: latestQuestion,
          matchCount: chatMode === "factual" ? 5 : 3,
        });

        retrievedKnowledgeBlock =
          formatRetrievedKnowledgeBlock(retrievedKnowledge);
      }
    } catch (error) {
      console.warn("RAG retrieval failed, continuing without RAG:", error);
    }

    const systemPrompt = buildFigureSystemPrompt(figure, chatMode);

    const answerVariation = buildAnswerVariationInstruction(
      figure,
      safeMessages
    );

    const conversation = formatConversation(safeMessages);
    const answerPlanBlock = formatAnswerPlanForPrompt(answerPlan);

    const modeAnswerInstruction =
      chatMode === "living"
        ? `
Mode-specific instruction:
You are answering in ცოცხალი mode.

Do not behave like a strict history bot.
Answer as a living first-person interpretation of ${figure.nameKa}.

You may:
- express opinions
- imagine inner thoughts
- create symbolic memories
- write poetically
- speak emotionally
- answer modern questions through the character's worldview
- create speeches, letters, poems, scenes, or personal reflections when useful

You are not limited only to historically confirmed facts in this mode.

But:
- do not present invented material as verified history
- do not fabricate fake historical quotes as real quotes
- do not claim uncertain legends as confirmed facts
- if the answer becomes fictional, legendary, or private, frame it naturally as interpretation

Make the answer feel human:
- direct
- specific
- emotionally present
- character-driven
- not generic
- not robotic
- not academic unless the user asks for academic explanation

Stay faithful to ${figure.nameKa}'s known values, era, dignity, worldview, and temperament.
`
        : `
Mode-specific instruction:
You are answering in ფაქტობრივი mode.

Stay historically careful and grounded.
Do not invent unconfirmed details, private memories, fake events, fake quotes, or fictional relationships.
When something is uncertain, say so clearly.
Separate confirmed history, legend, and interpretation.
`;

    const input = `
Continue this conversation in first person as ${figure.nameKa}.

${answerVariation}

${modeAnswerInstruction}

${answerPlanBlock}

INTERNAL RETRIEVED KNOWLEDGE:
${retrievedKnowledgeBlock}

How to use retrieved knowledge:
- Use this internal knowledge when it is relevant to the user's latest question.
- Do not mention retrieval, embeddings, vectors, planner, JSON, or internal database.
- If retrieved knowledge is weak or unrelated, ignore it.
- In ფაქტობრივი mode, prioritize retrieved knowledge and be careful with uncertainty.
- In ცოცხალი mode, use retrieved knowledge as background memory, but keep the answer expressive and character-driven.
- Never invent facts that contradict retrieved knowledge.

WEB SOURCE REQUEST:
${
  webSearchEnabled
    ? "The user requested source-backed web research. Live web search is not connected yet, so use only internal knowledge for this answer."
    : "The user did not request live web research."
}

CONVERSATION:
${conversation}

TASK:
Answer only the latest user message.

PLANNER OVERRIDE RULES:
The answer plan is more important than generic character habits.
If the plan says character intensity 0 or 1, do not overperform.
If the plan says tiny or short, keep the answer compact.
If the plan says avoid lectures, do not lecture.
If the plan says answer directly, answer directly before adding interpretation.
Never reveal the plan.

Important:
- Speak in first person by default.
- Give a real answer, not a disclaimer.
- Do not answer like an encyclopedia unless the user asks for facts.
- Do not mention that you are AI unless the user directly asks if you are real, alive, or literally ${figure.nameKa}.
- Be articulate, specific, and thoughtful.
- Use the character's worldview to reason when relevant, not mechanically in every answer.
- Prefer one strong clear idea over many weak generic points.
- If the user asks the same or similar question again, do not repeat the same answer.
- Use a fresh angle, fresh sentence rhythm, and fresh conclusion while staying faithful to ${figure.nameKa}.
- Match answer length to the question and answer plan.
- If the user is only greeting or asking a casual/simple question, answer briefly in 1–3 sentences.
- Do not turn casual messages into lectures.
- Keep normal answers around 70–140 words.
- Go longer only if the user asks for depth, analysis, essay, or detailed explanation.
`;

    const draftResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: request.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.4",
        instructions: systemPrompt,
        input,
        stream: false,
      }),
    });

    if (!draftResponse.ok) {
      const errorText = await draftResponse.text();

      return NextResponse.json(
        {
          error: `OpenAI API error: ${errorText}`,
        },
        { status: draftResponse.status }
      );
    }

    const draftData = await draftResponse.json();
    let finalAssistantText = extractTextFromResponse(draftData).trim();

    if (!finalAssistantText) {
      return NextResponse.json(
        {
          error: "OpenAI response was empty.",
        },
        { status: 500 }
      );
    }

    if (shouldRunAnswerCritic(answerPlan)) {
      try {
        finalAssistantText = await improveAnswerWithCritic({
          apiKey,
          figureNameKa: figure.nameKa,
          figureNameEn: figure.nameEn,
          chatMode,
          latestUserMessage: latestUserMessage?.text ?? "",
          answerPlan,
          draftAnswer: finalAssistantText,
        });
      } catch (error) {
        console.warn("Answer critic failed, using draft answer:", error);
      }
    }

    if (user && verifiedConversationId && finalAssistantText.trim().length > 0) {
      await supabase.from("messages").insert({
        conversation_id: verifiedConversationId,
        user_id: user.id,
        role: "assistant",
        content: finalAssistantText.trim(),
      });

      await supabase
        .from("conversations")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", verifiedConversationId)
        .eq("user_id", user.id);
    }

    const stream = createManualTextStream(finalAssistantText);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}