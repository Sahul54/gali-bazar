
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRecentlyViewed } from "@/modules/product/recently-viewed.service";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const rawLimit = searchParams.get("limit") || "8";
    const limit = Number(rawLimit);

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Limit must be between 1 and 50.",
        },
        { status: 400 }
      );
    }

    const session = await getSession();
    const userId = session?.userId || null;

    let sessionId = null;

    // Guest customer history
    if (!userId) {
      sessionId = searchParams.get("sessionId");

      if (
        typeof sessionId !== "string" ||
        sessionId.length < 10 ||
        sessionId.length > 128
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid guest session ID is required.",
          },
          { status: 400 }
        );
      }
    }

    const result = await getRecentlyViewed({
      userId,
      sessionId,
      limit,
    });

    return NextResponse.json({
      success: true,
      message: "Recently viewed products fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Recently viewed API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch recently viewed products.",
      },
      { status: 500 }
    );
  }
}
