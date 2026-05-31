"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Crown,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "user" | "admin";
  plan: "free" | "premium" | "unlimited";
  usage_today: number;
  usage_total: number;
  last_activity_at: string | null;
};

type Plan = AdminUser["plan"];

const planLabels: Record<Plan, string> = {
  free: "Free",
  premium: "Premium",
  unlimited: "Unlimited",
};

const planStyles: Record<Plan, string> = {
  free: "border-[#f4efe6]/10 bg-[#f4efe6]/5 text-[#b8aea3]",
  premium: "border-[#c9a45c]/25 bg-[#c9a45c]/10 text-[#d8c08a]",
  unlimited: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
};

function formatActivityDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("ka-GE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  async function loadUsers() {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load users.");
      }

      setUsers(data.users ?? []);
    } catch (error) {
      console.error("Admin users load error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "მომხმარებლების ჩატვირთვა ვერ მოხერხდა."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUserPlan(userId: string, plan: Plan) {
    setError("");
    setUpdatingUserId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user plan.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, plan: data.user.plan } : user
        )
      );
    } catch (error) {
      console.error("Admin user plan update error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "გეგმის შეცვლა ვერ მოხერხდა."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const totalUsers = users.length;
  const unlimitedUsers = users.filter(
    (user) => user.plan === "unlimited"
  ).length;
  const freeUsers = users.filter((user) => user.plan === "free").length;

  const totalQuestionsToday = users.reduce(
    (sum, user) => sum + user.usage_today,
    0
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0e0b0b] px-5 py-8 text-[#f4efe6]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,164,92,0.12),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(92,30,38,0.38),transparent_34%),linear-gradient(180deg,#140d0d_0%,#0e0b0b_72%)]" />
      <div className="absolute inset-0 opacity-[0.06] grain" />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#f4efe6]/10 bg-[#f4efe6]/5 px-4 py-2 text-sm font-bold text-[#d8c08a] transition hover:bg-[#f4efe6]/10"
          >
            <ArrowLeft size={16} />
            მთავარზე დაბრუნება
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/knowledge"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a45c] px-4 py-2 text-sm font-black text-[#140d0d] transition hover:bg-[#f4efe6]"
            >
              <BookOpen size={15} />
              ცოდნის მართვა
            </Link>

            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full border border-[#f4efe6]/10 bg-[#171010]/80 px-4 py-2 text-sm font-bold text-[#f4efe6] transition hover:bg-[#f4efe6]/8 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={isLoading ? "animate-spin" : ""}
              />
              განახლება
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#f4efe6]/10 bg-[#171010]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 px-4 py-2 text-sm font-bold text-[#d8c08a]">
                <ShieldCheck size={16} />
                Admin Panel
              </div>

              <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                მომხმარებლები
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b8aea3]">
                აქ შეგიძლია მომხმარებლების გეგმის შეცვლა. Unlimited გეგმა
                მოხსნის დღიურ კითხვების ლიმიტს, მაგრამ usage მაინც ჩაიწერება
                ანალიტიკისთვის.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Users" value={totalUsers} />
              <StatCard label="Today" value={totalQuestionsToday} />
              <StatCard label="Free" value={freeUsers} />
              <StatCard label="Unlimited" value={unlimitedUsers} />
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[#f4efe6]/10">
            <div className="hidden grid-cols-[1.5fr_1fr_90px_110px_120px_310px] gap-4 border-b border-[#f4efe6]/10 bg-[#0e0b0b]/80 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#756b63] lg:grid">
              <div>მომხმარებელი</div>
              <div>სახელი</div>
              <div>Today</div>
              <div>Total</div>
              <div>როლი</div>
              <div>გეგმა</div>
            </div>

            {isLoading ? (
              <div className="px-5 py-12 text-center text-sm text-[#b8aea3]">
                მომხმარებლები იტვირთება...
              </div>
            ) : users.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-[#b8aea3]">
                მომხმარებლები ვერ მოიძებნა.
              </div>
            ) : (
              <div className="divide-y divide-[#f4efe6]/8">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="grid gap-4 px-5 py-4 lg:grid-cols-[1.5fr_1fr_90px_110px_120px_310px] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#c9a45c]/25 bg-[#c9a45c]/10 text-[#c9a45c]">
                          {user.role === "admin" ? (
                            <Crown size={17} />
                          ) : (
                            <UserRound size={17} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#f4efe6]">
                            {user.email ?? "No email"}
                          </p>
                          <p className="mt-1 truncate text-xs text-[#756b63]">
                            {user.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-[#d9d0c5]">
                      <span className="text-[#756b63] lg:hidden">Name: </span>
                      {user.full_name || "—"}
                    </div>

                    <div className="text-sm font-black text-[#f4efe6]">
                      <span className="text-[#756b63] lg:hidden">Today: </span>
                      {user.usage_today}
                    </div>

                    <div className="text-sm text-[#b8aea3]">
                      <span className="text-[#756b63] lg:hidden">Total: </span>
                      {user.usage_total}
                      <p className="mt-1 text-[11px] text-[#756b63]">
                        {formatActivityDate(user.last_activity_at)}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                          user.role === "admin"
                            ? "border-[#c9a45c]/25 bg-[#c9a45c]/10 text-[#d8c08a]"
                            : "border-[#f4efe6]/10 bg-[#f4efe6]/5 text-[#b8aea3]"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-2">
                        {(["free", "premium", "unlimited"] as Plan[]).map(
                          (plan) => {
                            const isActive = user.plan === plan;
                            const isUpdating = updatingUserId === user.id;

                            return (
                              <button
                                key={plan}
                                type="button"
                                disabled={isUpdating || isActive}
                                onClick={() =>
                                  void updateUserPlan(user.id, plan)
                                }
                                className={`rounded-full border px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed ${
                                  isActive
                                    ? planStyles[plan]
                                    : "border-[#f4efe6]/10 bg-[#0e0b0b] text-[#756b63] hover:border-[#c9a45c]/25 hover:text-[#f4efe6]"
                                } ${isUpdating ? "opacity-60" : ""}`}
                              >
                                {isUpdating && !isActive
                                  ? "..."
                                  : planLabels[plan]}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#f4efe6]/10 bg-[#0e0b0b]/75 px-4 py-3 text-center">
      <p className="text-2xl font-black text-[#f4efe6]">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#756b63]">
        {label}
      </p>
    </div>
  );
}