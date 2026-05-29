import { createClient } from "@/lib/supabase/server";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isEmailWhitelistedAdmin(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

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
    .maybeSingle();

  const isWhitelistedAdmin = isEmailWhitelistedAdmin(user.email);
  const isProfileAdmin = profile?.role === "admin";
  const isAdmin = isWhitelistedAdmin || isProfileAdmin;

  if (!isAdmin) {
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