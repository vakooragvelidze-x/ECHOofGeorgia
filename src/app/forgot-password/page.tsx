"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = email.trim();

    setError("");
    setStatus("idle");

    if (!cleanEmail) {
      setError("შეიყვანე ელფოსტა.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : "https://echogeorgia.com/reset-password";

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setStatus("success");
    } catch (error) {
      console.error("Password reset request error:", error);
      setError(
        "პაროლის აღდგენის ბმულის გაგზავნა ვერ მოხერხდა. გადაამოწმე ელფოსტა და სცადე თავიდან."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0e0b0b] px-5 py-8 text-[#f4efe6]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,164,92,0.13),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(92,30,38,0.35),transparent_34%),linear-gradient(180deg,#140d0d_0%,#0e0b0b_72%)]" />
      <div className="absolute inset-0 opacity-[0.06] grain" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
        <div className="w-full rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010]/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-4 py-2 text-sm font-bold text-[#d8c08a] transition hover:bg-[#f4efe6]/10"
          >
            <ArrowLeft size={16} />
            უკან შესვლაზე
          </Link>

          <div className="mb-6 grid h-12 w-12 place-items-center rounded-full border border-[#c9a45c]/30 bg-[#c9a45c]/10 text-[#c9a45c]">
            <Mail size={22} />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-[#c9a45c]">
            ECHO Georgia
          </p>

          <h1 className="text-4xl font-black tracking-[-0.05em]">
            პაროლის აღდგენა
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#b8aea3]">
            შეიყვანე შენი ანგარიშის ელფოსტა და გამოგიგზავნით ბმულს, რომლითაც
            ახალ პაროლს დააყენებ.
          </p>

          {status === "success" ? (
            <div className="mt-7 rounded-2xl border border-[#c9a45c]/25 bg-[#c9a45c]/10 p-4 text-sm leading-7 text-[#d9d0c5]">
              თუ ეს ელფოსტა რეგისტრირებულია, პაროლის აღდგენის ბმული უკვე
              გამოგზავნილია. შეამოწმე Inbox და Spam საქაღალდეც.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ელფოსტა"
                className="w-full rounded-full border border-[#f4efe6]/10 bg-[#0e0b0b] px-5 py-4 text-sm text-[#f4efe6] outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40"
              />

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-[#c9a45c] px-6 py-4 text-sm font-black text-[#140d0d] transition hover:bg-[#e2c071] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "იგზავნება..." : "აღდგენის ბმულის გაგზავნა"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-[#b8aea3]">
            გაგახსენდა პაროლი?{" "}
            <Link href="/login" className="font-black text-[#c9a45c]">
              შესვლა
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}