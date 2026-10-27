import { requireAdminPage } from "@/lib/require-admin-page.js";
import SellersClient from "./sellers-client.js";

export const instant = false;

export default async function AdminSellersPage() {
  await requireAdminPage();

  return <SellersClient />;
}