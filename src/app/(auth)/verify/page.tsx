"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }

    signIn("credentials", { verificationToken: token, redirect: false }).then((res) => {
      if (res?.ok && !res?.error) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1800);
      } else {
        setStatus("error");
      }
    });
  }, [params, router]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
      {status === "loading" && (
        <>
          <div className="w-14 h-14 border-4 border-[#0d1f3c]/10 border-t-[#0d1f3c] rounded-full animate-spin mx-auto mb-5" />
          <h1 className="text-xl font-extrabold text-[#0d1f3c] mb-2">Wird bestätigt…</h1>
          <p className="text-[#0d1f3c]/40 text-sm">Einen Moment bitte.</p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✓</div>
          <h1 className="text-xl font-extrabold text-[#0d1f3c] mb-2">E-Mail bestätigt!</h1>
          <p className="text-[#0d1f3c]/40 text-sm">Du wirst zum Dashboard weitergeleitet…</p>
        </>
      )}
      {status === "error" && (
        <>
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✕</div>
          <h1 className="text-xl font-extrabold text-[#0d1f3c] mb-2">Link ungültig</h1>
          <p className="text-[#0d1f3c]/40 text-sm mb-6">
            Der Link ist abgelaufen oder ungültig. Bitte registriere dich erneut.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors text-sm"
          >
            Erneut registrieren
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
          <div className="w-14 h-14 border-4 border-[#0d1f3c]/10 border-t-[#0d1f3c] rounded-full animate-spin mx-auto mb-5" />
          <p className="text-[#0d1f3c]/40 text-sm">Wird geladen…</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
