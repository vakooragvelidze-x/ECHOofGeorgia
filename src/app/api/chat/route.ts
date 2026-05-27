import { buildAnswerVariationInstruction } from "@/data/answerVariation";
import { buildFigureSystemPrompt } from "@/data/figurePrompts";
import { getFigureBySlug } from "@/data/figures";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const FREE_DAILY_LIMIT = 15;

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

function extractDeltaFromSseJson(jsonText: string) {
  try {
    const event = JSON.parse(jsonText) as {
      type?: string;
      delta?: string;
      error?: {
        message?: string;
      };
    };

    if (
      event.type === "response.output_text.delta" &&
      typeof event.delta === "string"
    ) {
      return event.delta;
    }

    if (event.type === "error") {
      return `\n\nშეცდომა: ${
        event.error?.message ?? "Unknown streaming error."
      }`;
    }

    return "";
  } catch {
    return "";
  }
}

async function getUserPlanAndUsage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      plan: "guest",
      todayUsageCount: 0,
      supabase,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  const plan = profile?.plan ?? "free";

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

    const isRegisteredFreeUser = user && plan !== "premium";

    if (isRegisteredFreeUser && todayUsageCount >= FREE_DAILY_LIMIT) {
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

    const safeMessages = messages
      .filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") &&
          typeof message.text === "string" &&
          message.text.trim().length > 0
      )
      .slice(-8);

    const systemPrompt = buildFigureSystemPrompt(figure);
    const answerVariation = buildAnswerVariationInstruction(
      figure,
      safeMessages
    );
    const conversation = formatConversation(safeMessages);

    const input = `
Continue this conversation in first person as ${figure.nameKa}.

${answerVariation}

Conversation:
${conversation}

Answer only the latest user message.

Important:
- Speak in first person by default.
- Give a real answer, not a disclaimer.
- Do not answer like an encyclopedia unless the user asks for facts.
- Do not mention that you are AI unless the user directly asks if you are real, alive, or literally ${figure.nameKa}.
- Be articulate, specific, and thoughtful.
- Use the character's worldview to reason, not just facts from biography.
- Prefer one strong clear idea over many weak generic points.
- If the user asks the same or similar question again, do not repeat the same answer.
- Use a fresh angle, fresh sentence rhythm, and fresh conclusion while staying faithful to ${figure.nameKa}.
- Match answer length to the question.
- If the user is only greeting or asking a casual/simple question, answer briefly in 1–3 sentences.
- Do not turn casual messages into lectures.
- Keep normal answers around 80–140 words.
- Go longer only if the user asks for depth, analysis, essay, or detailed explanation.
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
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
        stream: true,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();

      return NextResponse.json(
        {
          error: `OpenAI API error: ${errorText}`,
        },
        { status: openaiResponse.status }
      );
    }

    if (!openaiResponse.body) {
      return NextResponse.json(
        {
          error: "OpenAI response stream was empty.",
        },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = openaiResponse.body.getReader();

    let buffer = "";
    let fullAssistantText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            if (request.signal.aborted) {
              break;
            }

            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            const parts = buffer.split("\n\n");
            buffer = parts.pop() ?? "";

            for (const part of parts) {
              const lines = part.split("\n");

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;

                const data = line.slice(6).trim();

                if (!data || data === "[DONE]") continue;

                const delta = extractDeltaFromSseJson(data);

                if (delta) {
                  fullAssistantText += delta;
                  controller.enqueue(encoder.encode(delta));
                }
              }
            }
          }

          if (
            user &&
            verifiedConversationId &&
            fullAssistantText.trim().length > 0 &&
            !request.signal.aborted
          ) {
            await supabase.from("messages").insert({
              conversation_id: verifiedConversationId,
              user_id: user.id,
              role: "assistant",
              content: fullAssistantText.trim(),
            });

            await supabase
              .from("conversations")
              .update({
                updated_at: new Date().toISOString(),
              })
              .eq("id", verifiedConversationId)
              .eq("user_id", user.id);
          }

          controller.close();
        } catch (error) {
          if (!request.signal.aborted) {
            const message = getErrorMessage(error);
            controller.enqueue(
              encoder.encode(
                `პასუხის მიღება ვერ მოხერხდა. შეცდომა: ${message}`
              )
            );
          }

          controller.close();
        } finally {
          reader.releaseLock();
        }
      },
    });

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