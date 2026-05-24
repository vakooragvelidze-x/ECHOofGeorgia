import FigureChat from "@/components/FigureChat";
import { figures, getFigureBySlug } from "@/data/figures";
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,164,92,0.16),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(92,30,38,0.45),transparent_38%),linear-gradient(180deg,#130d0d_0%,#0e0b0b_70%)]" />
        <div className="absolute inset-0 opacity-[0.08] grain" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#f4efe6]/10 bg-[#120d0d]/70 px-5 py-4 backdrop-blur-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#d8c08a] transition hover:text-[#f4efe6]"
          >
            <ArrowLeft size={17} />
            უკან დაბრუნება
          </Link>

          <div className="hidden text-sm text-[#b8aea3] sm:block">
            ECHO Georgia · Historical AI Interpretation
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-4 py-2 text-sm text-[#d8c08a]">
              <Sparkles size={16} />
              {figure.era}
            </div>

            <h1 className="text-[clamp(3rem,7vw,7.5rem)] font-black leading-[0.9] tracking-[-0.07em]">
              {figure.nameKa}
            </h1>

            <p className="mt-5 text-lg font-semibold text-[#c9a45c]">
              {figure.nameEn} · {figure.years}
            </p>

            <p className="mt-4 text-xl font-semibold leading-8 text-[#f4efe6]">
              {figure.role}
            </p>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#b8aea3]">
              {figure.longDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
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

          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-[#5c1e26]/30 blur-3xl" />

            <div className="relative rounded-[2.5rem] border border-[#f4efe6]/10 bg-[#171010]/80 p-4 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[2rem] border border-[#c9a45c]/20 bg-[linear-gradient(145deg,#241414,#0f0b0b)] p-5">
                <div className="min-h-[520px] rounded-[1.6rem] border border-[#f4efe6]/10 bg-[radial-gradient(circle_at_50%_18%,rgba(201,164,92,0.22),transparent_28%),linear-gradient(180deg,#2a1115,#120d0d)] p-5">
                  <div className="grid h-full min-h-[480px] gap-5 rounded-[1.2rem] border border-[#c9a45c]/20 bg-[#090707]/35 p-5 lg:grid-cols-[minmax(0,1fr)_250px]">
                    <div className="flex min-h-[430px] flex-col justify-between gap-6">
                      <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-[#c9a45c]">
                          Archive Room
                        </p>

                        <p className="mt-5 max-w-md text-3xl font-black leading-tight">
                          “{figure.quote}”
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f4efe6]/8 p-4">
                        <p className="text-sm leading-6 text-[#d9d0c5]">
                          {figure.room}
                        </p>
                      </div>
                    </div>

                    {figure.image ? (
                      <div className="relative min-h-[420px] overflow-hidden rounded-[1.4rem] border border-[#c9a45c]/30 bg-[#171010] shadow-[0_22px_60px_rgba(0,0,0,0.45)]">
                        <Image
                          src={figure.image}
                          alt={figure.nameKa}
                          fill
                          sizes="250px"
                          className="object-cover object-center grayscale sepia-[0.22] contrast-110"
                          priority
                        />

                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,11,11,0.02)_0%,rgba(14,11,11,0.08)_45%,rgba(14,11,11,0.78)_100%)]" />

                        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-[#f4efe6]/10 bg-[#0e0b0b]/70 px-3 py-2 backdrop-blur-md">
                          <p className="text-xs font-semibold text-[#f4efe6]">
                            {figure.nameKa}
                          </p>
                          <p className="mt-1 text-[11px] text-[#b8aea3]">
                            {figure.years}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid min-h-[420px] place-items-center rounded-[1.4rem] border border-[#c9a45c]/25 bg-[#c9a45c]/10 text-5xl font-black text-[#c9a45c]">
                        {figure.nameKa.slice(0, 1)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-[#f4efe6]/6 p-4">
                    <BookOpen className="mx-auto mb-2 text-[#c9a45c]" size={20} />
                    <p className="text-xs text-[#b8aea3]">Knowledge</p>
                  </div>

                  <div className="rounded-2xl bg-[#f4efe6]/6 p-4">
                    <MessageCircle
                      className="mx-auto mb-2 text-[#c9a45c]"
                      size={20}
                    />
                    <p className="text-xs text-[#b8aea3]">Dialogue</p>
                  </div>

                  <div className="rounded-2xl bg-[#f4efe6]/6 p-4">
                    <ShieldCheck
                      className="mx-auto mb-2 text-[#c9a45c]"
                      size={20}
                    />
                    <p className="text-xs text-[#b8aea3]">Source-safe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <FigureChat figure={figure} />
      </section>
    </main>
  );
}