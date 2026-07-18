import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt="Logo" width={28} height={28} className="rounded-lg" />
          <span className="font-semibold text-[#0d1f3c]">FinanceAbroad</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-[#0d1f3c]/50">
          <a href="#features" className="hover:text-[#0d1f3c] transition-colors">Features</a>
          <a href="#how" className="hover:text-[#0d1f3c] transition-colors">So funktionierts</a>
          <Link href="/login" className="hover:text-[#0d1f3c] transition-colors">Anmelden</Link>
        </div>
        <p className="text-sm text-[#0d1f3c]/40">© 2026 FinanceAbroad · Plan. Budget. Explore.</p>
      </div>
    </footer>
  );
}
