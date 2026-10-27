
import { requireApprovedSeller } from "@/lib/require-seller";
import SellerLayoutClient from "@/components/seller/SellerLayoutClient";

export const instant = false;

export default async function SellerLayout({ children }) {
  // Server-side authentication, role and approval check
  await requireApprovedSeller();

  return (
    <SellerLayoutClient>
      {children}
    </SellerLayoutClient>
  );
}
