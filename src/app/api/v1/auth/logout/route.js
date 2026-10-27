
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth.js";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to logout. Please try again.",
      },
      { status: 500 }
    );
  }
}
