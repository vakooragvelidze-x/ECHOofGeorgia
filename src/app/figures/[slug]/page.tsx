import FigureChat from "@/components/FigureChat";
import { figures, getFigureBySlug } from "@/data/figures";
import { ArrowLeft, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

function getFigureImagePosition(slug: string) {
  const positions: Record<string, string> = {
    "ilia-chavchavadze": "center 22%",
    "vazha-pshavela": "center 20%",
    "shota-rustaveli": "center 30%",
    "tamar-mepe": "center 28%",
    "niko-pirosmani": "center 30%",
  };

  return positions[slug] ?? "center 28%";
}

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

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#f4efe6]/10 bg-[#120d0d]/70 px-5 py-4 backdrop-blur-xl">
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

        <div className="relative z-10 mx-auto max-w-7xl py-10">
          <FigureChat figure={figure} />

          <section className="mt-8 rounded-[2.2rem] border border-[#f4efe6]/10 bg-[#171010]/82 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="grid gap-7 rounded-[1.8rem] border border-[#c9a45c]/16 bg-[linear-gradient(145deg,#211313,#0f0b0b)] p-5 sm:p-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
              {figure.image ? (
                <div className="relative h-[320px] overflow-hidden rounded-[1.5rem] border border-[#c9a45c]/25 bg-[#171010] shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
                  <Image
                    src={figure.image}
                    alt={figure.nameKa}
                    fill
                    sizes="280px"
                    style={{
                      objectPosition: getFigureImagePosition(figure.slug),
                    }}
                    className="object-cover grayscale sepia-[0.22] contrast-110"
                    priority
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,11,11,0.02)_0%,rgba(14,11,11,0.08)_48%,rgba(14,11,11,0.74)_100%)]" />
                </div>
              ) : (
                <div className="grid h-[320px] place-items-center rounded-[1.5rem] border border-[#c9a45c]/25 bg-[#c9a45c]/10 text-5xl font-black text-[#c9a45c]">
                  {figure.nameKa.slice(0, 1)}
                </div>
              )}

              <div className="py-1">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-4 py-2 text-sm text-[#d8c08a]">
                  <Sparkles size={16} />
                  {figure.era}
                </div>

                <h1 className="text-[clamp(2.6rem,5vw,5.2rem)] font-black leading-[0.94] tracking-[-0.065em]">
                  {figure.nameKa}
                </h1>

                <p className="mt-4 text-base font-bold text-[#c9a45c] sm:text-lg">
                  {figure.nameEn} · {figure.years}
                </p>

                <p className="mt-3 max-w-3xl text-xl font-black leading-8 text-[#f4efe6]">
                  {figure.role}
                </p>

                <p className="mt-6 max-w-4xl text-base leading-8 text-[#b8aea3] sm:text-lg sm:leading-9">
                  {figure.description}
                </p>

                <p className="mt-5 max-w-4xl text-base leading-8 text-[#9f958c]">
                  {figure.longDescription}
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {figure.principles.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-4 py-2 text-sm text-[#d9d0c5]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}