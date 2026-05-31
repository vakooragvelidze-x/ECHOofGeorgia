import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const { supabase, isAdmin, error } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const requestUrl = new URL(request.url);
  const figureSlug = getString(requestUrl.searchParams.get("figureSlug"));

  let query = supabase
    .from("knowledge_chunks")
    .select("id, source_id, figure_slug, title, content, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (figureSlug) {
    query = query.eq("figure_slug", figureSlug);
  }

  const { data, error: chunksError } = await query;

  if (chunksError) {
    return NextResponse.json({ error: chunksError.message }, { status: 500 });
  }

  return NextResponse.json({ chunks: data ?? [] });
}

export async function DELETE(request: Request) {
  const { supabase, isAdmin, error } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const requestUrl = new URL(request.url);
  const id = getString(requestUrl.searchParams.get("id"));

  if (!id) {
    return NextResponse.json(
      { error: "Missing knowledge chunk id." },
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from("knowledge_chunks")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}