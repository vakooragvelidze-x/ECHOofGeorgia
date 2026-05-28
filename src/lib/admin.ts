import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      profile: null,
      isAdmin: false,
      error: "Unauthorized.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, plan")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return {
      supabase,
      user,
      profile,
      isAdmin: false,
      error: "Admin access required.",
    };
  }

  return {
    supabase,
    user,
    profile,
    isAdmin: true,
    error: null,
  };
}