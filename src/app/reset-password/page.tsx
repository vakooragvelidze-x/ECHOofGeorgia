"use client";
import { getFriendlyAuthError } from "@/lib/authError";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PageStatus = "checking" | "ready" | "invalid" | "success";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<PageStatus>("checking");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

 useEffect(() => {
  const supabase = createClient();

  let invalidTimer: ReturnType<typeof setTimeout> | null = null;

  function safelyShowInvalid() {
    invalidTimer = setTimeout(() => {
      setStatus((currentStatus) =>
        currentStatus === "checking" ? "invalid" : currentStatus
      );
    }, 2200);
  }

  function markReady() {
    if (invalidTimer) {
      clearTimeout(invalidTimer);
      invalidTimer = null;
    }

    window.history.replaceState({}, document.title, "/reset-password");
    setStatus("ready");
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
      markReady();
    }
  });

  async function prepareRecoverySession() {
    const currentUrl = new URL(window.location.href);
    const code = currentUrl.searchParams.get("code");

    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", "")
    );

    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    try {
      if (accessToken && refreshToken && type === "recovery") {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!sessionError) {
          markReady();
          return;
        }
      }

      if (code) {
        try {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (!exchangeError) {
            markReady();
            return;
          }

          const isPkceVerifierError =
            exchangeError.name === "AuthPKCECodeVerifierMissingError" ||
            exchangeError.message
              .toLowerCase()
              .includes("code verifier not found");

          if (!isPkceVerifierError) {
            safelyShowInvalid();
            return;
          }

          // Supabase can still finish the recovery session through the auth event.
          // Do not throw this error, because it creates the red Next.js overlay.
        } catch (exchangeError) {
          const message =
            exchangeError instanceof Error ? exchangeError.message : "";

          const isPkceVerifierError =
            exchangeError instanceof Error &&
            (exchangeError.name === "AuthPKCECodeVerifierMissingError" ||
              message.toLowerCase().includes("code verifier not found"));

          if (!isPkceVerifierError) {
            safelyShowInvalid();
            return;
          }

          // Ignore PKCE verifier timing/storage error and wait for session.
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        markReady();
        return;
      }

      safelyShowInvalid();
    } catch {
      safelyShowInvalid();
    }
  }

  void prepareRecoverySession();

  return () => {
    if (invalidTimer) {
      clearTimeout(invalidTimer);
    }

    subscription.unsubscribe();
  };
}, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (cleanPassword.length < 6) {
      setError("პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს.");
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError("პაროლები ერთმანეთს არ ემთხვევა.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password: cleanPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setStatus("success");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password update error:", error);
      setError("პაროლის შეცვლა ვერ მოხერხდა. სცადე ახალი ბმულით თავიდან.");
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
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-4 py-2 text-sm font-bold text-[#d8c08a] transition hover:bg-[#f4efe6]/10"
          >
            <ArrowLeft size={16} />
            მთავარზე დაბრუნება
          </Link>

          <div className="mb-6 grid h-12 w-12 place-items-center rounded-full border border-[#c9a45c]/30 bg-[#c9a45c]/10 text-[#c9a45c]">
            <LockKeyhole size={22} />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-[#c9a45c]">
            ECHO Georgia
          </p>

          <h1 className="text-4xl font-black tracking-[-0.05em]">
            ახალი პაროლი
          </h1>

          {status === "checking" && (
            <p className="mt-5 text-sm leading-7 text-[#b8aea3]">
              ბმული მოწმდება...
            </p>
          )}

          {status === "invalid" && (
            <div className="mt-7 space-y-4">
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-7 text-red-200">
                აღდგენის ბმული არასწორია ან ვადა გაუვიდა. სცადე ახალი ბმულის
                გაგზავნა.
              </div>

              <Link
                href="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#c9a45c] px-6 py-4 text-sm font-black text-[#140d0d] transition hover:bg-[#e2c071]"
              >
                ახალი ბმულის მიღება
              </Link>
            </div>
          )}

          {status === "success" && (
            <div className="mt-7 space-y-4">
              <div className="rounded-2xl border border-[#c9a45c]/25 bg-[#c9a45c]/10 p-4 text-sm leading-7 text-[#d9d0c5]">
                პაროლი წარმატებით შეიცვალა. ახლა შეგიძლია შეხვიდე ანგარიშში.
              </div>

              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#c9a45c] px-6 py-4 text-sm font-black text-[#140d0d] transition hover:bg-[#e2c071]"
              >
                შესვლა
              </Link>
            </div>
          )}

          {status === "ready" && (
            <>
              <p className="mt-4 text-sm leading-7 text-[#b8aea3]">
                შეიყვანე ახალი პაროლი. პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="ახალი პაროლი"
                  className="w-full rounded-full border border-[#f4efe6]/10 bg-[#0e0b0b] px-5 py-4 text-sm text-[#f4efe6] outline-none placeholder:text-[#756b63] focus:border-[#c9a45c]/40"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="გაიმეორე ახალი პაროლი"
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
                  {isLoading ? "ინახება..." : "პაროლის შეცვლა"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}