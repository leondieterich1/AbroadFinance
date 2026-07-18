"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Fehler beim Senden. Bitte versuche es erneut.");
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-5">📬</div>
        <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-2">Schau in dein Postfach!</h1>
        <p className="text-[#0d1f3c]/50 text-sm mb-1">
          Wir haben einen Bestätigungslink an
        </p>
        <p className="font-bold text-[#0d1f3c] mb-6">{email}</p>
        <p className="text-[#0d1f3c]/40 text-xs">
          Der Link ist 24 Stunden gültig. Kein E-Mail bekommen?{" "}
          <button
            onClick={() => setSent(false)}
            className="text-[#0d1f3c] font-semibold hover:underline"
          >
            Erneut senden
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-2">Konto erstellen</h1>
      <p className="text-[#0d1f3c]/50 text-sm mb-8">Kostenlos starten – keine Kreditkarte nötig.</p>

      {error && (
        <div className="bg-rose-50 text-rose-600 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0d1f3c] mb-1.5">Name</label>
          <input
            type="text"
            placeholder="Dein Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0d1f3c] mb-1.5">E-Mail</label>
          <input
            type="email"
            placeholder="du@beispiel.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0d1f3c] mb-1.5">Passwort</label>
          <input
            type="password"
            placeholder="Mindestens 6 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0d1f3c] text-white font-semibold py-3 rounded-xl hover:bg-[#162d54] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Wird gesendet…
            </>
          ) : (
            "Bestätigungsmail senden →"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#0d1f3c]/50 mt-6">
        Bereits registriert?{" "}
        <Link href="/login" className="text-[#0d1f3c] font-semibold hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
