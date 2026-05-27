import { ArrowLeft, Check, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0e0b0b] text-[#f4efe6]">
      <section className="relative px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,164,92,0.12),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(92,30,38,0.36),transparent_36%),linear-gradient(180deg,#130d0d_0%,#0e0b0b_76%)]" />
        <div className="absolute inset-0 opacity-[0.07] grain" />

        <nav className="relative z-10 mx-auto mb-12 flex max-w-7xl items-center justify-between rounded-full border border-[#f4efe6]/10 bg-[#120d0d]/70 px-5 py-4 backdrop-blur-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#d8c08a] transition hover:text-[#f4efe6]"
          >
            <ArrowLeft size={17} />
            უკან დაბრუნება
          </Link>

          <div className="hidden text-sm text-[#b8aea3] sm:block">
            ECHO Georgia · Plans
          </div>
        </nav>

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-4 py-2 text-sm text-[#d8c08a]">
              <Sparkles size={16} />
              Plans
            </div>

            <h1 className="text-[clamp(3rem,7vw,6rem)] font-black leading-[0.9] tracking-[-0.07em]">
              აირჩიე გეგმა
            </h1>

            <p className="mt-6 text-base leading-8 text-[#b8aea3] sm:text-lg">
              ECHO Georgia ჯერ სატესტო რეჟიმშია. Premium გეგმა მალე დაემატება,
              მაგრამ ლიმიტების სისტემა უკვე მზადდება, რომ პლატფორმა სტაბილურად
              განვითარდეს.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010]/82 p-6 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.6rem] border border-[#f4efe6]/10 bg-[#0e0b0b]/70 p-6">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
                  Free
                </p>

                <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">
                  უფასო
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#b8aea3]">
                  საწყისი გეგმა მათთვის, ვისაც სურს სცადოს ისტორიულ
                  პერსონებთან საუბარი.
                </p>

                <div className="mt-7 space-y-4">
                  <div className="flex gap-3">
                    <Check className="mt-1 shrink-0 text-[#c9a45c]" size={18} />
                    <p className="text-sm leading-7 text-[#d9d0c5]">
                      სტუმარი მომხმარებელი იღებს 5 საცდელ კითხვას.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Check className="mt-1 shrink-0 text-[#c9a45c]" size={18} />
                    <p className="text-sm leading-7 text-[#d9d0c5]">
                      რეგისტრირებული მომხმარებელი იღებს 15 კითხვას დღეში.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Check className="mt-1 shrink-0 text-[#c9a45c]" size={18} />
                    <p className="text-sm leading-7 text-[#d9d0c5]">
                      ანგარიში საჭიროა საუბრების შენახვისა და გაგრძელებისთვის.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-full bg-[#c9a45c] px-6 py-3 text-sm font-black text-[#140d0d] transition hover:bg-[#e2c071]"
                  >
                    რეგისტრაცია
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-6 py-3 text-sm font-bold text-[#f4efe6] transition hover:bg-[#f4efe6]/10"
                  >
                    შესვლა
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative rounded-[2rem] border border-[#c9a45c]/25 bg-[#171010]/82 p-6 shadow-2xl backdrop-blur-xl">
              <div className="absolute -inset-1 rounded-[2rem] bg-[#c9a45c]/10 blur-2xl" />

              <div className="relative rounded-[1.6rem] border border-[#c9a45c]/20 bg-[linear-gradient(145deg,#211313,#0f0b0b)] p-6">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-3 py-1 text-xs font-bold text-[#d8c08a]">
                  <Lock size={14} />
                  Soon
                </div>

                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
                  Premium
                </p>

                <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">
                  Premium გეგმა
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#b8aea3]">
                  Premium გეგმა დაემატება მაშინ, როცა შენახული საუბრები,
                  ლიმიტები და ძირითადი გამოცდილება ბოლომდე გამართული იქნება.
                </p>

                <div className="mt-7 space-y-4">
                  <div className="flex gap-3">
                    <Check className="mt-1 shrink-0 text-[#c9a45c]" size={18} />
                    <p className="text-sm leading-7 text-[#d9d0c5]">
                      მეტი კითხვა დღეში.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Check className="mt-1 shrink-0 text-[#c9a45c]" size={18} />
                    <p className="text-sm leading-7 text-[#d9d0c5]">
                      შენახული საუბრები და ძველი ჩატების გაგრძელება.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Check className="mt-1 shrink-0 text-[#c9a45c]" size={18} />
                    <p className="text-sm leading-7 text-[#d9d0c5]">
                      მომავალში — Research Room, წყაროები და სასწავლო
                      ინსტრუმენტები.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  className="mt-8 w-full cursor-not-allowed rounded-full bg-[#f4efe6]/15 px-6 py-3 text-sm font-black text-[#b8aea3]"
                >
                  მალე დაემატება
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010]/65 p-6 text-center">
            <p className="text-sm leading-7 text-[#b8aea3]">
              ახლა მთავარი მიზანია ჩატის გამოცდილების, შენახული საუბრებისა და
              ისტორიული პერსონების ხარისხის გაუმჯობესება. გადახდის სისტემა
              დაემატება შემდეგ ეტაპზე.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}