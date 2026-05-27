import FigureChat from "@/components/FigureChat";
import { figures, getFigureBySlug } from "@/data/figures";
import { ArrowLeft, MessageCircle, Sparkles } from "lucide-react";
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,164,92,0.14),transparent_32%),radial-gradient(circle_at_82%_14%,rgba(92,30,38,0.4),transparent_36%),linear-gradient(180deg,#130d0d_0%,#0e0b0b_70%)]" />
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
            ECHO Georgia · Conversation Room
          </div>
        </nav>

        <div className="relative z-10 mx-auto max-w-7xl py-10 lg:py-12">
          <div className="overflow-hidden rounded-[2.2rem] border border-[#f4efe6]/10 bg-[#171010]/78 p-4 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-6 rounded-[1.8rem] border border-[#c9a45c]/16 bg-[linear-gradient(145deg,#211313,#0f0b0b)] p-5 sm:p-6 lg:grid-cols-[190px_minmax(0,1fr)_auto] lg:items-center">
              {figure.image ? (
                <div className="relative h-[230px] overflow-hidden rounded-[1.5rem] border border-[#c9a45c]/25 bg-[#171010] shadow-[0_22px_60px_rgba(0,0,0,0.35)] sm:h-[260px] lg:h-[220px]">
                  <Image
                    src={figure.image}
                    alt={figure.nameKa}
                    fill
                    sizes="220px"
                    style={{
                      objectPosition: getFigureImagePosition(figure.slug),
                    }}
                    className="object-cover grayscale sepia-[0.22] contrast-110"
                    priority
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,11,11,0.02)_0%,rgba(14,11,11,0.08)_48%,rgba(14,11,11,0.74)_100%)]" />
                </div>
              ) : (
                <div className="grid h-[230px] place-items-center rounded-[1.5rem] border border-[#c9a45c]/25 bg-[#c9a45c]/10 text-5xl font-black text-[#c9a45c] sm:h-[260px] lg:h-[220px]">
                  {figure.nameKa.slice(0, 1)}
                </div>
              )}

              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-4 py-2 text-sm text-[#d8c08a]">
                  <Sparkles size={16} />
                  {figure.era}
                </div>

                <h1 className="text-[clamp(2.8rem,6vw,5.8rem)] font-black leading-[0.92] tracking-[-0.07em]">
                  {figure.nameKa}
                </h1>

                <p className="mt-4 text-base font-bold text-[#c9a45c] sm:text-lg">
                  {figure.nameEn} · {figure.years}
                </p>

                <p className="mt-3 text-lg font-black leading-7 text-[#f4efe6]">
                  {figure.role}
                </p>

                <p className="mt-4 max-w-3xl text-base leading-8 text-[#b8aea3]">
                  {figure.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
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

              <div className="hidden min-w-[180px] rounded-[1.4rem] border border-[#f4efe6]/10 bg-[#0e0b0b]/65 p-5 lg:block">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 text-[#c9a45c]">
                  <MessageCircle size={20} />
                </div>

                <p className="text-sm font-black text-[#f4efe6]">
                  დაიწყე საუბარი
                </p>

                <p className="mt-3 text-sm leading-6 text-[#b8aea3]">
                  დასვი კითხვა ცხოვრებაზე, იდეებზე, ეპოქაზე ან დღევანდელ
                  საკითხებზე.
                </p>
              </div>
            </div>
          </div>
        </div>

        <FigureChat figure={figure} />
      </section>
    </main>
  );
}