import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0e0b0b] px-5 py-8 text-[#f4efe6]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,164,92,0.13),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(92,30,38,0.35),transparent_34%),linear-gradient(180deg,#140d0d_0%,#0e0b0b_72%)]" />
      <div className="absolute inset-0 opacity-[0.06] grain" />

      <section className="relative z-10 mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-4 py-2 text-sm font-bold text-[#d8c08a] transition hover:bg-[#f4efe6]/10"
        >
          <ArrowLeft size={16} />
          მთავარზე დაბრუნება
        </Link>

        <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010]/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-4 py-2 text-sm font-bold text-[#d8c08a]">
            <Sparkles size={16} />
            ECHO Georgia
          </div>

          <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            პროექტის შესახებ
          </h1>

          <div className="mt-7 space-y-6 text-sm leading-7 text-[#d9d0c5]">
            <p>
              ECHO Georgia არის საგანმანათლებლო AI პროექტი, რომელიც მომხმარებლებს
              აძლევს შესაძლებლობას ესაუბრონ საქართველოს ისტორიისა და კულტურის
              ცნობილ ფიგურებზე შექმნილ AI ინტერპრეტაციებს.
            </p>

            <p>
              ეს პერსონაჟები არ არიან რეალური ისტორიული ადამიანები და არ
              წარმოადგენენ მათ პირდაპირ, ფაქტობრივ ხმას. ისინი შექმნილია
              ბიოგრაფიული ცნობების, ისტორიული კონტექსტის, ნაწერების,
              კულტურული მეხსიერებისა და AI მოდელის ინტერპრეტაციის საფუძველზე.
            </p>

            <p>
              პროექტის მიზანია ისტორიისა და კულტურის უფრო ცოცხლად, მარტივად და
              საინტერესო ფორმით გაცნობა. პასუხები შეიძლება იყოს სასარგებლო
              სწავლისთვის, შთაგონებისთვის და ისტორიულ თემებზე ფიქრისთვის, მაგრამ
              არ უნდა ჩაითვალოს ოფიციალურ აკადემიურ წყაროდ.
            </p>

            <div className="rounded-2xl border border-[#c9a45c]/20 bg-[#c9a45c]/10 p-4">
              <p className="font-black text-[#f4efe6]">მნიშვნელოვანი შენიშვნა</p>
              <p className="mt-2 text-[#b8aea3]">
                AI პასუხები შეიძლება შეიცავდეს შეცდომებს, გამოტოვებებს ან
                ინტერპრეტაციებს. ისტორიული ფაქტების გადამოწმებისთვის ყოველთვის
                გამოიყენე სანდო წყაროები, წიგნები და სპეციალისტების კვლევები.
              </p>
            </div>

            <p>
              ECHO Georgia ჯერ განვითარებისა და გაუმჯობესების პროცესშია. ჩვენ
              მუდმივად ვაუმჯობესებთ პერსონაჟების ცოდნას, სტილს, სიზუსტესა და
              მომხმარებლის გამოცდილებას.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}