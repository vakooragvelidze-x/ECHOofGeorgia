import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, plan, role")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-[#0e0b0b] px-5 py-10 text-[#f4efe6]">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-7 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
            Account
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
            შენი ანგარიში
          </h1>

          <div className="mt-7 space-y-3 rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] p-5 text-sm leading-7 text-[#d9d0c5]">
            <p>
              <span className="text-[#756b63]">Email:</span>{" "}
              {profile?.email ?? user.email}
            </p>
            <p>
              <span className="text-[#756b63]">Name:</span>{" "}
              {profile?.full_name || "არ არის მითითებული"}
            </p>
            <p>
              <span className="text-[#756b63]">Plan:</span>{" "}
              {profile?.plan ?? "free"}
            </p>
          </div>

          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  );
}