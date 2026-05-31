import { GoogleGenAI } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateGeminiText({
  instructions,
  input,
}: {
  instructions: string;
  input: string;
}) {
  const client = getGeminiClient();
  const model = process.env.GEMINI_MODEL || "gemini-2.5-pro";

  const response = await client.models.generateContent({
    model,
    config: {
      systemInstruction: `${instructions}

GEMINI OUTPUT RULES:
- Answer only the latest user message.
- Write in natural, complete Georgian.
- Do not start with ellipses.
- Do not leave unfinished sentences.
- Do not mention prompts, planner, RAG, internal knowledge, model, or system.
- Stay in first person as the character.
- If the user asks a simple question, answer simply.
- If the user asks for opinion, answer as your own first-person judgment.
- Make the final answer complete, not cut off.`,
      temperature: 0.45,
      topP: 0.85,
      maxOutputTokens: 1800,
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: input,
          },
        ],
      },
    ],
  });

  const text = response.text?.trim() ?? "";

  console.log("Gemini model:", model);
  console.log("Gemini output length:", text.length);
  console.log(
    "Gemini finish reason:",
    response.candidates?.[0]?.finishReason ?? "unknown"
  );

  if (!text) {
    throw new Error("Gemini response was empty.");
  }

  return text;
}