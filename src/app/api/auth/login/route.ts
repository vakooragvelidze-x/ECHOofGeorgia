import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown server error.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password =
      typeof body.password === "string" ? body.password.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}