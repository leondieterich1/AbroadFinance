import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations("Sidebar");
  const name = session?.user?.name ?? t("userFallback");
  return <DashboardOverview userName={name} />;
}
