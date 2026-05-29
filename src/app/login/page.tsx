"use client";

import BackHomeButton from "@/components/BackHomeButton";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      router.push("/account");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "https://echogeorgia.com/auth/callback";

      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (googleError) {
        throw googleError;
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Google-ით შესვლა ვერ მოხერხდა. სცადე თავიდან.");
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#0e0b0b] px-5 py-10 text-[#f4efe6]">
      <div className="absolute left-5 top-5 z-20 sm:left-8 sm:top-8">
        <BackHomeButton />
      </div>

      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <form
          onSubmit={handleLogin}
          className="w-full rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-7 shadow-2xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
            ECHO Georgia
          </p>

          <h1 className="mt-6 text-4xl font-black tracking-[-0.05em]">
            ავტორიზაცია
          </h1>

          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={isLoading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-[#f4efe6]/10 bg-[#f4efe6] px-6 py-4 text-sm font-black text-[#140d0d] transition hover:bg-[#c9a45c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Google-ით შესვლა
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#f4efe6]/10" />
            <span className="text-xs font-bold text-[#756b63]">ან</span>
            <div className="h-px flex-1 bg-[#f4efe6]/10" />
          </div>

          <div className="space-y-4">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-4 text-sm outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40"
            />

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              required
              className="w-full rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-4 text-sm outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40"
            />
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-full bg-[#c9a45c] px-5 py-4 text-sm font-black text-[#140d0d] transition hover:bg-[#e2c071] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "შესვლა..." : "შესვლა"}
          </button>

          <div className="mt-4 text-center text-sm text-[#b8aea3]">
            <Link href="/forgot-password" className="font-black text-[#c9a45c]">
              დაგავიწყდა პაროლი?
            </Link>
          </div>

          <p className="mt-5 text-center text-sm text-[#b8aea3]">
            არ გაქვს ანგარიში?{" "}
            <Link href="/register" className="font-bold text-[#c9a45c]">
              რეგისტრაცია
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}