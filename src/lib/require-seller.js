
import { redirect } from "next/navigation";
import { getSession } from "./auth.js";
import { prisma } from "./prisma.js";

export async function requireApprovedSeller() {
  const session = await getSession();

  // 1. Authentication check
  if (!session?.userId) {
    redirect("/seller/login");
  }

  // 2. Role check
  if (session.role !== "SELLER") {
    redirect("/");
  }

  // 3. Verify seller against the database
  const seller = await prisma.user.findFirst({
    where: {
      id: session.userId,
      role: "SELLER",
      isActive: true,
    },
    include: {
      sellerProfile: true,
    },
  });

  if (!seller) {
    redirect("/seller/login");
  }

  // 4. Registration check
  if (!seller.sellerProfile) {
    redirect("/seller/register");
  }

  // 5. Approval check
  if (seller.sellerProfile.status !== "APPROVED") {
    redirect("/seller/status");
  }

  return seller;
}
