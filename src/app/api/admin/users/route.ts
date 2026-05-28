import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

function getTodayStartIso() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

export async function GET() {
  const { supabase, isAdmin, error } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, plan")
    .order("email", { ascending: true });

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const userIds = (users ?? []).map((user) => user.id);

  if (userIds.length === 0) {
    return NextResponse.json({ users: [] });
  }

  const todayStartIso = getTodayStartIso();

  const { data: usageEvents, error: usageError } = await supabase
    .from("usage_events")
    .select("user_id, created_at")
    .in("user_id", userIds)
    .eq("event_type", "chat_message")
    .order("created_at", { ascending: false });

  if (usageError) {
    return NextResponse.json({ error: usageError.message }, { status: 500 });
  }

  const usageByUser = new Map<
    string,
    {
      total: number;
      today: number;
      lastActivity: string | null;
    }
  >();

  for (const userId of userIds) {
    usageByUser.set(userId, {
      total: 0,
      today: 0,
      lastActivity: null,
    });
  }

  for (const event of usageEvents ?? []) {
    const current = usageByUser.get(event.user_id);

    if (!current) continue;

    current.total += 1;

    if (event.created_at >= todayStartIso) {
      current.today += 1;
    }

    if (!current.lastActivity) {
      current.lastActivity = event.created_at;
    }
  }

  const enrichedUsers = (users ?? []).map((user) => {
    const usage = usageByUser.get(user.id) ?? {
      total: 0,
      today: 0,
      lastActivity: null,
    };

    return {
      ...user,
      usage_today: usage.today,
      usage_total: usage.total,
      last_activity_at: usage.lastActivity,
    };
  });

  return NextResponse.json({ users: enrichedUsers });
}