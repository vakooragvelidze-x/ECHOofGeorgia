import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function createTitleFromMessage(message?: string) {
  if (!message || message.trim().length === 0) {
    return "New conversation";
  }

  const cleaned = message.trim().replace(/\s+/g, " ");

  if (cleaned.length <= 48) {
    return cleaned;
  }

  return `${cleaned.slice(0, 48)}...`;
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
    .select("id, figure_slug, title, created_at, updated_at")
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
      title: createTitleFromMessage(firstMessage),
    })
    .select("id, figure_slug, title, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversation: data });
}