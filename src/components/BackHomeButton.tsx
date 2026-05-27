import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BackHomeButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full border border-[#f4efe6]/10 bg-[#120d0d]/70 px-4 py-2.5 text-sm font-bold text-[#d8c08a] backdrop-blur-xl transition hover:border-[#c9a45c]/35 hover:bg-[#f4efe6]/5 hover:text-[#f4efe6]"
    >
      <ArrowLeft size={16} />
      მთავარ გვერდზე
    </Link>
  );
}