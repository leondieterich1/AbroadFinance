import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-2">Willkommen zurück</h1>
      <p className="text-[#0d1f3c]/50 text-sm mb-8">Melde dich bei deinem Konto an.</p>

      <form className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0d1f3c] mb-1.5">E-Mail</label>
          <input
            type="email"
            placeholder="du@beispiel.de"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0d1f3c] mb-1.5">Passwort</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#0d1f3c] text-white font-semibold py-3 rounded-xl hover:bg-[#162d54] transition-colors mt-2"
        >
          Anmelden
        </button>
      </form>

      <p className="text-center text-sm text-[#0d1f3c]/50 mt-6">
        Noch kein Konto?{" "}
        <Link href="/signup" className="text-[#0d1f3c] font-semibold hover:underline">
          Kostenlos registrieren
        </Link>
      </p>
    </div>
  );
}
