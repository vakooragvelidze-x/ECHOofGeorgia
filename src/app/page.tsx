import { ArrowRight, BookOpen, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { figures } from "@/data/figures";

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

export default function HomePage() {
  const featuredFigure = figures[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#0e0b0b] text-[#f4efe6]">
      <section className="relative px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(201,164,92,0.13),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(92,30,38,0.38),transparent_34%),linear-gradient(180deg,#140d0d_0%,#0e0b0b_68%)]" />
        <div className="absolute inset-0 opacity-[0.06] grain" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#f4efe6]/10 bg-[#120d0d]/65 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative block h-10 w-10 shrink-0">
  <Image
    src="/brand/echo-symbol.png"
    alt="ECHO Georgia"
    fill
    priority
    className="object-contain"
  />
</Link>
          </div>

          <div className="hidden items-center gap-7 text-sm text-[#b8aea3] md:flex">
            <a href="#figures" className="transition hover:text-[#f4efe6]">
              პიროვნებები
            </a>
            <a href="#about" className="transition hover:text-[#f4efe6]">
              იდეა
            </a>
          </div>

          <a
            href="#figures"
            className="rounded-full bg-[#f4efe6] px-5 py-2.5 text-sm font-bold text-[#140d0d] transition hover:bg-[#c9a45c]"
          >
            დაიწყე
          </a>
        </nav>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-12 py-14 lg:grid-cols-[1fr_0.85fr]">
          <div className="max-w-3xl">
  <div className="mb-8">
    <div className="relative h-24 w-[18rem] sm:h-28 sm:w-[22rem]">
      <Image
        src="/brand/echo-georgia-logo-nav.png"
        alt="ECHO Georgia"
        fill
        priority
        className="object-contain object-left"
      />
    </div>
  </div>

  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-4 py-2 text-sm text-[#d8c08a]">
    <Sparkles size={16} />
    Georgian AI cultural archive
  </div>

            <h1 className="text-[clamp(3rem,7vw,7rem)] font-black leading-[0.9] tracking-[-0.07em]">
              Echoes of Georgia
            </h1>

            <p className="mt-7 max-w-2xl text-2xl font-black leading-tight text-[#f4efe6] sm:text-3xl">
              ესაუბრე საქართველოს ისტორიას.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#b8aea3] sm:text-lg">
              პრემიუმ ციფრული სივრცე, სადაც ისტორიული ქართველი პიროვნებები
              ცოცხლდებიან როგორც AI დიალოგები — ბიოგრაფიებზე, ნაწერებზე და
              კულტურულ მეხსიერებაზე დაყრდნობით.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#figures"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#c9a45c] px-7 py-4 text-base font-black text-[#140d0d] transition hover:bg-[#e2c071]"
              >
                ნახე პიროვნებები
                <ArrowRight
                  className="transition group-hover:translate-x-1"
                  size={18}
                />
              </a>

              <Link
                href={`/figures/${featuredFigure.slug}`}
                className="inline-flex items-center justify-center rounded-full border border-[#f4efe6]/12 bg-[#f4efe6]/5 px-7 py-4 text-base font-bold text-[#f4efe6] transition hover:bg-[#f4efe6]/10"
              >
                დაიწყე ილიათი
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-[3rem] bg-[#5c1e26]/25 blur-3xl" />

            <Link
              href={`/figures/${featuredFigure.slug}`}
              className="group relative block rounded-[2.2rem] border border-[#f4efe6]/10 bg-[#171010]/75 p-4 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#c9a45c]/35"
            >
              <div className="rounded-[1.8rem] border border-[#c9a45c]/18 bg-[linear-gradient(145deg,#221313,#0f0b0b)] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
                      Featured dialogue
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      {featuredFigure.nameKa}
                    </h2>
                  </div>

                  <span className="rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-3 py-1 text-xs text-[#d8c08a]">
                    {featuredFigure.era}
                  </span>
                </div>

                <div className="grid gap-5 rounded-[1.5rem] border border-[#f4efe6]/10 bg-[#090707]/45 p-5 md:grid-cols-[1fr_165px]">
                  <div className="flex min-h-[330px] flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-[#c9a45c]">
                        Archive Room
                      </p>

                      <p className="mt-5 max-w-sm text-3xl font-black leading-tight">
                        “{featuredFigure.quote}”
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f4efe6]/8 p-4">
                      <p className="text-sm leading-6 text-[#d9d0c5]">
                        მკითხე ენაზე, განათლებაზე, პასუხისმგებლობაზე და იმაზე,
                        როგორ უნდა იფიქროს ადამიანმა საკუთარ დროზე.
                      </p>
                    </div>
                  </div>

                  {featuredFigure.image ? (
                    <div className="relative min-h-[330px] overflow-hidden rounded-[1.2rem] border border-[#c9a45c]/25 bg-[#171010]">
                      <Image
                        src={featuredFigure.image}
                        alt={featuredFigure.nameKa}
                        fill
                        sizes="165px"
                        style={{
                          objectPosition: getFigureImagePosition(
                            featuredFigure.slug
                          ),
                        }}
                        className="object-cover grayscale sepia-[0.2] contrast-110 transition duration-500 group-hover:scale-105"
                        priority
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(14,11,11,0.76)_100%)]" />
                    </div>
                  ) : (
                    <div className="grid min-h-[330px] place-items-center rounded-[1.2rem] border border-[#c9a45c]/25 bg-[#c9a45c]/10 text-5xl font-black text-[#c9a45c]">
                      {featuredFigure.nameKa.slice(0, 1)}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-[#f4efe6]/6 p-4">
                    <BookOpen className="mx-auto mb-2 text-[#c9a45c]" size={19} />
                    <p className="text-xs text-[#b8aea3]">Sources</p>
                  </div>
                  <div className="rounded-2xl bg-[#f4efe6]/6 p-4">
                    <MessageCircle
                      className="mx-auto mb-2 text-[#c9a45c]"
                      size={19}
                    />
                    <p className="text-xs text-[#b8aea3]">Dialogue</p>
                  </div>
                  <div className="rounded-2xl bg-[#f4efe6]/6 p-4">
                    <ShieldCheck
                      className="mx-auto mb-2 text-[#c9a45c]"
                      size={19}
                    />
                    <p className="text-xs text-[#b8aea3]">Careful</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section id="figures" className="relative px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-[#c9a45c]">
                Character archive
              </p>
              <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                აირჩიე ისტორიული ხმა
              </h2>
              <p className="mt-4 text-base leading-8 text-[#b8aea3]">
                თითოეულ პერსონას აქვს საკუთარი ცოდნის ბაზა, ხმა, ეპოქის ატმოსფერო
                და საუბრის სტილი.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {figures.map((figure) => (
              <Link
                key={figure.slug}
                href={`/figures/${figure.slug}`}
                className="group overflow-hidden rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] transition duration-300 hover:-translate-y-1 hover:border-[#c9a45c]/35 hover:bg-[#1d1212]"
              >
                <div className="relative aspect-[16/10] bg-[radial-gradient(circle_at_top,rgba(201,164,92,0.22),transparent_34%),linear-gradient(145deg,#2a1115,#100b0b)]">
                  {figure.image ? (
                    <Image
                      src={figure.image}
                      alt={figure.nameKa}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{
                        objectPosition: getFigureImagePosition(figure.slug),
                      }}
                      className="object-cover grayscale sepia-[0.2] opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,11,11,0.1)_0%,rgba(14,11,11,0.82)_100%)]" />

                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="mb-2 text-sm text-[#d8c08a]">{figure.era}</p>
                    <h3 className="text-3xl font-black leading-tight tracking-[-0.04em]">
                      {figure.nameKa}
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-[#c9a45c]">{figure.years}</p>
                  <p className="mt-2 text-base font-bold text-[#f4efe6]">
                    {figure.role}
                  </p>

                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#b8aea3]">
                    {figure.description}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#f4efe6]">
                    საუბრის გახსნა
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-7">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
              First person
            </p>
            <h3 className="mt-4 text-2xl font-black">ცოცხალი საუბარი</h3>
            <p className="mt-4 text-sm leading-7 text-[#b8aea3]">
              პერსონები საუბრობენ პირველ პირში, მაგრამ საჭირო დროს განმარტავენ,
              რომ ეს AI ინტერპრეტაციაა.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-7">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
              Historical logic
            </p>
            <h3 className="mt-4 text-2xl font-black">წყაროებზე დაყრდნობით</h3>
            <p className="mt-4 text-sm leading-7 text-[#b8aea3]">
              ცოდნა აგებულია ბიოგრაფიებზე, ნაწერებზე, ისტორიულ კონტექსტზე და
              მკაფიო შეზღუდვებზე.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-7">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
              Private beta
            </p>
            <h3 className="mt-4 text-2xl font-black">ჯერ სატესტო ვერსია</h3>
            <p className="mt-4 text-sm leading-7 text-[#b8aea3]">
              პროექტი ვითარდება ეტაპობრივად. პირველი მიზანია ერთი პერსონის
              გამოცდილება მაქსიმალურად ხარისხიანი გახდეს.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}