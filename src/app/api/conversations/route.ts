import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export function createSmartConversationTitle(message?: string) {
  if (!message || message.trim().length === 0) {
    return "ახალი საუბარი";
  }

  const cleaned = message.trim().replace(/\s+/g, " ");
  const normalized = cleaned.toLowerCase();

  const isCasual =
    normalized.includes("გამარჯობა") ||
    normalized.includes("სალამი") ||
    normalized.includes("როგორ ხარ") ||
    normalized.includes("როგორხარ") ||
    normalized.includes("რა ხდება") ||
    normalized.includes("რას შვები") ||
    normalized.includes("hello") ||
    normalized.includes("hi") ||
    normalized.includes("hey");

  if (isCasual) {
    return "მსუბუქი საუბარი";
  }

  const isEmotional =
    normalized.includes("ცუდად") ||
    normalized.includes("ცუდ") ||
    normalized.includes("დავიღალე") ||
    normalized.includes("მიჭირს") ||
    normalized.includes("მეშინ") ||
    normalized.includes("არ ვიცი რა ვქნა") ||
    normalized.includes("ვერაფერს") ||
    normalized.includes("დეპრეს");

  if (isEmotional) {
    return "ემოციური მხარდაჭერა";
  }

  const isAdvice =
    normalized.includes("რჩევა") ||
    normalized.includes("რა ვქნა") ||
    normalized.includes("როგორ გავხდე") ||
    normalized.includes("როგორ დავიწყო") ||
    normalized.includes("ცხოვრებაში") ||
    normalized.includes("ზარმაცი");

  if (isAdvice) {
    return "ცხოვრების რჩევა";
  }

  const isOpinion =
    normalized.includes("რას ფიქრობ") ||
    normalized.includes("რა აზრის ხარ") ||
    normalized.includes("შენი აზრით") ||
    normalized.includes("რას იტყვი");

  if (isOpinion) {
    return "აზრი და შეფასება";
  }

  const isLanguage =
    normalized.includes("ენა") ||
    normalized.includes("ქართული ენა") ||
    normalized.includes("ენის მნიშვნელობა");

  if (isLanguage) {
    return "ენის მნიშვნელობა";
  }

  const isEducation =
    normalized.includes("განათლება") ||
    normalized.includes("სწავლა") ||
    normalized.includes("სკოლა");

  if (isEducation) {
    return "განათლება და სწავლა";
  }

  const isNation =
    normalized.includes("საქართველო") ||
    normalized.includes("ქართველ") ||
    normalized.includes("ერი") ||
    normalized.includes("მამული");

  if (isNation) {
    return "საქართველო და საზოგადოება";
  }

  const isFact =
    normalized.includes("ვინ") ||
    normalized.includes("როდის") ||
    normalized.includes("სად") ||
    normalized.includes("რამდენ") ||
    normalized.includes("მართალია") ||
    normalized.includes("ფაქტი");

  if (isFact) {
    return "ისტორიული კითხვა";
  }

  const isDeep =
    normalized.includes("რატომ") ||
    normalized.includes("ამიხსენი") ||
    normalized.includes("გაანალიზე") ||
    normalized.includes("რა არის") ||
    normalized.includes("მნიშვნელობა") ||
    cleaned.length > 120;

  if (isDeep) {
    return "ღრმა განხილვა";
  }

  if (cleaned.length <= 42) {
    return cleaned;
  }

  return `${cleaned.slice(0, 42)}...`;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id, figure_slug, title, chat_mode, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();

  const figureSlug = body.figureSlug as string | undefined;
  const firstMessage = body.firstMessage as string | undefined;

  const chatMode =
    body.chatMode === "living" || body.chatMode === "factual"
      ? body.chatMode
      : "factual";

  if (!figureSlug) {
    return NextResponse.json(
      { error: "Missing figure slug." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      figure_slug: figureSlug,
      title: createSmartConversationTitle(firstMessage),
      chat_mode: chatMode,
    })
    .select("id, figure_slug, title, chat_mode, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversation: data });
}