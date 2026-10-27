import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin.js";
import { prisma } from "@/lib/prisma.js";

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return auth.response;
    }

    const admin = await prisma.user.findUnique({
      where: { id: auth.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin account not found.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: admin,
    });
  } catch (error) {
    console.error("Admin session check failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify admin session.",
      },
      { status: 500 }
    );
  }
}