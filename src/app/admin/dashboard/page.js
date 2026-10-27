import { requireAdminPage } from "@/lib/require-admin-page.js";
import DashboardClient from "./dashboard-client.js";

export const instant = false;

export default async function AdminDashboardPage() {
  await requireAdminPage();

  return <DashboardClient />;
}