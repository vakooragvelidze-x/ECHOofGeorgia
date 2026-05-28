import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const { supabase, isAdmin, error } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const { data, error: usersError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, plan")
    .order("email", { ascending: true });

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [] });
}