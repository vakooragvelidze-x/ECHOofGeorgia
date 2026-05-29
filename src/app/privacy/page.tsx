import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
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
            <ShieldCheck size={16} />
            Privacy
          </div>

          <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            კონფიდენციალურობის პოლიტიკა
          </h1>

          <p className="mt-4 text-sm text-[#756b63]">
            ბოლო განახლება: 2026
          </p>

          <div className="mt-7 space-y-7 text-sm leading-7 text-[#d9d0c5]">
            <Section title="1. რას ვაგროვებთ">
              <p>
                როდესაც ქმნი ანგარიშს ან შედიხარ სისტემაში, ჩვენ შეიძლება
                შევინახოთ შენი ელფოსტა, სახელი, ანგარიშის გეგმა, როლი და
                შესვლისთვის საჭირო ტექნიკური ინფორმაცია.
              </p>
              <p>
                თუ შენ ხარ ავტორიზებული მომხმარებელი, შენი საუბრები და
                შეტყობინებები შეიძლება შეინახოს, რათა მოგვიანებით შეძლო ჩატის
                ისტორიის ნახვა.
              </p>
            </Section>

            <Section title="2. რატომ ვიყენებთ მონაცემებს">
              <p>მონაცემები გამოიყენება შემდეგი მიზნებისთვის:</p>
              <ul className="ml-5 list-disc space-y-2">
                <li>ანგარიშის შექმნა და ავტორიზაცია;</li>
                <li>შენახული ჩატების ჩვენება;</li>
                <li>დღიური ლიმიტების და გეგმების მართვა;</li>
                <li>უსაფრთხოების, შეცდომების და ბოროტად გამოყენების კონტროლი;</li>
                <li>საიტის გაუმჯობესება და მომხმარებლის გამოცდილების დახვეწა.</li>
              </ul>
            </Section>

            <Section title="3. AI პასუხები და ჩატის შინაარსი">
              <p>
                როდესაც აგზავნი შეტყობინებას, ტექსტი იგზავნება AI მოდელთან
                პასუხის დასაგენერირებლად. არ შეიყვანო პაროლები, საბანკო
                ინფორმაცია, პირადი საიდუმლოებები ან სხვა განსაკუთრებით მგრძნობიარე
                მონაცემები.
              </p>
            </Section>

            <Section title="4. მესამე მხარის სერვისები">
              <p>
                ECHO Georgia იყენებს მესამე მხარის სერვისებს, მათ შორის Supabase-ს
                ანგარიშებისა და მონაცემთა ბაზისთვის, Vercel-ს ჰოსტინგისთვის,
                Google-ს Google ავტორიზაციისთვის და AI პროვაიდერებს პასუხების
                გენერირებისთვის.
              </p>
            </Section>

            <Section title="5. მონაცემების შენახვა">
              <p>
                ანგარიშის მონაცემები და შენახული საუბრები ინახება მანამ, სანამ
                საჭიროა სერვისის მიწოდებისთვის ან სანამ არ მოითხოვ მონაცემების
                წაშლას. მომავალში შეიძლება დაემატოს ანგარიშის წაშლის ავტომატური
                ფუნქცია.
              </p>
            </Section>

            <Section title="6. შენი უფლებები">
              <p>
                შეგიძლია მოითხოვო შენი მონაცემების ნახვა, გასწორება ან წაშლა.
                მოთხოვნისთვის დაგვიკავშირდი იმ ელფოსტიდან, რომლითაც დარეგისტრირდი.
              </p>
            </Section>

            <Section title="7. უსაფრთხოება">
              <p>
                ჩვენ ვიყენებთ ავტორიზაციისა და მონაცემთა ბაზის უსაფრთხოების
                მექანიზმებს, რათა მომხმარებლების მონაცემები დაცული იყოს. თუმცა,
                არცერთი ონლაინ სისტემა არ არის აბსოლუტურად შეუღწევადი.
              </p>
            </Section>

            <Section title="8. კონტაქტი">
              <p>
                კონფიდენციალურობასთან დაკავშირებული კითხვებისთვის დაგვიკავშირდი:
                vako.oragvelidze36@gmail.com
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