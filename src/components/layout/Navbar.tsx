import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo-icon.png" alt="FinanceAbroad Logo" width={44} height={44} className="rounded-xl" />
        <span className="text-xl font-bold tracking-tight text-[#0d1f3c]">FinanceAbroad</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#0d1f3c]/70">
        <a href="#features" className="hover:text-[#0d1f3c] transition-colors">Features</a>
        <a href="#how" className="hover:text-[#0d1f3c] transition-colors">Wie es funktioniert</a>
        <Link href="/planner" className="hover:text-[#0d1f3c] transition-colors font-semibold text-[#0d1f3c]">
          📊 Planer
        </Link>
        <Link href="/converter" className="hover:text-[#0d1f3c] transition-colors font-semibold text-[#0d1f3c]">
          💱 Währungen
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-[#0d1f3c]/70 hover:text-[#0d1f3c] transition-colors px-4 py-2"
        >
          Anmelden
        </Link>
        <Link
          href="/signup"
          className="bg-[#0d1f3c] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#162d54] transition-colors"
        >
          Kostenlos starten
        </Link>
      </div>
    </nav>
  );
}
