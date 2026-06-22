import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <Image src="/logo-icon.png" alt="FinanceAbroad" width={40} height={40} className="rounded-xl" />
        <span className="text-lg font-bold text-[#0d1f3c]">FinanceAbroad</span>
      </Link>
      {children}
    </div>
  );
}
