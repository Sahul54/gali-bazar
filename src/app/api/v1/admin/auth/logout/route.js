import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth.js";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      success: true,
      message: "Admin logout successful.",
    });
  } catch (error) {
    console.error("Admin logout failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to logout. Please try again.",
      },
      { status: 500 }
    );
  }
}