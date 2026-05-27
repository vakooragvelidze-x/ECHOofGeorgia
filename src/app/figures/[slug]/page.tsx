import FigureChat from "@/components/FigureChat";
import { figures, getFigureBySlug } from "@/data/figures";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return figures.map((figure) => ({
    slug: figure.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const figure = getFigureBySlug(slug);

  if (!figure) {
    return {
      title: "Figure Not Found — ECHO Georgia",
    };
  }

  return {
    title: `${figure.nameKa} — ECHO Georgia`,
    description: figure.description,
  };
}

export default async function FigurePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const figure = getFigureBySlug(slug);

  if (!figure) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0e0b0b] text-[#f4efe6]">
      <section className="relative px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,164,92,0.12),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(92,30,38,0.36),transparent_36%),linear-gradient(180deg,#130d0d_0%,#0e0b0b_76%)]" />
        <div className="absolute inset-0 opacity-[0.07] grain" />

        <nav className="relative z-10 mx-auto mb-6 flex max-w-7xl items-center justify-between rounded-full border border-[#f4efe6]/10 bg-[#120d0d]/70 px-5 py-4 backdrop-blur-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#d8c08a] transition hover:text-[#f4efe6]"
          >
            <ArrowLeft size={17} />
            უკან დაბრუნება
          </Link>

          <div className="hidden text-sm text-[#b8aea3] sm:block">
            ECHO Georgia · Conversation
          </div>
        </nav>

        <FigureChat figure={figure} />
      </section>
    </main>
  );
}