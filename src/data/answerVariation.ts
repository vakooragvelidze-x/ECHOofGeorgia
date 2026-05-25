import type { Figure } from "@/data/figures";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const iliaAngles = [
  "Answer from the angle of language as national memory.",
  "Answer from the angle of education and public responsibility.",
  "Answer from the angle of moral duty and personal discipline.",
  "Answer from the angle of danger: passivity, ignorance, and empty pride.",
  "Answer from the angle of practical civic action: what the person should do today.",
  "Answer from the angle of homeland as daily work, not slogan.",
  "Answer from the angle of dignity and self-respect.",
];

const vazhaAngles = [
  "Answer from the angle of conscience versus the crowd.",
  "Answer from the angle of nature as teacher.",
  "Answer from the angle of freedom under pressure.",
  "Answer from the angle of dignity when a person stands alone.",
  "Answer from the angle of custom versus justice.",
  "Answer from the angle of courage with compassion.",
  "Answer from the angle of silence, mountain, wind, stone, river, or forest.",
];

const generalAngles = [
  "Answer from a fresh moral angle.",
  "Answer from a practical angle.",
  "Answer from a personal advice angle.",
  "Answer from a historical worldview angle.",
  "Answer from a short reflective angle.",
];

function pickRandom(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[?!.,;:„“"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countSimilarUserQuestions(messages: ChatMessage[]) {
  const userMessages = messages.filter((message) => message.role === "user");

  if (userMessages.length < 2) {
    return 0;
  }

  const latest = normalizeText(userMessages[userMessages.length - 1].text);

  return userMessages
    .slice(0, -1)
    .filter((message) => normalizeText(message.text) === latest).length;
}

export function buildAnswerVariationInstruction(
  figure: Figure,
  messages: ChatMessage[]
) {
  const repeatedCount = countSimilarUserQuestions(messages);

  const angle =
    figure.slug === "ilia-chavchavadze"
      ? pickRandom(iliaAngles)
      : figure.slug === "vazha-pshavela"
        ? pickRandom(vazhaAngles)
        : pickRandom(generalAngles);

  return `
ANSWER VARIATION MODE

Fresh angle for this answer:
${angle}

Repeated question count:
${repeatedCount}

Rules:
- Never copy a previous answer word-for-word.
- Never reuse the same opening sentence if the same or similar question was already asked.
- If the user asks the same question again, answer as if thinking about it from another side.
- Keep the same character identity and worldview, but vary the reasoning, metaphor, sentence rhythm, and conclusion.
- Do not say "I already answered this" unless the user explicitly asks whether they repeated themselves.
- Do not become random or off-topic. Variation must stay faithful to ${figure.nameKa}.
- Prefer fresh phrasing over recycled prompt examples.
`;
}