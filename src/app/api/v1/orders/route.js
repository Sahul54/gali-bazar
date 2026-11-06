
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth.js";
import { orderService } from "@/modules/order/order.service.js";

// Standard API error response
function handleError(error) {
  console.error("[ORDER API ERROR]:", error);

  return NextResponse.json(
    {
      success: false,
      message: error.statusCode
        ? error.message
        : "Something went wrong. Please try again.",
    },
    {
      status: error.statusCode || 500,
    }
  );
}

// Verify customer authentication
async function getCustomerSession() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Please login to continue.",
        },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "CUSTOMER") {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Only customers can access this endpoint.",
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}

// POST /api/v1/orders
// Create a new customer order
export async function POST(request) {
  try {
    const { session, error: authError } =
      await getCustomerSession();

    if (authError) return authError;

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body must be a valid object.",
        },
        { status: 400 }
      );
    }

    const order = await orderService.createOrder(
      session.userId,
      body
    );

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/v1/orders
// Get logged-in customer's orders
export async function GET(request) {
  try {
    const { session, error: authError } =
      await getCustomerSession();

    if (authError) return authError;

    const { searchParams } = new URL(request.url);

    const rawSkip = searchParams.get("skip") ?? "0";
    const rawTake = searchParams.get("take") ?? "10";

    const skip = Number(rawSkip);
    const take = Number(rawTake);

    // Validate pagination
    if (
      !Number.isSafeInteger(skip) ||
      skip < 0 ||
      !Number.isSafeInteger(take) ||
      take < 1 ||
      take > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid pagination. Skip must be 0 or greater and take must be between 1 and 50.",
        },
        { status: 400 }
      );
    }

    const result = await orderService.getCustomerOrders(
      session.userId,
      { skip, take }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Orders fetched successfully.",
        data: result.orders,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
