import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  CalendarDays,
  Crown,
  Mail,
  MessageCircle,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export const dynamic = "force-dynamic";

const FREE_DAILY_LIMIT = 15;

function getTodayStartIso() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, plan, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const fullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null;

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      plan: "free",
      role: "user",
    });

    const { data: createdProfile } = await supabase
      .from("profiles")
      .select("full_name, email, plan, role, created_at")
      .eq("id", user.id)
      .maybeSingle();

    profile = createdProfile;
  }

  const plan = profile?.plan ?? "free";

  const { count } = await supabase
    .from("usage_events")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("event_type", "chat_message")
    .gte("created_at", getTodayStartIso());

  const usedToday = count ?? 0;
  const isPremium = plan === "premium";
  const remainingToday = isPremium
    ? null
    : Math.max(FREE_DAILY_LIMIT - usedToday, 0);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0e0b0b] px-5 py-6 text-[#f4efe6] sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,164,92,0.12),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(92,30,38,0.36),transparent_36%),linear-gradient(180deg,#130d0d_0%,#0e0b0b_76%)]" />
      <div className="absolute inset-0 opacity-[0.07] grain" />

      <nav className="relative z-10 mx-auto mb-10 flex max-w-5xl items-center justify-between rounded-full border border-[#f4efe6]/10 bg-[#120d0d]/70 px-5 py-4 backdrop-blur-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#d8c08a] transition hover:text-[#f4efe6]"
        >
          <ArrowLeft size={17} />
          მთავარ გვერდზე
        </Link>

        <div className="hidden text-sm text-[#b8aea3] sm:block">
          ECHO Georgia · Account
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-5xl">
        <div className="rounded-[2.2rem] border border-[#f4efe6]/10 bg-[#171010]/82 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
            Account
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            შენი ანგარიში
          </h1>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.6rem] border border-[#f4efe6]/10 bg-[#0e0b0b]/70 p-5">
              <h2 className="text-xl font-black">ანგარიშის დეტალები</h2>

              <div className="mt-5 space-y-4 text-sm leading-7 text-[#d9d0c5]">
                <div className="flex gap-3">
                  <Mail className="mt-1 shrink-0 text-[#c9a45c]" size={18} />
                  <div>
                    <p className="text-[#756b63]">Email</p>
                    <p className="font-bold text-[#f4efe6]">
                      {profile?.email ?? user.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <UserRound
                    className="mt-1 shrink-0 text-[#c9a45c]"
                    size={18}
                  />
                  <div>
                    <p className="text-[#756b63]">Name</p>
                    <p className="font-bold text-[#f4efe6]">
                      {profile?.full_name || "არ არის მითითებული"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CalendarDays
                    className="mt-1 shrink-0 text-[#c9a45c]"
                    size={18}
                  />
                  <div>
                    <p className="text-[#756b63]">Account type</p>
                    <p className="font-bold text-[#f4efe6]">
                      {profile?.role ?? "user"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[#c9a45c]/18 bg-[#c9a45c]/10 p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-full border border-[#c9a45c]/25 bg-[#0e0b0b]/50 text-[#c9a45c]">
                <Crown size={20} />
              </div>

              <h2 className="text-xl font-black">გეგმა</h2>

              <p className="mt-3 text-3xl font-black capitalize tracking-[-0.04em] text-[#f4efe6]">
                {plan}
              </p>

              <div className="mt-5 rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b]/55 p-4">
                <div className="flex gap-3">
                  <MessageCircle
                    className="mt-1 shrink-0 text-[#c9a45c]"
                    size={18}
                  />
                  <div>
                    <p className="text-sm font-bold text-[#f4efe6]">
                      დღევანდელი კითხვები
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#b8aea3]">
                      {isPremium
                        ? `${usedToday} გამოყენებული · Premium ლიმიტი`
                        : `${usedToday}/${FREE_DAILY_LIMIT} გამოყენებული · დარჩა ${remainingToday}`}
                    </p>
                  </div>
                </div>
              </div>

              {!isPremium && (
                <Link
                  href="/pricing"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-[#c9a45c]/25 bg-[#0e0b0b] px-5 py-3 text-sm font-black text-[#d8c08a] transition hover:bg-[#f4efe6]/5"
                >
                  Premium გეგმა
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#c9a45c] px-6 py-3 text-sm font-black text-[#140d0d] transition hover:bg-[#e2c071]"
            >
              მთავარ გვერდზე დაბრუნება
            </Link>

            <LogoutButton />
          </div>
        </div>
      </section>
    </main>
  );
}