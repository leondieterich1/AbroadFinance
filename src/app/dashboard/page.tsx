import { auth } from "@/auth";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? "Nutzer";
  return <DashboardOverview userName={name} />;
}
