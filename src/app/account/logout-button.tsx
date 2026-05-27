"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full bg-[#f4efe6] px-6 py-3 text-sm font-black text-[#140d0d] transition hover:bg-[#c9a45c]"
    >
      გამოსვლა
    </button>
  );
}