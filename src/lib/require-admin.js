import { NextResponse } from "next/server";
import { getSession } from "./auth.js";
import { prisma } from "./prisma.js";

export async function requireAdmin() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "ADMIN") {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      ),
    };
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
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Admin account is inactive or unavailable.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    session,
    response: null,
  };
}