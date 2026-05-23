import { buildFigureSystemPrompt } from "@/data/figurePrompts";
import { getFigureBySlug } from "@/data/figures";
import { NextResponse } from "next/server";
import OpenAI from "openai";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

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

    if (!slug) {
      return NextResponse.json({ error: "Missing figure slug." }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing chat messages." }, { status: 400 });
    }

    const figure = getFigureBySlug(slug);

    if (!figure) {
      return NextResponse.json({ error: "Figure not found." }, { status: 404 });
    }

    const safeMessages = messages
      .filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") &&
          typeof message.text === "string" &&
          message.text.trim().length > 0
      )
      .slice(-12);

    const client = new OpenAI({
      apiKey,
    });

    const systemPrompt = buildFigureSystemPrompt(figure);
    const conversation = formatConversation(safeMessages);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: systemPrompt,
      input: `
Continue this conversation as the historical AI interpretation.

Conversation:
${conversation}

Answer only the latest user message.
Keep the answer natural, respectful, historically careful, and useful.
`,
    });

    return NextResponse.json({
      text:
        response.output_text ||
        "ვერ მოხერხდა პასუხის მიღება. სცადე თავიდან.",
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