
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Please login to continue.",
        },
        { status: 401 }
      );
    }

    // Fetch the current user so disabled accounts
    // cannot continue using an existing session.
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Your session is no longer valid.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Session API error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Unable to verify session.",
      },
      { status: 500 }
    );
  }
}
