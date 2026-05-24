import type { Figure } from "@/data/figures";
import { getKnowledgeBySlug } from "@/data/figureKnowledge";
import { BookOpen, CheckCircle2, Compass, FileText, ShieldCheck } from "lucide-react";

function ListBlock({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.7rem] border border-[#f4efe6]/10 bg-[#171010] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 text-[#c9a45c]">
          {icon}
        </div>
        <h3 className="text-xl font-black">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm leading-7 text-[#b8aea3]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a45c]" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FigureKnowledgePanel({ figure }: { figure: Figure }) {
  const knowledge = getKnowledgeBySlug(figure.slug);

  if (!knowledge) {
    return null;
  }

  return (
    <section className="relative z-10 mx-auto max-w-7xl pb-16">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-[#c9a45c]">
          Knowledge & source logic
        </p>

        <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          წყაროების ლოგიკა
        </h2>

        <p className="mt-5 text-lg leading-8 text-[#b8aea3]">
          ეს ნაწილი აჩვენებს, რაზეა აგებული {figure.nameKa}-ს AI ინტერპრეტაცია,
          რა თემებზე უნდა ისაუბროს ფრთხილად და რას არ უნდა იგონებდეს.
        </p>
      </div>

      <div className="rounded-[2.2rem] border border-[#f4efe6]/10 bg-[#120d0d]/80 p-5 shadow-2xl backdrop-blur-xl">
        <div className="rounded-[1.8rem] border border-[#c9a45c]/15 bg-[linear-gradient(145deg,#1a1010,#0e0b0b)] p-6">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.7rem] border border-[#f4efe6]/10 bg-[#f4efe6]/5 p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 text-[#c9a45c]">
                  <BookOpen size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#c9a45c]">
                    Foundation
                  </p>
                  <h3 className="mt-1 text-2xl font-black">რის საფუძველზე პასუხობს</h3>
                </div>
              </div>

              <p className="text-base leading-8 text-[#d9d0c5]">
                {knowledge.overview}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {knowledge.keyTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-2 text-sm text-[#d9d0c5]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <ListBlock
                title="რას არ იგონებს"
                icon={<ShieldCheck size={20} />}
                items={knowledge.historicalBoundaries}
              />

              <ListBlock
                title="როგორ პასუხობს"
                icon={<CheckCircle2 size={20} />}
                items={knowledge.responseRules}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ListBlock
              title="საწყისი ფაქტები"
              icon={<FileText size={20} />}
              items={knowledge.starterFacts}
            />

            <ListBlock
              title="შემდეგი წყაროების გეგმა"
              icon={<Compass size={20} />}
              items={knowledge.sourcePlan}
            />
          </div>
        </div>
      </div>
    </section>
  );
}