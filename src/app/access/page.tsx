"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, Sparkles } from "lucide-react";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Access denied.");
      }

      window.location.href = "/";
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Access denied. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0e0b0b] px-5 text-[#f4efe6]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,164,92,0.18),transparent_34%),radial-gradient(circle_at_70%_20%,rgba(92,30,38,0.45),transparent_36%),linear-gradient(180deg,#130d0d_0%,#0e0b0b_65%)]" />
      <div className="absolute inset-0 opacity-[0.08] grain" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-xl items-center justify-center">
        <div className="w-full rounded-[2.5rem] border border-[#f4efe6]/10 bg-[#171010]/85 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-4 py-2 text-sm text-[#d8c08a]">
            <Sparkles size={16} />
            Private beta
          </div>

          <div className="mb-7 grid h-14 w-14 place-items-center rounded-full border border-[#c9a45c]/30 bg-[#c9a45c]/10 text-[#c9a45c]">
            <LockKeyhole size={24} />
          </div>

          <h1 className="text-4xl font-black tracking-[-0.05em]">
            ECHO Georgia
          </h1>

          <p className="mt-4 text-base leading-7 text-[#b8aea3]">
            ეს ვერსია ჯერ private beta რეჟიმშია. შეიყვანე access code, რომ
            გააგრძელო.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Access code"
              className="w-full rounded-full border border-[#f4efe6]/10 bg-[#0e0b0b] px-5 py-4 text-sm text-[#f4efe6] outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#f4efe6] px-6 py-4 text-sm font-bold text-[#140d0d] transition hover:bg-[#c9a45c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "შემოწმება..." : "შესვლა"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}