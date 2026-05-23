import Link from "next/link";
import { ArrowRight, BookOpen, Landmark, MessageCircle, Sparkles } from "lucide-react";
import { figures } from "@/data/figures";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0e0b0b] text-[#f4efe6]">
      <section className="relative min-h-screen px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,164,92,0.18),transparent_34%),radial-gradient(circle_at_70%_20%,rgba(92,30,38,0.45),transparent_36%),linear-gradient(180deg,#130d0d_0%,#0e0b0b_65%)]" />
        <div className="absolute inset-0 opacity-[0.08] grain" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#f4efe6]/10 bg-[#120d0d]/70 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-[#c9a45c]/40 bg-[#c9a45c]/10 text-sm font-bold tracking-[0.18em] text-[#c9a45c]">
              EC
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-[#f4efe6]">
                ECHO
              </p>
              <p className="text-xs text-[#b8aea3]">Voices of Georgian History</p>
            </div>
          </div>

          <div className="hidden items-center gap-7 text-sm text-[#b8aea3] md:flex">
            <a className="transition hover:text-[#f4efe6]" href="#figures">
              პიროვნებები
            </a>
            <a className="transition hover:text-[#f4efe6]" href="#vision">
              ხედვა
            </a>
            <a className="transition hover:text-[#f4efe6]" href="#sources">
              წყაროები
            </a>
          </div>

          <a
            href="#figures"
            className="rounded-full bg-[#f4efe6] px-5 py-2.5 text-sm font-semibold text-[#160f0f] transition hover:bg-[#c9a45c]"
          >
            დაიწყე
          </a>
        </nav>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-12 py-16 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-4 py-2 text-sm text-[#d8c08a]">
              <Sparkles size={16} />
              AI-powered Georgian cultural archive
            </div>

            <h1 className="max-w-4xl text-[clamp(3.2rem,8vw,8.5rem)] font-black leading-[0.88] tracking-[-0.07em]">
              Echoes of Georgia
            </h1>

            <p className="mt-8 max-w-2xl text-2xl font-semibold leading-tight text-[#f4efe6] sm:text-3xl">
              ესაუბრე საქართველოს ისტორიას.
            </p>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#b8aea3]">
              პრემიუმ ციფრული მუზეუმი, სადაც ისტორიული ქართველი პიროვნებები
              ცოცხლდებიან როგორც AI ინტერპრეტაციები — ბიოგრაფიებზე, ნაწერებზე,
              წყაროებსა და კულტურულ მეხსიერებაზე დაყრდნობით.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#figures"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#c9a45c] px-7 py-4 text-base font-bold text-[#140d0d] transition hover:bg-[#e2c071]"
              >
                ნახე პიროვნებები
                <ArrowRight className="transition group-hover:translate-x-1" size={18} />
              </a>

              <a
                href="#vision"
                className="inline-flex items-center justify-center rounded-full border border-[#f4efe6]/15 bg-[#f4efe6]/5 px-7 py-4 text-base font-semibold text-[#f4efe6] transition hover:bg-[#f4efe6]/10"
              >
                გაიგე იდეა
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-[#5c1e26]/30 blur-3xl" />
            <div className="relative rounded-[2.5rem] border border-[#f4efe6]/10 bg-[#171010]/78 p-4 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[2rem] border border-[#c9a45c]/20 bg-[linear-gradient(145deg,#211313,#0f0b0b)] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#b8aea3]">Featured dialogue</p>
                    <h2 className="text-2xl font-bold">ილია ჭავჭავაძე</h2>
                  </div>
                  <div className="rounded-full border border-[#c9a45c]/30 px-3 py-1 text-xs text-[#d8c08a]">
                    XIX საუკუნე
                  </div>
                </div>

                <div className="aspect-[4/5] rounded-[1.6rem] border border-[#f4efe6]/10 bg-[radial-gradient(circle_at_50%_18%,rgba(201,164,92,0.22),transparent_28%),linear-gradient(180deg,#2a1115,#120d0d)] p-5">
                  <div className="flex h-full flex-col justify-between rounded-[1.2rem] border border-[#c9a45c]/20 bg-[#090707]/35 p-5">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-[#c9a45c]">
                        Archive Room
                      </p>
                      <p className="mt-5 text-3xl font-black leading-tight">
                        “ენა, მამული, სარწმუნოება...”
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f4efe6]/8 p-4">
                      <p className="text-sm leading-6 text-[#d9d0c5]">
                        მკითხე განათლებაზე, პასუხისმგებლობაზე, ერზე და იმაზე,
                        როგორ უნდა იფიქროს ადამიანმა საკუთარ დროზე.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-[#f4efe6]/6 p-4">
                    <BookOpen className="mx-auto mb-2 text-[#c9a45c]" size={20} />
                    <p className="text-xs text-[#b8aea3]">Sources</p>
                  </div>
                  <div className="rounded-2xl bg-[#f4efe6]/6 p-4">
                    <MessageCircle className="mx-auto mb-2 text-[#c9a45c]" size={20} />
                    <p className="text-xs text-[#b8aea3]">Dialogue</p>
                  </div>
                  <div className="rounded-2xl bg-[#f4efe6]/6 p-4">
                    <Landmark className="mx-auto mb-2 text-[#c9a45c]" size={20} />
                    <p className="text-xs text-[#b8aea3]">History</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="figures" className="relative px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-[#c9a45c]">
              Character archive
            </p>
            <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
              აირჩიე ისტორიული ხმა
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#b8aea3]">
              თითოეული პიროვნება იქნება ცალკე AI ინტერპრეტაცია, საკუთარი ცოდნის
              ბაზით, ტონით, ეპოქის ატმოსფეროთი და წყაროებზე დაფუძნებული პასუხებით.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {figures.map((figure) => (
              <article
                key={figure.slug}
                className="group rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#c9a45c]/35 hover:bg-[#1d1212]"
              >
                <div className="mb-5 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-[#f4efe6]/10 bg-[radial-gradient(circle_at_top,rgba(201,164,92,0.24),transparent_32%),linear-gradient(145deg,#2a1115,#100b0b)]">
                  <div className="flex h-full items-end p-5">
                    <div>
                      <p className="mb-2 text-sm text-[#d8c08a]">{figure.era}</p>
                      <h3 className="text-3xl font-black leading-tight tracking-[-0.04em]">
                        {figure.nameKa}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#c9a45c]">{figure.years}</p>
                <p className="mt-2 text-base font-semibold text-[#f4efe6]">
                  {figure.role}
                </p>
                <p className="mt-4 min-h-24 text-sm leading-7 text-[#b8aea3]">
                  {figure.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {figure.questions.slice(0, 2).map((question) => (
                    <span
                      key={question}
                      className="rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-3 py-2 text-xs text-[#cfc6ba]"
                    >
                      {question}
                    </span>
                  ))}
                </div>

                <Link
  href={`/figures/${figure.slug}`}
  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f4efe6] px-5 py-3 text-sm font-bold text-[#130d0d] transition hover:bg-[#c9a45c]"
>
  პროფილის გახსნა
  <ArrowRight size={16} />
</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="vision" className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-8">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
              Not a toy
            </p>
            <h3 className="mt-4 text-3xl font-black">არა AI როლფლეი</h3>
            <p className="mt-4 leading-7 text-[#b8aea3]">
              ეს უნდა იყოს კულტურული გამოცდილება — პატივისცემით შექმნილი,
              წყაროებზე დაფუძნებული და ისტორიულად ფრთხილი.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-8">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
              Museum feeling
            </p>
            <h3 className="mt-4 text-3xl font-black">ციფრული მუზეუმი</h3>
            <p className="mt-4 leading-7 text-[#b8aea3]">
              ბნელი ველვეტი, თბილი ოქრო, ძველი ქაღალდი, ქართული ტექსტურა და
              თანამედროვე AI ინტერფეისი ერთ სისტემაში.
            </p>
          </div>

          <div
            id="sources"
            className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-8"
          >
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
              Source-based
            </p>
            <h3 className="mt-4 text-3xl font-black">წყაროებზე დაფუძნებული</h3>
            <p className="mt-4 leading-7 text-[#b8aea3]">
              მომავალში თითოეულ პასუხს ექნება ცოდნის ბაზა, წყაროების ლოგიკა და
              მკაფიო შეზღუდვა, რომ AI-მ ისტორია არ გამოიგონოს.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}