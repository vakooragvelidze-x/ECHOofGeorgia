"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type KnowledgeChunk = {
  id: string;
  source_id: string;
  figure_slug: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

type FigureOption = {
  slug: string;
  label: string;
};

const FIGURE_OPTIONS: FigureOption[] = [
  {
    slug: "ilia-chavchavadze",
    label: "ილია ჭავჭავაძე",
  },
  {
    slug: "vazha-pshavela",
    label: "ვაჟა-ფშაველა",
  },
  {
    slug: "tamar-mepe",
    label: "თამარ მეფე",
  },
  {
    slug: "shota-rustaveli",
    label: "შოთა რუსთაველი",
  },
  {
    slug: "niko-pirosmani",
    label: "ნიკო ფიროსმანი",
  },
];

function makeSourceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `source-${Date.now()}`;
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("ka-GE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPreviewText(text: string) {
  if (text.length <= 260) return text;
  return `${text.slice(0, 260)}...`;
}

export default function AdminKnowledgePanel() {
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [filterFigureSlug, setFilterFigureSlug] = useState("");
  const [figureSlug, setFigureSlug] = useState(FIGURE_OPTIONS[0].slug);
  const [sourceId, setSourceId] = useState(makeSourceId());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedFigureLabel = useMemo(() => {
    return (
      FIGURE_OPTIONS.find((figure) => figure.slug === figureSlug)?.label ??
      figureSlug
    );
  }, [figureSlug]);

  async function loadChunks(nextFigureSlug = filterFigureSlug) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const query = nextFigureSlug
        ? `?figureSlug=${encodeURIComponent(nextFigureSlug)}`
        : "";

      const response = await fetch(`/api/admin/knowledge${query}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Knowledge chunks could not be loaded.");
      }

      setChunks(data.chunks ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Knowledge loading failed."
      );
      setChunks([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadChunks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateChunk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanSourceId = sourceId.trim() || makeSourceId();

    setErrorMessage(null);
    setStatusMessage(null);

    if (!figureSlug || !cleanTitle || !cleanContent) {
      setErrorMessage("ფიგურა, სათაური და ტექსტი აუცილებელია.");
      return;
    }

    if (cleanContent.length < 80) {
      setErrorMessage("ტექსტი ძალიან მოკლეა. ჩაწერე მინიმუმ 80 სიმბოლო.");
      return;
    }

    if (cleanContent.length > 5000) {
      setErrorMessage(
        "ტექსტი ძალიან გრძელია. დაყავი პატარა ნაწილებად, მაქსიმუმ 5000 სიმბოლო."
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/knowledge/embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          sourceId: cleanSourceId,
          figureSlug,
          title: cleanTitle,
          content: cleanContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Knowledge chunk could not be saved.");
      }

      setStatusMessage("ცოდნის ნაწილი წარმატებით დაემატა და დაიემბედდა.");
      setTitle("");
      setContent("");
      setSourceId(makeSourceId());
      setFilterFigureSlug(figureSlug);
      await loadChunks(figureSlug);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Knowledge save failed."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteChunk(id: string) {
    const confirmed = window.confirm("ნამდვილად გინდა ამ knowledge chunk-ის წაშლა?");

    if (!confirmed) return;

    setDeletingId(id);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch(
        `/api/admin/knowledge?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Knowledge chunk could not be deleted.");
      }

      setStatusMessage("Knowledge chunk წაიშალა.");
      setChunks((current) => current.filter((chunk) => chunk.id !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Knowledge delete failed."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0707] px-5 py-8 text-[#f4efe6]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#c9a45c]">
              ECHO Georgia Admin
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              ცოდნის მართვა
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b8aea3]">
              აქედან დაამატებ ფიგურების შიდა ცოდნას RAG სისტემისთვის. ტექსტი
              ავტომატურად დაიემბედდება და შემდეგ ჩატში გამოიყენება შესაბამის
              კითხვებზე.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-full border border-[#f4efe6]/10 px-4 py-2 text-xs font-black text-[#f4efe6] transition hover:bg-[#f4efe6]/6"
            >
              ← მომხმარებლები
            </Link>

            <Link
              href="/"
              className="rounded-full bg-[#c9a45c] px-4 py-2 text-xs font-black text-[#140d0d] transition hover:bg-[#f4efe6]"
            >
              მთავარზე დაბრუნება
            </Link>
          </div>
        </div>

        {(statusMessage || errorMessage) && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold ${
              errorMessage
                ? "border-red-500/25 bg-red-500/10 text-red-100"
                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {errorMessage ?? statusMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-[1.8rem] border border-[#f4efe6]/10 bg-[#120d0d] p-5">
            <h2 className="text-xl font-black">ახალი ცოდნის დამატება</h2>
            <p className="mt-2 text-sm leading-6 text-[#b8aea3]">
              ერთი chunk უნდა იყოს კონკრეტული და სუფთა. არ ჩაყარო მთელი
              ბიოგრაფია ერთ დიდ ტექსტად. დაყავი თემებად.
            </p>

            <form onSubmit={handleCreateChunk} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#756b63]">
                  ფიგურა
                </span>
                <select
                  value={figureSlug}
                  onChange={(event) => setFigureSlug(event.target.value)}
                  className="w-full rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-3 text-sm font-bold text-[#f4efe6] outline-none focus:border-[#c9a45c]/40"
                >
                  {FIGURE_OPTIONS.map((figure) => (
                    <option key={figure.slug} value={figure.slug}>
                      {figure.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#756b63]">
                  Source ID
                </span>
                <input
                  value={sourceId}
                  onChange={(event) => setSourceId(event.target.value)}
                  className="w-full rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-3 text-sm text-[#f4efe6] outline-none focus:border-[#c9a45c]/40"
                  placeholder="ავტომატურად გენერირდება"
                />
                <p className="mt-1.5 text-[11px] leading-4 text-[#756b63]">
                  ერთი წყაროს რამდენიმე chunk-ს შეგიძლია ერთი source ID მისცე.
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#756b63]">
                  სათაური
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-3 text-sm text-[#f4efe6] outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40"
                  placeholder={`${selectedFigureLabel} — თემა`}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#756b63]">
                  ტექსტი / Knowledge chunk
                </span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={12}
                  className="w-full resize-none rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-3 text-sm leading-6 text-[#f4efe6] outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40"
                  placeholder="ჩაწერე კონკრეტული ცოდნა, ისტორიული საზღვარი, ფაქტი, ლეგენდის გაფრთხილება ან პერსონაჟის კონტექსტი..."
                />
                <div className="mt-2 flex justify-between text-[11px] text-[#756b63]">
                  <span>მინ. 80 სიმბოლო · მაქს. 5000</span>
                  <span>{content.trim().length}/5000</span>
                </div>
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-full bg-[#c9a45c] px-5 py-3 text-sm font-black text-[#140d0d] transition hover:bg-[#f4efe6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "ინახება და ემბედდება..." : "ცოდნის დამატება"}
              </button>
            </form>
          </section>

          <section className="rounded-[1.8rem] border border-[#f4efe6]/10 bg-[#120d0d] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">დამატებული ცოდნა</h2>
                <p className="mt-2 text-sm text-[#b8aea3]">
                  ბოლო 100 ჩანაწერი. შეგიძლია გაფილტრო ფიგურით.
                </p>
              </div>

              <div className="flex gap-2">
                <select
                  value={filterFigureSlug}
                  onChange={(event) => {
                    setFilterFigureSlug(event.target.value);
                    void loadChunks(event.target.value);
                  }}
                  className="rounded-full border border-[#f4efe6]/10 bg-[#0e0b0b] px-3 py-2 text-xs font-bold text-[#f4efe6] outline-none focus:border-[#c9a45c]/40"
                >
                  <option value="">ყველა</option>
                  {FIGURE_OPTIONS.map((figure) => (
                    <option key={figure.slug} value={figure.slug}>
                      {figure.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => void loadChunks()}
                  className="rounded-full border border-[#f4efe6]/10 px-3 py-2 text-xs font-black text-[#f4efe6] transition hover:bg-[#f4efe6]/6"
                >
                  განახლება
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {isLoading && (
                <div className="rounded-2xl border border-dashed border-[#f4efe6]/10 px-4 py-8 text-center text-sm text-[#756b63]">
                  იტვირთება...
                </div>
              )}

              {!isLoading && chunks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#f4efe6]/10 px-4 py-8 text-center text-sm text-[#756b63]">
                  Knowledge chunk ჯერ არ არის დამატებული.
                </div>
              )}

              {chunks.map((chunk) => (
                <article
                  key={chunk.id}
                  className="rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[#f4efe6]">
                        {chunk.title}
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-[#c9a45c]">
                        {chunk.figure_slug}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleDeleteChunk(chunk.id)}
                      disabled={deletingId === chunk.id}
                      className="shrink-0 rounded-full border border-red-400/20 px-3 py-1.5 text-[11px] font-black text-red-100 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === chunk.id ? "იშლება..." : "წაშლა"}
                    </button>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-[#b8aea3] [overflow-wrap:anywhere]">
                    {getPreviewText(chunk.content)}
                  </p>

                  <div className="mt-4 grid gap-2 text-[10px] text-[#756b63] sm:grid-cols-2">
                    <div className="rounded-xl bg-[#f4efe6]/4 px-3 py-2">
                      Source: {chunk.source_id}
                    </div>
                    <div className="rounded-xl bg-[#f4efe6]/4 px-3 py-2">
                      Added: {formatDate(chunk.created_at)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}