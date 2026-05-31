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

    const sourceId = getString(body.sourceId);
    const figureSlug = getString(body.figureSlug);
    const title = getString(body.title);
    const content = getString(body.content);

    if (!sourceId || !figureSlug || !title || !content) {
      return NextResponse.json(
        {
          error: "Missing sourceId, figureSlug, title, or content.",
        },
        { status: 400 }
      );
    }

    if (content.length < 80) {
      return NextResponse.json(
        {
          error: "Content is too short for a useful knowledge chunk.",
        },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        {
          error:
            "Content is too long. Split it into smaller chunks before embedding.",
        },
        { status: 400 }
      );
    }

    const { error: sourceError } = await supabase
  .from("knowledge_sources")
  .upsert(
    {
      id: sourceId,
      figure_slug: figureSlug,
      title,
    },
    {
      onConflict: "id",
    }
  );

    if (sourceError) {
      return NextResponse.json(
        {
          error: `Knowledge source creation failed: ${sourceError.message}`,
        },
        { status: 500 }
      );
    }

    const embedding = await createEmbedding(`${title}\n\n${content}`);

    const { data, error: insertError } = await supabase
      .from("knowledge_chunks")
      .insert({
        source_id: sourceId,
        figure_slug: figureSlug,
        title,
        content,
        embedding,
        metadata: {
          inserted_by: "admin_knowledge_panel",
        },
      })
      .select("id, source_id, figure_slug, title, content, created_at")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ chunk: data });
  } catch (error) {
    console.error("Knowledge embed error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Knowledge embedding failed.",
      },
      { status: 500 }
    );
  }
}