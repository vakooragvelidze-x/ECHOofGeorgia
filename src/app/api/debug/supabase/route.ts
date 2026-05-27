import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const result = {
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseKey),
    url: supabaseUrl ?? null,
    keyPrefix: supabaseKey ? supabaseKey.slice(0, 18) : null,
    keyLength: supabaseKey?.length ?? 0,
    healthStatus: null as number | null,
    healthText: null as string | null,
    error: null as string | null,
  };

  try {
    if (!supabaseUrl) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      cache: "no-store",
    });

    result.healthStatus = response.status;
    result.healthText = (await response.text()).slice(0, 300);
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Unknown error";
  }

  return NextResponse.json(result);
}