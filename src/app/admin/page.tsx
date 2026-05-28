import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminPanel from "./AdminPanel";

export default async function AdminPage() {
  const { isAdmin } = await requireAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return <AdminPanel />;
}