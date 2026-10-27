import "server-only";

import { redirect } from "next/navigation";
import { getSession } from "./auth.js";
import { prisma } from "./prisma.js";

export async function requireAdminPage() {
  const session = await getSession();

  if (!session?.userId || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const admin = await prisma.user.findFirst({
    where: {
      id: session.userId,
      role: "ADMIN",
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!admin) {
    redirect("/admin/login");
  }

  return session;
}
