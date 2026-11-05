
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { trackProductView } from "@/modules/product/product-view.service";

export async function POST(request, { params }) {
  try {
    const { productId } = await params;

    const session = await getSession();

    let sessionId = null;
    let userId = session?.userId || null;

    // Guest customer tracking
    if (!userId) {
      const body = await request.json().catch(() => ({}));
      sessionId = body.sessionId || null;

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

    await trackProductView({
      productId,
      userId,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      message: "Product view recorded successfully.",
    });
  } catch (error) {
    console.error("Product view API error:", error);

    if (error.message === "Product not found or unavailable.") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to record product view.",
      },
      { status: 500 }
    );
  }
}
