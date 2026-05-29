import { createEmbedding } from "@/lib/embeddings";
import { createClient } from "@/lib/supabase/server";

export type RetrievedKnowledgeChunk = {
  id: string;
  source_id: string;
  figure_slug: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

const MIN_SIMILARITY = 0.25;
const DEFAULT_MATCH_COUNT = 4;

export async function retrieveRelevantKnowledge({
  figureSlug,
  query,
  matchCount = DEFAULT_MATCH_COUNT,
}: {
  figureSlug: string;
  query: string;
  matchCount?: number;
}) {
  const cleanQuery = query.trim();

  if (!figureSlug || !cleanQuery) {
    return [];
  }

  const supabase = await createClient();
  const queryEmbedding = await createEmbedding(cleanQuery);

  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: queryEmbedding,
    match_figure_slug: figureSlug,
    match_count: matchCount,
  });

  if (error) {
    console.warn("Knowledge retrieval warning:", error.message);
    return [];
  }

  const chunks = (data ?? []) as RetrievedKnowledgeChunk[];

  return chunks.filter((chunk) => {
    return typeof chunk.similarity === "number" && chunk.similarity >= MIN_SIMILARITY;
  });
}

export function formatRetrievedKnowledgeBlock(chunks: RetrievedKnowledgeChunk[]) {
  if (chunks.length === 0) {
    return "No relevant internal knowledge chunks were retrieved.";
  }

  return chunks
    .map((chunk, index) => {
      return `SOURCE ${index + 1}: ${chunk.title}
Relevance score: ${chunk.similarity.toFixed(3)}
Content:
${chunk.content}`;
    })
    .join("\n\n---\n\n");
}