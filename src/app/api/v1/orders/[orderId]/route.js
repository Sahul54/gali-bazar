
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth.js";
import { orderService } from "@/modules/order/order.service.js";

// GET /api/v1/orders/[orderId]
export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view this order.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can access this endpoint.",
        },
        { status: 403 }
      );
    }

    // Next.js 16: params is a Promise.
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const order = await orderService.getOrderById(
      orderId,
      session.userId
    );

    return NextResponse.json(
      {
        success: true,
        message: "Order details fetched successfully.",
        data: order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ORDER DETAILS API ERROR]:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to fetch order details.",
      },
      {
        status: error.statusCode || 500,
      }
    );
  }
}
