import { createEmbedding } from "@/lib/embeddings";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const { supabase, isAdmin, error } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    const body = await request.json();

    const figureSlug = getString(body.figureSlug);
    const query = getString(body.query);
    const matchCount =
      typeof body.matchCount === "number" && body.matchCount > 0
        ? Math.min(body.matchCount, 10)
        : 5;

    if (!figureSlug || !query) {
      return NextResponse.json(
        {
          error: "Missing figureSlug or query.",
        },
        { status: 400 }
      );
    }

    const queryEmbedding = await createEmbedding(query);

    const { data, error: matchError } = await supabase.rpc(
      "match_knowledge_chunks",
      {
        query_embedding: queryEmbedding,
        match_figure_slug: figureSlug,
        match_count: matchCount,
      }
    );

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    return NextResponse.json({ matches: data ?? [] });
  } catch (error) {
    console.error("Knowledge search error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Knowledge search failed.",
      },
      { status: 500 }
    );
  }
}