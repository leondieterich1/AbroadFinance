import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminStats } from "@/lib/users";
import { formatDate } from "@/lib/utils";
import DotPattern from "@/components/ui/DotPattern";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const stats = await getAdminStats();
  const maxDay = Math.max(...stats.signupsByDay.map((d) => d.count), 1);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0d1f3c]">Admin</h1>
        <p className="text-[#0d1f3c]/50 mt-1">Übersicht über registrierte Nutzerkonten.</p>
      </div>

      {/* KPI cards */}
      <div className="relative overflow-hidden bg-[#0d1f3c] text-white rounded-2xl p-6 mb-8">
        <DotPattern className="text-white" />
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Registrierte Konten</p>
            <p className="text-3xl font-extrabold">{stats.totalUsers}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Verifiziert</p>
            <p className="text-3xl font-extrabold text-emerald-300">{stats.verifiedUsers}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Aktuell gesperrt</p>
            <p className={`text-3xl font-extrabold ${stats.lockedUsers > 0 ? "text-rose-300" : ""}`}>{stats.lockedUsers}</p>
          </div>
        </div>
      </div>

      {/* Signups over time */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-8">
        <h2 className="font-extrabold text-[#0d1f3c] mb-6">Neue Registrierungen (letzte 30 Tage)</h2>
        <div className="flex items-end gap-1" style={{ height: 120 }}>
          {stats.signupsByDay.map((d) => {
            const h = maxDay > 0 ? (d.count / maxDay) * 100 : 0;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div
                  className="w-full rounded-t-sm bg-[#0d1f3c] hover:bg-[#162d54] transition-all duration-300"
                  style={{ height: `${Math.max(h, d.count > 0 ? 4 : 0)}%` }}
                />
                <div className="absolute -top-7 hidden group-hover:block bg-[#0d1f3c] text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap">
                  {d.date}: {d.count}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-[#0d1f3c]/30 mt-2">
          <span>{stats.signupsByDay[0]?.date}</span>
          <span>{stats.signupsByDay[stats.signupsByDay.length - 1]?.date}</span>
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <h2 className="font-extrabold text-[#0d1f3c] p-5 pb-3">Letzte Registrierungen</h2>
        <div className="divide-y divide-gray-50">
          {stats.recentUsers.length === 0 ? (
            <p className="text-[#0d1f3c]/30 text-sm p-5 text-center">Noch keine Konten.</p>
          ) : (
            stats.recentUsers.map((u) => (
              <div key={u.email} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0d1f3c] truncate">{u.name}</p>
                  <p className="text-xs text-[#0d1f3c]/40 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      u.email_verified
                        ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                        : "text-amber-600 bg-amber-50 border-amber-200"
                    }`}
                  >
                    {u.email_verified ? "Verifiziert" : "Ausstehend"}
                  </span>
                  <span className="text-xs text-[#0d1f3c]/30">{formatDate(u.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
