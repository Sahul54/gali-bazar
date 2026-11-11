
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          user: null,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const role = String(session.role || "")
      .trim()
      .toUpperCase();

    if (role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          user: null,
          message: "Customer account required.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        role,
        phone: session.phone,
      },
    });
  } catch (error) {
    console.error("Customer session error:", error);

    return NextResponse.json(
      {
        success: false,
        user: null,
        message: "Unable to verify session.",
      },
      { status: 500 }
    );
  }
}
