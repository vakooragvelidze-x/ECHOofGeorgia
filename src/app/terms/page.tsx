import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
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
            <FileText size={16} />
            Terms
          </div>

          <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            გამოყენების პირობები
          </h1>

          <p className="mt-4 text-sm text-[#756b63]">
            ბოლო განახლება: 2026
          </p>

          <div className="mt-7 space-y-7 text-sm leading-7 text-[#d9d0c5]">
            <Section title="1. სერვისის აღწერა">
              <p>
                ECHO Georgia არის AI-ზე დაფუძნებული საგანმანათლებლო და
                კულტურული ვებგვერდი, სადაც მომხმარებლებს შეუძლიათ ესაუბრონ
                საქართველოს ისტორიულ და კულტურულ ფიგურებზე შექმნილ AI
                ინტერპრეტაციებს.
              </p>
            </Section>

            <Section title="2. AI ინტერპრეტაცია">
              <p>
                ვებგვერდზე წარმოდგენილი პერსონაჟები არ არიან რეალური ისტორიული
                პირები. ისინი AI ინტერპრეტაციებია, რომლებიც ეფუძნება ისტორიულ
                ცნობებს, კულტურულ კონტექსტს და შემოქმედებით მოდელირებას.
              </p>
              <p>
                პასუხები შეიძლება იყოს არასრული, არაზუსტი ან ინტერპრეტაციული.
                სერვისი არ ცვლის აკადემიურ კვლევას, პროფესიულ რჩევას ან
                ოფიციალურ ისტორიულ წყაროს.
              </p>
            </Section>

            <Section title="3. მომხმარებლის პასუხისმგებლობა">
              <p>სერვისის გამოყენებისას არ შეიძლება:</p>
              <ul className="ml-5 list-disc space-y-2">
                <li>სერვისის ბოროტად გამოყენება ან ავტომატური სპამი;</li>
                <li>სხვა მომხმარებლის ანგარიშზე წვდომის მცდელობა;</li>
                <li>უკანონო, შეურაცხმყოფელი ან მავნე შინაარსის გაგზავნა;</li>
                <li>სისტემის ლიმიტების გვერდის ავლა;</li>
                <li>პერსონალური ან მგრძნობიარე მონაცემების დაუფიქრებლად შეყვანა.</li>
              </ul>
            </Section>

            <Section title="4. ანგარიშები და წვდომა">
              <p>
                ზოგი ფუნქცია საჭიროებს ანგარიშს. მომხმარებელი პასუხისმგებელია
                თავისი ანგარიშის უსაფრთხოებაზე. ადმინისტრაციას შეუძლია შეზღუდოს,
                შეაჩეროს ან წაშალოს წვდომა, თუ სერვისი გამოიყენება არაკეთილსინდისიერად.
              </p>
            </Section>

            <Section title="5. ლიმიტები და გეგმები">
              <p>
                უფასო, პრემიუმ ან unlimited წვდომის პირობები შეიძლება შეიცვალოს,
                განსაკუთრებით ბეტა პერიოდის განმავლობაში. ადმინისტრატორს შეუძლია
                კონკრეტულ ანგარიშებს მისცეს ან შეუცვალოს წვდომის ტიპი.
              </p>
            </Section>

            <Section title="6. სერვისის ხელმისაწვდომობა">
              <p>
                ვცდილობთ სერვისი იყოს სტაბილური, მაგრამ არ ვიძლევით გარანტიას,
                რომ ვებგვერდი ყოველთვის იმუშავებს შეფერხების გარეშე. შესაძლებელია
                ტექნიკური შეცდომები, განახლებები ან დროებითი გათიშვები.
              </p>
            </Section>

            <Section title="7. ინტელექტუალური საკუთრება">
              <p>
                ვებგვერდის დიზაინი, ტექსტური სტრუქტურა, AI პერსონაჟების სისტემა
                და სხვა მასალები ეკუთვნის ECHO Georgia-ს ან გამოყენებულია შესაბამისი
                უფლებების და ლეგიტიმური საფუძვლის ფარგლებში.
              </p>
            </Section>

            <Section title="8. პირობების ცვლილება">
              <p>
                გამოყენების პირობები შეიძლება განახლდეს. ცვლილებები გამოქვეყნდება
                ამ გვერდზე. სერვისის გაგრძელებული გამოყენება ნიშნავს განახლებულ
                პირობებზე თანხმობას.
              </p>
            </Section>

            <Section title="9. კონტაქტი">
              <p>
                კითხვებისთვის დაგვიკავშირდი: vako.oragvelidze36@gmail.com
              </p>
            </Section>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-black text-[#f4efe6]">{title}</h2>
      <div className="space-y-3 text-[#b8aea3]">{children}</div>
    </section>
  );
}