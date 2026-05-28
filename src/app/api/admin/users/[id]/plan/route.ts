import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

const allowedPlans = ["free", "premium", "unlimited"] as const;

type Plan = (typeof allowedPlans)[number];

function isAllowedPlan(value: unknown): value is Plan {
  return typeof value === "string" && allowedPlans.includes(value as Plan);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { supabase, isAdmin, error } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();

  if (!isAllowedPlan(body.plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("profiles")
    .update({ plan: body.plan })
    .eq("id", id)
    .select("id, email, full_name, role, plan")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}