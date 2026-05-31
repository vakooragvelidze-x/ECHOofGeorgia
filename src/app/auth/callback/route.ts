import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    console.error("OAuth exchange error:", exchangeError);
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("OAuth user lookup error:", userError);
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const email = user.email ?? "";

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id, role, plan")
    .eq("id", user.id)
    .maybeSingle();

  if (profileLookupError) {
    console.error("OAuth profile lookup error:", profileLookupError);
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (existingProfile) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("OAuth safe profile update error:", updateError);
    }
  } else {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email,
      full_name: fullName,
      role: "user",
      plan: "free",
    });

    if (insertError) {
      console.error("OAuth profile insert error:", insertError);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}