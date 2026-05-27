"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError("");
  setIsLoading(true);

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed.");
    }

    router.push("/account");
    router.refresh();
  } catch (error) {
    setError(
      error instanceof Error ? error.message : "Registration failed."
    );
  } finally {
    setIsLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-[#0e0b0b] px-5 py-10 text-[#f4efe6]">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <form
          onSubmit={handleRegister}
          className="w-full rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010] p-7 shadow-2xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a45c]">
            ECHO Georgia
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
            რეგისტრაცია
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#b8aea3]">
            შექმენი ანგარიში, რომ საუბრები შეინახო და მოგვიანებით გააგრძელო.
          </p>

          <div className="mt-7 space-y-4">
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="სახელი"
              className="w-full rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b] px-4 py-4 text-sm outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40"
            />

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
              minLength={6}
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
            {isLoading ? "იქმნება..." : "ანგარიშის შექმნა"}
          </button>

          <p className="mt-5 text-center text-sm text-[#b8aea3]">
            უკვე გაქვს ანგარიში?{" "}
            <Link href="/login" className="font-bold text-[#c9a45c]">
              შესვლა
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}