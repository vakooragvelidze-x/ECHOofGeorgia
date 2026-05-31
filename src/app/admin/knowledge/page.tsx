import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminKnowledgePanel from "./AdminKnowledgePanel";

export default async function AdminKnowledgePage() {
  const { isAdmin } = await requireAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return <AdminKnowledgePanel />;
}